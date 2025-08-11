import { Metadata } from 'next'
import JournalLibrary from './components/JournalLibrary'
import { JsonLd } from './components/JsonLd'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://article.stmjournals.com';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Journal Library';

export const metadata: Metadata = {
  title: `Home - ${SITE_NAME}`,
  description: 'Discover and explore comprehensive academic journals and research papers across multiple disciplines and cutting-edge research areas.',
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: `${SITE_NAME} - Academic Research`,
    description: 'Discover comprehensive academic journals and research papers across multiple disciplines.',
    url: SITE_URL,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'STM Journal Articles'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} - Academic Research`,
    description: 'Discover comprehensive academic journals and research papers across multiple disciplines.',
  }
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: SITE_URL
    }
  ]
}

const collectionPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: `${SITE_NAME} - Journal Collection`,
  description: 'Comprehensive collection of academic research articles and journals',
  url: SITE_URL,
  mainEntity: {
    '@type': 'ItemList',
    name: 'Academic Journal Articles',
    description: 'Academic research publications',
    numberOfItems: 0 // This should be dynamic based on actual journal count
  },
  provider: {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL
  },
  isPartOf: {
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL
  }
}

export default function Home() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={collectionPageJsonLd} />
      <JournalLibrary />
    </>
  )
}