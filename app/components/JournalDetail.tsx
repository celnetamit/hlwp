'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { wpAPI } from '../lib/wordpress';
import { Journal } from '../lib/wordpress'; // Ensure this import is present

interface JournalDetailProps {
  journal: Journal; // Accept journal as a prop
}

export default function JournalDetail({ journal }: JournalDetailProps) {
  // Extracting properties from the journal
  const title = journal.title.rendered; // Journal title
  const authors = journal.meta?.journal_authors?.join(', ') || 'Unknown Author'; // Authors
  const year = journal.meta?.journal_year || new Date(journal.date).getFullYear().toString(); // Publication year
  const content = journal.content.rendered; // Full text content
  const abstract = journal.meta?.journal_abstract || 'No abstract available'; // Abstract
  const publisher = journal.meta?.journal_publisher || ''; // Publisher
  const doi = journal.meta?.journal_doi; // DOI
  const issn = journal.meta?.journal_issn; // ISSN
  const volume = journal.meta?.journal_volume; // Volume
  const issue = journal.meta?.journal_issue; // Issue
  const pages = journal.meta?.journal_pages; // Pages

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Journal Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">{title}</h1>

        {/* Authors */}
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Authors:</h2>
        <p className="text-gray-700">{authors}</p>

        {/* Publication Year */}
        <h3 className="font-semibold text-gray-700 mt-6">Publication Year:</h3>
        <p>{year}</p>

        {/* Abstract */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800">Abstract:</h3>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{abstract}</p>
          </div>
        </div>

        {/* Full Text */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800">Full Text:</h3>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">{content}</div>
          </div>
        </div>

        {/* Journal Metadata */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Publication Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            {publisher && (
              <div>
                <span className="font-semibold text-gray-700">Publisher:</span>
                <span className="ml-2 text-gray-600">{publisher}</span>
              </div>
            )}
            {issn && (
              <div>
                <span className="font-semibold text-gray-700">ISSN:</span>
                <span className="ml-2 text-gray-600">{issn}</span>
              </div>
            )}
            {doi && (
              <div>
                <span className="font-semibold text-gray-700">DOI:</span>
                <a
                  href={`https://doi.org/${doi}`}
                  className="ml-2 text-blue-600 hover:text-blue-800 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {doi}
                </a>
              </div>
            )}
            {volume && (
              <div>
                <span className="font-semibold text-gray-700">Volume:</span>
                <span className="ml-2 text-gray-600">{volume}</span>
              </div>
            )}
            {issue && (
              <div>
                <span className="font-semibold text-gray-700">Issue:</span>
                <span className="ml-2 text-gray-600">{issue}</span>
              </div>
            )}
            {pages && (
              <div>
                <span className="font-semibold text-gray-700">Pages:</span>
                <span className="ml-2 text-gray-600">{pages}</span>
              </div>
            )}
            <div>
              <span className="font-semibold text-gray-700">Published:</span>
              <span className="ml-2 text-gray-600">{formatDate(journal.date)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons (PDF, Save, Cite) */}
        <div className="flex flex-wrap gap-4 mb-8">
          {journal.meta?.journal_pdf_url && (
            <a
              href={journal.meta.journal_pdf_url}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
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

        {/* Back to Journals Button */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/journals" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors">
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
