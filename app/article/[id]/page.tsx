// app/article/[id]/page.tsx
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
    citations: post.meta.journal_citation_count,
    references: post.meta.journal_citations,
    subjects: post.meta.journal_keywords || [],
    language: post.meta.journal_language,
    publisher: post.meta.journal_publisher || 'STM Journals',
  };
}

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
