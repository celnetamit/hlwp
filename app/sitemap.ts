// app/sitemap.ts
import { MetadataRoute } from 'next';
import { wpAPI, SITE_URL } from '@/lib/wordpress';

const safeDate = (v?: string) => (v ? new Date(v) : new Date());

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  let posts: Awaited<ReturnType<typeof wpAPI.getJournals>>['journals'] = [];
  try {
    const res = await wpAPI.getJournals({ per_page: 100, page: 1, orderby: 'modified', order: 'desc' });
    posts = res.journals;
  } catch {
    posts = [];
  }

  const base: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/journals`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/articles`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE_URL}/search`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ];

  const journals = posts.map((p) => {
    const last = safeDate(p.modified || p.date);
    const days = Math.floor((now.getTime() - last.getTime()) / 86400000);
    const priority = days < 7 ? 0.95 : days < 30 ? 0.9 : days < 90 ? 0.85 : 0.8;
    const changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] =
      days < 7 ? 'daily' : days < 180 ? 'weekly' : 'monthly';
    return {
      url: `${SITE_URL}/journal/${p.slug}`,
      lastModified: last,
      changeFrequency,
      priority,
    };
  });

  const articles = posts.map((p) => ({
    url: `${SITE_URL}/article/${p.id}`,
    lastModified: safeDate(p.modified || p.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const all = [...base, ...journals, ...articles].filter(
    (v, i, a) => a.findIndex((x) => x.url === v.url) === i
  );

  return all.slice(0, 50000);
}
