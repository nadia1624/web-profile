'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentAdmin } from './auth';

/**
 * Submit a contact form message from visitors
 */
export async function sendContactMessage(data: {
  name: string;
  email: string;
  subject?: string | null;
  message: string;
}) {
  try {
    if (!data.name || !data.email || !data.message) {
      return { success: false, error: 'Silakan isi Nama, Email, dan Pesan.' };
    }

    // Save message into PostgreSQL database
    const saved = await prisma.contactMessage.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim(),
        subject: data.subject?.trim() || null,
        message: data.message.trim(),
      },
    });

    return { success: true, data: JSON.parse(JSON.stringify(saved)) };
  } catch (error: any) {
    console.error('Error saving contact message:', error);
    return { success: false, error: 'Gagal menyimpan pesan. Silakan coba lagi.' };
  }
}

/**
 * Fetch all contact messages (for Admin Panel)
 */
export async function getContactMessages() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: JSON.parse(JSON.stringify(messages)) };
  } catch (error: any) {
    console.error('Error fetching contact messages:', error);
    return { success: false, error: error.message || 'Failed to fetch messages.' };
  }
}

/**
 * Mark a contact message as read
 */
export async function markContactMessageAsRead(id: string) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete a contact message
 */
export async function deleteContactMessage(id: string) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    await prisma.contactMessage.delete({
      where: { id },
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
