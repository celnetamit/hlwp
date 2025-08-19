// app/lib/wordpress.ts

// Define constants for the API and site URLs
const WORDPRESS_API_URL =
  process.env.WORDPRESS_API_URL ||
  'https://journals.stmjournals.com/wp-json/wp/v2';
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://article.stmjournals.com';
const SITE_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME || 'Journal Library';

const WORDPRESS_USERNAME = process.env.WORDPRESS_USERNAME || 'your_username';
const WORDPRESS_PASSWORD = process.env.WORDPRESS_PASSWORD || 'your_password';

if (!WORDPRESS_API_URL) {
  console.warn('WORDPRESS_API_URL not found, using default URL');
}

// Types
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

// WordPress API client
class WordPressAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = WORDPRESS_API_URL;
  }

  // Helper method to strip HTML tags
  stripHtml(html: string): string {
    return (html || '').replace(/<[^>]*>/g, '');
  }

  // Authorization ONLY on the server (prevents bundling secrets to the client)
  private getAuthHeaders() {
    const isServer = typeof window === 'undefined';
    if (!isServer) {
      return { 'Content-Type': 'application/json' };
    }
    const authHeader =
      'Basic ' + Buffer.from(`${WORDPRESS_USERNAME}:${WORDPRESS_PASSWORD}`).toString('base64');
    return { 'Authorization': authHeader, 'Content-Type': 'application/json' };
  }

  // Generic fetch with basic error handling
  private async fetchAPI(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const res = await fetch(url, {
      headers: this.getAuthHeaders(),
      cache: 'no-store',
      ...options,
    });
    if (!res.ok) {
      throw new Error(`WordPress API error: ${res.status} - ${res.statusText} (${url})`);
    }
    return res.json();
  }

  // List with pagination
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

    const response = await fetch(`${this.baseUrl}/posts?${queryParams}`, {
      headers: this.getAuthHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status} - ${response.statusText}`);
    }

    const journals = (await response.json()) as Journal[];
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1', 10);
    const total = parseInt(response.headers.get('X-WP-Total') || '0', 10);

    return { journals, totalPages, total };
  }

  async getJournal(slug: string): Promise<Journal | null> {
    const data = (await this.fetchAPI(`/posts?slug=${encodeURIComponent(slug)}&_embed=true`)) as Journal[];
    return data[0] || null;
  }

  async getJournalById(id: number): Promise<Journal | null> {
    try {
      return (await this.fetchAPI(`/posts/${id}?&_embed=true`)) as Journal;
    } catch {
      return null;
    }
  }

  async getArticle(idOrSlug: string): Promise<Journal | null> {
    if (/^\d+$/.test(idOrSlug)) {
      const byId = await this.getJournalById(Number(idOrSlug));
      if (byId) return byId;
    }
    return await this.getJournal(idOrSlug);
  }

  async getCategories(): Promise<Category[]> {
    try {
      return (await this.fetchAPI('/categories')) as Category[];
    } catch {
      return [];
    }
  }

  async getAuthors(): Promise<Author[]> {
    try {
      return (await this.fetchAPI('/users')) as Author[];
    } catch {
      return [];
    }
  }

  generateCitation(journal: Journal): string {
    const authors = journal.meta?.journal_authors?.join(', ') || 'Unknown Author';
    const title = this.stripHtml(journal.title.rendered);
    const year = journal.meta?.journal_year || new Date(journal.date).getFullYear().toString();
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

// Instantiate and export the API client
export const wpAPI = new WordPressAPI();
export { SITE_URL, SITE_NAME, WORDPRESS_API_URL };
