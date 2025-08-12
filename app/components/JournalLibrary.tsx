// app/components/JournalLibrary.tsx - Updated with Google Scholar style row layout
'use client';

import { useState, useEffect, type SyntheticEvent } from 'react';
import Link from 'next/link';
import { wpAPI, Journal, Category, SITE_NAME } from '../lib/wordpress';

export default function JournalLibrary() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'modified'>('date');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchJournals();
    }
  }, [currentPage, searchQuery, selectedCategory, sortBy]);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [journalsResult, categoriesResult] = await Promise.allSettled([
        wpAPI.getJournals({ page: 1, per_page: 20, orderby: 'date', order: 'desc' }),
        wpAPI.getCategories()
      ]);

      if (journalsResult.status === 'fulfilled') {
        setJournals(journalsResult.value.journals);
        setTotalPages(journalsResult.value.totalPages);
        setTotalResults(journalsResult.value.total);
      } else {
        console.error('Error fetching journals:', journalsResult.reason);
        setError('Failed to load journals');
      }

      if (categoriesResult.status === 'fulfilled') {
        setCategories(categoriesResult.value);
      } else {
        console.error('Error fetching categories:', categoriesResult.reason);
      }
    } catch (error) {
      console.error('Critical error during initial data fetch:', error);
      setError('Failed to load journal library');
    } finally {
      setLoading(false);
    }
  };

  const fetchJournals = async () => {
    setError(null);
    try {
      const result = await wpAPI.getJournals({
        page: currentPage,
        per_page: 20,
        search: searchQuery || undefined,
        categories: selectedCategory || undefined,
        orderby: sortBy,
        order: 'desc'
      });
      setJournals(result.journals);
      setTotalPages(result.totalPages);
      setTotalResults(result.total);
    } catch (error) {
      console.error('Error fetching journals:', error);
      setError('Failed to fetch journals. Please try again.');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    if (loading) return;
    fetchJournals();
  };

  const handleRetry = () => {
    setError(null);
    if (journals.length === 0) {
      fetchInitialData();
    } else {
      fetchJournals();
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const extractPlainText = (html: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').substring(0, 300) + '...';
  };

  const stripHtml = (html: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  };

  const getJournalUrl = (journal: Journal) => `/journal/${journal.slug}`;

  const getJournalInitials = (title: string) =>
    title.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase();

  if (error && journals.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-4">Journal Library</h1>
              <p className="text-xl mb-8 max-w-3xl mx-auto">
                Discover comprehensive academic journals and research papers 
                across multiple disciplines and cutting-edge research areas.
              </p>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Unable to Load Journals</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Journal Library</h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Discover comprehensive academic journals and research papers 
              across multiple disciplines and cutting-edge research areas.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 bg-white rounded-lg p-2 shadow-lg">
                <input
                  type="text"
                  placeholder="Search journals, authors, keywords..."
                  className="flex-1 px-4 py-3 text-gray-900 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select
                  className="px-4 py-3 text-gray-900 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id.toString()}>
                      {category.name} ({category.count})
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-md font-semibold transition duration-300"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Search Results Header - Google Scholar Style */}
      <div className="search-header">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            {searchQuery && (
              <h2 className="text-lg text-gray-700 mb-2">
                Search results for: <strong>"{searchQuery}"</strong>
              </h2>
            )}
            <div className="search-stats">
              About {totalResults.toLocaleString()} results 
              {searchQuery && ` for "${searchQuery}"`}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-gray-700 text-sm">Sort by:</span>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'modified')}
            >
              <option value="date">Publication Date</option>
              <option value="title">Title</option>
              <option value="modified">Recently Updated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error message for subsequent requests */}
      {error && journals.length > 0 && (
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-red-800">{error}</span>
              <button
                onClick={handleRetry}
                className="text-red-600 hover:text-red-800 font-semibold text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="journal-list">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton-row">
              <div className="skeleton-thumbnail"></div>
              <div className="skeleton-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-text" style={{ width: '90%' }}></div>
                <div className="skeleton-text" style={{ width: '70%' }}></div>
                <div className="skeleton-text" style={{ width: '50%' }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Journal List - Google Scholar Style Row Layout */}
          <div className="journal-list">
            {journals.map((journal) => {
              const title = stripHtml(journal.title.rendered);
              const excerpt = extractPlainText(journal.excerpt?.rendered || '');
              const authors = journal.meta?.journal_authors?.slice(0, 3).join(', ') || 'Unknown Author';
              const year = journal.meta?.journal_year || new Date(journal.date).getFullYear().toString();
              const publisher = journal.meta?.journal_publisher || '';
              const doi = journal.meta?.journal_doi;
              
              return (
                <article key={journal.id} className="journal-card animate-fade-in-up">
                  {/* Journal Icon/Thumbnail */}
                  <div className="journal-thumbnail">
                    {journal._embedded?.['wp:featuredmedia']?.[0] ? (
                      <img
                        src={journal._embedded['wp:featuredmedia'][0].source_url}
                        alt={title}
                        className="w-full h-full object-cover rounded-md"
                        onError={(e: SyntheticEvent<HTMLImageElement>) => {
                          const img = e.currentTarget;
                          img.style.display = 'none';
                          const sib = img.nextElementSibling;
                          if (sib instanceof HTMLElement) {
                            sib.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {getJournalInitials(title)}
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="journal-content">
                    {/* Title */}
                    <h2 className="journal-title">
                      <Link href={getJournalUrl(journal)}>
                        {title}
                      </Link>
                    </h2>

                    {/* URL/Publisher Line */}
                    <div className="journal-url">
                      {publisher && `${publisher} • `}
                      {year}
                      {doi && (
                        <>
                          {' • '}
                          <a 
                            href={`https://doi.org/${doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            DOI: {doi}
                          </a>
                        </>
                      )}
                    </div>

                    {/* Description/Abstract */}
                    <p className="journal-description">
                      {excerpt}
                    </p>

                    {/* Metadata */}
                    <div className="journal-meta">
                      <span className="journal-author">
                        <strong>Authors:</strong> {authors}
                      </span>
                      <span className="journal-date">
                        Published: {formatDate(journal.date)}
                      </span>
                      {journal.meta?.journal_citation_count && (
                        <span className="text-green-600">
                          Cited by {journal.meta.journal_citation_count}
                        </span>
                      )}
                      {journal.meta?.journal_volume && (
                        <span>
                          Vol. {journal.meta.journal_volume}
                          {journal.meta?.journal_issue && `, Issue ${journal.meta.journal_issue}`}
                        </span>
                      )}
                    </div>

                    {/* Keywords/Categories */}
                    {(journal.meta?.journal_keywords || journal._embedded?.['wp:term']?.[0]) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {journal.meta?.journal_keywords?.slice(0, 4).map((keyword, index) => (
                          <span key={index} className="journal-category">
                            {keyword}
                          </span>
                        )) || journal._embedded?.['wp:term']?.[0]?.slice(0, 3).map((category) => (
                          <span key={category.id} className="journal-category">
                            {category.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* PDF Download Link (kept here; tell me if you want it removed as well) */}
                    {journal.meta?.journal_pdf_url && (
                      <div className="mt-3">
                        <a 
                          href={journal.meta.journal_pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          [PDF] Download Full Text
                        </a>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* No Results */}
          {journals.length === 0 && !loading && (
            <div className="text-center py-12 max-w-4xl mx-auto">
              <div className="text-gray-400 text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No journals found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery ? `No results found for "${searchQuery}". Try different keywords or remove filters.` : 'Try adjusting your search terms or filters'}
              </p>
              <button
                onClick={handleRetry}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition duration-300"
              >
                Refresh
              </button>
            </div>
          )}

          {/* Pagination - Google Style */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 9, currentPage - 5)) + i;
                if (page > totalPages) return null;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={page === currentPage ? 'active' : ''}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
