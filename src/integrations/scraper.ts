/**
 * Web Scraper Integration
 * 
 * Simple article content scraper
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

class ScraperService {
  /**
   * Scrape article content from URL
   */
  async scrapeArticleContent(url: string): Promise<string> {
    try {
      // Fetch the page
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NewsletterBot/1.0)'
        },
        timeout: 10000
      });
      
      // Parse HTML
      const $ = cheerio.load(data);
      
      // Remove unwanted elements
      $('script, style, nav, header, footer, aside').remove();
      
      // Try to find article content using common selectors
      const selectors = [
        'article',
        'main',
        '[role="main"]',
        '.article-content',
        '.post-content',
        '.entry-content',
        '.content',
        '.story-body'
      ];
      
      let content = '';
      
      for (const selector of selectors) {
        const element = $(selector);
        if (element.length > 0) {
          content = element.text();
          break;
        }
      }
      
      // Fallback to body if no specific content found
      if (!content) {
        content = $('body').text();
      }
      
      // Clean up the content
      return this.cleanContent(content);
      
    } catch (error) {
      console.error(`Scraping failed for ${url}:`, error);
      return '';
    }
  }
  
  /**
   * Clean and format scraped content
   */
  private cleanContent(content: string): string {
    return content
      .replace(/\s+/g, ' ')           // Normalize whitespace
      .replace(/\n{3,}/g, '\n\n')     // Limit consecutive newlines
      .trim()
      .substring(0, 2000);            // Limit length
  }
}

export const scraper = new ScraperService();