// app/components/ArticleViewer.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  authors: string[]
  abstract: string
  fullText?: string
  keywords: string[]
  doi?: string
  publishedDate: string
  journal: string
  volume?: string
  issue?: string
  pages?: string
  pdfUrl?: string
  citations?: number
  references?: string[]
  subjects: string[]
  language?: string
  publisher?: string
}

interface ArticleViewerProps {
  article: Article
}

const ArticleViewer: React.FC<ArticleViewerProps> = ({ article }) => {
  const [activeTab, setActiveTab] = useState<'abstract' | 'fulltext' | 'references'>('abstract')
  
  const formattedDate = new Date(article.publishedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-600">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/articles" className="hover:text-blue-600">Articles</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{article.title.substring(0, 50)}...</span>
      </nav>

      {/* Article Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
          {article.title}
        </h1>
        
        {/* Authors */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Authors:</h2>
          <div className="flex flex-wrap gap-2">
            {article.authors.map((author, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {author}
              </span>
            ))}
          </div>
        </div>

        {/* Publication Info */}
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Journal:</span> {article.journal}
            </div>
            <div>
              <span className="font-semibold">Published:</span> {formattedDate}
            </div>
            {article.volume && (
              <div>
                <span className="font-semibold">Volume:</span> {article.volume}
                {article.issue && `, Issue ${article.issue}`}
              </div>
            )}
            {article.pages && (
              <div>
                <span className="font-semibold">Pages:</span> {article.pages}
              </div>
            )}
            {article.doi && (
              <div>
                <span className="font-semibold">DOI:</span> 
                <a href={`https://doi.org/${article.doi}`} className="text-blue-600 hover:underline ml-1">
                  {article.doi}
                </a>
              </div>
            )}
            <div>
              <span className="font-semibold">Publisher:</span> {article.publisher || 'STM Journals'}
            </div>
          </div>
        </div>

        {/* Keywords */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Keywords:</h3>
          <div className="flex flex-wrap gap-2">
            {article.keywords.map((keyword, index) => (
              <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* Subjects */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Research Areas:</h3>
          <div className="flex flex-wrap gap-2">
            {article.subjects.map((subject, index) => (
              <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                {subject}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          {/* PDF Download removed intentionally */}
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
            Cite This Article
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
            Save to Library
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'abstract'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('abstract')}
          >
            Abstract
          </button>
          {article.fullText && (
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'fulltext'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('fulltext')}
            >
              Full Text
            </button>
          )}
          {article.references && article.references.length > 0 && (
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'references'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('references')}
            >
              References ({article.references.length})
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="prose prose-lg max-w-none">
        {activeTab === 'abstract' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Abstract</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {article.abstract}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'fulltext' && article.fullText && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Full Text</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {article.fullText}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'references' && article.references && (
          <div>
            <h2 className="text-2xl font-bold mb-4">References</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <ol className="list-decimal list-inside space-y-2">
                {article.references.map((reference, index) => (
                  <li key={index} className="text-gray-700 text-sm">
                    {reference}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Article Metrics */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Article Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {article.citations && (
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

      {/* Citation Format */}
      <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">How to Cite This Article</h3>
        <div className="bg-white p-4 rounded border font-mono text-sm overflow-x-auto">
          {article.authors.join(', ')}. ({new Date(article.publishedDate).getFullYear()}). 
          {article.title}. <em>{article.journal}</em>
          {article.volume && `, ${article.volume}`}
          {article.issue && `(${article.issue})`}
          {article.pages && `, ${article.pages}`}.
          {article.doi && ` https://doi.org/${article.doi}`}
        </div>
      </div>
    </div>
  )
}

export default ArticleViewer
