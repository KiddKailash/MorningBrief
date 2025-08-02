/**
 * Newsletter Main Entry Point
 * 
 * Simple, linear flow:
 * 1. Fetch data
 * 2. Generate sections
 * 3. Create HTML
 * 4. Send email
 */

import { fetchAllNewsletterData } from './fetchers';
import { compileAllSections } from './sections';
import { generateHTML, generatePlainText } from './template';
import { emailer } from '../integrations/email';
import { brand } from '../config/brand';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export class Newsletter {
  private previewDir = 'previews';

  constructor() {
    // Ensure preview directory exists
    if (!existsSync(this.previewDir)) {
      mkdirSync(this.previewDir, { recursive: true });
    }
  }

  /**
   * Generate and send the newsletter
   */
  async send(): Promise<void> {
    console.log(`🚀 Starting ${brand.name} newsletter...`);
    
    try {
      // 1. Fetch all data
      const data = await fetchAllNewsletterData();
      console.log(`✅ Fetched ${data.articles.length} articles and ${data.marketData.length} market indicators`);
      
      // 2. Generate newsletter sections
      const sections = await compileAllSections(data.articles, data.marketData);
      console.log('✅ Generated all newsletter sections');
      
      // 3. Create HTML and plain text versions
      const html = generateHTML(sections);
      const plainText = generatePlainText(sections);
      console.log('✅ Created HTML and plain text versions');
      
      // 4. Send to subscribers
      const subject = await this.generateSubject();
      const recipients = this.getRecipients();
      
      await emailer.sendNewsletter({
        subject,
        recipients,
        html,
        plainText
      });
      
      console.log(`✅ Newsletter sent to ${recipients.length} subscribers!`);
      
    } catch (error) {
      console.error('❌ Newsletter failed:', error);
      throw error;
    }
  }

  /**
   * Generate preview without sending
   */
  async preview(): Promise<string> {
    console.log('👀 Generating newsletter preview...');
    
    // Fetch and generate
    const data = await fetchAllNewsletterData();
    const sections = await compileAllSections(data.articles, data.marketData);
    const html = generateHTML(sections, true); // true for preview mode
    
    // Save preview
    const filename = `preview-${new Date().toISOString().split('T')[0]}.html`;
    const latestPreviewFilename = 'latest.html';

    const filepath = join(this.previewDir, filename);
    const latestPreviewPath = join(this.previewDir, latestPreviewFilename);

    writeFileSync(filepath, html);
    writeFileSync(latestPreviewPath, html);

    console.log(`[SUCCESS] Preview saved to: ${filepath}`);
    return filepath;
  }

  /**
   * Generate editable preview (returns sections object)
   */
  async getEditableSections() {
    const data = await fetchAllNewsletterData();
    return await compileAllSections(data.articles, data.marketData);
  }

  /**
   * Generate subject line with date
   */
  private async generateSubject(): Promise<string> {
    const date = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    
    // For subject lines, we'll use the brand name from config or env
    const newsletterName = process.env['NEWSLETTER_NAME'] || brand.name;
    return `${newsletterName} - ${date}`;
  }

  /**
   * Get recipient list from environment
   */
  private getRecipients(): string[] {
    const subscribers = process.env['SUBSCRIBERS_LIST'] || '';
    return subscribers
      .split(',')
      .map(email => email.trim())
      .filter(email => email.includes('@'));
  }
}

// Export singleton instance
export const newsletter = new Newsletter();