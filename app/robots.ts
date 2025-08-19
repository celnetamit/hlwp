// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://article.stmjournals.com';
  const isDev = process.env.NODE_ENV === 'development';
  const isProd = process.env.NODE_ENV === 'production';
  const isPreview = process.env.VERCEL_ENV === 'preview';
  const isStaging = process.env.NEXT_PUBLIC_DEPLOY_ENV === 'staging' || isPreview;

  if (isDev || isStaging) {
    return { rules: { userAgent: '*', disallow: '/' }, sitemap: `${siteUrl}/sitemap.xml` };
  }

  const dynamicDisallows = [
    '/api/', '/admin/', '/_next/', '/private/', '/temp/', '/*.json', '/search?*',
    ...(process.env.BLOCK_DRAFTS === 'true' ? ['/drafts/', '/preview/'] : []),
    ...(process.env.BLOCK_USER_CONTENT === 'true' ? ['/user/', '/profile/'] : []),
  ];

  const rules: MetadataRoute.Robots['rules'] = [
    { userAgent: '*', allow: '/', disallow: dynamicDisallows },
  ];

  return { rules, sitemap: `${siteUrl}/sitemap.xml`, host: siteUrl };
}
