// app/article/[id]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '../../components/JsonLd';
import ArticleViewer from '../../components/ArticleViewer';
import { wpAPI, SITE_URL, SITE_NAME } from '../../lib/wordpress';
import type { Journal } from '../../lib/wordpress';

// Render on-demand to avoid build-time WP calls (prevents 401 at build)
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

//
// Types expected by <ArticleViewer />
//
interface Article {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  fullText?: string;
  keywords: string[];
  doi?: string;
  publishedDate: string;
  journal: string;
  volume?: string;
  issue?: string;
  pages?: string;
  pdfUrl?: string;
  citations?: number;
  references?: string[];
  subjects: string[];
  language?: string;
  publisher?: string;
}

function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, '');
}

function mapWpToArticle(post: Journal): Article {
  const m = post.meta || ({} as NonNullable<Journal['meta']>);

  const authors =
    m.journal_authors && m.journal_authors.length > 0
      ? m.journal_authors
      : post._embedded?.author?.map(a => a.name) || ['Unknown Author'];

  // keywords: prefer meta, else terms
  const keywords =
    (m.journal_keywords && m.journal_keywords.length > 0
      ? m.journal_keywords
      : (post._embedded?.['wp:term']?.[0]?.map(t => t.name) ?? [])
    ).slice(0, 10);

  const subjects =
    post._embedded?.['wp:term']?.[0]?.map(t => t.name) ?? [];

  const title = stripHtml(post.title?.rendered || 'Untitled');
  const abstract =
    stripHtml(m.journal_abstract || post.excerpt?.rendered || '').trim() ||
    'No abstract available.';

  return {
    id: post.slug || String(post.id),
    title,
    authors,
    abstract,
    fullText: stripHtml(post.content?.rendered || ''),
    keywords,
    doi: m.journal_doi,
    publishedDate: post.date,
    journal: m.journal_publisher || SITE_NAME, // if you have a proper journal name elsewhere, place it here
    volume: m.journal_volume,
    issue: m.journal_issue,
    pages: m.journal_pages,
    pdfUrl: m.journal_pdf_url,
    citations: m.journal_citation_count,
    references: [], // populate if you store references in WP
    subjects,
    language: 'en',
    publisher: m.journal_publisher || 'STM Journals',
  };
}

async function fetchArticle(idOrSlug: string): Promise<Article | null> {
  const post = await wpAPI.getArticle(idOrSlug);
  if (!post) return null;
  return mapWpToArticle(post);
}

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  try {
    const article = await fetchArticle(params.id);

    if (!article) {
      return {
        title: 'Article Not Found',
        description: 'The requested article could not be found.',
      };
    }

    const articleUrl = `${SITE_URL}/article/${article.id}`;
    const desc = (article.abstract || '').slice(0, 160);

    return {
      title: `${article.title} | ${SITE_NAME}`,
      description: desc,
      keywords: article.keywords.join(', '),
      authors: article.authors.map(name => ({ name })),
      alternates: { canonical: articleUrl },
      openGraph: {
        title: article.title,
        description: (article.abstract || '').slice(0, 200),
        url: articleUrl,
        type: 'article',
        publishedTime: article.publishedDate,
        authors: article.authors,
        section: article.subjects[0] || 'Research',
        tags: article.keywords,
      },
      twitter: {
        card: 'summary',
        title: article.title,
        description: (article.abstract || '').slice(0, 200),
      },
      other: {
        // Highwire / DC / PRISM
        'citation_title': article.title,
        'citation_author': article.authors.join('; '),
        'citation_publication_date': article.publishedDate.split('T')[0],
        'citation_journal_title': article.journal,
        'citation_publisher': article.publisher || 'STM Journals',
        'citation_volume': article.volume || '',
        'citation_issue': article.issue || '',
        'citation_firstpage': article.pages?.split('-')[0] || '',
        'citation_lastpage': article.pages?.split('-')[1] || '',
        'citation_doi': article.doi || '',
        'citation_abstract_html_url': articleUrl,
        'citation_fulltext_html_url': articleUrl,
        'citation_pdf_url': article.pdfUrl || `${articleUrl}/pdf`,
        'citation_language': article.language || 'en',
        'citation_keywords': article.keywords.join('; '),

        'dc.title': article.title,
        'dc.creator': article.authors.join('; '),
        'dc.publisher': article.publisher || 'STM Journals',
        'dc.date': article.publishedDate.split('T')[0],
        'dc.type': 'Text',
        'dc.format': 'text/html',
        'dc.identifier': article.doi || articleUrl,
        'dc.language': article.language || 'en',
        'dc.subject': article.subjects.join('; '),
        'dc.description': article.abstract,
        'dc.rights': '© STM Journals. All rights reserved.',

        'prism.publicationName': article.journal,
        'prism.publicationDate': article.publishedDate.split('T')[0],
        'prism.volume': article.volume || '',
        'prism.number': article.issue || '',
        'prism.startingPage': article.pages?.split('-')[0] || '',
        'prism.endingPage': article.pages?.split('-')[1] || '',
        'prism.doi': article.doi || '',

        'hw.ad-path': `/article/${article.id}`,
        'hw.identifier': articleUrl,

        'robots': 'index,follow',
        'revisit-after': '7 days',
        'content-language': article.language || 'en',
      },
    };
  } catch {
    return {
      title: SITE_NAME,
      description: 'Research articles',
    };
  }
}

