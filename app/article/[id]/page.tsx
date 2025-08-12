// app/article/[id]/page.tsx
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await getArticle(params.id)
  
  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.'
    }
  }

  const articleUrl = `${SITE_URL}/article/${article.id}`
  const publishedYear = new Date(article.publishedDate).getFullYear()

  return {
    title: `${article.title} | ${SITE_NAME}`,
    description: article.abstract.substring(0, 160) + '...',
    keywords: article.keywords.join(', '),
    authors: article.authors.map(author => ({ name: author })),
    // ❌ remove this line:
    // publishedTime: article.publishedDate,
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title: article.title,
      description: article.abstract.substring(0, 200) + '...',
      url: articleUrl,
      type: 'article',
      publishedTime: article.publishedDate, // ✅ correct place
      authors: article.authors,
      section: article.subjects[0] || 'Research',
      tags: article.keywords,
    },
    twitter: {
      card: 'summary',
      title: article.title,
      description: article.abstract.substring(0, 200) + '...',
    },
    other: {
      // (kept exactly as-is)
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
    }
  }
}
