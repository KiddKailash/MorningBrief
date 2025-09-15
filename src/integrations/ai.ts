/**
 * AI Integration
 *
 * Unified wrapper for AI providers (OpenAI/Anthropic) with common newsletter prompts
 */

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { settings } from "../config/settings";
import { brand } from "../config/brand";

class AIService {
  private openaiClient?: OpenAI;
  private anthropicClient?: Anthropic;
  private provider: "openai" | "anthropic";

  constructor() {
    this.provider = settings.ai.provider;

    if (this.provider === "openai") {
      this.openaiClient = new OpenAI({
        apiKey: settings.apis.openai,
      });
    } else if (this.provider === "anthropic") {
      this.anthropicClient = new Anthropic({
        apiKey: settings.apis.anthropic,
      });
    }
  }

  /**
   * Get system prompt for AI providers
   */
  private getSystemPrompt(): string {
    return `
    You are a ${brand.personality.expertise} newsletter journalist for "${brand.name}". 
    Brand personality and tone: ${brand.personality.tone}.
    Your political leaning is ${brand.personality.political}.
    
    NEVER give recommendations or advice. DO NOT speculate on the future.
    When using links, make these random but relevant words within the article.

    When linking to an article, use the following format:
    [Link text](URL)
    - Do not call attention to links, here is an example of an apropriate link embed: 'In an ironic twist, [oil prices have surged](link) following recent turmoil in...', example two: 'A [new species of panda](https://www.panda.com) was discovered in the Himalayas.' 
    - Links ARE ALWAYS to be embedded subtly, NEVER EVER name an article author, source, or specifically call attention to the link.
    - URL MUST be the full URL of the article.

    MARKDOWN FORMATTING AVAILABLE:
    - **Bold text** for emphasis and important points
    - *Italic text* for subtle emphasis and quotes
    - ***Bold italic*** for maximum emphasis
    - ~~Strikethrough~~ for humorous, witty use, or sarcastic comments
    - Embed [link text](URL) within sentences
    - Lists: - item for bullet points
    `;
  }

  /**
   * Generate content with a prompt
   */
  async generateContent(
    prompt: string,
    maxTokens: number = 2000
  ): Promise<string> {
    try {
      if (this.provider === "openai" && this.openaiClient) {
        return await this.generateWithOpenAI(prompt, maxTokens);
      } else if (this.provider === "anthropic" && this.anthropicClient) {
        return await this.generateWithAnthropic(prompt, maxTokens);
      } else {
        throw new Error(`Invalid AI provider: ${this.provider}`);
      }
    } catch (error) {
      console.error(`${this.provider.toUpperCase()} API error:`, error);
      // Return fallback content
      return this.getFallbackContent(prompt);
    }
  }

  /**
   * Generate content with a prompt
   */
  async generateUnsplashSearchTerm(
    prompt: string,
    maxTokens: number = 1000
  ): Promise<string> {
    const systemPrompt = `
    You are a search term generator for unsplash.com.
    You are given an article which the image is to accompany, return 3-5 search terms for unsplash.com based on the article content.
    The search terms should be no more than 4 words (plain text, no markdown, quatations, or formatting).
    `

    try {
      if (this.provider === "openai" && this.openaiClient) {
        return await this.generateWithOpenAI(prompt, maxTokens, systemPrompt);
      } else if (this.provider === "anthropic" && this.anthropicClient) {
        return await this.generateWithAnthropic(prompt, maxTokens, systemPrompt);
      } else {
        throw new Error(`Invalid AI provider: ${this.provider}`);
      }
    } catch (error) {
      console.error(`${this.provider.toUpperCase()} API error:`, error);
      // Return fallback content
      return this.getFallbackContent(prompt);
    }
  }

  /**
   * Generate content using OpenAI
   */
  private async generateWithOpenAI(
    prompt: string,
    maxTokens: number,
    systemPrompt?: string
  ): Promise<string> {
    const sysPrompt = systemPrompt ?? this.getSystemPrompt();
    if (!this.openaiClient) throw new Error("OpenAI client not initialized");

    const response = await this.openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: sysPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: maxTokens,
      temperature: 0.5,
    });

    return response.choices[0]?.message?.content || "";
  }

  /**
   * Generate content using Anthropic Claude
   */
  private async generateWithAnthropic(
    prompt: string,
    maxTokens: number,
    systemPrompt?: string
  ): Promise<string> {
    const sysPrompt = systemPrompt ?? this.getSystemPrompt();
    if (!this.anthropicClient)
      throw new Error("Anthropic client not initialized");

    const response = await this.anthropicClient.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: maxTokens,
      temperature: 0.5,
      system: sysPrompt,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract text content from Anthropic response
    const content = response.content[0];
    if (content && content.type === "text") {
      return content.text;
    }
    return "";
  }

  /**
   * Generate short text (headlines, one-liners)
   */
  async generateShortText(
    prompt: string,
    maxTokens: number = 500
  ): Promise<string> {
    return this.generateContent(prompt, maxTokens);
  }

  /**
   * Fallback content when AI API fails
   */
  private getFallbackContent(prompt: string): string {
    // Generic fallbacks when AI service is unavailable
    if (prompt.includes("intro") || prompt.includes("hook")) {
      return "[Content generation temporarily unavailable]";
    }
    if (prompt.includes("market")) {
      return "[Market commentary unavailable]";
    }
    return "[AI content unavailable]";
  }
}

export const ai = new AIService();

// Legacy export for backward compatibility
export const openai = ai;
