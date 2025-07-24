import dotenv from "dotenv";
import { Article, GNewsResponse, NewsletterConfig } from "../types/index.js";

dotenv.config();

export class GNewsService {
  private apiKey: string;
  private baseUrl = "https://gnews.io/api/v4";

  constructor() {
    this.apiKey = process.env["GNEWS_API_KEY"] as string;
    if (!this.apiKey) {
      throw new Error("GNEWS_API_KEY environment variable is not set");
    }
  }

  async fetchArticles(config?: Partial<NewsletterConfig>): Promise<Article[]> {
    const category = config?.category || process.env["GNEWS_CATEGORY"] || "business";
    const country = config?.country || process.env["GNEWS_COUNTRY"] || "us";
    const numArticles = config?.numArticles || process.env["GNEWS_NUM_ARTICLES"] || "10";

    console.log("Environment check:");
    console.log("- API Key present:", this.apiKey ? `Yes (${this.apiKey.substring(0, 8)}...)` : "No");
    console.log("- Category:", category);
    console.log("- Country:", country);
    console.log("- Number of articles:", numArticles);

    const url = `${this.baseUrl}/top-headlines?category=${category}&lang=en&country=${country}&max=${numArticles}&apikey=${this.apiKey}`;
    console.log("Request URL:", url.replace(this.apiKey, "***API_KEY***"));

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as GNewsResponse;
      const articles: Article[] = data.articles ?? [];

      console.log(`📰 Found ${articles.length} articles from GNews API`);
      return articles;
    } catch (error) {
      console.error("Error fetching articles from GNews:", error);
      throw error;
    }
  }
}

export const gnewsService = new GNewsService(); 