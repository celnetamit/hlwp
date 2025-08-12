import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://article.stmjournals.com'

  // Typed-safe env flags
  const isDev = process.env.NODE_ENV === 'development'
  const isProd = process.env.NODE_ENV === 'production'
  const isPreview = process.env.VERCEL_ENV === 'preview'
  // Optionally set NEXT_PUBLIC_DEPLOY_ENV=staging in your env to mark staging builds
  const isStaging = process.env.NEXT_PUBLIC_DEPLOY_ENV === 'staging' || isPreview

  // Development: block everything
  if (isDev) {
    return {
      rules: { userAgent: '*', disallow: '/' },
      sitemap: `${siteUrl}/sitemap.xml`,
    }
  }

  // Staging/Preview: block everything
  if (isStaging) {
    return {
      rules: { userAgent: '*', disallow: '/' },
      sitemap: `${siteUrl}/sitemap.xml`,
    }
  }

  // --- production continues as before ---
  const dynamicDisallows = [
    '/api/',
    '/admin/',
    '/_next/',
    '/private/',
    '/temp/',
    '/*.json',
    '/search?*',
    ...(process.env.BLOCK_DRAFTS === 'true' ? ['/drafts/', '/preview/'] : []),
    ...(process.env.BLOCK_USER_CONTENT === 'true' ? ['/user/', '/profile/'] : []),
  ]

  const academicCrawlers = [
    'Googlebot','Bingbot','Slurp','DuckDuckBot','Baiduspider','YandexBot',
    'facebookexternalhit','Twitterbot','LinkedInBot',
    'ScolarBot','Microsoft Academic Search Bot','Semantic Scholar Bot',
    'ResearchGate','Academia.edu Bot','Mendeley','Zotero','CiteSeerX','JSTOR','PubMed','ArXiv',
  ]

  const blockedCrawlers = [
    'CCBot','ChatGPT-User','GPTBot','AdsBot-Google','AhrefsBot','SemrushBot','MJ12bot','DotBot',
    'AspiegelBot','VelenPublicWebCrawler','MegaIndex.ru','SeznamBot','Mail.RU_Bot','Applebot',
    'Yeti','Barkrowler','Cliqzbot','Exabot','Facebot','ia_archiver','MojeekBot','Qwantify','Sogou',
    'TurnitinBot','Vagabondo','Wayback','ZoomBot','anthropic-ai','Claude-Web',
    ...(process.env.BLOCK_AI_CRAWLERS === 'true' ? ['*Bot', '*Crawler', '*Spider'] : []),
  ]

  const rules: MetadataRoute.Robots['rules'] = [
    {
      userAgent: '*',
      allow: '/',
      disallow: dynamicDisallows,
      crawlDelay: isProd ? undefined : 1,
    },
    ...academicCrawlers.map(bot => ({
      userAgent: bot,
      allow: ['/', '/journal/', '/search/', '/category/', '/subject/', '/publisher/'],
      disallow: ['/api/', '/admin/', '/_next/', '/private/'],
    })),
    {
      userAgent: blockedCrawlers,
      disallow: '/',
    },
  ]

  return {
    rules,
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