export default async function Page(
  { params }: { params: { id: string } }
) {
  const article = await fetchArticle(params.id);
  if (!article) notFound();

  const articleUrl = `${SITE_URL}/article/${article.id}`;
  const pageStart = article.pages?.split('-')[0]?.trim();
  const pageEnd = article.pages?.split('-')[1]?.trim();

  // Periodical hierarchy
  const periodical = {
    '@type': 'Periodical',
    name: article.journal,
    publisher: { '@type': 'Organization', name: article.publisher || 'STM Journals' },
  };

  let isPartOf: any = periodical;
  if (article.volume) {
    isPartOf = { '@type': 'PublicationVolume', volumeNumber: article.volume, isPartOf: periodical };
  }
  if (article.issue) {
    isPartOf = { '@type': 'PublicationIssue', issueNumber: article.issue, isPartOf };
  }

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: article.title,
    name: article.title,
    author: article.authors.map(a => ({ '@type': 'Person', name: a })),
    publisher: { '@type': 'Organization', name: article.publisher || 'STM Journals', url: SITE_URL },
    datePublished: article.publishedDate,
    dateModified: article.publishedDate,
    description: article.abstract,
    abstract: article.abstract,
    keywords: article.keywords.join(', '),
    url: articleUrl,
    mainEntityOfPage: articleUrl,
    ...(article.doi && {
      identifier: { '@type': 'PropertyValue', propertyID: 'DOI', value: article.doi },
    }),
    ...(pageStart && { pageStart }),
    ...(pageEnd && { pageEnd }),
    isPartOf,
    about: (article.subjects || []).map(s => ({ '@type': 'Thing', name: s })),
    inLanguage: article.language || 'en',
    citation: article.references || [],
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Articles', item: `${SITE_URL}/articles` },
      { '@type': 'ListItem', position: 3, name: article.title, item: articleUrl },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <ArticleViewer article={article} />
      {/* Hidden extras for crawlers */}
      <div className="hidden">
        <span itemProp="headline">{article.title}</span>
        <span itemProp="datePublished">{article.publishedDate}</span>
        <span itemProp="publisher">{article.publisher}</span>
        {article.authors.map((a, i) => (
          <span key={i} itemProp="author">{a}</span>
        ))}
        {article.keywords.map((k, i) => (
          <span key={i} itemProp="keywords">{k}</span>
        ))}
        <span itemProp="abstract">{article.abstract}</span>
      </div>
    </div>
  );
}

// Do NOT generate static params; we fetch at request time to avoid build-time WP API hits.
// If you later want SSG for specific slugs, implement safely with try/catch and a small list.
// export async function generateStaticParams() { return []; }
