'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentAdmin } from './auth';

/**
 * Fetch all education entries ordered by displayOrder (ascending)
 */
export async function getEducationList() {
  try {
    const list = await prisma.education.findMany({
      orderBy: [
        { displayOrder: 'asc' },
        { startDate: 'desc' }
      ],
    });
    return list;
  } catch (error) {
    console.error('Error fetching education list:', error);
    return [];
  }
}

/**
 * Create a new education entry
 */
export async function createEducation(data: {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string | null;
  description?: string | null;
  gpa?: string | null;
  achievement?: string | null;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    // Get next display order
    const lastEdu = await prisma.education.findFirst({
      orderBy: { displayOrder: 'desc' },
    });
    const displayOrder = lastEdu ? lastEdu.displayOrder + 1 : 0;

    const entry = await prisma.education.create({
      data: {
        institution: data.institution,
        degree: data.degree,
        fieldOfStudy: data.fieldOfStudy,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        description: data.description,
        gpa: data.gpa,
        achievement: data.achievement,
        displayOrder,
      },
    });

    return { success: true, data: entry };
  } catch (error: any) {
    console.error('Create education error:', error);
    return { success: false, error: error.message || 'Failed to create education entry.' };
  }
}

/**
 * Update an education entry
 */
export async function updateEducation(
  id: string,
  data: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate?: string | null;
    description?: string | null;
    gpa?: string | null;
    achievement?: string | null;
  }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const updated = await prisma.education.update({
      where: { id },
      data: {
        institution: data.institution,
        degree: data.degree,
        fieldOfStudy: data.fieldOfStudy,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        description: data.description,
        gpa: data.gpa,
        achievement: data.achievement,
      },
    });

    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Update education error:', error);
    return { success: false, error: error.message || 'Failed to update education entry.' };
  }
}

/**
 * Delete an education entry
 */
export async function deleteEducation(id: string) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    await prisma.education.delete({
      where: { id },
    });
    return { success: true };
  } catch (error: any) {
    console.error('Delete education error:', error);
    return { success: false, error: error.message || 'Failed to delete education entry.' };
  }
}

/**
 * Reorder education list in database
 */
export async function reorderEducation(orderedIds: string[]) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const updates = orderedIds.map((id, index) =>
      prisma.education.update({
        where: { id },
        data: { displayOrder: index },
      })
    );
    await prisma.$transaction(updates);
    return { success: true };
  } catch (error: any) {
    console.error('Reorder education error:', error);
    return { success: false, error: error.message || 'Failed to reorder education list.' };
  }
}
