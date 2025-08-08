'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { wpAPI, Journal, Category, SITE_NAME } from '../lib/wordpress';

export default function JournalLibrary() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'modified'>('date');

  useEffect(() => {
    fetchJournals();
    fetchCategories();
  }, [currentPage, searchQuery, selectedCategory, sortBy]);

  const fetchJournals = async () => {
    setLoading(true);
    try {
      const { journals: fetchedJournals, totalPages: fetchedTotalPages } = await wpAPI.getJournals({
        page: currentPage,
        per_page: 12,
        search: searchQuery || undefined,
        categories: selectedCategory || undefined,
        orderby: sortBy,
        order: 'desc'
      });
      setJournals(fetchedJournals);
      setTotalPages(fetchedTotalPages);
    } catch (error) {
      console.error('Error fetching journals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const fetchedCategories = await wpAPI.getCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchJournals();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const extractPlainText = (html: string) => {
    return html.replace(/<[^>]*>/g, '').substring(0, 200) + '...';
  };

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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-semibold transition duration-300"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="mb-4 md:mb-0">
            <span className="text-gray-700">Sort by:</span>
            <select
              className="ml-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'modified')}
            >
              <option value="date">Publication Date</option>
              <option value="title">Title</option>
              <option value="modified">Last Modified</option>
            </select>
          </div>
          
          {searchQuery && (
            <div className="text-gray-600">
              Search results for: <strong>"{searchQuery}"</strong>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Journal Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {journals.map((journal) => (
                <article 
                  key={journal.id} 
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
                >
                  {/* Featured Image */}
                  {journal._embedded?.['wp:featuredmedia']?.[0] && (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={journal._embedded['wp:featuredmedia'][0].source_url}
                        alt={journal._embedded['wp:featuredmedia'][0].alt_text || journal.title.rendered}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    {/* Category Tags */}
                    {journal._embedded?.['wp:term']?.[0] && (
                      <div className="mb-3">
                        {journal._embedded['wp:term'][0].slice(0, 2).map((category) => (
                          <span
                            key={category.id}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2 mb-1"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Title */}
                    <h2 className="text-xl font-bold mb-3 text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                      <Link href={`/journal/${journal.slug}`}>
                        {wpAPI.stripHtml(journal.title.rendered)}
                      </Link>
                    </h2>
                    
                    {/* Journal Metadata */}
                    <div className="mb-3 text-sm text-gray-600 space-y-1">
                      {journal.meta.journal_authors && (
                        <p><strong>Authors:</strong> {journal.meta.journal_authors.slice(0, 2).join(', ')}</p>
                      )}
                      {journal.meta.journal_year && (
                        <p><strong>Year:</strong> {journal.meta.journal_year}</p>
                      )}
                      {journal.meta.journal_publisher && (
                        <p><strong>Publisher:</strong> {journal.meta.journal_publisher}</p>
                      )}
                      {journal.meta.journal_doi && (
                        <p><strong>DOI:</strong> {journal.meta.journal_doi}</p>
                      )}
                    </div>
                    
                    {/* Excerpt */}
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {extractPlainText(journal.excerpt.rendered)}
                    </p>
                    
                    {/* Footer */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500">
                        {formatDate(journal.date)}
                      </span>
                      <Link
                        href={`/journal/${journal.slug}`}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors duration-300"
                      >
                        Read More →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* No Results */}
            {journals.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No journals found</h3>
                <p className="text-gray-500">Try adjusting your search terms or filters</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-12">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 border rounded-md ${
                        page === currentPage
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}