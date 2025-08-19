// app/article/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { wpAPI } from '../../lib/wordpress';

interface ArticleProps { params: { id: string } }

export default function Article({ params }: ArticleProps) {
  const [article, setArticle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const post = await wpAPI.getArticle(params.id);
        if (!post) return setError('Article not found');

        setArticle({
          ...post,
          citations: post.meta?.journal_citation_count ?? 0,
          references: Array.isArray(post.meta?.references) ? post.meta.references : [],
        });
      } catch (e) {
        console.error(e); setError('Failed to load article');
      } finally { setLoading(false); }
    })();
  }, [params.id]);

  if (loading) return <div className="text-center text-xl text-gray-600">Loading...</div>;
  if (error) return <div className="text-center text-xl text-red-500">Error: {error}</div>;
  if (!article) return <div className="text-center text-xl text-gray-600">Article not found.</div>;

  const { title, content, meta } = article;
  const authors = meta?.journal_authors?.join(', ') || 'Unknown Author';
  const year = meta?.journal_year || new Date(article.date).getFullYear().toString();
  const publisher = meta?.journal_publisher || 'Unknown Publisher';
  const doi = meta?.journal_doi || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6" dangerouslySetInnerHTML={{ __html: title.rendered }} />
        <div className="text-sm text-gray-600 mb-6">
          <strong>Authors:</strong> {authors}
        </div>
        <div className="text-sm text-gray-600 mb-6">
          <strong>Published in:</strong> {publisher} ({year})
          {doi && (
            <> {' | '}
              <a href={`https://doi.org/${doi}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                DOI: {doi}
              </a>
            </>
          )}
        </div>

        <div className="prose max-w-none bg-white p-6 rounded-lg shadow-sm border"
             dangerouslySetInnerHTML={{ __html: content.rendered }} />

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Metrics</h2>
          <p><strong>Citations:</strong> {article.citations}</p>
          <div>
            <strong>References:</strong>
            {article.references?.length ? (
              <ul>{article.references.map((ref: string, i: number) => (
                <li key={i} className="text-sm text-gray-700">{ref}</li>
              ))}</ul>
            ) : <p className="text-sm text-gray-600">No references available.</p>}
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200">
        <a href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0L2.586 11H18a1 1 0 110 2H2.586l3.707 3.707a1 1 0 01-1.414 1.414l-5.414-5.414a1 1 0 010-1.414l5.414-5.414a1 1 0 011.414 1.414L2.586 9H18a1 1 0 110 2H7.707z" clipRule="evenodd" />
          </svg>
          Back to Journal Library
        </a>
      </div>
    </div>
  );
}
