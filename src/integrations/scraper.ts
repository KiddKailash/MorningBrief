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
      // Fetch the page with increased timeout and retry logic
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 20000, // Increased to 20 seconds
        maxRedirects: 5,
        validateStatus: (status) => status < 500 // Accept 4xx but not 5xx errors
      });
      
      // Parse HTML
      const $ = cheerio.load(data);
      
      // Remove unwanted elements
      $('script, style, nav, header, footer, aside').remove();
      
      // Try to find article content using common selectors (ordered by specificity)
      const selectors = [
        'article p',
        '[class*="article-body"] p',
        '[class*="story-body"] p', 
        '[class*="post-content"] p',
        '[class*="entry-content"] p',
        'main p',
        '.content p',
        'article',
        '[role="main"]',
        '.article-content',
        '.post-content',
        '.entry-content',
        '.content',
        '.story-body',
        'main'
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
      const cleanedContent = this.cleanContent(content);
      
      // Validate content quality
      if (this.isValidContent(cleanedContent)) {
        return cleanedContent;
      } else {
        console.warn(`Low quality content from ${url}, content length: ${cleanedContent.length}`);
        return cleanedContent; // Still return it, let the caller decide
      }
      
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
      .replace(/\[.*?\]/g, '')        // Remove reference markers [1], [2], etc.
      .replace(/\(.*?\)/g, '')        // Remove parenthetical references
      .replace(/Advertisement/gi, '') // Remove advertisement text
      .replace(/Subscribe/gi, '')     // Remove subscription prompts
      .replace(/Sign up/gi, '')       // Remove sign-up prompts
      .trim()
      .substring(0, 2000);            // Limit length for AI processing
  }

  /**
   * Validate if scraped content is of sufficient quality
   */
  private isValidContent(content: string): boolean {
    if (!content || content.length < 100) {
      return false;
    }

    // Check for repetitive content patterns that indicate poor scraping
    const words = content.split(' ');
    const uniqueWords = new Set(words);
    const uniqueRatio = uniqueWords.size / words.length;
    
    // If less than 30% unique words, likely poor quality
    if (uniqueRatio < 0.3) {
      return false;
    }

    // Check for common navigation/UI text that indicates bad scraping
    const badPatterns = [
      /^(menu|navigation|skip to)/i,
      /^(home|about|contact|privacy)/i,
      /^(search|login|register)/i
    ];

    for (const pattern of badPatterns) {
      if (pattern.test(content.substring(0, 100))) {
        return false;
      }
    }

    return true;
  }
}

export const scraper = new ScraperService();