'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentAdmin } from './auth';

/**
 * Fetch all certifications ordered by issueDate (descending)
 */
export async function getCertifications() {
  try {
    const certs = await prisma.certification.findMany({
      orderBy: { issueDate: 'desc' },
    });
    return certs;
  } catch (error) {
    console.error('Error fetching certifications:', error);
    return [];
  }
}

/**
 * Create a new certification entry
 */
export async function createCertification(data: {
  name: string;
  issuingOrganization: string;
  issueDate: string;
  credentialId?: string | null;
  credentialUrl?: string | null;
  certificateImage?: string | null;
  type?: string;
  description?: string | null;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const cert = await prisma.certification.create({
      data: {
        name: data.name,
        issuingOrganization: data.issuingOrganization,
        issueDate: new Date(data.issueDate),
        credentialId: data.credentialId,
        credentialUrl: data.credentialUrl,
        certificateImage: data.certificateImage,
        type: data.type || 'Certification',
        description: data.description,
      },
    });

    return { success: true, data: cert };
  } catch (error: any) {
    console.error('Create certification error:', error);
    return { success: false, error: error.message || 'Failed to create certification.' };
  }
}

/**
 * Update an existing certification entry
 */
export async function updateCertification(
  id: string,
  data: {
    name: string;
    issuingOrganization: string;
    issueDate: string;
    credentialId?: string | null;
    credentialUrl?: string | null;
    certificateImage?: string | null;
    type?: string;
    description?: string | null;
  }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const existing = await prisma.certification.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: 'Certification not found.' };
    }

    const finalImage =
      data.certificateImage !== undefined && data.certificateImage !== null && data.certificateImage !== ''
        ? data.certificateImage
        : existing.certificateImage;

    const updated = await prisma.certification.update({
      where: { id },
      data: {
        name: data.name,
        issuingOrganization: data.issuingOrganization,
        issueDate: new Date(data.issueDate),
        credentialId: data.credentialId,
        credentialUrl: data.credentialUrl,
        certificateImage: finalImage,
        type: data.type || 'Certification',
        description: data.description,
      },
    });

    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Update certification error:', error);
    return { success: false, error: error.message || 'Failed to update certification.' };
  }
}

/**
 * Delete a certification entry
 */
export async function deleteCertification(id: string) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    await prisma.certification.delete({
      where: { id },
    });
    return { success: true };
  } catch (error: any) {
    console.error('Delete certification error:', error);
    return { success: false, error: error.message || 'Failed to delete certification.' };
  }
}
