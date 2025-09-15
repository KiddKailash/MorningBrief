/**
 * GNews Integration
 * 
 * Simple wrapper for GNews API with rate limiting and retry logic
 */

import axios from 'axios';
import { Article, CategorizedArticles } from '../types';
import { settings } from '../config/settings';

type GNewsCategory = 'general' | 'business' | 'world' | 'technology' | 'entertainment' | 'science' | 'health';

// Rate limiting configuration
const RATE_LIMIT_DELAY = 2000; // 2 seconds between requests
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

class GNewsService {
  private baseURL = 'https://gnews.io/api/v4';
  
  /**
   * Sleep utility for rate limiting
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Retry with exponential backoff for rate limited requests
   */
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    context: string,
    retryCount: number = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      // Check if it's a rate limiting error
      const isRateLimit = error?.response?.status === 429 || 
                         (error?.code === 'ERR_BAD_REQUEST' && error?.response?.status === 429);
      
      if (isRateLimit && retryCount < MAX_RETRIES) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        console.warn(`🚫 Rate limited for ${context}. Retrying in ${delay}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await this.sleep(delay);
        return this.retryWithBackoff(operation, context, retryCount + 1);
      }
      
      // Log additional context for debugging
      if (isRateLimit) {
        console.error(`❌ Max retries exceeded for ${context}. Rate limit still active.`);
      } else {
        console.error(`❌ Non-rate-limit error for ${context}:`, error?.message || error);
      }
      
      // If not rate limit or max retries exceeded, throw the error
      throw error;
    }
  }
  
  async fetchLatestArticles(): Promise<Article[]> {
    return this.retryWithBackoff(async () => {
      const response = await axios.get(`${this.baseURL}/top-headlines`, {
        params: {
          category: settings.content.category,
          country: settings.content.country,
          lang: settings.content.language,
          max: settings.content.numArticles,
          apikey: settings.apis.gnews
        }
      });
      
      if (!response.data?.articles) {
        throw new Error('No articles in response');
      }
      
      return response.data.articles.map(this.mapArticle);
    }, 'fetchLatestArticles');
  }
  
  async fetchArticlesByCategory(category: GNewsCategory, maxArticles: number = 7): Promise<Article[]> {
    try {
      return await this.retryWithBackoff(async () => {
        const response = await axios.get(`${this.baseURL}/top-headlines`, {
          params: {
            category,
            country: settings.content.country,
            lang: settings.content.language,
            max: maxArticles,
            apikey: settings.apis.gnews
          }
        });
        
        if (!response.data?.articles) {
          console.warn(`No articles found for category: ${category}`);
          return [];
        }
        
        return response.data.articles.map(this.mapArticle);
      }, `fetchArticlesByCategory(${category})`);
      
    } catch (error) {
      console.error(`GNews API error for category ${category}:`, error);
      return []; // Return empty array instead of throwing to avoid breaking other category fetches
    }
  }
  
  async fetchCategorizedArticles(): Promise<CategorizedArticles> {
    console.log("📰 Fetching articles by category with rate limiting...");
    
    const categories: GNewsCategory[] = ['general', 'business', 'world', 'technology', 'entertainment', 'science', 'health'];
    
    // Increased article count per category for better diversity and to prevent duplication
    const articlesPerCategory = {
      general: 15,     // Used for ICYMI and News sections
      business: 12,    // Used for header, economy, and stat sections  
      world: 8,        // Used for world section
      technology: 8,   // Used for retail section
      entertainment: 6, // Used for retail section
      science: 6,      // Additional content pool
      health: 6        // Additional content pool
    };
    
    // Fetch articles for each category SEQUENTIALLY with delays to prevent rate limiting
    const results: { category: GNewsCategory; articles: Article[] }[] = [];
    
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i]!; // Non-null assertion since we're within array bounds
      const maxArticles = (articlesPerCategory as any)[category] || 6;
      
      console.log(`📰 Fetching ${category} articles (${i + 1}/${categories.length})...`);
      
      try {
        const articles = await this.fetchArticlesByCategory(category, maxArticles);
        results.push({ category, articles });
        
        // Add delay between requests (except for the last one)
        if (i < categories.length - 1) {
          console.log(`⏱️ Waiting ${RATE_LIMIT_DELAY}ms before next request...`);
          await this.sleep(RATE_LIMIT_DELAY);
        }
      } catch (error) {
        console.error(`Failed to fetch ${category} articles:`, error);
        results.push({ category, articles: [] });
      }
    }
    
    // Build the categorized articles object
    const categorizedArticles: CategorizedArticles = {
      general: [],
      business: [],
      world: [],
      technology: [],
      entertainment: [],
      science: [],
      health: []
    };
    
    results.forEach(({ category, articles }) => {
      categorizedArticles[category] = articles;
    });
    
    const totalArticles = Object.values(categorizedArticles).reduce((sum, articles) => sum + articles.length, 0);
    console.log(`✅ Categories fetched (${totalArticles} total articles):`, Object.keys(categorizedArticles).map(cat => 
      `${cat}: ${categorizedArticles[cat as keyof CategorizedArticles].length} articles`
    ).join(', '));
    
    return categorizedArticles;
  }
  
  private mapArticle(article: any): Article {
    return {
      id: article.url, // Use URL as ID
      title: article.title,
      description: article.description,
      url: article.url,
      image: article.image,
      publishedAt: article.publishedAt,
      source: {
        id: null,
        name: article.source.name
      }
    };
  }
}

export const gnews = new GNewsService();