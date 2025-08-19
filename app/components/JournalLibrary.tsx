// app/components/JournalLibrary.tsx
'use client';

import { useEffect, useState, type SyntheticEvent } from 'react';
import Link from 'next/link';
import { wpAPI, type Journal, type Category } from '@/lib/wordpress';

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
    fetchInitial();
  }, []);

  useEffect(() => {
    if (!loading) fetchJournals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, selectedCategory, sortBy]);

  async function fetchInitial() {
    setLoading(true);
    setError(null);
    try {
      const [jr, cr] = await Promise.allSettled([
        wpAPI.getJournals({ page: 1, per_page: 20, orderby: 'date', order: 'desc' }),
        wpAPI.getCategories(),
      ]);

      if (jr.status === 'fulfilled') {
        setJournals(jr.value.journals);
        setTotalPages(jr.value.totalPages);
        setTotalResults(jr.value.total);
      } else {
        setError('Failed to load journals');
      }
      if (cr.status === 'fulfilled') setCategories(cr.value);
    } catch (e) {
      setError('Failed to load journal library');
    } finally {
      setLoading(false);
    }
  }

  async function fetchJournals() {
    try {
      const res = await wpAPI.getJournals({
        page: currentPage,
        per_page: 20,
        search: searchQuery || undefined,
        categories: selectedCategory || undefined,
        orderby: sortBy,
        order: 'desc',
      });
      setJournals(res.journals);
      setTotalPages(res.totalPages);
      setTotalResults(res.total);
    } catch {
      setError('Failed to fetch journals. Please try again.');
    }
  }

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const stripHtml = (html: string) => (html ? html.replace(/<[^>]*>/g, '') : '');

  const getJournalUrl = (j: Journal) => `/journal/${j.slug}`;
  const getInitials = (t: string) => t.split(' ').map((w) => w[0]).join('').substring(0, 3).toUpperCase();

  const handleRetry = () => {
    setError(null);
    if (journals.length === 0) fetchInitial();
    else fetchJournals();
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    if (!loading) fetchJournals();
  };

  if (error && journals.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Unable to Load Journals</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button onClick={handleRetry} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-bold mb-4">Journal Library</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Discover comprehensive academic journals and research papers across multiple disciplines and cutting-edge research areas.
          </p>
          {/* Search */}
          <form onSubmit={submitSearch} className="max-w-4xl mx-auto">
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
                {categories.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name} ({c.count})
                  </option>
                ))}
              </select>
              <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-md font-semibold transition">
                {loading ? 'Searching…' : 'Search'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="text-gray-700 text-sm">
            About {totalResults.toLocaleString()} results {searchQuery && <> for <strong>"{searchQuery}"</strong></>}
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

      {/* List */}
      <div className="max-w-6xl mx-auto px-4 pb-12 space-y-6">
        {journals.map((j) => {
          const title = stripHtml(j.title?.rendered || '');
          const authors = j.meta?.journal_authors?.slice(0, 3).join(', ') || 'Unknown Author';
          const year = j.meta?.journal_year || new Date(j.date).getFullYear().toString();
          const doi = j.meta?.journal_doi;

          return (
            <article key={j.id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex gap-5">
                <div className="w-28 h-28 flex-shrink-0 relative">
                  {j._embedded?.['wp:featuredmedia']?.[0] ? (
                    <img
                      src={j._embedded['wp:featuredmedia'][0].source_url}
                      alt={title}
                      className="w-28 h-28 object-cover rounded-md"
                      onError={(e: SyntheticEvent<HTMLImageElement>) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                  {!j._embedded?.['wp:featuredmedia']?.[0] && (
                    <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg rounded-md">
                      {getInitials(title)}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    <Link href={getJournalUrl(j)} className="hover:text-blue-600">
                      {title}
                    </Link>
                  </h2>
                  <div className="text-sm text-gray-600 mb-2">
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
                  <p className="text-gray-700 line-clamp-3">
                    {(j.excerpt?.rendered || '').replace(/<[^>]*>/g, '').slice(0, 260)}…
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {j.meta?.journal_authors?.slice(0, 3).map((a, i) => (
                      <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {a}
                      </span>
                    ))}
                    {j.meta?.journal_keywords?.slice(0, 3).map((k, i) => (
                      <span key={`k${i}`} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="max-w-6xl mx-auto px-4 pb-12 flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-2 rounded border ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
          >
            Previous
          </button>
          <div className="text-sm text-gray-600">Page {currentPage} of {totalPages}</div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`px-3 py-2 rounded border ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
