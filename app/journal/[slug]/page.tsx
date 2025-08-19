// app/journal/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { wpAPI, SITE_URL, SITE_NAME } from '@/lib/wordpress';
import { JsonLd } from '@/components/JsonLd';

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const journal = await wpAPI.getJournal(params.slug);
  if (!journal) {
    return {
      title: 'Journal Not Found',
      description: 'The requested journal could not be found.',
    };
  }

  const title = wpAPI.stripHtml(journal.title.rendered);
  const description = wpAPI.stripHtml(journal.excerpt?.rendered || '').slice(0, 160);
  const authors = journal.meta?.journal_authors?.join(', ') || 'Unknown Author';
  const publishDate =
    journal.meta?.journal_year ||
    (journal.date ? new Date(journal.date).getFullYear().toString() : '');
  const doi = journal.meta?.journal_doi;
  const publisher = journal.meta?.journal_publisher || SITE_NAME;
  const ogImage = journal._embedded?.['wp:featuredmedia']?.[0]?.source_url;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${SITE_URL}/journal/${journal.slug}`,
      publishedTime: journal.date,
      modifiedTime: journal.modified,
      authors: journal.meta?.journal_authors || [],
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    other: {
      // Google Scholar tags
      citation_title: title,
      citation_author: authors,
      citation_publication_date: publishDate,
      citation_journal_title: publisher,
      citation_publisher: publisher,
      citation_volume: journal.meta?.journal_volume || '',
      citation_issue: journal.meta?.journal_issue || '',
      citation_firstpage: journal.meta?.journal_pages?.split('-')[0] || '',
      citation_lastpage: journal.meta?.journal_pages?.split('-')[1] || '',
      citation_pdf_url: journal.meta?.journal_pdf_url || '',
      citation_abstract_html_url: `${SITE_URL}/journal/${journal.slug}`,
      citation_fulltext_html_url: `${SITE_URL}/journal/${journal.slug}`,
      ...(doi ? { citation_doi: doi } : {}),
      ...(journal.meta?.journal_issn ? { citation_issn: journal.meta.journal_issn } : {}),

      // Dublin Core
      'dc.title': title,
      'dc.creator': authors,
      'dc.publisher': publisher,
      'dc.date': publishDate,
      'dc.type': 'Text',
      'dc.format': 'text/html',
      'dc.language': 'en',
      'dc.identifier': doi || `${SITE_URL}/journal/${journal.slug}`,
      'dc.description': description,
      'dc.subject': (journal.meta?.journal_keywords || []).join(', '),

      // Prism
      'prism.publicationName': publisher,
      'prism.publicationDate': publishDate,
      'prism.volume': journal.meta?.journal_volume || '',
      'prism.number': journal.meta?.journal_issue || '',
      'prism.startingPage': journal.meta?.journal_pages?.split('-')[0] || '',
      'prism.endingPage': journal.meta?.journal_pages?.split('-')[1] || '',
      'prism.doi': doi || '',

      // Highwire Press
      'hw.title': title,
      'hw.author': authors,
      'hw.journal': publisher,
      'hw.volume': journal.meta?.journal_volume || '',
      'hw.issue': journal.meta?.journal_issue || '',
      'hw.spage': journal.meta?.journal_pages?.split('-')[0] || '',
      'hw.epage': journal.meta?.journal_pages?.split('-')[1] || '',
      'hw.year': publishDate,
      ...(doi ? { 'hw.doi': doi } : {}),
    },
  };
}

export default async function JournalPage({ params }: Props) {
  const journal = await wpAPI.getJournal(params.slug);
  if (!journal) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: wpAPI.stripHtml(journal.title.rendered),
    description: wpAPI.stripHtml(journal.excerpt?.rendered || ''),
    author:
      journal.meta?.journal_authors?.map((name) => ({
        '@type': 'Person',
        name,
      })) || [{ '@type': 'Person', name: 'Unknown Author' }],
    publisher: { '@type': 'Organization', name: journal.meta?.journal_publisher || SITE_NAME },
    datePublished: journal.date,
    dateModified: journal.modified,
    url: `${SITE_URL}/journal/${journal.slug}`,
    ...(journal.meta?.journal_doi
      ? {
          identifier: [
            { '@type': 'PropertyValue', propertyID: 'DOI', value: journal.meta.journal_doi },
          ],
        }
      : {}),
    ...(journal.meta?.journal_issn
      ? {
          isPartOf: {
            '@type': 'Periodical',
            name: journal.meta?.journal_publisher || SITE_NAME,
            issn: journal.meta.journal_issn,
          },
        }
      : {}),
    ...(journal.meta?.journal_abstract ? { abstract: journal.meta.journal_abstract } : {}),
    ...(journal.meta?.journal_keywords
      ? { keywords: journal.meta.journal_keywords.join(', ') }
      : {}),
    ...(journal._embedded?.['wp:featuredmedia']?.[0]
      ? {
          image: {
            '@type': 'ImageObject',
            url: journal._embedded['wp:featuredmedia'][0].source_url,
            caption: journal.title.rendered,
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Journals', item: `${SITE_URL}/#journals` },
      { '@type': 'ListItem', position: 3, name: journal.slug, item: `${SITE_URL}/journal/${journal.slug}` },
    ],
  };

  // Render with your presentational component
  const JournalDetail = (await import('@/components/JournalDetail')).default;

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <JournalDetail journal={journal} />
    </>
  );
}

export async function generateStaticParams() {
  // optional: prebuild first N posts
  const { journals } = await wpAPI.getJournals({ per_page: 100 });
  return journals.map((j) => ({ slug: j.slug }));
}
