'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentAdmin } from './auth';

/**
 * Fetch case study by associated project ID
 */
export async function getCaseStudyByProjectId(projectId: string) {
  try {
    const caseStudy = await prisma.caseStudy.findUnique({
      where: { projectId },
    });
    return caseStudy;
  } catch (error) {
    console.error('Error fetching case study:', error);
    return null;
  }
}

/**
 * Create or update a case study record for a project
 */
export async function upsertCaseStudy(
  projectId: string,
  data: {
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
    
    // Business process modeling fields
    businessProcess?: string | null;
    asIsProcess?: string | null;
    toBeProcess?: string | null;
    requirementsAnalysis?: string | null;
    
    // Diagram URLs
    bpmn?: string | null;
    uml?: string | null;
    uiUxDesign?: string | null;
    databaseDesign?: string | null;
    applicationScreenshots: string[];
    uat?: string | null;
  }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const existing = await prisma.caseStudy.findUnique({ where: { projectId } });

    const finalBpmn =
      data.bpmn !== undefined && data.bpmn !== null && data.bpmn !== ''
        ? data.bpmn
        : (existing?.bpmn || null);

    const finalUml =
      data.uml !== undefined && data.uml !== null && data.uml !== ''
        ? data.uml
        : (existing?.uml || null);

    const finalDbDesign =
      data.databaseDesign !== undefined && data.databaseDesign !== null && data.databaseDesign !== ''
        ? data.databaseDesign
        : (existing?.databaseDesign || null);

    const finalScreenshots =
      data.applicationScreenshots && data.applicationScreenshots.length > 0
        ? data.applicationScreenshots
        : (existing?.applicationScreenshots || []);

    const caseStudy = await prisma.caseStudy.upsert({
      where: { projectId },
      update: {
        overview: data.overview,
        background: data.background,
        problem: data.problem,
        process: data.process,
        analysis: data.analysis,
        solution: data.solution,
        design: data.design,
        development: data.development,
        testing: data.testing,
        result: data.result,
        
        businessProcess: data.businessProcess,
        asIsProcess: data.asIsProcess,
        toBeProcess: data.toBeProcess,
        requirementsAnalysis: data.requirementsAnalysis,
        bpmn: finalBpmn,
        uml: finalUml,
        uiUxDesign: data.uiUxDesign,
        databaseDesign: finalDbDesign,
        applicationScreenshots: finalScreenshots,
        uat: data.uat,
      },
      create: {
        projectId,
        overview: data.overview,
        background: data.background,
        problem: data.problem,
        process: data.process,
        analysis: data.analysis,
        solution: data.solution,
        design: data.design,
        development: data.development,
        testing: data.testing,
        result: data.result,
        
        businessProcess: data.businessProcess,
        asIsProcess: data.asIsProcess,
        toBeProcess: data.toBeProcess,
        requirementsAnalysis: data.requirementsAnalysis,
        bpmn: data.bpmn,
        uml: data.uml,
        uiUxDesign: data.uiUxDesign,
        databaseDesign: data.databaseDesign,
        applicationScreenshots: data.applicationScreenshots,
        uat: data.uat,
      },
    });

    return { success: true, data: caseStudy };
  } catch (error: any) {
    console.error('Upsert case study Server Action error:', error);
    return { success: false, error: error.message || 'Failed to save case study.' };
  }
}
