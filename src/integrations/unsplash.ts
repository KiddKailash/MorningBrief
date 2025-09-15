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
   * Default fallback search terms only used if AI-generated terms fail
   */
  private getDefaultFallbackTerms(): string[] {
    return ['business', 'professional workspace', 'modern office'];
  }

  /**
   * Fetch a relevant image for a newsletter section using AI-generated search terms
   */
  public async getImageForSection(
    sectionName: string,
    aiGeneratedQuery?: string
  ): Promise<{ url: string; alt: string; credit: string; link: string } | null> {
    
    if (!this.apiKey) {
      console.log(`⚠️ Skipping image for section "${sectionName}" - no Unsplash API key`);
      return null;
    }

    try {
      // Use AI-generated query or fallback to minimal defaults
      const fallbackTerms = this.getDefaultFallbackTerms();
      const query = aiGeneratedQuery || fallbackTerms[Math.floor(Math.random() * fallbackTerms.length)];
      
      if (!query) {
        console.log(`⚠️ No search query available for "${sectionName}"`);
        return null;
      }
      
      console.log(`🖼️ Fetching image for "${sectionName}" with AI query: "${query}"`);

      const response = await fetch(
        `${this.baseUrl}/search/photos?query=${encodeURIComponent(query)}&per_page=10&orientation=landscape&content_filter=high`,
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

          const imageData = {
            url: photo.urls.regular,
            alt: photo.alt_description || photo.description || `${sectionName} related image`,
            credit: `Photo by ${photo.user.name}`,
            link: photo.links.html
          };
          
          console.log(`✅ Image found for "${sectionName}": ${imageData.url}`);
          return imageData;
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
   * Get multiple images for batch processing with AI-generated search terms
   */
  public async getImagesForSections(
    sectionData: Array<{ sectionName: string; aiQuery?: string }>
  ): Promise<Map<string, { url: string; alt: string; credit: string; link: string } | null>> {
    const imageMap = new Map();
    
    // Process images with some delay to respect rate limits
    for (let i = 0; i < sectionData.length; i++) {
      const sectionItem = sectionData[i];
      if (sectionItem) {
        const { sectionName, aiQuery } = sectionItem;
        if (sectionName) {
          const image = await this.getImageForSection(sectionName, aiQuery);
          imageMap.set(sectionName, image);
        }
      }
      
      // Small delay between requests to be respectful to the API
      if (i < sectionData.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    return imageMap;
  }
}

export const unsplashService = new UnsplashService(); 