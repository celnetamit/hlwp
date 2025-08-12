import { MetadataRoute } from 'next'

// Dynamic import of journals data with fallback
async function getJournalsData() {
  try {
    const { journals } = await import('./data/journals')
    return journals || []
  } catch (error) {
    console.warn('Could not load journals data:', error)
    return []
  }
}

// Dynamic route discovery (kept as-is; not used below)
async function getApiRoutes() {
  const apiRoutes = [
    '/api/search',
    '/api/journals',
    '/api/categories',
    '/api/subjects',
    '/api/publishers',
  ]

  // Filter out routes based on environment
  if (process.env.NODE_ENV !== 'production') {
    return apiRoutes.filter(route => !route.includes('admin'))
  }

  return apiRoutes
}

// Get dynamic pages based on content
async function getDynamicPages() {
  const pages: string[] = []

  // Add conditional pages based on environment variables
  if (process.env.ENABLE_BLOG === 'true') {
    pages.push('/blog', '/blog/categories')
  }

  if (process.env.ENABLE_NEWS === 'true') {
    pages.push('/news', '/news/archive')
  }

  if (process.env.ENABLE_RESOURCES === 'true') {
    pages.push('/resources', '/resources/tools', '/resources/guides')
  }

  return pages
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://article.stmjournals.com'
  const currentDate = new Date()
  const isProduction = process.env.NODE_ENV === 'production'

  // Get dynamic data
  const journals = await getJournalsData()
  const dynamicPages = await getDynamicPages()

  // Base routes with dynamic priorities and frequencies
  const baseRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/journals`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/search`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/categories`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/subjects`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/publishers`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date('2024-01-01'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date('2024-01-01'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/privacy-policy`,
      lastModified: new Date('2024-01-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms-of-service`,
      lastModified: new Date('2024-01-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Add dynamic pages
  const dynamicRoutes: MetadataRoute.Sitemap = dynamicPages.map(page => ({
    url: `${siteUrl}${page}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Journal pages with dynamic metadata
  const journalRoutes: MetadataRoute.Sitemap = journals.map((journal: any) => {
    const lastModified =
      journal.lastUpdated
        ? new Date(journal.lastUpdated)
        : journal.publishedDate
        ? new Date(journal.publishedDate)
        : currentDate

    // Higher priority for recently updated journals
    const daysSinceUpdate = Math.floor(
      (currentDate.getTime() - lastModified.getTime()) / (1000 * 60 * 60 * 24)
    )
    let priority = 0.8

    if (daysSinceUpdate < 7) priority = 0.95
    else if (daysSinceUpdate < 30) priority = 0.9
    else if (daysSinceUpdate < 90) priority = 0.85

    // Dynamic change frequency based on journal activity
    let changeFrequency: 'daily' | 'weekly' | 'monthly' = 'weekly'
    if (journal.isActivelyUpdated || daysSinceUpdate < 7) changeFrequency = 'daily'
    else if (daysSinceUpdate > 180) changeFrequency = 'monthly'

    return {
      url: `${siteUrl}/journal/${journal.id}`,
      lastModified,
      changeFrequency,
      priority,
    }
  })

  // Journal slug routes (if different from ID)
  const journalSlugRoutes: MetadataRoute.Sitemap = journals
    .filter((journal: any) => journal.slug && journal.slug !== journal.id)
    .map((journal: any) => ({
      url: `${siteUrl}/journal/${journal.slug}`,
      lastModified: journal.lastUpdated ? new Date(journal.lastUpdated) : currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))

  // Dynamic category pages
  const categories = [
    ...new Set(journals.map((journal: any) => journal.category).filter(Boolean)),
  ]

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category: string) => {
    const categoryJournals = journals.filter((j: any) => j.category === category)
    const mostRecentUpdate =
      categoryJournals
        .map((j: any) => (j.lastUpdated ? new Date(j.lastUpdated) : new Date()))
        .sort((a: Date, b: Date) => b.getTime() - a.getTime())[0] || currentDate

    return {
      url: `${siteUrl}/category/${encodeURIComponent(
        category.toLowerCase().replace(/\s+/g, '-')
      )}`,
      lastModified: mostRecentUpdate,
      changeFrequency: 'daily' as const,
      priority: Math.min(0.8, 0.5 + categoryJournals.length * 0.01),
    }
  })

  // Dynamic subject/discipline pages
  const subjects = [
    ...new Set(
      journals
        .flatMap((j: any) => j.subjects || j.keywords || [])
        .filter(Boolean)
    ),
  ]

  const subjectRoutes: MetadataRoute.Sitemap = subjects.slice(0, 100).map((subject: string) => {
    const subjectJournals = journals.filter(
      (j: any) =>
        (j.subjects || []).includes(subject) ||
        (j.keywords || []).includes(subject)
    )

    return {
      url: `${siteUrl}/subject/${encodeURIComponent(
        subject.toLowerCase().replace(/\s+/g, '-')
      )}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: Math.min(0.7, 0.4 + subjectJournals.length * 0.01),
    }
  })

  // Dynamic publisher pages
  const publishers = [
    ...new Set(journals.map((j: any) => j.publisher).filter(Boolean)),
  ]

  const publisherRoutes: MetadataRoute.Sitemap = publishers.map((publisher: string) => {
    const publisherJournals = journals.filter((j: any) => j.publisher === publisher)

    return {
      url: `${siteUrl}/publisher/${encodeURIComponent(
        publisher.toLowerCase().replace(/\s+/g, '-')
      )}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: Math.min(0.6, 0.3 + publisherJournals.length * 0.01),
    }
  })

  // Individual article pages (if available)
  const articleRoutes: MetadataRoute.Sitemap = journals
    .flatMap((j: any) => (j.articles || []).slice(0, 10)) // Limit to 10 most recent articles per journal
    .filter(Boolean)
    .map((article: any) => ({
      url: `${siteUrl}/article/${article.id || article.slug}`,
      lastModified: article.publishedDate ? new Date(article.publishedDate) : currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

  // Archive pages for different time periods
  const now = new Date()
  const archiveRoutes: MetadataRoute.Sitemap = []

  if (isProduction) {
    // Generate archive pages for the last 24 months
    for (let i = 0; i < 24; i++) {
      const archiveDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = archiveDate.getFullYear()
      const month = String(archiveDate.getMonth() + 1).padStart(2, '0')

      archiveRoutes.push({
        url: `${siteUrl}/archive/${year}/${month}`,
        lastModified: archiveDate,
        changeFrequency: 'yearly',
        priority: i < 6 ? 0.4 : 0.2, // Higher priority for recent archives
      })
    }
  }

  // Combine all routes and sort by priority
  const allRoutes = [
    ...baseRoutes,
    ...dynamicRoutes,
    ...journalRoutes,
    ...journalSlugRoutes,
    ...categoryRoutes,
    ...subjectRoutes,
    ...publisherRoutes,
    ...articleRoutes,
    ...archiveRoutes,
  ].sort((a, b) => (b.priority || 0) - (a.priority || 0))

  // Limit total URLs to avoid sitemap being too large
  const maxUrls = isProduction ? 50000 : 1000
  return allRoutes.slice(0, maxUrls)
}
