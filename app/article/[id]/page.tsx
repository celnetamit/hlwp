import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { JsonLd } from '../../components/JsonLd'
import ArticleViewer from '../../components/ArticleViewer'
import { wpAPI } from '../../lib/wordpress'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://article.stmjournals.com'
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Journal Library'

interface Article {
  id: string
  title: string
  authors: string[]
  abstract: string
  fullText?: string
  keywords: string[]
  doi?: string
  publishedDate: string
  journal: string
  volume?: string
  issue?: string
  pages?: string
  pdfUrl?: string
  citations?: number
  references?: string[]
  subjects: string[]
  language?: string
  publisher?: string
}

// Function to fetch the article based on id or slug
async function getArticle(id: string): Promise<Article | null> {
  const post = await wpAPI.getArticle(id);
  if (!post) return null;

  return {
    id: post.id.toString(),
    title: post.title.rendered,
    authors: post.meta.journal_authors || [],
    abstract: post.meta.journal_abstract || '',
    keywords: post.meta.journal_keywords || [],
    publishedDate: post.date,
    journal: post.meta.journal_publisher || 'STM Journals',
    volume: post.meta.journal_volume,
    issue: post.meta.journal_issue,
    pages: post.meta.journal_pages,
    pdfUrl: post.meta.journal_pdf_url,
    citations: post.meta.journal_citation_count ?? 0, // Use nullish coalescing to default to 0 if missing
    references: post.meta.journal_citations ?? [], // Ensure it's always an array, even if missing
    subjects: post.meta.journal_keywords || [],
    language: post.meta.journal_language,
    publisher: post.meta.journal_publisher || 'STM Journals',
  };
}

// Generate metadata for SEO and social media sharing
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const article = await getArticle(params.id)

  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.',
    }
  }

  const articleUrl = `${SITE_URL}/article/${article.id}`

  return {
    title: `${article.title} | ${SITE_NAME}`,
    description: article.abstract.substring(0, 160) + '...',
    keywords: article.keywords.join(', '),
    authors: article.authors.map(name => ({ name })),
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title: article.title,
      description: article.abstract.substring(0, 200) + '...',
      url: articleUrl,
      type: 'article',
      publishedTime: article.publishedDate,
      authors: article.authors,
      section: article.subjects[0] || 'Research',
      tags: article.keywords,
    },
    twitter: {
      card: 'summary',
      title: article.title,
      description: article.abstract.substring(0, 200) + '...',
    },
    other: {
      'citation_title': article.title,
      'citation_author': article.authors.join('; '),
      'citation_publication_date': article.publishedDate.split('T')[0],
      'citation_journal_title': article.journal,
      'citation_publisher': article.publisher || 'STM Journals',
      'citation_volume': article.volume || '',
      'citation_issue': article.issue || '',
      'citation_firstpage': article.pages?.split('-')[0] || '',
      'citation_lastpage': article.pages?.split('-')[1] || '',
      'citation_doi': article.doi || '',
      'citation_abstract_html_url': articleUrl,
      'citation_fulltext_html_url': articleUrl,
      'citation_pdf_url': article.pdfUrl || `${articleUrl}/pdf`,
      'citation_language': article.language || 'en',
      'citation_keywords': article.keywords.join('; '),
      'dc.title': article.title,
      'dc.creator': article.authors.join('; '),
      'dc.publisher': article.publisher || 'STM Journals',
      'dc.date': article.publishedDate.split('T')[0],
      'dc.type': 'Text',
      'dc.format': 'text/html',
      'dc.identifier': article.doi || articleUrl,
      'dc.language': article.language || 'en',
      'dc.subject': article.subjects.join('; '),
      'dc.description': article.abstract,
      'dc.rights': '© STM Journals. All rights reserved.',
      'robots': 'index,follow',
      'revisit-after': '7 days',
      'content-language': article.language || 'en',
    },
  }
}

// Default Page Component to render article
export default async function Page({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id)

  if (!article) {
    notFound()
  }

  const articleUrl = `${SITE_URL}/article/${article.id}`

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: article.title,
    name: article.title,
    author: article.authors.map(a => ({ '@type': 'Person', name: a })),
    publisher: {
      '@type': 'Organization',
      name: article.publisher || 'STM Journals',
      url: SITE_URL,
    },
    datePublished: article.publishedDate,
    dateModified: article.publishedDate,
    description: article.abstract,
    abstract: article.abstract,
    keywords: article.keywords.join(', '),
    url: articleUrl,
    mainEntityOfPage: articleUrl,
    isPartOf: {
      '@type': 'Periodical',
      name: article.journal,
      publisher: {
        '@type': 'Organization',
        name: article.publisher || 'STM Journals',
      },
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Articles', item: `${SITE_URL}/articles` },
      { '@type': 'ListItem', position: 3, name: article.title, item: articleUrl },
    ],
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <ArticleViewer article={article} />
      <div className="hidden">
        <span itemProp="headline">{article.title}</span>
        <span itemProp="datePublished">{article.publishedDate}</span>
        <span itemProp="publisher">{article.publisher}</span>
        {article.authors.map((author, i) => (
          <span key={i} itemProp="author">{author}</span>
        ))}
        {article.keywords.map((keyword, i) => (
          <span key={i} itemProp="keywords">{keyword}</span>
        ))}
        <span itemProp="abstract">{article.abstract}</span>
      </div>
    </div>
  )
}

// Static Params for dynamic routing
export function generateStaticParams(): { id: string }[] {
  const articleIds: string[] = []

  journals.forEach(journal => {
    if (journal.articles) {
      journal.articles.forEach((article: any) => {
        articleIds.push(article.id)
        if (article.slug && article.slug !== article.id) {
          articleIds.push(article.slug)
        }
      })
    }
  })

  return articleIds.map(id => ({ id }))
}
