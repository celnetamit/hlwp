'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { wpAPI, Journal } from '../lib/wordpress';
import { JsonLd } from './JsonLd';

interface Props {
  slug: string;
}

export default function JournalDetail({ slug }: Props) {
  const [journal, setJournal] = useState<Journal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) fetchJournal();
  }, [slug]);

  const fetchJournal = async () => {
    try {
      const data = await wpAPI.getJournal(slug);
      setJournal(data);
    } catch (error) {
      console.error('Error fetching journal:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const stripHtml = (html: string) => html.replace(/<[^>]+>/g, '');

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading...</div>;
  }

  if (!journal) {
    return <div className="p-10 text-center text-red-500">Journal not found.</div>;
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: stripHtml(journal.title.rendered),
    datePublished: journal.date,
    dateModified: journal.modified,
    author: journal.meta?.journal_authors?.map((name: string) => ({
      '@type': 'Person',
      name,
    })),
    publisher: {
      '@type': 'Organization',
      name: journal.meta?.journal_publisher || 'STM Journals',
    },
    url: `https://article.stmjournals.com/journal/${journal.slug}`,
    identifier: journal.meta?.journal_doi || '',
    description: stripHtml(journal.excerpt.rendered),
  };

  return (
    <div className="min-h-screen py-10 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <JsonLd data={jsonLd} />

      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <Link href="/journals" className="text-blue-600 hover:underline">&larr; Back to Journals</Link>
        </div>

        {journal._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
          <div className="relative w-full h-64 mb-6 rounded overflow-hidden">
            <Image
              src={journal._embedded['wp:featuredmedia'][0].source_url}
              alt={journal.title.rendered}
              fill
              className="object-cover"
            />
          </div>
        )}

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {stripHtml(journal.title.rendered)}
        </h1>

        <div className="text-gray-700 mb-5 space-y-1">
          {journal.meta?.journal_authors && (
            <p><strong>Authors:</strong> {journal.meta.journal_authors.join(', ')}</p>
          )}
          {journal.meta?.journal_year && <p><strong>Year:</strong> {journal.meta.journal_year}</p>}
          {journal.meta?.journal_publisher && <p><strong>Publisher:</strong> {journal.meta.journal_publisher}</p>}
          {journal.meta?.journal_doi && <p><strong>DOI:</strong> {journal.meta.journal_doi}</p>}
          <p><strong>Published on:</strong> {formatDate(journal.date)}</p>
        </div>

        <div
          className="prose max-w-none prose-blue"
          dangerouslySetInnerHTML={{ __html: journal.content.rendered }}
        />
      </div>
    </div>
  );
}
