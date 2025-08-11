// app/article/[id]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { JsonLd } from '../../components/JsonLd'
import ArticleViewer from '../../components/ArticleViewer'
import { journals } from '../../data/journals'

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

interface PageProps {
  params: { id: string }
}

async function getArticle(id: string): Promise<Article | null> {
  // Find article across all journals
  for (const journal of journals) {
    if (journal.articles) {
      const article = journal.articles.find((art: any) => art.id === id || art.slug === id)
      if (article) {
        return {
          ...article,
          journal: journal.title,
          publisher: journal.publisher || 'STM Journals',
          subjects: article.subjects || journal.subjects || [],
        }
      }
    }
  }
  return null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await getArticle(params.id)
  
  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.'
    }
  }

  const articleUrl = `${SITE_URL}/article/${article.id}`
  const publishedYear = new Date(article.publishedDate).getFullYear()

  return {
    title: `${article.title} | ${SITE_NAME}`,
    description: article.abstract.substring(0, 160) + '...',
    keywords: article.keywords.join(', '),
    authors: article.authors.map(author => ({ name: author })),
    publishedTime: article.publishedDate,
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
      // Enhanced Google Scholar meta tags
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
      
      // Dublin Core meta tags
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
      
      // PRISM tags
      'prism.publicationName': article.journal,
      'prism.publicationDate': article.publishedDate.split('T')[0],
      'prism.volume': article.volume || '',
      'prism.number': article.issue || '',
      'prism.startingPage': article.pages?.split('-')[0] || '',
      'prism.endingPage': article.pages?.split('-')[1] || '',
      'prism.doi': article.doi || '',
      
      // Highwire Press tags
      'hw.ad-path': `/article/${article.id}`,
      'hw.identifier': articleUrl,
      
      // Additional academic indexing tags
      'robots': 'index,follow',
      'revisit-after': '7 days',
      'content-language': article.language || 'en',
    }
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const article = await getArticle(params.id)
  
  if (!article) {
    notFound()
  }

  const articleUrl = `${SITE_URL}/article/${article.id}`
  const publishedYear = new Date(article.publishedDate).getFullYear()

  // Structured data for the article
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: article.title,
    name: article.title,
    author: article.authors.map(author => ({
      '@type': 'Person',
      name: author
    })),
    publisher: {
      '@type': 'Organization',
      name: article.publisher || 'STM Journals',
      url: SITE_URL
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
        name: article.publisher || 'STM Journals'
      }
    },
    ...(article.doi && { 
      identifier: [
        {
          '@type': 'PropertyValue',
          propertyID: 'DOI',
          value: article.doi
        }
      ]
    }),
    ...(article.volume && {
      isPartOf: {
        '@type': 'PublicationVolume',
        volumeNumber: article.volume,
        ...(article.issue && { issueNumber: article.issue })
      }
    }),
    citation: article.references || [],
    about: article.subjects.map(subject => ({
      '@type': 'Thing',
      name: subject
    })),
    inLanguage: article.language || 'en'
  }

  // Breadcrumb structured data
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Articles',
        item: `${SITE_URL}/articles`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: articleUrl
      }
    ]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      
      {/* Article viewer component */}
      <ArticleViewer article={article} />
      
      {/* Hidden metadata for crawlers */}
      <div className="hidden">
        <span itemProp="headline">{article.title}</span>
        <span itemProp="datePublished">{article.publishedDate}</span>
        <span itemProp="publisher">{article.publisher}</span>
        {article.authors.map((author, index) => (
          <span key={index} itemProp="author">{author}</span>
        ))}
        {article.keywords.map((keyword, index) => (
          <span key={index} itemProp="keywords">{keyword}</span>
        ))}
        <span itemProp="abstract">{article.abstract}</span>
      </div>
    </div>
  )
}

export async function generateStaticParams() {
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
  
  return articleIds.map(id => ({
    id: id
  }))
}