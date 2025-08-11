// app/layout.tsx (Enhanced Version)
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
  description: 'Comprehensive academic journal library providing full-text access to peer-reviewed research papers across science, technology, medicine and multiple disciplines.',
  keywords: [
    'academic journals',
    'research papers', 
    'scholarly articles', 
    'peer review', 
    'academic publishing', 
    'scientific literature',
    'journal articles',
    'research publications',
    'academic research',
    'full text articles',
    'open access',
    'citation database'
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
    description: 'Comprehensive academic journal library with full-text access to peer-reviewed research papers.',
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Academic Research`
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} - Academic Research Hub`,
    description: 'Comprehensive academic journal library with full-text access to research papers.',
    images: [`${SITE_URL}/og-image.jpg`]
  },
  verification: {
    google: GOOGLE_VERIFICATION,
  },
  other: {
    // Enhanced robots directives
    'robots': 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1',
    'googlebot': 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1',
    'bingbot': 'index,follow',
    'slurp': 'index,follow',
    
    // Content language
    'content-language': 'en',
    
    // Cache control
    'cache-control': 'public, max-age=3600',
    
    // Academic search engine verification
    'msvalidate.01': process.env.BING_VERIFICATION_CODE || '',
    'yandex-verification': process.env.YANDEX_VERIFICATION_CODE || '',
    
    // Academic indexing tags
    'academic-site': 'true',
    'scholarly-content': 'true',
    'peer-reviewed': 'true',
  }
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: 'Comprehensive academic journal library providing full-text access to peer-reviewed research',
  inLanguage: 'en',
  copyrightYear: new Date().getFullYear(),
  copyrightHolder: {
    '@type': 'Organization',
    name: SITE_NAME
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string'
  },
  about: [
    {
      '@type': 'Thing',
      name: 'Academic Research',
      sameAs: 'https://en.wikipedia.org/wiki/Academic_publishing'
    },
    {
      '@type': 'Thing',
      name: 'Scholarly Communication',
      sameAs: 'https://en.wikipedia.org/wiki/Scholarly_communication'
    },
    {
      '@type': 'Thing',
      name: 'Peer Review',
      sameAs: 'https://en.wikipedia.org/wiki/Peer_review'
    }
  ],
  mainEntity: {
    '@type': 'DataCatalog',
    name: `${SITE_NAME} Collection`,
    description: 'Comprehensive collection of academic research articles and journals',
    provider: {
      '@type': 'Organization',
      name: SITE_NAME
    }
  }
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/logo.png`,
    width: 600,
    height: 60
  },
  description: 'Leading platform for academic research articles and scholarly journals',
  foundingDate: '2024',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: CONTACT_PHONE,
    contactType: 'customer service',
    email: CONTACT_EMAIL,
    availableLanguage: 'English'
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'US'
  },
  sameAs: [
    'https://twitter.com/stmjournals',
    'https://linkedin.com/company/stmjournals',
    'https://facebook.com/stmjournals'
  ],
  knowsAbout: [
    'Academic Publishing',
    'Scientific Research',
    'Peer Review',
    'Scholarly Communication',
    'Research Methodology'
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
        
        {/* Enhanced Google Scholar meta tags */}
        <meta name="citation_title" content={`${SITE_NAME} - Academic Research Hub`} />
        <meta name="citation_author" content={`${SITE_NAME} Team`} />
        <meta name="citation_publication_date" content="2024" />
        <meta name="citation_journal_title" content={SITE_NAME} />
        <meta name="citation_publisher" content={SITE_NAME} />
        <meta name="citation_abstract_html_url" content={SITE_URL} />
        <meta name="citation_fulltext_html_url" content={SITE_URL} />
        <meta name="citation_language" content="en" />
        <meta name="citation_keywords" content="academic research, scholarly articles, peer review, journal articles" />
        
        {/* Dublin Core meta tags */}
        <meta name="dc.title" content={`${SITE_NAME} - Academic Research Hub`} />
        <meta name="dc.creator" content={`${SITE_NAME} Team`} />
        <meta name="dc.publisher" content={SITE_NAME} />
        <meta name="dc.date" content="2024" />
        <meta name="dc.type" content="Text" />
        <meta name="dc.format" content="text/html" />
        <meta name="dc.language" content="en" />
        <meta name="dc.subject" content="Academic Research, Scholarly Articles, Peer Review" />
        <meta name="dc.description" content="Comprehensive academic journal library with full-text access" />
        <meta name="dc.identifier" content={SITE_URL} />
        <meta name="dc.coverage" content="Global" />
        <meta name="dc.rights" content="© STM Journals. All rights reserved." />
        
        {/* PRISM (Publishing Requirements for Industry Standard Metadata) */}
        <meta name="prism.publicationName" content={SITE_NAME} />
        <meta name="prism.publicationDate" content="2024" />
        <meta name="prism.copyright" content={`© ${new Date().getFullYear()} ${SITE_NAME}`} />
        <meta name="prism.rightsAgent" content={CONTACT_EMAIL} />
        <meta name="prism.url" content={SITE_URL} />
        
        {/* Highwire Press tags */}
        <meta name="hw.ad-path" content="/journals" />
        <meta name="hw.identifier" content={SITE_URL} />
        
        {/* Enhanced academic indexing tags */}
        <meta name="eprints.type" content="article" />
        <meta name="eprints.title" content={`${SITE_NAME} - Academic Research`} />
        <meta name="eprints.creators_name" content={`${SITE_NAME} Team`} />
        <meta name="eprints.date" content="2024" />
        <meta name="eprints.publication" content={SITE_NAME} />
        
        {/* Microsoft Academic tags */}
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="theme-color" content="#2563eb" />
        
        {/* Open Access indicators */}
        <meta name="dc.rights.accessrights" content="open access" />
        <meta name="eprints.access" content="open" />
        
        {/* Additional verification tags */}
        {GOOGLE_VERIFICATION && (
          <meta name="google-site-verification" content={GOOGLE_VERIFICATION} />
        )}
        <meta name="msvalidate.01" content={process.env.BING_VERIFICATION_CODE || ''} />
        <meta name="yandex-verification" content={process.env.YANDEX_VERIFICATION_CODE || ''} />
        <meta name="baidu-site-verification" content={process.env.BAIDU_VERIFICATION_CODE || ''} />
        
        {/* RSS/Atom feeds */}
        <link rel="alternate" type="application/rss+xml" title={`${SITE_NAME} RSS Feed`} href={`${SITE_URL}/feed.xml`} />
        <link rel="alternate" type="application/atom+xml" title={`${SITE_NAME} Atom Feed`} href={`${SITE_URL}/atom.xml`} />
        
        {/* Enhanced Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#2563eb" />
        
        {/* DNS prefetch for better performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={inter.className}>
        {/* Skip to content for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
        >
          Skip to main content
        </a>
        
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
                  anonymize_ip: true,
                  allow_google_signals: false,
                  allow_ad_personalization_signals: false
                });
              `}
            </Script>
          </>
        )}
        
        {/* Google Scholar verification script */}
        <Script id="scholar-meta" strategy="afterInteractive">
          {`
            // Enhanced metadata for Google Scholar
            if (typeof window !== 'undefined') {
              const meta = document.createElement('meta');
              meta.name = 'google-scholar-verification';
              meta.content = 'enhanced-indexing-enabled';
              document.head.appendChild(meta);
              
              // Ensure proper encoding
              document.querySelectorAll('meta[name^="citation_"]').forEach(el => {
                if (el.content) {
                  el.content = el.content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                }
              });
            }
          `}
        </Script>
        
        {/* Main content wrapper */}
        <div id="main-content" role="main">
          {children}
        </div>
        
        {/* Structured data for breadcrumbs (global) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: SITE_NAME,
              url: SITE_URL,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${SITE_URL}/search?q={search_term_string}`,
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />
      </body>
    </html>
  )
}