// app/feed.xml/route.ts
// Build RSS at request time from WordPress (no local imports)
export const dynamic = 'force-dynamic'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://article.stmjournals.com'
const WP_API =
  process.env.WORDPRESS_API_URL ||
  'https://journals.stmjournals.com/wp-json/wp/v2'

// If your journals are a CPT, set NEXT_PUBLIC_WP_COLLECTION='journals'.
// Otherwise this will fall back to 'posts'.
const COLLECTION = process.env.NEXT_PUBLIC_WP_COLLECTION || 'posts'

// tiny XML escaper
const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

// strip HTML for description
const stripHtml = (html?: string) =>
  (html || '').replace(/<[^>]*>/g, '').trim()

type WPItem = {
  id: number
  slug: string
  link?: string
  date: string
  title?: { rendered: string }
  excerpt?: { rendered: string }
  meta?: {
    journal_authors?: string[]
    journal_subjects?: string[]
  }
}

async function fetchLatest(): Promise<WPItem[]> {
  const url = `${WP_API}/${COLLECTION}?per_page=50&_embed`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return []
  const data = (await res.json()) as unknown
  return Array.isArray(data) ? (data as WPItem[]) : []
}

export async function GET() {
  const items = await fetchLatest()

  const rssItems = items
    .map((item) => {
      const title = item.title?.rendered ?? `Item #${item.id}`
      const desc = stripHtml(item.excerpt?.rendered).slice(0, 500)
      const link = item.link || `${SITE_URL}/journal/${item.slug}`
      const pubDate = new Date(item.date).toUTCString()
      const authors =
        item.meta?.journal_authors?.join(', ') || 'Unknown Author'
      const categories = item.meta?.journal_subjects?.join(', ') || ''

      return `
    <item>
      <title><![CDATA[${title}]]></title>
      <link>${esc(link)}</link>
      <guid isPermaLink="false">${esc(`${SITE_URL}/wp/${item.id}`)}</guid>
      <description><![CDATA[${desc}]]></description>
      <pubDate>${esc(pubDate)}</pubDate>
      <author><![CDATA[${authors}]]></author>
      ${categories ? `<category><![CDATA[${categories}]]></category>` : ''}
    </item>`
    })
    .join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>STM Journals - Latest Research</title>
    <link>${esc(SITE_URL)}</link>
    <description>Latest academic research articles and journals</description>
    <language>en-us</language>
    <lastBuildDate>${esc(new Date().toUTCString())}</lastBuildDate>
${rssItems}
  </channel>
</rss>`

  return new Response(rss, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'max-age=0, s-maxage=300, stale-while-revalidate=600',
    },
  })
}
