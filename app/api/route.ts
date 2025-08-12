// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { journals } from '../data/journals'

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

function searchJournals(query: string, filters: any = {}): SearchResult[] {
  const results: SearchResult[] = []
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2)
  
  journals.forEach(journal => {
    // Search in journal metadata
    let journalScore = 0
    const journalText = `${journal.title} ${journal.description || ''} ${(journal.subjects || []).join(' ')}`.toLowerCase()
    
    searchTerms.forEach(term => {
      if (journalText.includes(term)) {
        journalScore += journalText.split(term).length - 1
      }
    })
    
    if (journalScore > 0) {
      results.push({
        type: 'journal',
        id: journal.id,
        title: journal.title,
        abstract: journal.description,
        subjects: journal.subjects,
        relevanceScore: journalScore
      })
    }
    
    // Search in articles
    if (journal.articles) {
      journal.articles.forEach((article: any) => {
        let articleScore = 0
        const articleText = `${article.title} ${article.abstract || ''} ${(article.keywords || []).join(' ')} ${(article.authors || []).join(' ')}`.toLowerCase()
        
        searchTerms.forEach(term => {
          if (articleText.includes(term)) {
            articleScore += articleText.split(term).length - 1
          }
        })
        
        // Apply filters
        if (filters.year && article.publishedDate) {
          const articleYear = new Date(article.publishedDate).getFullYear()
          if (articleYear !== parseInt(filters.year)) {
            articleScore = 0
          }
        }
        
        if (filters.subject && article.subjects) {
          if (!article.subjects.some((subject: string) => 
            subject.toLowerCase().includes(filters.subject.toLowerCase())
          )) {
            articleScore = 0
          }
        }
        
        if (filters.author && article.authors) {
          if (!article.authors.some((author: string) => 
            author.toLowerCase().includes(filters.author.toLowerCase())
          )) {
            articleScore = 0
          }
        }
        
        if (articleScore > 0) {
          results.push({
            type: 'article',
            id: article.id,
            title: article.title,
            authors: article.authors,
            journal: journal.title,
            abstract: article.abstract,
            publishedDate: article.publishedDate,
            subjects: article.subjects,
            keywords: article.keywords,
            relevanceScore: articleScore
          })
        }
      })
    }
  })
  
  // Sort by relevance score
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')
  const type = searchParams.get('type') || 'all'
  
  // Filters
  const filters = {
    year: searchParams.get('year'),
    subject: searchParams.get('subject'),
    author: searchParams.get('author'),
    journal: searchParams.get('journal'),
  }
  
  if (!query.trim()) {
    return NextResponse.json({
      results: [],
      total: 0,
      query: '',
      filters: {},
      pagination: {
        offset: 0,
        limit,
        hasMore: false
      }
    })
  }
  
  try {
    let results = searchJournals(query, filters)
    
    // Filter by type if specified
    if (type !== 'all') {
      results = results.filter(result => result.type === type)
    }
    
    const total = results.length
    const paginatedResults = results.slice(offset, offset + limit)
    const hasMore = offset + limit < total
    
    return NextResponse.json({
      results: paginatedResults,
      total,
      query,
      filters,
      pagination: {
        offset,
        limit,
        hasMore
      }
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed', message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, filters = {}, limit = 20, offset = 0 } = body
    
    if (!query?.trim()) {
      return NextResponse.json({
        results: [],
        total: 0,
        query: '',
        filters: {},
        pagination: { offset: 0, limit, hasMore: false }
      })
    }
    
    let results = searchJournals(query, filters)
    
    const total = results.length
    const paginatedResults = results.slice(offset, offset + limit)
    const hasMore = offset + limit < total
    
    return NextResponse.json({
      results: paginatedResults,
      total,
      query,
      filters,
      pagination: {
        offset,
        limit,
        hasMore
      }
    })
  } catch (error) {
    console.error('Search POST error:', error)
    return NextResponse.json(
      { error: 'Search failed', message: 'Invalid request body' },
      { status: 400 }
    )
  }
}
