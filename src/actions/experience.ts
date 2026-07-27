'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentAdmin } from './auth';

/**
 * Fetch all experience records ordered by displayOrder (ascending)
 */
export async function getExperiences() {
  try {
    const experiences = await prisma.experience.findMany({
      orderBy: [
        { displayOrder: 'asc' },
        { startDate: 'desc' }
      ],
    });
    return experiences;
  } catch (error) {
    console.error('Error fetching experiences:', error);
    return [];
  }
}

/**
 * Create a new experience record
 */
export async function createExperience(data: {
  company: string;
  position: string;
  employmentType: string;
  location?: string | null;
  startDate: string; // ISO string from form
  endDate?: string | null; // ISO string from form
  isCurrent: boolean;
  description?: string | null;
  responsibilities: string[];
  technologies: string[];
  companyLogo?: string | null;
  displayOrder?: number;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    // Determine display order (add to end of list)
    let displayOrder = data.displayOrder;
    if (displayOrder === undefined) {
      const lastExp = await prisma.experience.findFirst({
        orderBy: { displayOrder: 'desc' },
      });
      displayOrder = lastExp ? lastExp.displayOrder + 1 : 0;
    }

    const experience = await prisma.experience.create({
      data: {
        company: data.company,
        position: data.position,
        employmentType: data.employmentType,
        location: data.location,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        isCurrent: data.isCurrent,
        description: data.description,
        responsibilities: data.responsibilities,
        technologies: data.technologies,
        companyLogo: data.companyLogo,
        displayOrder,
      },
    });

    return { success: true, data: experience };
  } catch (error: any) {
    console.error('Create experience error:', error);
    return { success: false, error: error.message || 'Failed to create experience.' };
  }
}

/**
 * Update an existing experience record
 */
export async function updateExperience(
  id: string,
  data: {
    company: string;
    position: string;
    employmentType: string;
    location?: string | null;
    startDate: string;
    endDate?: string | null;
    isCurrent: boolean;
    description?: string | null;
    responsibilities: string[];
    technologies: string[];
    companyLogo?: string | null;
    displayOrder?: number;
  }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const existing = await prisma.experience.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: 'Experience record not found.' };
    }

    const finalLogo =
      data.companyLogo !== undefined && data.companyLogo !== null && data.companyLogo !== ''
        ? data.companyLogo
        : existing.companyLogo;

    const updated = await prisma.experience.update({
      where: { id },
      data: {
        company: data.company,
        position: data.position,
        employmentType: data.employmentType,
        location: data.location,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        isCurrent: data.isCurrent,
        description: data.description,
        responsibilities: data.responsibilities,
        technologies: data.technologies,
        companyLogo: finalLogo,
        displayOrder: data.displayOrder !== undefined ? data.displayOrder : existing.displayOrder,
      },
    });

    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Update experience error:', error);
    return { success: false, error: error.message || 'Failed to update experience.' };
  }
}

/**
 * Delete an experience record
 */
export async function deleteExperience(id: string) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    await prisma.experience.delete({
      where: { id },
    });
    return { success: true };
  } catch (error: any) {
    console.error('Delete experience error:', error);
    return { success: false, error: error.message || 'Failed to delete experience.' };
  }
}

/**
 * Reorder experiences by updating displayOrder fields
 */
export async function reorderExperiences(orderedIds: string[]) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const updates = orderedIds.map((id, index) =>
      prisma.experience.update({
        where: { id },
        data: { displayOrder: index },
      })
    );
    await prisma.$transaction(updates);
    return { success: true };
  } catch (error: any) {
    console.error('Reorder experiences error:', error);
    return { success: false, error: error.message || 'Failed to reorder experiences.' };
  }
}
