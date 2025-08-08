import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { JsonLd } from './components/JsonLd'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://article.stmjournals.com';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Journal Library';
const GOOGLE_VERIFICATION = process.env.GOOGLE_VERIFICATION_CODE;
const GOOGLE_ANALYTICS_ID = process.env.GOOGLE_ANALYTICS_ID;
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@stmjournals.com';
const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE || '+1-555-123-4567';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Academic Research Hub`,
    template: `%s | ${SITE_NAME}`
  },
  description: 'Explore comprehensive academic journals and research papers across science, technology, medicine and more disciplines.',
  keywords: [
    'academic journals',
    'research papers', 
    'scholarly articles', 
    'peer review', 
    'academic publishing', 
    'scientific literature',
    'journal articles',
    'research publications',
    'academic research'
  ],
  authors: [{ name: `${SITE_NAME} Team` }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    title: `${SITE_NAME} - Academic Research Hub`,
    description: 'Explore comprehensive academic journals and research papers across multiple disciplines.',
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} - Academic Research Hub`,
    description: 'Explore comprehensive academic journals and research papers across multiple disciplines.',
  },
  verification: {
    google: GOOGLE_VERIFICATION,
  },
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: 'Comprehensive academic journal and research paper library',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string'
  },
  about: {
    '@type': 'Thing',
    name: 'Academic Research and Journals'
  }
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: 'Leading platform for academic research articles and journals',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: CONTACT_PHONE,
    contactType: 'customer service',
    email: CONTACT_EMAIL
  },
  sameAs: [
    'https://twitter.com/stmjournals',
    'https://linkedin.com/company/stmjournals'
  ]
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <JsonLd data={websiteJsonLd} />
        <JsonLd data={organizationJsonLd} />
        <link rel="canonical" href={SITE_URL} />
        
        {/* Google Scholar meta tags */}
        <meta name="citation_title" content={`${SITE_NAME} - Academic Research Hub`} />
        <meta name="citation_author" content={`${SITE_NAME} Team`} />
        <meta name="citation_publication_date" content="2024" />
        <meta name="citation_journal_title" content={SITE_NAME} />
        <meta name="citation_publisher" content={SITE_NAME} />
        
        {/* Dublin Core meta tags */}
        <meta name="dc.title" content={`${SITE_NAME} - Academic Research Hub`} />
        <meta name="dc.creator" content={`${SITE_NAME} Team`} />
        <meta name="dc.publisher" content={SITE_NAME} />
        <meta name="dc.type" content="Text" />
        <meta name="dc.format" content="text/html" />
        <meta name="dc.language" content="en" />
        <meta name="dc.subject" content="Academic Research, Journals, Scholarly Articles" />
        
        {/* Additional meta tags for academic indexing */}
        <meta name="prism.publicationName" content={SITE_NAME} />
        <meta name="prism.issn" content="your-issn-here" />
        <meta name="prism.eIssn" content="your-eissn-here" />
        
        {/* Highwire Press tags */}
        <meta name="hw.ad-path" content="/journals" />
        <meta name="hw.identifier" content={SITE_URL} />
        
        {/* Additional academic search engine tags */}
        {GOOGLE_VERIFICATION && (
          <meta name="google-site-verification" content={GOOGLE_VERIFICATION} />
        )}
        <meta name="msvalidate.01" content="your-bing-verification-code" />
        
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={inter.className}>
        {/* Google Analytics */}
        {GOOGLE_ANALYTICS_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GOOGLE_ANALYTICS_ID}', {
                  page_title: document.title,
                  page_location: window.location.href,
                });
              `}
            </Script>
          </>
        )}
        
        {children}
      </body>
    </html>
  )
}