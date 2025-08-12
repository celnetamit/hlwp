const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL || 'https://journals.stmjournals.com/wp-json/wp/v2';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://article.stmjournals.com';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Journal Library';

if (!WORDPRESS_API_URL) {
  console.warn('WORDPRESS_API_URL not found, using default URL');
}

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
        sizes: Record<string, {
          source_url: string;
          width: number;
          height: number;
        }>;
      };
    }>;
    'wp:term': Array<Array<{
      id: number;
      name: string;
      slug: string;
    }>>;
  };
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  count: number; // Number of posts in this category
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

  // Helper method to strip HTML tags
  stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, ''); // Regular expression to remove HTML tags
  }

  private async fetchAPI(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        cache: 'no-store',
        ...options,
      });

      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status} - ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`Error fetching from ${url}:`, error);
      throw error;
    }
  }

  async getJournals(params: {
    page?: number;
    per_page?: number;
    search?: string;
    categories?: string;
    orderby?: 'date' | 'title' | 'modified';
    order?: 'asc' | 'desc';
  } = {}): Promise<{ journals: Journal[], totalPages: number, total: number }> {
    const queryParams = new URLSearchParams({
      _embed: 'true',
      per_page: (params.per_page || 10).toString(),
      page: (params.page || 1).toString(),
      orderby: params.orderby || 'date',
      order: params.order || 'desc',
      ...(params.search && { search: params.search }),
      ...(params.categories && { categories: params.categories }),
    });

    try {
      const response = await fetch(`${this.baseUrl}/posts?${queryParams}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status} - ${response.statusText}`);
      }

      const journals = await response.json();

      const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
      const total = parseInt(response.headers.get('X-WP-Total') || '0');

      return { journals, totalPages, total };
    } catch (error) {
      console.error('Error fetching journals:', error);
      return { journals: [], totalPages: 1, total: 0 };
    }
  }

  async getJournal(slug: string): Promise<Journal | null> {
    try {
      const journals = await this.fetchAPI(`/posts?slug=${slug}&_embed=true`);
      return journals[0] || null;
    } catch (error) {
      console.error('Error fetching journal:', error);
      return null;
    }
  }

  async getJournalById(id: number): Promise<Journal | null> {
    try {
      return await this.fetchAPI(`/posts/${id}?_embed=true`);
    } catch (error) {
      console.error('Error fetching journal by ID:', error);
      return null;
    }
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
    try {
      return await this.fetchAPI('/categories');
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async getAuthors(): Promise<Author[]> {
    try {
      return await this.fetchAPI('/users');
    } catch (error) {
      console.error('Error fetching authors:', error);
      return [];
    }
  }

  // New helper to generate citation
  generateCitation(journal: Journal): string {
    const authors = journal.meta.journal_authors?.join(', ') || 'Unknown Author';
    const title = this.stripHtml(journal.title.rendered);
    const year = journal.meta.journal_year || new Date(journal.date).getFullYear().toString();
    const publisher = journal.meta.journal_publisher || SITE_NAME;
    return `${authors} (${year}). ${title}. ${publisher}.`;
  }

  // Method to test API connection
  async testConnection(): Promise<boolean> {
    try {
      await this.fetchAPI('/posts?per_page=1');
      return true;
    } catch (error) {
      console.error('WordPress API connection test failed:', error);
      return false;
    }
  }
}

export const wpAPI = new WordPressAPI();
export type { Journal, Category, Author };
export { SITE_URL, SITE_NAME };
