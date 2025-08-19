// app/robots.ts
import { MetadataRoute } from 'next';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://article.stmjournals.com';

export default function robots(): MetadataRoute.Robots {
  const isDev = process.env.NODE_ENV === 'development';
  const isPreview = process.env.VERCEL_ENV === 'preview';
  const isStaging = process.env.NEXT_PUBLIC_DEPLOY_ENV === 'staging' || isPreview;

  if (isDev || isStaging) {
    return { rules: { userAgent: '*', disallow: '/' }, sitemap: `${SITE_URL}/sitemap.xml` };
  }

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/admin/', '/_next/', '/private/', '/temp/'] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
