import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://article.stmjournals.com'
  const isProduction = process.env.NODE_ENV === 'production'
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  // Development environment - restrict all crawling
  if (isDevelopment) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
      sitemap: `${siteUrl}/sitemap.xml`,
    }
  }
  
  // Staging environment - allow only specific bots
  if (process.env.VERCEL_ENV === 'preview' || process.env.NODE_ENV === 'staging') {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
      sitemap: `${siteUrl}/sitemap.xml`,
    }
  }
  
  // Dynamic disallow patterns based on environment variables
  const dynamicDisallows = [
    '/api/',
    '/admin/',
    '/_next/',
    '/private/',
    '/temp/',
    '/*.json', // ✅ fixed missing closing quote
    '/search?*',
    ...(process.env.BLOCK_DRAFTS === 'true' ? ['/drafts/', '/preview/'] : []),
    ...(process.env.BLOCK_USER_CONTENT === 'true' ? ['/user/', '/profile/'] : []),
  ]
  
  // Academic and research-focused crawlers
  const academicCrawlers = [
    'Googlebot',
    'Bingbot',
    'Slurp', // Yahoo
    'DuckDuckBot',
    'Baiduspider',
    'YandexBot',
    'facebookexternalhit',
    'Twitterbot',
    'LinkedInBot',
    // Academic specific
    'ScolarBot',
    'Microsoft Academic Search Bot',
    'Semantic Scholar Bot',
    'ResearchGate',
    'Academia.edu Bot',
    'Mendeley',
    'Zotero',
    'CiteSeerX',
    'JSTOR',
    'PubMed',
    'ArXiv',
  ]
  
  // AI and content scrapers to block
  const blockedCrawlers = [
    'CCBot',
    'ChatGPT-User',
    'GPTBot',
    'AdsBot-Google',
    'AhrefsBot',
    'SemrushBot',
    'MJ12bot',
    'DotBot',
    'AspiegelBot',
    'VelenPublicWebCrawler',
    'MegaIndex.ru',
    'SeznamBot',
    'Mail.RU_Bot',
    'Applebot',
    'Yeti',
    'Barkrowler',
    'Cliqzbot',
    'Exabot',
    'Facebot',
    'ia_archiver',
    'MojeekBot',
    'Qwantify',
    'Sogou',
    'TurnitinBot',
    'Vagabondo',
    'Wayback',
    'ZoomBot',
    // Block specific AI training bots
    'anthropic-ai',
    'Claude-Web',
    ...(process.env.BLOCK_AI_CRAWLERS === 'true' ? ['*Bot', '*Crawler', '*Spider'] : []),
  ]
  
  const rules: MetadataRoute.Robots['rules'] = [
    // Allow all legitimate crawlers
    {
      userAgent: '*',
      allow: '/',
      disallow: dynamicDisallows,
      crawlDelay: isProduction ? undefined : 1, // Add crawl delay for non-production
    },
    
    // Specific rules for academic crawlers
    ...academicCrawlers.map(bot => ({
      userAgent: bot,
      allow: [
        '/',
        '/journal/',
        '/search/',
        '/category/',
        '/subject/',
        '/publisher/',
      ],
      disallow: ['/api/', '/admin/', '/_next/', '/private/'],
    })),
    
    // Block problematic crawlers
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
