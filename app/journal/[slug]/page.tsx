// app/journal/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { wpAPI, SITE_URL, SITE_NAME } from '../../lib/wordpress';
import { JsonLd } from '../../components/JsonLd';
import JournalDetail from '../../components/JournalDetail';

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const journal = await wpAPI.getJournal(params.slug);
  if (!journal) return { title: 'Journal Not Found', description: 'The requested journal could not be found.' };

  const title = wpAPI.stripHtml(journal.title.rendered);
  const description = wpAPI.stripHtml(journal.excerpt?.rendered || '').substring(0, 160);
  const publishDate = journal.meta?.journal_year || new Date(journal.date).getFullYear().toString();
  const doi = journal.meta?.journal_doi;
  const publisher = journal.meta?.journal_publisher || SITE_NAME;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    openGraph: {
      title, description, type: 'article',
      publishedTime: journal.date, modifiedTime: journal.modified,
      url: `${SITE_URL}/journal/${journal.slug}`,
      images: journal._embedded?.['wp:featuredmedia']?.[0]
        ? [{ url: journal._embedded['wp:featuredmedia'][0].source_url, width: 1200, height: 630, alt: title }]
        : [],
    },
    twitter: { card: 'summary_large_image', title, description },
    alternates: { canonical: `${SITE_URL}/journal/${journal.slug}` },
    other: {
      'citation_title': title,
      ...(journal.meta?.journal_authors || []).reduce((acc: any, a: string, i: number) => {
        acc[`citation_author_${i}`] = a; return acc;
      }, {}),
      'citation_publication_date': publishDate,
      'citation_journal_title': publisher,
      'citation_publisher': publisher,
      'citation_volume': journal.meta?.journal_volume || '',
      'citation_issue': journal.meta?.journal_issue || '',
      'citation_firstpage': journal.meta?.journal_pages?.split('-')[0] || '',
      'citation_lastpage': journal.meta?.journal_pages?.split('-')[1] || '',
      'citation_pdf_url': journal.meta?.journal_pdf_url || '',
      ...(doi && { 'citation_doi': doi }),
      ...(journal.meta?.journal_issn && { 'citation_issn': journal.meta.journal_issn }),
    },
  };
}

export default async function Page({ params }: Props) {
  const journal = await wpAPI.getJournal(params.slug);
  if (!journal) notFound();

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: wpAPI.stripHtml(journal.title.rendered),
    description: wpAPI.stripHtml(journal.excerpt?.rendered || ''),
    author: (journal.meta?.journal_authors || []).map((n) => ({ '@type': 'Person', name: n })),
    publisher: { '@type': 'Organization', name: journal.meta?.journal_publisher || SITE_NAME },
    datePublished: journal.date, dateModified: journal.modified,
    url: `${SITE_URL}/journal/${journal.slug}`,
    ...(journal.meta?.journal_doi && { identifier: [{ '@type': 'PropertyValue', propertyID: 'DOI', value: journal.meta.journal_doi }] }),
  };

  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Journals', item: `${SITE_URL}/#journals` },
      { '@type': 'ListItem', position: 3, name: wpAPI.stripHtml(journal.title.rendered), item: `${SITE_URL}/journal/${journal.slug}` },
    ],
  };

  return (
    <>
      <JsonLd data={ld} />
      <JsonLd data={breadcrumb} />
      <JournalDetail journal={journal} />
    </>
  );
}

export async function generateStaticParams() {
  const { journals } = await wpAPI.getJournals({ per_page: 100 });
  return journals.map((j) => ({ slug: j.slug }));
}
