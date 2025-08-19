// app/lib/wordpress.ts
// WordPress client used across pages/components

const WORDPRESS_API_URL =
  process.env.WORDPRESS_API_URL ||
  'https://journals.stmjournals.com/wp-json/wp/v2';
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://article.stmjournals.com';
const SITE_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME || 'Journal Library';

const WORDPRESS_USERNAME =
  process.env.WORDPRESS_USERNAME || ''; // leave blank in prod unless your WP needs Basic Auth
const WORDPRESS_PASSWORD =
  process.env.WORDPRESS_PASSWORD || '';

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
    // optional extras
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
        sizes: Record<
          string,
          { source_url: string; width: number; height: number }
        >;
      };
    }>;
    'wp:term': Array<
      Array<{
        id: number;
        name: string;
        slug: string;
      }>
    >;
  };
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface Author {
  id: number;
  name: string;
  slug: string;
  description: string;
  avatar_urls: Record<string, string>;
}

class WordPressAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = WORDPRESS_API_URL;
  }

  stripHtml(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  }

  private getAuthHeaders() {
    if (!WORDPRESS_USERNAME || !WORDPRESS_PASSWORD) {
      // public endpoints usually don’t require auth
      return { 'Content-Type': 'application/json' } as Record<string, string>;
    }
    const authHeader =
      'Basic ' +
      Buffer.from(`${WORDPRESS_USERNAME}:${WORDPRESS_PASSWORD}`).toString(
        'base64'
      );
    return {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    } as Record<string, string>;
  }

  private async fetchAPI<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const res = await fetch(url, {
      headers: this.getAuthHeaders(),
      cache: 'no-store',
      ...options,
    });
    if (!res.ok) {
      throw new Error(`WordPress API error: ${res.status} ${res.statusText}`);
    }
    // @ts-ignore
    res.xHeaders = res.headers;
    return res.json();
  }

  async getJournals(params: {
    page?: number;
    per_page?: number;
    search?: string;
    categories?: string;
    orderby?: 'date' | 'title' | 'modified';
    order?: 'asc' | 'desc';
  } = {}): Promise<{ journals: Journal[]; totalPages: number; total: number }> {
    const queryParams = new URLSearchParams({
      _embed: 'true',
      per_page: String(params.per_page ?? 10),
      page: String(params.page ?? 1),
      orderby: params.orderby ?? 'date',
      order: params.order ?? 'desc',
      ...(params.search ? { search: params.search } : {}),
      ...(params.categories ? { categories: params.categories } : {}),
    });

    const url = `/posts?${queryParams.toString()}`;
    const res = await fetch(`${this.baseUrl}${url}`, {
      headers: this.getAuthHeaders(),
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`WordPress API error: ${res.status} ${res.statusText}`);
    }

    const journals: Journal[] = await res.json();
    const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);
    const total = parseInt(res.headers.get('X-WP-Total') || '0', 10);
    return { journals, totalPages, total };
  }

  async getJournal(slug: string): Promise<Journal | null> {
    const data = await this.fetchAPI<Journal[]>(
      `/posts?slug=${encodeURIComponent(slug)}&_embed=true`
    );
    return data?.[0] ?? null;
  }

  async getJournalById(id: number): Promise<Journal | null> {
    return this.fetchAPI<Journal>(`/posts/${id}?_embed=true`).catch(() => null);
  }

  async getArticle(idOrSlug: string): Promise<Journal | null> {
    if (/^\d+$/.test(idOrSlug)) {
      const byId = await this.getJournalById(Number(idOrSlug));
      if (byId) return byId;
    }
    const bySlug = await this.getJournal(idOrSlug);
    if (bySlug) return bySlug;
    return null;
  }

  async getCategories(): Promise<Category[]> {
    return this.fetchAPI<Category[]>(`/categories?per_page=100`).catch(() => []);
  }

  async getAuthors(): Promise<Author[]> {
    return this.fetchAPI<Author[]>(`/users?per_page=100`).catch(() => []);
  }

  generateCitation(journal: Journal): string {
    const authors = journal.meta?.journal_authors?.join(', ') || 'Unknown Author';
    const title = this.stripHtml(journal.title?.rendered);
    const year =
      journal.meta?.journal_year ||
      new Date(journal.date).getFullYear().toString();
    const publisher = journal.meta?.journal_publisher || SITE_NAME;
    return `${authors} (${year}). ${title}. ${publisher}.`;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.fetchAPI('/posts?per_page=1');
      return true;
    } catch {
      return false;
    }
  }
}

export const wpAPI = new WordPressAPI();
export { SITE_URL, SITE_NAME };
