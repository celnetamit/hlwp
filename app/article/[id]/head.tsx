import { SITE_URL, SITE_NAME, wpAPI } from '../../lib/wordpress';

export default async function Head({ params }: { params: { id: string } }) {
  const post = await wpAPI.getArticle(params.id);
  if (!post) return null;

  const title = (post.title?.rendered || '').replace(/<[^>]*>/g, '');
  const desc = (post.excerpt?.rendered || '').replace(/<[^>]*>/g, '').slice(0, 160);
  const authors = post.meta?.journal_authors || [];
  const publishDate = post.meta?.journal_year || new Date(post.date).toISOString().slice(0, 10);
  const publisher = post.meta?.journal_publisher || SITE_NAME;
  const doi = post.meta?.journal_doi || '';
  const pages = post.meta?.journal_pages || '';
  const [fp = '', lp = ''] = pages.split('-');
  const pdfUrl = post.meta?.journal_pdf_url || '';
  const url = `${SITE_URL}/article/${params.id}`;

  return (
    <>
      <title>{`${title} | ${SITE_NAME}`}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />

      <meta name="citation_title" content={title} />
      {authors.map((a: string, i: number) => (
        <meta key={i} name="citation_author" content={a} />
      ))}
      <meta name="citation_publication_date" content={publishDate} />
      <meta name="citation_journal_title" content={publisher} />
      <meta name="citation_publisher" content={publisher} />
      {fp && <meta name="citation_firstpage" content={fp} />}
      {lp && <meta name="citation_lastpage" content={lp} />}
      {post.meta?.journal_volume && <meta name="citation_volume" content={post.meta.journal_volume} />}
      {post.meta?.journal_issue && <meta name="citation_issue" content={post.meta.journal_issue} />}
      {doi && <meta name="citation_doi" content={doi} />}
      {pdfUrl && <meta name="citation_pdf_url" content={pdfUrl} />}
      <meta name="citation_abstract_html_url" content={url} />
      <meta name="citation_fulltext_html_url" content={url} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={url} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
    </>
  );
}
