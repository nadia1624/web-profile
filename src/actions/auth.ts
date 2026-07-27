'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { comparePassword, hashPassword, signJWT, verifyJWT } from '@/lib/auth';

/**
 * Log in the administrator
 */
export async function loginAdmin(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  try {
    // 1. Fetch user from database
    const user = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: 'Invalid credentials.' };
    }

    // 2. Compare password hashes
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Invalid credentials.' };
    }

    // 3. Create session JWT
    const token = await signJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    // 4. Save session cookie globally with path: '/'
    const cookiesStore = await cookies();
    cookiesStore.set('nadia_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  } catch (error: any) {
    console.error('Login Server Action error:', error);
    return { success: false, error: 'Server authentication failed.' };
  }
}

/**
 * Log out the administrator by clearing cookies
 */
export async function logoutAdmin() {
  try {
    const cookiesStore = await cookies();
    cookiesStore.delete('nadia_session');
    
    // We also delete the restricted path cookies
    cookiesStore.set('nadia_session', '', { path: '/admin', maxAge: 0 });
    cookiesStore.set('nadia_session', '', { path: '/', maxAge: 0 });
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Logout failed.' };
  }
}

/**
 * Helper to retrieve currently logged in admin user
 */
export async function getCurrentAdmin() {
  try {
    const cookiesStore = await cookies();
    const sessionCookie = cookiesStore.get('nadia_session')?.value;
    if (!sessionCookie) return null;

    const decoded = await verifyJWT(sessionCookie);
    if (!decoded || !decoded.userId) return null;

    const user = await prisma.adminUser.findUnique({
      where: { id: decoded.userId as string },
      select: { id: true, name: true, email: true },
    });

    return user;
  } catch (error) {
    return null;
  }
}

/**
 * Update the administrator profile settings and password
 */
export async function updateAdminSettings(data: {
  name: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
}) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const updateData: { name: string; email: string; passwordHash?: string } = {
      name: data.name,
      email: data.email,
    };

    if (data.newPassword) {
      if (!data.currentPassword) {
        return { success: false, error: 'Current password is required to set a new password.' };
      }

      // Check current password
      const fullUser = await prisma.adminUser.findUnique({
        where: { id: currentAdmin.id },
      });

      if (!fullUser) {
        return { success: false, error: 'User not found.' };
      }

      const isValid = await comparePassword(data.currentPassword, fullUser.passwordHash);
      if (!isValid) {
        return { success: false, error: 'Current password is incorrect.' };
      }

      // Hash new password
      updateData.passwordHash = await hashPassword(data.newPassword);
    }

    await prisma.adminUser.update({
      where: { id: currentAdmin.id },
      data: updateData,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Update settings error:', error);
    return { success: false, error: error.message || 'Failed to update credentials.' };
  }
}
