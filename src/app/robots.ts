import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://nadiadearihanifah.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/*'], // Keep the dashboard private from search engine indexes
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
