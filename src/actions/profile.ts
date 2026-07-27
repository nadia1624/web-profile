'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentAdmin } from './auth';

/**
 * Fetch the profile record. If none exists, return null.
 */
export async function getProfile() {
  try {
    const profile = await prisma.profile.findFirst();
    return profile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

/**
 * Create or update the single profile record in the database.
 */
export async function updateProfile(data: {
  name: string;
  headline: string;
  shortBio: string;
  bio: string;
  profileImage?: string | null;
  email: string;
  phone?: string | null;
  location?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  instagramUrl?: string | null;
  cvUrl?: string | null;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const existing = await prisma.profile.findFirst();
    
    if (existing) {
      const finalImage =
        data.profileImage !== undefined && data.profileImage !== null && data.profileImage !== ''
          ? data.profileImage
          : existing.profileImage;

      const finalCv =
        data.cvUrl !== undefined && data.cvUrl !== null && data.cvUrl !== ''
          ? data.cvUrl
          : existing.cvUrl;

      const updated = await prisma.profile.update({
        where: { id: existing.id },
        data: {
          name: data.name,
          headline: data.headline,
          shortBio: data.shortBio,
          bio: data.bio,
          profileImage: finalImage,
          email: data.email,
          phone: data.phone,
          location: data.location,
          linkedinUrl: data.linkedinUrl,
          githubUrl: data.githubUrl,
          instagramUrl: data.instagramUrl,
          cvUrl: finalCv,
        },
      });
      return { success: true, data: updated };
    } else {
      const created = await prisma.profile.create({
        data: {
          name: data.name,
          headline: data.headline,
          shortBio: data.shortBio,
          bio: data.bio,
          profileImage: data.profileImage,
          email: data.email,
          phone: data.phone,
          location: data.location,
          linkedinUrl: data.linkedinUrl,
          githubUrl: data.githubUrl,
          instagramUrl: data.instagramUrl,
          cvUrl: data.cvUrl,
        },
      });
      return { success: true, data: created };
    }
  } catch (error: any) {
    console.error('Update profile Server Action error:', error);
    return { success: false, error: error.message || 'Failed to update profile.' };
  }
}
