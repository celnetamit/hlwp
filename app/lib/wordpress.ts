// app/lib/wordpress.ts

// Server + client safe WordPress API helper
const WORDPRESS_API_URL =
  process.env.WORDPRESS_API_URL ||
  'https://journals.stmjournals.com/wp-json/wp/v2';
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://article.stmjournals.com';
const SITE_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME || 'Journal Library';

const WORDPRESS_USERNAME = process.env.WORDPRESS_USERNAME || 'your_username';
const WORDPRESS_PASSWORD = process.env.WORDPRESS_PASSWORD || 'your_password';

export interface Journal {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  slug: string;
  date: string;
  modified: string;
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
  meta: {
    journal_issn?: string;
    journal_doi?: string;
    journal_volume?: string;
    journal_issue?: string;
    journal_pages?: string;
    journal_publisher?: string;
    journal_year?: string;
    journal_authors?: string[];
    journal_keywords?: string[];
    journal_abstract?: string;
    journal_pdf_url?: string;
    journal_citation_count?: number;
    references?: string[];
  };
  _embedded?: {
    author: Array<{
      id: number;
      name: string;
      slug: string;
      avatar_urls: Record<string, string>;
    }>;
    'wp:featuredmedia': Array<{
      id: number;
      source_url: string;
      alt_text: string;
      media_details: {
        sizes: Record<string, { source_url: string; width: number; height: number }>;
      };
    }>;
    'wp:term': Array<Array<{ id: number; name: string; slug: string }>>;
  };
}

export interface Category {
  id: number; name: string; slug: string; count: number;
}

class WordPressAPI {
  private baseUrl: string = WORDPRESS_API_URL;

  stripHtml(html: string): string {
    return (html || '').replace(/<[^>]*>/g, '');
  }

  // Only attach Authorization headers on the server (prevents exposing creds)
  private getAuthHeaders() {
    const isServer = typeof window === 'undefined';
    if (!isServer) return { 'Content-Type': 'application/json' };
    const auth =
      'Basic ' + Buffer.from(`${WORDPRESS_USERNAME}:${WORDPRESS_PASSWORD}`).toString('base64');
    return { 'Authorization': auth, 'Content-Type': 'application/json' };
  }

  private async fetchAPI(endpoint: string, init: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const res = await fetch(url, { headers: this.getAuthHeaders(), cache: 'no-store', ...init });
    if (!res.ok) throw new Error(`WP API ${res.status}: ${res.statusText} (${url})`);
    return res.json();
  }

  async getJournals(params: {
    page?: number; per_page?: number; search?: string; categories?: string;
    orderby?: 'date'|'title'|'modified'; order?: 'asc'|'desc';
  } = {}): Promise<{ journals: Journal[]; totalPages: number; total: number }> {
    const qs = new URLSearchParams({
      _embed: 'true',
      per_page: String(params.per_page ?? 20),
      page: String(params.page ?? 1),
      orderby: params.orderby ?? 'date',
      order: params.order ?? 'desc',
      ...(params.search ? { search: params.search } : {}),
      ...(params.categories ? { categories: params.categories } : {}),
    }).toString();

    const res = await fetch(`${this.baseUrl}/posts?${qs}`, {
      headers: this.getAuthHeaders(), cache: 'no-store'
    });
    if (!res.ok) throw new Error(`WP API ${res.status}: ${res.statusText}`);
    const journals = (await res.json()) as Journal[];
    const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);
    const total = parseInt(res.headers.get('X-WP-Total') || '0', 10);
    return { journals, totalPages, total };
  }

  async getJournal(slug: string): Promise<Journal | null> {
    const data = (await this.fetchAPI(`/posts?slug=${encodeURIComponent(slug)}&_embed=true`)) as Journal[];
    return data[0] || null;
  }

  async getJournalById(id: number): Promise<Journal | null> {
    try { return (await this.fetchAPI(`/posts/${id}?_embed=true`)) as Journal; }
    catch { return null; }
  }

  async getArticle(idOrSlug: string): Promise<Journal | null> {
    if (/^\d+$/.test(idOrSlug)) {
      const byId = await this.getJournalById(Number(idOrSlug));
      if (byId) return byId;
    }
    return await this.getJournal(idOrSlug);
  }

  async getCategories(): Promise<Category[]> {
    try { return (await this.fetchAPI('/categories?per_page=100')) as Category[]; }
    catch { return []; }
  }

  generateCitation(j: Journal): string {
    const authors = j.meta?.journal_authors?.join(', ') || 'Unknown Author';
    const title = this.stripHtml(j.title?.rendered || '');
    const year = j.meta?.journal_year || new Date(j.date).getFullYear().toString();
    const publisher = j.meta?.journal_publisher || SITE_NAME;
    return `${authors} (${year}). ${title}. ${publisher}.`;
  }
}

export const wpAPI = new WordPressAPI();
export { SITE_URL, SITE_NAME, WORDPRESS_API_URL };
