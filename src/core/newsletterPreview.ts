/**
 * Newsletter Preview System
 * 
 * Generates newsletter previews as HTML files that can be opened in a browser
 * for easy viewing, editing, and testing before sending to subscribers.
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { Article } from '../types/index.js';
import { contentProcessor } from './contentProcessor.js';
import { createNewsletterHTML } from '../branding/emailTemplate.js';
import { brand } from '../branding/brand.js';

export class NewsletterPreview {
  private previewDir = 'previews';

  constructor() {
    // Ensure preview directory exists
    if (!existsSync(this.previewDir)) {
      mkdirSync(this.previewDir, { recursive: true });
    }
  }

  /**
   * Generate and save newsletter preview as HTML file
   */
  async generatePreview(articles: Article[]): Promise<string> {
    console.log('[PREVIEW] Generating newsletter preview...');

    try {
      // Generate newsletter content
      const newsletterContent = await contentProcessor.generateNewsletter(articles);
      
      // Create branded subject line for preview
      const today = new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      const subject = `${today} | ${brand.tagline}`;
      const previewText = `${brand.subtitle} - ${today}'s edition`;

      // Generate HTML email
      const htmlContent = createNewsletterHTML({
        subject,
        content: newsletterContent,
        previewText,
      });

      // Add preview-specific enhancements
      const enhancedHtml = this.addPreviewEnhancements(htmlContent, subject);

      // Save to file with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `newsletter-preview-${timestamp}.html`;
      const filepath = join(this.previewDir, filename);

      writeFileSync(filepath, enhancedHtml, 'utf8');

      console.log(`[PREVIEW] Newsletter preview saved to: ${filepath}`);
      console.log(`[PREVIEW] Open in browser: file://${process.cwd()}/${filepath}`);
      
      return filepath;
    } catch (error) {
      console.error('[PREVIEW] Error generating preview:', error);
      throw error;
    }
  }

  /**
   * Generate a live preview that updates automatically
   */
  async generateLivePreview(articles: Article[]): Promise<string> {
    const filepath = await this.generatePreview(articles);
    
    // Also create a "latest.html" that always points to the newest preview
    const latestPath = join(this.previewDir, 'latest.html');
    const htmlContent = await this.getFileContent(filepath);
    writeFileSync(latestPath, htmlContent, 'utf8');
    
    console.log(`[PREVIEW] Latest preview available at: file://${process.cwd()}/${latestPath}`);
    
    return latestPath;
  }

  /**
   * Generate preview with editing annotations
   */
  async generateEditablePreview(articles: Article[]): Promise<string> {
    console.log('[PREVIEW] Generating editable preview with annotations...');

    try {
      // Generate newsletter content with section markers
      const newsletterContent = await contentProcessor.generateNewsletter(articles);
      
      // Add editing hints and section markers
      const annotatedContent = this.addEditingAnnotations(newsletterContent);
      
      const today = new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short", 
        day: "numeric",
      });
      const subject = `[EDITABLE PREVIEW] ${today} | ${brand.tagline}`;
      const previewText = `Editable preview - ${today}'s edition`;

      const htmlContent = createNewsletterHTML({
        subject,
        content: annotatedContent,
        previewText,
      });

      // Add editing enhancements
      const editableHtml = this.addEditingEnhancements(htmlContent, subject);

      const filename = `editable-preview-${Date.now()}.html`;
      const filepath = join(this.previewDir, filename);

      writeFileSync(filepath, editableHtml, 'utf8');

      console.log(`[PREVIEW] Editable preview saved to: ${filepath}`);
      console.log(`[PREVIEW] This version includes editing hints and section markers`);
      
      return filepath;
    } catch (error) {
      console.error('[PREVIEW] Error generating editable preview:', error);
      throw error;
    }
  }

  /**
   * Add preview-specific enhancements to HTML
   */
  private addPreviewEnhancements(html: string, subject: string): string {
    const previewBanner = `
    <div style="background: #1f2937; color: white; padding: 15px; text-align: center; font-family: monospace; position: sticky; top: 0; z-index: 1000; border-bottom: 3px solid #10b981;">
      <h2 style="margin: 0; color: #10b981;">📧 Newsletter Preview</h2>
      <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">Generated: ${new Date().toLocaleString()}</p>
      <div style="margin-top: 10px;">
        <button onclick="window.print()" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin: 0 5px; cursor: pointer;">Print Preview</button>
        <button onclick="document.querySelector('.newsletter-container').style.maxWidth = document.querySelector('.newsletter-container').style.maxWidth === '100%' ? '670px' : '100%'" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin: 0 5px; cursor: pointer;">Toggle Width</button>
      </div>
    </div>`;

    // Insert banner at the beginning of body
    const bodyStartIndex = html.indexOf('<body>') + '<body>'.length;
    return html.slice(0, bodyStartIndex) + previewBanner + html.slice(bodyStartIndex);
  }

  /**
   * Add editing annotations to content
   */
  private addEditingAnnotations(content: string): string {
    let annotated = content;

    // Add section editing hints
    const sectionMarkers = [
      { marker: '## 📊 MARKETS SNAPSHOT', hint: '💡 Edit market data in src/services/marketData.ts' },
      { marker: '## 🔍 STOCK SPOTLIGHT', hint: '💡 Spotlight algorithm in src/services/marketData.ts' },
      { marker: '## 📰 ICYMI', hint: '💡 Quick news items in generateICYMISection()' },
      { marker: '## 📈 STATS & REPORTS', hint: '💡 Daily stats in generateStatsSection()' },
      { marker: '## ⚡ QUICK HIT NEWS', hint: '💡 Brief news in generateQuickHitsSection()' },
      { marker: '## 💬 COMMUNITY CORNER', hint: '💡 Community prompts in brand.ts' },
      { marker: '## 👍 RECOMMENDATIONS', hint: '💡 Product recs in generateRecommendationsSection()' },
      { marker: '## 🏠 OPEN HOUSE', hint: '💡 Real estate game in generateRealEstateSection()' },
      { marker: '## 📚 WORD OF THE DAY', hint: '💡 Vocabulary in getTodaysWordOfDay()' }
    ];

    sectionMarkers.forEach(({ marker, hint }) => {
      annotated = annotated.replace(
        marker,
        `${marker}\n\n<div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px; margin: 10px 0; font-size: 12px; color: #92400e;">${hint}</div>`
      );
    });

    return annotated;
  }

  /**
   * Add editing enhancements to HTML
   */
  private addEditingEnhancements(html: string, subject: string): string {
    const editingStyles = `
    <style>
      .edit-hint {
        background: #fef3c7;
        border-left: 4px solid #f59e0b;
        padding: 8px 12px;
        margin: 8px 0;
        font-size: 11px;
        color: #92400e;
        font-family: monospace;
      }
      .section-container:hover {
        outline: 2px dashed #10b981;
        outline-offset: 2px;
      }
      .section-container:hover::after {
        content: "✏️ Click to edit this section";
        position: absolute;
        top: -25px;
        right: 0;
        background: #10b981;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: bold;
      }
    </style>`;

    // Insert editing styles in head
    const headEndIndex = html.indexOf('</head>');
    return html.slice(0, headEndIndex) + editingStyles + html.slice(headEndIndex);
  }

  /**
   * Helper to read file content
   */
  private async getFileContent(filepath: string): Promise<string> {
    const fs = await import('fs');
    return fs.readFileSync(filepath, 'utf8');
  }

  /**
   * Create a comparison preview showing before/after changes
   */
  async generateComparisonPreview(originalArticles: Article[], modifiedArticles: Article[]): Promise<string> {
    console.log('[PREVIEW] Generating comparison preview...');

    const [originalContent, modifiedContent] = await Promise.all([
      contentProcessor.generateNewsletter(originalArticles),
      contentProcessor.generateNewsletter(modifiedArticles)
    ]);

    const comparisonHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Newsletter Comparison</title>
      <style>
        body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; background: #f3f4f6; }
        .comparison-container { display: flex; gap: 20px; max-width: 1400px; margin: 0 auto; }
        .version { flex: 1; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .version-header { background: #374151; color: white; padding: 15px; text-align: center; font-weight: bold; }
        .version-content { height: 80vh; overflow-y: auto; }
        .original { border-top: 4px solid #ef4444; }
        .modified { border-top: 4px solid #10b981; }
      </style>
    </head>
    <body>
      <h1 style="text-align: center; color: #374151;">Newsletter Comparison Preview</h1>
      <div class="comparison-container">
        <div class="version original">
          <div class="version-header">🔴 Original Version</div>
          <div class="version-content">
            ${createNewsletterHTML({ subject: "Original", content: originalContent, previewText: "Original version" })}
          </div>
        </div>
        <div class="version modified">
          <div class="version-header">🟢 Modified Version</div>
          <div class="version-content">
            ${createNewsletterHTML({ subject: "Modified", content: modifiedContent, previewText: "Modified version" })}
          </div>
        </div>
      </div>
    </body>
    </html>`;

    const filename = `comparison-preview-${Date.now()}.html`;
    const filepath = join(this.previewDir, filename);
    writeFileSync(filepath, comparisonHtml, 'utf8');

    console.log(`[PREVIEW] Comparison preview saved to: ${filepath}`);
    return filepath;
  }
}

export const newsletterPreview = new NewsletterPreview(); 