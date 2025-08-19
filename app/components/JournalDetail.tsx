// app/components/JournalDetail.tsx
'use client';

import type { Journal } from '@/lib/wordpress';
import Link from 'next/link';
import { useMemo } from 'react';

export default function JournalDetail({ journal }: { journal: Journal }) {
  const title = useMemo(
    () => journal?.title?.rendered?.replace(/<[^>]*>/g, '') || 'Untitled',
    [journal?.title?.rendered]
  );
  const excerpt = useMemo(
    () => journal?.excerpt?.rendered?.replace(/<[^>]*>/g, ''),
    [journal?.excerpt?.rendered]
  );
  const authors = journal?.meta?.journal_authors || [];
  const year =
    journal?.meta?.journal_year ||
    (journal?.date ? new Date(journal.date).getFullYear().toString() : '');
  const publisher = journal?.meta?.journal_publisher || '';
  const doi = journal?.meta?.journal_doi || '';
  const pages = journal?.meta?.journal_pages || '';
  const vol = journal?.meta?.journal_volume || '';
  const issue = journal?.meta?.journal_issue || '';
  const keywords = journal?.meta?.journal_keywords || [];

  return (
    <article className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
          {title}
        </h1>

        {/* Authors + Pub info */}
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Authors:</span>{' '}
              {authors.length ? authors.join(', ') : 'Unknown Author'}
            </div>
            <div>
              <span className="font-semibold">Published:</span>{' '}
              {year || '—'}
            </div>
            <div>
              <span className="font-semibold">Journal/Publisher:</span>{' '}
              {publisher || 'STM Journals'}
            </div>
            {(vol || issue) && (
              <div>
                <span className="font-semibold">Volume/Issue:</span>{' '}
                {vol}
                {issue && ` (${issue})`}
              </div>
            )}
            {pages && (
              <div>
                <span className="font-semibold">Pages:</span> {pages}
              </div>
            )}
            {doi && (
              <div>
                <span className="font-semibold">DOI:</span>{' '}
                <a
                  href={`https://doi.org/${doi}`}
                  className="text-blue-600 hover:underline"
                >
                  {doi}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Keywords */}
        {!!keywords.length && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Keywords:</h3>
            <div className="flex flex-wrap gap-2">
              {keywords.slice(0, 12).map((k, i) => (
                <span
                  key={i}
                  className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs"
                >
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Body */}
      <div className="prose max-w-none">
        {excerpt && (
          <p className="text-gray-700 leading-relaxed mb-6">{excerpt}</p>
        )}
        <div
          className="bg-white p-6 rounded-lg shadow-sm border"
          dangerouslySetInnerHTML={{
            __html: journal?.content?.rendered || '<p>No content</p>',
          }}
        />
      </div>

      {/* Back / actions */}
      <div className="mt-10 pt-6 border-t border-gray-200">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          ← Back to Journal Library
        </Link>
      </div>
    </article>
  );
}
