/**
 * All TypeScript types in one place
 */

// Type definitions for Alpha Vantage market data
export interface MarketDataPoint {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

/** Polygon API article structure */
export interface PolygonArticle {
  id: string;
  publisher: {
    name: string;
    homepage_url: string;
    logo_url: string;
    favicon_url: string;
  };
  title: string;
  author: string;
  published_utc: string;
  article_url: string;
  tickers: string[];
  amp_url: string;
  image_url: string;
  description: string;
  keywords: string[];
}

/** Polygon API article with scraped content */
export interface PolygonArticleWithContent extends PolygonArticle {
  content: string;
}

/** Polygon API response structure */
export interface PolygonNewsResponse {
  results: PolygonArticle[];
  status: string;
  request_id: string;
  count: number;
  next_url?: string;
}

/** Polygon API response with scraped content */
export interface PolygonNewsResponseWithContent {
  results: PolygonArticleWithContent[];
  status: string;
  request_id: string;
  count: number;
  next_url?: string;
}

export interface EmailOptions {
  subject: string;
  recipients: string[];
  html: string;
  plainText: string;
}

// Article types
export interface Article {
  id: string;
  title: string;
  description: string;
  content?: string;
  url: string;
  image?: string;
  publishedAt: string;
  source: {
    id: string | null;
    name: string;
  };
}

// Market data types
export interface MarketIndicator {
  name: string;
  value: number;
  changePercent: number;
  symbol?: string;
}

// Spotlight stock types
export interface SpotlightStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changesPercentage: number;
  marketCap?: number;
  articles?: any[];
}

// Categorized articles for themed sections
export interface CategorizedArticles {
  general: Article[];
  business: Article[];
  world: Article[];
  technology: Article[];
  entertainment: Article[];
  science: Article[];
  health: Article[];
}

// Newsletter structure
export interface NewsletterData {
  date: Date;
  articles: CategorizedArticles;
  marketData: MarketIndicator[];
  spotlightStock?: SpotlightStock;
}

export interface NewsletterSections {
  header: string;
  intro: string;
  marketSnapshot?: string;
  stockSpotlight?: string;
  economy?: string;
  world?: string;
  retail?: string;
  icymi?: string;
  stat?: string;
  news?: string;
  community?: string;
  recs?: string;
  games?: string;
  shareTheBrew?: string;
  wordOfDay?: string;
  footer: string;
}

// Email configuration
export interface EmailConfig {
  subject: string;
  recipients: string[];
  newsletter: NewsletterSections;
}