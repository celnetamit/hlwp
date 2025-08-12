import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { wpAPI, Journal, SITE_URL, SITE_NAME } from '../../lib/wordpress';
import { JsonLd } from '../../components/JsonLd';
import JournalDetail from '../../components/JournalDetail';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const journal = await wpAPI.getJournal(params.slug);
    
    if (!journal) {
      return {
        title: 'Journal Not Found',
        description: 'The requested journal could not be found.'
      };
    }

    const title = wpAPI.stripHtml(journal.title.rendered);
    const description = wpAPI.stripHtml(journal.excerpt.rendered).substring(0, 160);
    const authors = journal.meta.journal_authors?.join(', ') || 'Unknown Author';
    const publishDate = journal.meta.journal_year || new Date(journal.date).getFullYear().toString();
    const doi = journal.meta.journal_doi;
    const publisher = journal.meta.journal_publisher || 'Journal Library';

    return {
      title: `${title} | ${SITE_NAME}`,
      description: description,
      keywords: [
        ...journal.meta.journal_keywords || [],
        'academic journals',
        'research papers',
        'scholarly articles',
        'peer review'
      ],
      authors: journal.meta.journal_authors?.map(author => ({ name: author })) || [{ name: 'Unknown Author' }],
      publisher: publisher,
      openGraph: {
        title: title,
        description: description,
        type: 'article',
        publishedTime: journal.date,
        modifiedTime: journal.modified,
        authors: journal.meta.journal_authors || [],
        section: 'Academic Research',
        url: `${SITE_URL}/journal/${journal.slug}`,
        images: journal._embedded?.['wp:featuredmedia']?.[0] ? [{
          url: journal._embedded['wp:featuredmedia'][0].source_url,
          width: 1200,
          height: 630,
          alt: title
        }] : []
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        images: journal._embedded?.['wp:featuredmedia']?.[0]?.source_url
      },
      other: {
        // Google Scholar specific meta tags
        'citation_title': title,
        'citation_author': authors,
        'citation_publication_date': publishDate,
        'citation_journal_title': publisher,
        'citation_publisher': publisher,
        'citation_volume': journal.meta.journal_volume || '',
        'citation_issue': journal.meta.journal_issue || '',
        'citation_firstpage': journal.meta.journal_pages?.split('-')[0] || '',
        'citation_lastpage': journal.meta.journal_pages?.split('-')[1] || '',
        'citation_pdf_url': journal.meta.journal_pdf_url || '',
        'citation_abstract_html_url': `${SITE_URL}/journal/${journal.slug}`,
        'citation_fulltext_html_url': `${SITE_URL}/journal/${journal.slug}`,
        ...(doi && { 'citation_doi': doi }),
        ...(journal.meta.journal_issn && { 'citation_issn': journal.meta.journal_issn }),
        
        // Dublin Core meta tags
        'dc.title': title,
        'dc.creator': authors,
        'dc.publisher': publisher,
        'dc.date': publishDate,
        'dc.type': 'Text',
        'dc.format': 'text/html',
        'dc.language': 'en',
        'dc.identifier': doi || `${SITE_URL}/journal/${journal.slug}`,
        'dc.description': description,
        'dc.subject': journal.meta.journal_keywords?.join(', ') || '',
        
        // Additional scholarly meta tags
        'prism.publicationName': publisher,
        'prism.publicationDate': publishDate,
        'prism.volume': journal.meta.journal_volume || '',
        'prism.number': journal.meta.journal_issue || '',
        'prism.startingPage': journal.meta.journal_pages?.split('-')[0] || '',
        'prism.endingPage': journal.meta.journal_pages?.split('-')[1] || '',
        'prism.doi': doi || '',
        
        // Highwire Press meta tags
        'hw.title': title,
        'hw.author': authors,
        'hw.journal': publisher,
        'hw.volume': journal.meta.journal_volume || '',
        'hw.issue': journal.meta.journal_issue || '',
        'hw.spage': journal.meta.journal_pages?.split('-')[0] || '',
        'hw.epage': journal.meta.journal_pages?.split('-')[1] || '',
        'hw.year': publishDate,
        ...(doi && { 'hw.doi': doi })
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Journal Not Found',
      description: 'The requested journal could not be found.'
    };
  }
}

export default async function JournalPage({ params }: Props) {
  try {
    const journal = await wpAPI.getJournal(params.slug);
    
    if (!journal) {
      notFound();
    }

    // Generate structured data for the journal article
    const journalJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'ScholarlyArticle',
      headline: wpAPI.stripHtml(journal.title.rendered),
      // other properties...
    };

    // Breadcrumb structured data
    const breadcrumbJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: SITE_URL
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Journals',
          item: `${SITE_URL}/#journals`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: wpAPI.stripHtml(journal.title.rendered),
          item: `${SITE_URL}/journal/${journal.slug}`
        }
      ]
    };

    return (
      <>
        <JsonLd data={journalJsonLd} />
        <JsonLd data={breadcrumbJsonLd} />
        <JournalDetail journal={journal} /> {/* Pass journal object */}
      </>
    );
  } catch (error) {
    console.error('Error loading journal page:', error);
    notFound();
  }
}
