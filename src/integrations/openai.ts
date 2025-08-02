/**
 * OpenAI Integration
 * 
 * Simple wrapper for OpenAI API with common newsletter prompts
 */

import OpenAI from 'openai';
import { settings } from '../config/settings';
import { brand } from '../config/brand';

class OpenAIService {
  private client: OpenAI;
  
  constructor() {
    this.client = new OpenAI({
      apiKey: settings.apis.openai
    });
  }
  
  /**
   * Generate content with a prompt
   */
  async generateContent(prompt: string, maxTokens: number = 1000): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a ${brand.personality.expertise} newsletter writer with a ${brand.personality.voice} voice and ${brand.personality.tone} tone. Write in a ${brand.personality.style} style.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.6
      });
      
      return response.choices[0]?.message?.content || '';
      
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Return fallback content
      return this.getFallbackContent(prompt);
    }
  }
  
  /**
   * Generate short text (headlines, one-liners)
   */
  async generateShortText(prompt: string, maxTokens: number = 50): Promise<string> {
    return this.generateContent(prompt, maxTokens);
  }
  
  /**
   * Fallback content when API fails
   */
  private getFallbackContent(prompt: string): string {
    // Generic fallbacks when AI service is unavailable
    if (prompt.includes('intro') || prompt.includes('hook')) {
      return "[Content generation temporarily unavailable]";
    }
    if (prompt.includes('market')) {
      return "[Market commentary unavailable]";
    }
    return "[Content unavailable]";
  }
}

export const openai = new OpenAIService();