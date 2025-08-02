/**
 * All TypeScript types in one place
 */

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

// Newsletter structure
export interface NewsletterData {
  date: Date;
  articles: Article[];
  marketData: MarketIndicator[];
  spotlightStock?: SpotlightStock;
}

export interface NewsletterSections {
  header: string;
  intro: string;
  mainNews: string;
  marketSnapshot?: string;
  stockSpotlight?: string;
  icymi?: string;
  quickHits?: string;
  wordOfDay?: string;
  footer: string;
}

// Email configuration
export interface EmailConfig {
  subject: string;
  recipients: string[];
  newsletter: NewsletterSections;
}