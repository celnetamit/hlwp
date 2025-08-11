// app/search/page.tsx
'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface SearchResult {
  type: 'journal' | 'article'
  id: string
  title: string
  authors?: string[]
  journal?: string
  abstract?: string
  publishedDate?: string
  relevanceScore: number
  subjects?: string[]
  keywords?: string[]
}

interface SearchResponse {
  results: SearchResult[]
  total: number
  query: string
  filters: any
  pagination: {
    offset: number
    limit: number
    hasMore: boolean
  }
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [query, setQuery] = useState(searchParams?.get('q') || '')
  const [filters, setFilters] = useState({
    type: searchParams?.get('type') || 'all',
    year: searchParams?.get('year') || '',
    subject: searchParams?.get('subject') || '',
    author: searchParams?.get('author') || '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(20)

  const performSearch = async (searchQuery: string, searchFilters: any = {}, page: number = 1) => {
    if (!searchQuery.trim()) {
      setResults([])
      setTotal(0)
      return
    }

    setLoading(true)
    try {
      const offset = (page - 1) * limit
      const params = new URLSearchParams({
        q: searchQuery,
        limit: limit.toString(),
        offset: offset.toString(),
        ...Object.fromEntries(
          Object.entries(searchFilters).filter(([_, v]) => v !== '')
        )
      })

      const response = await fetch(`/api/search?${params}`)
      const data: SearchResponse = await response.json()
      
      setResults(data.results)
      setTotal(data.total)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (query) {
      performSearch(query, filters, currentPage)
    }
  }, [query, filters, currentPage])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    performSearch(query, filters, 1)
    
    // Update URL
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value as string)
    })
    router.push(`/search?${params.toString()}`)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Academic Articles</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles, authors, keywords..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="article">Articles Only</option>
                <option value="journal">Journals Only</option>
              </select>
              
              <input
                type="text"
                value={filters.author}
                onChange={(e) => handleFilterChange('author', e.target.value)}
                placeholder="Author name"
                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              
              <input
                type="text"
                value={filters.subject}
                onChange={(e) => handleFilterChange('subject', e.target.value)}
                placeholder="Subject area"
                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              
              <input
                type="number"
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                placeholder="Publication year"
                min="1900"
                max="2025"
                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>
        </div>

        {/* Results */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching...</p>
          </div>
        )}

        {!loading && query && (
          <div className="mb-6">
            <p className="text-gray-700">
              Found <span className="font-semibold">{total}</span> results for "<span className="font-semibold">{query}</span>"
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-6">
            {results.map((result) => (
              <div key={`${result.type}-${result.id}`} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        result.type === 'article' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {result.type === 'article' ? 'Article' : 'Journal'}
                      </span>
                      {result.publishedDate && (
                        <span className="text-gray-500 text-sm">
                          {new Date(result.publishedDate).getFullYear()}
                        </span>
                      )}
                    </div>
                    
                    <Link 
                      href={result.type === 'article' ? `/article/${result.id}` : `/journal/${result.id}`}
                      className="text-xl font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {result.title}
                    </Link>
                    
                    {result.authors && result.authors.length > 0 && (
                      <p className="text-gray-600 mt-1">
                        <span className="font-medium">Authors:</span> {result.authors.join(', ')}
                      </p>
                    )}
                    
                    {result.journal && (
                      <p className="text-gray-600 mt-1">
                        <span className="font-medium">Published in:</span> {result.journal}
                      </p>
                    )}
                    
                    {result.abstract && (
                      <p className="text-gray-700 mt-3 line-clamp-3">
                        {result.abstract.length > 300 
                          ? `${result.abstract.substring(0, 300)}...` 
                          : result.abstract
                        }
                      </p>
                    )}
                    
                    {(result.subjects || result.keywords) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {result.subjects?.slice(0, 3).map((subject, index) => (
                          <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                            {subject}
                          </span>
                        ))}
                        {result.keywords?.slice(0, 3).map((keyword, index) => (
                          <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    <Link 
                      href={result.type === 'article' ? `/article/${result.id}` : `/journal/${result.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                    >
                      View {result.type === 'article' ? 'Article' : 'Journal'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No results found for your search.</p>
            <p className="text-gray-500 text-sm">Try adjusting your search terms or filters.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + Math.max(1, currentPage - 2)
                if (page > totalPages) return null
                
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}