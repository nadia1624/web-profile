import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nadiadearihanifah.com'; // Default domain

  // Fetch dynamic project slugs from the database
  let projectUrls: any[] = [];
  try {
    const projects = await prisma.project.findMany({
      select: { slug: true, updatedAt: true },
    });
    projectUrls = projects.map((p: any) => ({
      url: `${baseUrl}/projects/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Sitemap project fetch failed:', error);
  }

  // Base static routes
  const staticRoutes = ['', '/about', '/experience', '/projects', '/contact'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  return [...staticRoutes, ...projectUrls] as MetadataRoute.Sitemap;
}
