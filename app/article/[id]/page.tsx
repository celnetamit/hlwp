'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { wpAPI } from '@/lib/wordpress';

type ArticleData = any;

export default function ArticlePage({ params }: { params: { id: string } }) {
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const idOrSlug = params.id;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const post = await wpAPI.getArticle(idOrSlug);
        if (!mounted) return;
        if (!post) {
          setError('Article not found');
          return;
        }
        const citations = post.meta?.journal_citation_count ?? 0;
        const references = post.meta?.references ?? [];
        setArticle({ ...post, citations, references });
      } catch (e) {
        setError('Failed to load article');
      }
    })();
    return () => {
      mounted = false;
    };
  }, [idOrSlug]);

  const plainTitle = useMemo(
    () => (article?.title?.rendered || '').replace(/<[^>]*>/g, ''),
    [article?.title?.rendered]
  );

  if (error) {
    return <div className="text-center text-xl text-red-500 mt-10">Error: {error}</div>;
  }
  if (!article) {
    return <div className="text-center text-xl text-gray-600 mt-10">Loading…</div>;
  }

  const meta = article.meta || {};
  const authors = (meta.journal_authors || []).join(', ') || 'Unknown Author';
  const year =
    meta.journal_year || (article.date ? new Date(article.date).getFullYear().toString() : '');
  const publisher = meta.journal_publisher || 'STM Journals';
  const doi = meta.journal_doi || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in-up">
        <nav className="mb-4 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/articles" className="hover:text-blue-600">Articles</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{plainTitle.substring(0, 50)}…</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{plainTitle}</h1>

        <div className="text-sm text-gray-600 mb-6">
          <strong>Authors:</strong> {authors}
        </div>
        <div className="text-sm text-gray-600 mb-6">
          <strong>Published in:</strong> {publisher} ({year})
          {doi && (
            <>
              {' '}|{' '}
              <a
                href={`https://doi.org/${doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                DOI: {doi}
              </a>
            </>
          )}
        </div>

        <div
          className="prose max-w-none bg-white p-6 rounded-lg shadow-sm border"
          dangerouslySetInnerHTML={{ __html: article?.content?.rendered || '' }}
        />

        {/* metrics */}
        <div className="mt-8 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Article Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {typeof article.citations === 'number' && (
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{article.citations}</div>
                <div className="text-sm text-gray-600">Citations</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">Views</div>
            </div>
          </div>
        </div>

        {/* references */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">References</h3>
          {article.references?.length ? (
            <ol className="list-decimal list-inside space-y-2">
              {article.references.map((r: string, i: number) => (
                <li key={i} className="text-gray-700 text-sm">
                  {r}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-gray-600">No references available.</p>
          )}
        </div>

        {/* citation block */}
        <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">How to Cite This Article</h3>
          <div className="bg-white p-4 rounded border font-mono text-sm overflow-x-auto">
            {authors}. ({year}). {plainTitle}. <em>{publisher}</em>
            {meta.journal_volume && `, ${meta.journal_volume}`}
            {meta.journal_issue && `(${meta.journal_issue})`}
            {meta.journal_pages && `, ${meta.journal_pages}`}.
            {doi && ` https://doi.org/${doi}`}
          </div>
        </div>

        {/* back */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            ← Back to Journal Library
          </Link>
        </div>
      </div>
    </div>
  );
}
