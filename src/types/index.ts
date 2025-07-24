export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    id: string;
    name: string;
    url: string;
  };
}

export interface GNewsResponse {
  totalArticles: number;
  articles: Article[];
}

export interface NewsletterConfig {
  apiKey: string;
  category?: string;
  country?: string;
  numArticles?: string;
}

export interface EmailConfig {
  senderEmail: string;
  senderPassword: string;
  subscribers: string[];
}

export interface NewsletterContent {
  subject: string;
  htmlContent: string;
  textContent: string;
  previewText: string;
} 