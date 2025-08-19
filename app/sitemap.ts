// app/sitemap.ts
import { MetadataRoute } from 'next';
import { wpAPI, SITE_URL } from './lib/wordpress';

// Defensive helpers
const safeDate = (v?: string) => (v ? new Date(v) : new Date());

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ---- fetch live content from WordPress ----
  // Pull a good amount; raise per_page if you need more.
  let posts: Awaited<ReturnType<typeof wpAPI.getJournals>>['journals'] = [];
  try {
    const res = await wpAPI.getJournals({ per_page: 100, page: 1, orderby: 'modified', order: 'desc' });
    posts = res.journals;
  } catch (e) {
    // If WP is temporarily unavailable, still return base URLs so the sitemap never fails the build.
    posts = [];
  }

  // ---- base routes (kept from your style) ----
  const base: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/journals`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/articles`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE_URL}/search`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: new Date('2024-01-01'), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: new Date('2024-01-01'), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: new Date('2024-01-01'), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms-of-service`, lastModified: new Date('2024-01-01'), changeFrequency: 'yearly', priority: 0.3 },
  ];

  // ---- journal detail pages (your /journal/[slug] page) ----
  // "posts" are the items you show as "journals".
  const journalRoutes: MetadataRoute.Sitemap = posts.map((p) => {
    const last = safeDate(p.modified || p.date);
    const days = Math.floor((now.getTime() - last.getTime()) / 86400000);
    const priority = days < 7 ? 0.95 : days < 30 ? 0.9 : days < 90 ? 0.85 : 0.8;
    const changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] =
      days < 7 ? 'daily' : days < 180 ? 'weekly' : 'monthly';
    return {
      url: `${SITE_URL}/journal/${p.slug}`, // <-- use slug, not id
      lastModified: last,
      changeFrequency,
      priority,
    };
  });

  // ---- article pages (your /article/[id] page) ----
  const articleRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/article/${p.id}`, // your article page reads by id
    lastModified: safeDate(p.modified || p.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // (Optional) category/subject/publisher archives can be added *only if*
  // you actually have pages for them. Since those fields are not native to
  // the WP /posts response, we skip them to avoid dead links.

  // Combine & cap (Next will serve it as sitemap.xml)
  const all = [...base, ...journalRoutes, ...articleRoutes]
    // de-dupe just in case
    .filter((v, i, a) => a.findIndex(x => x.url === v.url) === i)
    // keep highest priorities first (not required, just neat)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  // Keep well below limits; enlarge if you have many posts.
  return all.slice(0, 50000);
}
