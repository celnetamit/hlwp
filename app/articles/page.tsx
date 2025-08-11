// app/articles/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import { journals } from '../data/journals'
import { JsonLd } from '../components/JsonLd'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://article.stmjournals.com'
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Journal Library'

export const metadata: Metadata = {
  title: `All Articles - ${SITE_NAME}`,
  description: 'Browse comprehensive collection of peer-reviewed academic articles and research papers across multiple disciplines with full-text access.',
  alternates: {
    canonical: `${SITE_URL}/articles`,
  },
  openGraph: {
    title: `All Articles - ${SITE_NAME}`,
    description: 'Browse comprehensive collection of peer-reviewed academic articles with full-text access.',
    url: `${SITE_URL}/articles`,
    type: 'website',
  },
  other: {
    'citation_title': `${SITE_NAME} - Article Collection`,
    'citation_author': `${SITE_NAME} Team`,
    'citation_publication_date': '2024',
    'citation_journal_title': SITE_NAME,
    'citation_publisher': 'STM Journals',
    'citation_abstract_html_url': `${SITE_URL}/articles`,
    'citation_fulltext_html_url': `${SITE_URL}/articles`,
    'citation_language': 'en',
  }
}

// Get all articles from all journals
function getAllArticles() {
  const allArticles: any[] = []
  
  journals.forEach(journal => {
    if (journal.articles) {
      journal.articles.forEach(article => {
        allArticles.push({
          ...article,
          journal: journal.title,
          publisher: journal.publisher
        })
      })
    }
  })
  
  return allArticles.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
}

export default function ArticlesPage() {
  const articles = getAllArticles()

  // Structured data for the article collection
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${SITE_NAME} - Article Collection`,
    description: 'Comprehensive collection of peer-reviewed academic articles',
    url: `${SITE_URL}/articles`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: articles.length,
      itemListElement: articles.slice(0, 50).map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'ScholarlyArticle',
          name: article.title,
          url: `${SITE_URL}/article/${article.id}`,
          author: article.authors.map((author: string) => ({
            '@type': 'Person',
            name: author
          })),
          datePublished: article.publishedDate,
          publisher: {
            '@type': 'Organization',
            name: article.publisher
          }
        }
      }))
    },
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL
    }
  }

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
      }
    ]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={collectionJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="mb-4 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Articles</span>
          </nav>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Academic Articles</h1>
          <p className="text-xl text-gray-700 mb-6">
            Browse our comprehensive collection of {articles.length} peer-reviewed research articles with full-text access
          </p>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{articles.length}</div>
                <div className="text-sm text-gray-600">Total Articles</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{journals.length}</div>
                <div className="text-sm text-gray-600">Journals</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {[...new Set(articles.flatMap(a => a.subjects))].length}
                </div>
                <div className="text-sm text-gray-600">Research Areas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {articles.filter(a => a.fullText).length}
                </div>
                <div className="text-sm text-gray-600">Full-Text Available</div>
              </div>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="space-y-6">
          {articles.map((article) => {
            const publishedDate = new Date(article.publishedDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })

            return (
              <article key={article.id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        Article
                      </span>
                      {article.fullText && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                          Full Text Available
                        </span>
                      )}
                      <span className="text-gray-500 text-sm">{publishedDate}</span>
                    </div>
                    
                    <Link 
                      href={`/article/${article.id}`}
                      className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors block mb-2"
                    >
                      {article.title}
                    </Link>
                    
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Authors:</span> {article.authors.join(', ')}
                    </p>
                    
                    <p className="text-gray-600 mb-3">
                      <span className="font-medium">Published in:</span> {article.journal}
                    </p>
                    
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {article.abstract.length > 300 
                        ? `${article.abstract.substring(0, 300)}...` 
                        : article.abstract
                      }
                    </p>
                    
                    {/* Keywords and Subjects */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.subjects.slice(0, 3).map((subject: string, index: number) => (
                        <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                          {subject}
                        </span>
                      ))}
                      {article.keywords.slice(0, 3).map((keyword: string, index: number) => (
                        <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                          {keyword}
                        </span>
                      ))}
                    </div>
                    
                    {/* Metadata */}
                    <div className="text-sm text-gray-500 space-y-1">
                      {article.doi && (
                        <div>
                          <span className="font-medium">DOI:</span> {article.doi}
                        </div>
                      )}
                      {article.citations && (
                        <div>
                          <span className="font-medium">Citations:</span> {article.citations}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-6 space-y-2">
                    <Link 
                      href={`/article/${article.id}`}
                      className="block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-center text-sm"
                    >
                      Read Article
                    </Link>
                    {article.pdfUrl && (
                      <a 
                        href={article.pdfUrl}
                        className="block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors text-center text-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download PDF
                      </a>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {/* Load More / Pagination could be added here */}
        {articles.length > 50 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Showing first 50 articles. Use our <Link href="/search" className="text-blue-600 hover:underline">search feature</Link> to find specific articles.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}