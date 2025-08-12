'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Journal } from '../lib/wordpress';

interface JournalDetailProps {
  journal: Journal;
}

export default function JournalDetail({ journal }: JournalDetailProps) {
  const [activeTab, setActiveTab] = useState<'abstract' | 'fulltext' | 'details'>('abstract');
  
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const stripHtml = (html: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  };

  const title = stripHtml(journal.title.rendered);
  const abstract = journal.meta.journal_abstract || stripHtml(journal.excerpt?.rendered || '');
  const content = stripHtml(journal.content?.rendered || '');
  const citationCount = journal.meta.journal_citation_count || 0;
  const citations = journal.meta.journal_citations || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Breadcrumb */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span>›</span>
            <Link href="/#journals" className="hover:text-blue-600 transition-colors">Journals</Link>
            <span>›</span>
            <span className="text-gray-900 font-medium">{title.substring(0, 50)}...</span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <header className="mb-8">
          {/* Journal Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {title}
          </h1>
          
          {/* Authors */}
          {journal.meta?.journal_authors && journal.meta.journal_authors.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Authors:</h2>
              <div className="flex flex-wrap gap-2">
                {journal.meta.journal_authors.map((author, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {author}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Publication Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Publication Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              {journal.meta?.journal_publisher && (
                <div>
                  <span className="font-semibold text-gray-700">Publisher:</span>
                  <span className="ml-2 text-gray-600">{journal.meta.journal_publisher}</span>
                </div>
              )}
              {journal.meta?.journal_year && (
                <div>
                  <span className="font-semibold text-gray-700">Publication Year:</span>
                  <span className="ml-2 text-gray-600">{journal.meta.journal_year}</span>
                </div>
              )}
              {journal.meta?.journal_volume && (
                <div>
                  <span className="font-semibold text-gray-700">Volume:</span>
                  <span className="ml-2 text-gray-600">{journal.meta.journal_volume}</span>
                </div>
              )}
              {journal.meta?.journal_issue && (
                <div>
                  <span className="font-semibold text-gray-700">Issue:</span>
                  <span className="ml-2 text-gray-600">{journal.meta.journal_issue}</span>
                </div>
              )}
              {journal.meta?.journal_pages && (
                <div>
                  <span className="font-semibold text-gray-700">Pages:</span>
                  <span className="ml-2 text-gray-600">{journal.meta.journal_pages}</span>
                </div>
              )}
              {journal.meta?.journal_issn && (
                <div>
                  <span className="font-semibold text-gray-700">ISSN:</span>
                  <span className="ml-2 text-gray-600">{journal.meta.journal_issn}</span>
                </div>
              )}
              {journal.meta?.journal_doi && (
                <div className="md:col-span-2">
                  <span className="font-semibold text-gray-700">DOI:</span>
                  <a 
                    href={`https://doi.org/${journal.meta.journal_doi}`}
                    className="ml-2 text-blue-600 hover:text-blue-800 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {journal.meta.journal_doi}
                  </a>
                </div>
              )}
              <div>
                <span className="font-semibold text-gray-700">Published:</span>
                <span className="ml-2 text-gray-600">{formatDate(journal.date)}</span>
              </div>
            </div>
          </div>

          {/* Keywords */}
          {journal.meta?.journal_keywords && journal.meta.journal_keywords.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Keywords:</h3>
              <div className="flex flex-wrap gap-2">
                {journal.meta.journal_keywords.map((keyword, index) => (
                  <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            {journal.meta?.journal_pdf_url && (
              <a 
                href={journal.meta.journal_pdf_url}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download PDF
              </a>
            )}
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Cite Article
            </button>
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              Save to Library
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'abstract'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('abstract')}
            >
              Abstract
            </button>
            {content && (
              <button
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'fulltext'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('fulltext')}
              >
                Full Text
              </button>
            )}
            <button
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('details')}
            >
              Details & Metrics
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="prose prose-lg max-w-none">
          {activeTab === 'abstract' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Abstract</h2>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {abstract || 'No abstract available.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'fulltext' && content && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Full Text</h2>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {content}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Article Details & Metrics</h2>
              
              {/* Article Metrics */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {citationCount}
                    </div>
                    <div className="text-sm text-gray-600">Citations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-600">Downloads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">0</div>
                    <div className="text-sm text-gray-600">Views</div>
                  </div>
                </div>
              </div>

              {/* Citation Format */}
              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">How to Cite This Article</h3>
                <div className="bg-white p-4 rounded border font-mono text-sm overflow-x-auto">
                  {journal.meta?.journal_authors?.join(', ') || 'Unknown Author'}. 
                  ({journal.meta?.journal_year || new Date(journal.date).getFullYear()}). 
                  {title}. <em>{journal.meta?.journal_publisher || 'Journal Library'}</em>
                  {journal.meta?.journal_volume && `, ${journal.meta.journal_volume}`}
                  {journal.meta?.journal_issue && `(${journal.meta.journal_issue})`}
                  {journal.meta?.journal_pages && `, ${journal.meta.journal_pages}`}.
                  {journal.meta?.journal_doi && ` https://doi.org/${journal.meta.journal_doi}`}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Back to Journals */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link 
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0L2.586 11H18a1 1 0 110 2H2.586l3.707 3.707a1 1 0 01-1.414 1.414l-5.414-5.414a1 1 0 010-1.414l5.414-5.414a1 1 0 011.414 1.414L2.586 9H18a1 1 0 110 2H7.707z" clipRule="evenodd" />
            </svg>
            Back to Journal Library
          </Link>
        </div>
      </div>
    </div>
  );
}
