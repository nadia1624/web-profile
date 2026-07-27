'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentAdmin } from './auth';

// ==========================================
// SKILLS CRUD ACTIONS
// ==========================================

/**
 * Fetch all skill entries ordered by displayOrder (ascending)
 */
export async function getSkills() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return skills;
  } catch (error) {
    console.error('Error fetching skills:', error);
    return [];
  }
}

/**
 * Create a new skill
 */
export async function createSkill(data: {
  name: string;
  category: string;
  icon?: string | null;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    // Get next display order
    const lastSkill = await prisma.skill.findFirst({
      orderBy: { displayOrder: 'desc' },
    });
    const displayOrder = lastSkill ? lastSkill.displayOrder + 1 : 0;

    const skill = await prisma.skill.create({
      data: {
        name: data.name,
        category: data.category,
        icon: data.icon,
        displayOrder,
      },
    });

    return { success: true, data: skill };
  } catch (error: any) {
    console.error('Create skill error:', error);
    return { success: false, error: error.message || 'Failed to create skill.' };
  }
}

/**
 * Update a skill
 */
export async function updateSkill(
  id: string,
  data: {
    name: string;
    category: string;
    icon?: string | null;
  }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const updated = await prisma.skill.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        icon: data.icon,
      },
    });

    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Update skill error:', error);
    return { success: false, error: error.message || 'Failed to update skill.' };
  }
}

/**
 * Delete a skill
 */
export async function deleteSkill(id: string) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    await prisma.skill.delete({
      where: { id },
    });
    return { success: true };
  } catch (error: any) {
    console.error('Delete skill error:', error);
    return { success: false, error: error.message || 'Failed to delete skill.' };
  }
}

/**
 * Reorder skills list in database
 */
export async function reorderSkills(orderedIds: string[]) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const updates = orderedIds.map((id, index) =>
      prisma.skill.update({
        where: { id },
        data: { displayOrder: index },
      })
    );
    await prisma.$transaction(updates);
    return { success: true };
  } catch (error: any) {
    console.error('Reorder skills error:', error);
    return { success: false, error: error.message || 'Failed to reorder skills.' };
  }
}

// ==========================================
// TECHNOLOGIES CRUD ACTIONS
// ==========================================

/**
 * Fetch all technology records
 */
export async function getTechnologies() {
  try {
    const techs = await prisma.technology.findMany({
      orderBy: { name: 'asc' },
    });
    return techs;
  } catch (error) {
    console.error('Error fetching technologies:', error);
    return [];
  }
}

/**
 * Create a new technology
 */
export async function createTechnology(data: {
  name: string;
  category: string;
  icon?: string | null;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const tech = await prisma.technology.create({
      data: {
        name: data.name,
        category: data.category,
        icon: data.icon,
      },
    });

    return { success: true, data: tech };
  } catch (error: any) {
    console.error('Create technology error:', error);
    return { success: false, error: error.message || 'Failed to create technology.' };
  }
}

/**
 * Update an existing technology
 */
export async function updateTechnology(
  id: string,
  data: {
    name: string;
    category: string;
    icon?: string | null;
  }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const updated = await prisma.technology.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        icon: data.icon,
      },
    });

    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Update technology error:', error);
    return { success: false, error: error.message || 'Failed to update technology.' };
  }
}

/**
 * Delete a technology (cascade deletes ProjectTechnology relations)
 */
export async function deleteTechnology(id: string) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    await prisma.technology.delete({
      where: { id },
    });
    return { success: true };
  } catch (error: any) {
    console.error('Delete technology error:', error);
    return { success: false, error: error.message || 'Failed to delete technology.' };
  }
}
