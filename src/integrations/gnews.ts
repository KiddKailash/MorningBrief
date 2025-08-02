/**
 * GNews Integration
 * 
 * Simple wrapper for GNews API
 */

import axios from 'axios';
import { Article } from '../types';
import { settings } from '../config/settings';

class GNewsService {
  private baseURL = 'https://gnews.io/api/v4';
  
  async fetchLatestArticles(): Promise<Article[]> {
    try {
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
      
    } catch (error) {
      console.error('GNews API error:', error);
      throw error;
    }
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