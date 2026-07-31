'use server';

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getCurrentAdmin } from './auth';
import { sanitizeImageUrl, sanitizeImageUrls } from '@/lib/cloudinary';

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

import { cache } from 'react';

/**
 * Fetch all project records with lean summary fields for fast listing page loading
 */
export const getProjects = cache(async () => {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        category: true,
        role: true,
        thumbnail: true,
        featured: true,
        displayOrder: true,
        createdAt: true,
        technologies: {
          select: {
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
    return JSON.parse(JSON.stringify(projects));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
});

/**
 * Fetch featured projects directly with database limit for fast homepage loading
 */
export const getFeaturedProjects = cache(async (limit = 3) => {
  try {
    const projects = await prisma.project.findMany({
      where: { featured: true },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        category: true,
        role: true,
        thumbnail: true,
        featured: true,
        displayOrder: true,
        createdAt: true,
        technologies: {
          select: {
            technology: true,
          },
        },
      },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ],
    });
    return JSON.parse(JSON.stringify(projects));
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    return [];
  }
});

/**
 * Fetch a single project by its slug (Full details including full description & case study)
 */
export const getProjectBySlug = cache(async (slug: string) => {
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
    return project ? JSON.parse(JSON.stringify(project)) : null;
  } catch (error) {
    console.error(`Error fetching project slug ${slug}:`, error);
    return null;
  }
});

/**
 * Fetch a single project by its ID
 */
export const getProjectById = cache(async (id: string) => {
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
    return project ? JSON.parse(JSON.stringify(project)) : null;
  } catch (error) {
    console.error(`Error fetching project by ID ${id}:`, error);
    return null;
  }
});

export interface CaseStudyInput {
  overview?: string | null;
  background?: string | null;
  problem?: string | null;
  process?: string | null;
  analysis?: string | null;
  solution?: string | null;
  design?: string | null;
  development?: string | null;
  testing?: string | null;
  result?: string | null;
  businessProcess?: string | null;
  asIsProcess?: string | null;
  toBeProcess?: string | null;
  requirementsAnalysis?: string | null;
  bpmn?: string | null;
  uml?: string | null;
  uiUxDesign?: string | null;
  databaseDesign?: string | null;
  applicationScreenshots?: string[];
  uat?: string | null;
}

