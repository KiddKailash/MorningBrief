// Unsplash API service for fetching appropriate section images
import dotenv from 'dotenv';

dotenv.config();

interface UnsplashPhoto {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
    full: string;
  };
  alt_description: string | null;
  description: string | null;
  user: {
    name: string;
    username: string;
  };
  links: {
    html: string;
  };
}

interface UnsplashSearchResponse {
  results: UnsplashPhoto[];
  total: number;
  total_pages: number;
}

export class UnsplashService {
  private apiKey: string;
  private baseUrl = 'https://api.unsplash.com';

  constructor() {
    this.apiKey = process.env['UNSPLASH_API_KEY'] || '';
    
    if (!this.apiKey) {
      console.warn('⚠️ Unsplash API key not found. Images will be skipped.');
    }
  }

  /**
   * Get search terms for different newsletter sections
   */
  private getSectionSearchTerms(sectionName: string): string[] {
    const searchMappings: { [key: string]: string[] } = {
      'MARKETS & FINANCE': ['stock market', 'financial trading', 'investment banking', 'wall street'],
      'GLOBAL ECONOMY': ['global business', 'international trade', 'world economy', 'economic growth'],
      'CORPORATE': ['corporate headquarters', 'business meeting', 'executive office', 'company boardroom'],
      'ENERGY & COMMODITIES': ['oil drilling', 'renewable energy', 'commodity trading', 'energy industry'],
      'POLICY & REGULATION': ['government buildings', 'policy meeting', 'regulatory affairs', 'political economy'],
      'INNOVATION & TRENDS': ['business innovation', 'startup culture', 'entrepreneurship', 'business growth'],
      'QUICK BYTES': ['business news', 'financial markets', 'economic indicators', 'market trends'],
      'WORTH A CLICK': ['business resources', 'financial analysis', 'market insights', 'economic research'],
      'BUSINESS NEWS': ['business', 'finance', 'economics', 'corporate world']
    };

    // Find the best match for the section name
    for (const [key, terms] of Object.entries(searchMappings)) {
      if (sectionName.toUpperCase().includes(key.toUpperCase())) {
        return terms;
      }
    }

    // Default fallback terms
    return ['business', 'finance', 'economics'];
  }

  /**
   * Fetch a relevant image for a newsletter section
   */
  public async getImageForSection(
    sectionName: string,
    fallbackQuery?: string
  ): Promise<{ url: string; alt: string; credit: string; link: string } | null> {
    
    if (!this.apiKey) {
      console.log(`⚠️ Skipping image for section "${sectionName}" - no Unsplash API key`);
      return null;
    }

    try {
      const searchTerms = this.getSectionSearchTerms(sectionName);
      const query = fallbackQuery || searchTerms[Math.floor(Math.random() * searchTerms.length)];
      
      console.log(`🖼️ Fetching image for "${sectionName}" with query: "${query}"`);

      const response = await fetch(
        `${this.baseUrl}/search/photos?query=${encodeURIComponent(query || 'business')}&per_page=10&orientation=landscape&content_filter=high`,
        {
          headers: {
            'Authorization': `Client-ID ${this.apiKey}`,
            'Accept-Version': 'v1'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as UnsplashSearchResponse;
      
      if (data.results && data.results.length > 0) {
        // Pick a random image from the top results
        const randomIndex = Math.floor(Math.random() * Math.min(data.results.length, 5));
        const photo = data.results[randomIndex];
        
        if (photo) {
          // Trigger a download ping (Unsplash requirement for free tier)
          this.triggerDownload(photo.id);

          return {
            url: photo.urls.regular,
            alt: photo.alt_description || photo.description || `${sectionName} related image`,
            credit: `Photo by ${photo.user.name}`,
            link: photo.links.html
          };
        }
      } else {
        console.log(`⚠️ No images found for "${sectionName}" with query "${query}"`);
        return null;
      }

    } catch (error) {
      console.error(`❌ Error fetching image for section "${sectionName}":`, error);
      return null;
    }

    return null;
  }

  /**
   * Trigger download ping (required by Unsplash for free tier)
   */
  private async triggerDownload(photoId: string): Promise<void> {
    if (!this.apiKey) return;
    
    try {
      await fetch(`${this.baseUrl}/photos/${photoId}/download`, {
        headers: {
          'Authorization': `Client-ID ${this.apiKey}`,
          'Accept-Version': 'v1'
        }
      });
    } catch (error) {
      // Non-critical error, just log it
      console.log('Note: Could not trigger download ping for photo', photoId);
    }
  }

  /**
   * Get multiple images for batch processing
   */
  public async getImagesForSections(sectionNames: string[]): Promise<Map<string, { url: string; alt: string; credit: string; link: string } | null>> {
    const imageMap = new Map();
    
    // Process images with some delay to respect rate limits
    for (let i = 0; i < sectionNames.length; i++) {
      const sectionName = sectionNames[i];
      if (sectionName) {
        const image = await this.getImageForSection(sectionName);
        imageMap.set(sectionName, image);
      }
      
      // Small delay between requests to be respectful to the API
      if (i < sectionNames.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    return imageMap;
  }
}

export const unsplashService = new UnsplashService(); 