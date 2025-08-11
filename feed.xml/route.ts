import { journals } from '../data/journals'

export async function GET() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://article.stmjournals.com'
  
  const allArticles = journals.flatMap(journal => 
    (journal.articles || []).map(article => ({
      ...article,
      journal: journal.title
    }))
  ).sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>STM Journals - Latest Research</title>
    <link>${SITE_URL}</link>
    <description>Latest academic research articles and journals</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${allArticles.slice(0, 50).map(article => `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${SITE_URL}/article/${article.id}</link>
      <guid>${SITE_URL}/article/${article.id}</guid>
      <description><![CDATA[${article.abstract}]]></description>
      <pubDate>${new Date(article.publishedDate).toUTCString()}</pubDate>
      <author><![CDATA[${article.authors.join(', ')}]]></author>
      <category><![CDATA[${article.subjects?.join(', ') || ''}]]></category>
    </item>`).join('')}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=3600'
    }
  })
}