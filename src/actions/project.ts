'use server';

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getCurrentAdmin } from './auth';

/**
 * Helper to generate a slug from a title
 */
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
}

/**
 * Fetch all project records with their technologies and case study reference
 */
export async function getProjects() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        technologies: {
          include: {
            technology: true,
          },
        },
        caseStudy: {
          select: {
            id: true,
          },
        },
      },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ],
    });
    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

/**
 * Fetch a single project by its slug
 */
export async function getProjectBySlug(slug: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { slug },
      include: {
        technologies: {
          include: {
            technology: true,
          },
        },
        caseStudy: true,
      },
    });
    return project;
  } catch (error) {
    console.error(`Error fetching project slug ${slug}:`, error);
    return null;
  }
}

/**
 * Fetch a single project by its ID
 */
export async function getProjectById(id: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        technologies: {
          select: {
            technologyId: true,
          },
        },
        caseStudy: true,
      },
    });
    return project;
  } catch (error) {
    console.error(`Error fetching project by ID ${id}:`, error);
    return null;
  }
}

/**
 * Create a new project record
 */
export async function createProject(data: {
  title: string;
  slug?: string | null;
  shortDescription: string;
  fullDescription: string;
  category: string;
  role?: string | null;
  thumbnail?: string | null;
  projectImages: string[];
  liveUrl?: string | null;
  githubUrl?: string | null;
  featured: boolean;
  technologyIds: string[];
}) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    // Generate unique slug if not provided
    const baseSlug = data.slug && data.slug.trim() !== '' ? slugify(data.slug) : slugify(data.title);
    let finalSlug = baseSlug;
    let slugCounter = 1;
    
    // Check if slug exists
    while (await prisma.project.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${slugCounter}`;
      slugCounter++;
    }

    // Get next display order
    const lastProj = await prisma.project.findFirst({
      orderBy: { displayOrder: 'desc' },
    });
    const displayOrder = lastProj ? lastProj.displayOrder + 1 : 0;

    const project = await prisma.project.create({
      data: {
        title: data.title,
        slug: finalSlug,
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription,
        category: data.category,
        role: data.role,
        thumbnail: data.thumbnail,
        projectImages: data.projectImages,
        liveUrl: data.liveUrl,
        githubUrl: data.githubUrl,
        featured: data.featured,
        displayOrder,
        technologies: {
          create: data.technologyIds.map((techId) => ({
            technologyId: techId,
          })),
        },
      },
    });

    return { success: true, data: project };
  } catch (error: any) {
    console.error('Create project error:', error);
    return { success: false, error: error.message || 'Failed to create project.' };
  }
}

/**
 * Update an existing project record
 */
export async function updateProject(
  id: string,
  data: {
    title: string;
    slug?: string | null;
    shortDescription: string;
    fullDescription: string;
    category: string;
    role?: string | null;
    thumbnail?: string | null;
    projectImages: string[];
    liveUrl?: string | null;
    githubUrl?: string | null;
    featured: boolean;
    technologyIds: string[];
  }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    // Check if project exists
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: 'Project not found.' };
    }

    // Handle slug change / unique verification
    const baseSlug = data.slug && data.slug.trim() !== '' ? slugify(data.slug) : slugify(data.title);
    let finalSlug = baseSlug;
    let slugCounter = 1;

    if (finalSlug !== existing.slug) {
      while (await prisma.project.findUnique({ where: { slug: finalSlug } })) {
        finalSlug = `${baseSlug}-${slugCounter}`;
        slugCounter++;
      }
    } else {
      finalSlug = existing.slug;
    }

    // Use a transaction to clean and recreate technology relations, and update project details
    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Delete existing relations
      await tx.projectTechnology.deleteMany({
        where: { projectId: id },
      });

      const finalThumbnail =
        data.thumbnail !== undefined && data.thumbnail !== null && data.thumbnail !== ''
          ? data.thumbnail
          : existing.thumbnail;

      const finalProjectImages =
        data.projectImages && data.projectImages.length > 0
          ? data.projectImages
          : existing.projectImages;

      // 2. Update project + recreate relations
      return tx.project.update({
        where: { id },
        data: {
          title: data.title,
          slug: finalSlug,
          shortDescription: data.shortDescription,
          fullDescription: data.fullDescription,
          category: data.category,
          role: data.role,
          thumbnail: finalThumbnail,
          projectImages: finalProjectImages,
          liveUrl: data.liveUrl,
          githubUrl: data.githubUrl,
          featured: data.featured,
          technologies: {
            create: data.technologyIds.map((techId) => ({
              technologyId: techId,
            })),
          },
        },
      });
    });

    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Update project error:', error);
    return { success: false, error: error.message || 'Failed to update project.' };
  }
}

/**
 * Delete a project record (relations and case studies are cascade deleted)
 */
export async function deleteProject(id: string) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    await prisma.project.delete({
      where: { id },
    });
    return { success: true };
  } catch (error: any) {
    console.error('Delete project error:', error);
    return { success: false, error: error.message || 'Failed to delete project.' };
  }
}

/**
 * Toggle the featured flag on a project
 */
export async function toggleProjectFeatured(id: string, featured: boolean) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const updated = await prisma.project.update({
      where: { id },
      data: { featured },
    });
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Toggle project featured error:', error);
    return { success: false, error: error.message || 'Failed to update project featured status.' };
  }
}

/**
 * Reorder projects by updating displayOrder fields
 */
export async function reorderProjects(orderedIds: string[]) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const updates = orderedIds.map((id, index) =>
      prisma.project.update({
        where: { id },
        data: { displayOrder: index },
      })
    );
    await prisma.$transaction(updates);
    return { success: true };
  } catch (error: any) {
    console.error('Reorder projects error:', error);
    return { success: false, error: error.message || 'Failed to reorder projects.' };
  }
}