/**
 * Create a new project record (and optional Case Study in a single transaction)
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
  caseStudy?: CaseStudyInput | null;
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

    // Sanitize image fields before DB operation
    const sanitizedThumbnail = await sanitizeImageUrl(data.thumbnail, 'portfolio/thumbnails');
    const sanitizedProjectImages = await sanitizeImageUrls(data.projectImages, 'portfolio/projects');

    const validTechIds = (data.technologyIds || [])
      .map((t: any) => (typeof t === 'string' ? t : t?.technologyId || t?.technology?.id || t?.id))
      .filter((techId): techId is string => typeof techId === 'string' && techId.trim() !== '');

    const project = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const createdProject = await tx.project.create({
        data: {
          title: data.title,
          slug: finalSlug,
          shortDescription: data.shortDescription,
          fullDescription: data.fullDescription,
          category: data.category,
          role: data.role,
          thumbnail: sanitizedThumbnail,
          projectImages: sanitizedProjectImages,
          liveUrl: data.liveUrl,
          githubUrl: data.githubUrl,
          featured: data.featured,
          displayOrder,
          technologies: {
            create: validTechIds.map((techId) => ({
              technologyId: techId,
            })),
          },
        },
      });

      if (data.caseStudy) {
        const sanitizedBpmn = await sanitizeImageUrl(data.caseStudy.bpmn, 'portfolio/diagrams');
        const sanitizedUml = await sanitizeImageUrl(data.caseStudy.uml, 'portfolio/diagrams');
        const sanitizedDbDesign = await sanitizeImageUrl(data.caseStudy.databaseDesign, 'portfolio/diagrams');
        const sanitizedScreenshots = await sanitizeImageUrls(data.caseStudy.applicationScreenshots || [], 'portfolio/screenshots');

        await tx.caseStudy.create({
          data: {
            projectId: createdProject.id,
            overview: data.caseStudy.overview || null,
            background: data.caseStudy.background || null,
            problem: data.caseStudy.problem || null,
            process: data.caseStudy.process || null,
            analysis: data.caseStudy.analysis || null,
            solution: data.caseStudy.solution || null,
            design: data.caseStudy.design || null,
            development: data.caseStudy.development || null,
            testing: data.caseStudy.testing || null,
            result: data.caseStudy.result || null,
            businessProcess: data.caseStudy.businessProcess || null,
            asIsProcess: data.caseStudy.asIsProcess || null,
            toBeProcess: data.caseStudy.toBeProcess || null,
            requirementsAnalysis: data.caseStudy.requirementsAnalysis || null,
            bpmn: sanitizedBpmn,
            uml: sanitizedUml,
            uiUxDesign: data.caseStudy.uiUxDesign || null,
            databaseDesign: sanitizedDbDesign,
            applicationScreenshots: sanitizedScreenshots,
            uat: data.caseStudy.uat || null,
          },
        });
      }

      return createdProject;
    });

    return { success: true, data: JSON.parse(JSON.stringify(project)) };
  } catch (error: any) {
    console.error('Create project error:', error);
    return { success: false, error: error.message || 'Failed to create project.' };
  }
}

/**
 * Update an existing project record (and optional Case Study in a single transaction)
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
    caseStudy?: CaseStudyInput | null;
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

    // Use a transaction to clean and recreate technology relations, update project details, and upsert case study
    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Delete existing relations
      await tx.projectTechnology.deleteMany({
        where: { projectId: id },
      });

      const rawThumbnail =
        data.thumbnail !== undefined && data.thumbnail !== null && data.thumbnail !== ''
          ? data.thumbnail
          : existing.thumbnail;

      const rawProjectImages =
        data.projectImages && data.projectImages.length > 0
          ? data.projectImages
          : existing.projectImages;

      const finalThumbnail = await sanitizeImageUrl(rawThumbnail, 'portfolio/thumbnails');
      const finalProjectImages = await sanitizeImageUrls(rawProjectImages, 'portfolio/projects');

      const validTechIds = (data.technologyIds || [])
        .map((t: any) => (typeof t === 'string' ? t : t?.technologyId || t?.technology?.id || t?.id))
        .filter((techId): techId is string => typeof techId === 'string' && techId.trim() !== '');

      const finalFullDescription =
        data.fullDescription && data.fullDescription.trim() !== ''
          ? data.fullDescription
          : existing.fullDescription;

      const finalRole =
        data.role !== undefined && data.role !== null && data.role.trim() !== ''
          ? data.role
          : existing.role;

      const finalLiveUrl =
        data.liveUrl !== undefined && data.liveUrl !== null && data.liveUrl.trim() !== ''
          ? data.liveUrl
          : existing.liveUrl;

      const finalGithubUrl =
        data.githubUrl !== undefined && data.githubUrl !== null && data.githubUrl.trim() !== ''
          ? data.githubUrl
          : existing.githubUrl;

      // 2. Update project + recreate relations
      const proj = await tx.project.update({
        where: { id },
        data: {
          title: data.title || existing.title,
          slug: finalSlug,
          shortDescription: data.shortDescription || existing.shortDescription,
          fullDescription: finalFullDescription,
          category: data.category || existing.category,
          role: finalRole,
          thumbnail: finalThumbnail,
          projectImages: finalProjectImages,
          liveUrl: finalLiveUrl,
          githubUrl: finalGithubUrl,
          featured: data.featured !== undefined ? data.featured : existing.featured,
          technologies: {
            create: validTechIds.map((techId) => ({
              technologyId: techId,
            })),
          },
        },
      });

      // 3. Upsert Case Study if provided
      if (data.caseStudy) {
        const existingCs = await tx.caseStudy.findUnique({ where: { projectId: id } });

        const getCsVal = (newVal: string | null | undefined, oldVal: string | null | undefined) => {
          if (newVal !== undefined && newVal !== null && newVal.trim() !== '') {
            return newVal;
          }
          return oldVal || null;
        };

        const rawBpmn =
          data.caseStudy.bpmn !== undefined && data.caseStudy.bpmn !== null && data.caseStudy.bpmn !== ''
            ? data.caseStudy.bpmn
            : (existingCs?.bpmn || null);

        const rawUml =
          data.caseStudy.uml !== undefined && data.caseStudy.uml !== null && data.caseStudy.uml !== ''
            ? data.caseStudy.uml
            : (existingCs?.uml || null);

        const rawDbDesign =
          data.caseStudy.databaseDesign !== undefined && data.caseStudy.databaseDesign !== null && data.caseStudy.databaseDesign !== ''
            ? data.caseStudy.databaseDesign
            : (existingCs?.databaseDesign || null);

        const rawScreenshots =
          data.caseStudy.applicationScreenshots && data.caseStudy.applicationScreenshots.length > 0
            ? data.caseStudy.applicationScreenshots
            : (existingCs?.applicationScreenshots || []);

        const finalBpmn = await sanitizeImageUrl(rawBpmn, 'portfolio/diagrams');
        const finalUml = await sanitizeImageUrl(rawUml, 'portfolio/diagrams');
        const finalDbDesign = await sanitizeImageUrl(rawDbDesign, 'portfolio/diagrams');
        const finalScreenshots = await sanitizeImageUrls(rawScreenshots, 'portfolio/screenshots');

        const csPayload = {
          overview: getCsVal(data.caseStudy.overview, existingCs?.overview),
          background: getCsVal(data.caseStudy.background, existingCs?.background),
          problem: getCsVal(data.caseStudy.problem, existingCs?.problem),
          process: getCsVal(data.caseStudy.process, existingCs?.process),
          analysis: getCsVal(data.caseStudy.analysis, existingCs?.analysis),
          solution: getCsVal(data.caseStudy.solution, existingCs?.solution),
          design: getCsVal(data.caseStudy.design, existingCs?.design),
          development: getCsVal(data.caseStudy.development, existingCs?.development),
          testing: getCsVal(data.caseStudy.testing, existingCs?.testing),
          result: getCsVal(data.caseStudy.result, existingCs?.result),
          businessProcess: getCsVal(data.caseStudy.businessProcess, existingCs?.businessProcess),
          asIsProcess: getCsVal(data.caseStudy.asIsProcess, existingCs?.asIsProcess),
          toBeProcess: getCsVal(data.caseStudy.toBeProcess, existingCs?.toBeProcess),
          requirementsAnalysis: getCsVal(data.caseStudy.requirementsAnalysis, existingCs?.requirementsAnalysis),
          bpmn: finalBpmn,
          uml: finalUml,
          uiUxDesign: getCsVal(data.caseStudy.uiUxDesign, existingCs?.uiUxDesign),
          databaseDesign: finalDbDesign,
          applicationScreenshots: finalScreenshots,
          uat: getCsVal(data.caseStudy.uat, existingCs?.uat),
        };

        await tx.caseStudy.upsert({
          where: { projectId: id },
          update: csPayload,
          create: {
            projectId: id,
            ...csPayload,
          },
        });
      }

      return proj;
    });

    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
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
