/**
 * Newsletter Main Entry Point
 *
 * Simple, linear flow:
 * 1. Fetch data
 * 2. Generate sections
 * 3. Create HTML
 * 4. Send email
 */

import {
  fetchAllNewsletterData,
  fetchAllCategorizedNewsletterData,
} from "./fetchers";
import { compileAllSections, compileAllCategorizedSections } from "./sections";
import { generateHTML, generatePlainText } from "./template";
import { emailer } from "../integrations/email";
import { brand } from "../config/brand";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { ai } from "../integrations/ai";

export class Newsletter {
  private previewDir = "previews";

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
      console.log(
        `✅ Fetched ${data.articles.length} articles and ${data.marketData.length} market indicators`
      );

      // 2. Generate newsletter sections
      const sections = await compileAllSections(data.articles, data.marketData);
      console.log("✅ Generated all newsletter sections");

      // 3. Create HTML and plain text versions
      const html = generateHTML(sections);
      const plainText = generatePlainText(sections);
      console.log("✅ Created HTML and plain text versions");

      // 4. Send to subscribers
      const subject = await this.generateSubject(plainText);
      const recipients = this.getRecipients();

      await emailer.sendNewsletter({
        subject,
        recipients,
        html,
        plainText,
      });

      console.log(`✅ Newsletter sent to ${recipients.length} subscribers!`);
    } catch (error) {
      console.error("❌ Newsletter failed:", error);
      throw error;
    }
  }

  /**
   * Generate preview without sending
   */
  async preview(): Promise<string> {
    console.log("👀 Generating newsletter preview...");

    // Fetch and generate
    const data = await fetchAllNewsletterData();
    const sections = await compileAllSections(data.articles, data.marketData);
    const html = generateHTML(sections, true); // true for preview mode

    // Get Date Data
    const now = new Date();
    const iso = now.toISOString();
    const datePart = iso.split("T")[0];
    const timePart =
      iso.split("T")[1]?.replace(/:/g, "-").replace(/\..+/, "") || "00-00-00";

    // Names
    const filename = `newsletter-preview-${datePart}T${timePart}.html`;
    const latestPreviewFilename = "latest.html";

    // Paths
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
   * Generate and send the newsletter using categorized articles (NEW)
   */
  async sendCategorized(): Promise<void> {
    console.log(
      `🚀 Starting ${brand.name} newsletter with categorized content...`
    );

    try {
      // 1. Fetch all categorized data
      const data = await fetchAllCategorizedNewsletterData();
      const totalArticles = Object.values(data.articles).reduce(
        (sum, articles) => sum + articles.length,
        0
      );
      console.log(
        `✅ Fetched ${totalArticles} categorized articles and ${data.marketData.length} market indicators`
      );

      // 2. Generate newsletter sections using categorized data
      const sections = await compileAllCategorizedSections(
        data.articles,
        data.marketData,
        data.spotlightStock
      );
      console.log("✅ Generated all newsletter sections");

      // 3. Create HTML and plain text versions
      const html = generateHTML(sections);
      const plainText = generatePlainText(sections);
      console.log("✅ Created HTML and plain text versions");

      // 4. Send to subscribers
      const subject = await this.generateSubject(plainText);
      const recipients = this.getRecipients();

      await emailer.sendNewsletter({
        subject,
        recipients,
        html,
        plainText,
      });

      console.log(`✅ Newsletter sent to ${recipients.length} subscribers!`);
    } catch (error) {
      console.error("❌ Newsletter failed:", error);
      throw error;
    }
  }

  /**
   * Generate preview using categorized articles (NEW)
   */
  async previewCategorized(): Promise<string> {
    console.log("👀 Generating categorized newsletter preview...");

    // Fetch and generate using categorized data
    const data = await fetchAllCategorizedNewsletterData();
    const sections = await compileAllCategorizedSections(
      data.articles,
      data.marketData,
      data.spotlightStock
    );
    const html = generateHTML(sections, true); // true for preview mode

    // Get Date Data
    const now = new Date();
    const iso = now.toISOString();
    const datePart = iso.split("T")[0];
    const timePart =
      iso.split("T")[1]?.replace(/:/g, "-").replace(/\..+/, "") || "00-00-00";

    // Names
    const filename = `newsletter-categorized-preview-${datePart}T${timePart}.html`;
    const latestPreviewFilename = "latest-categorized.html";

    // Paths
    const filepath = join(this.previewDir, filename);
    const latestPreviewPath = join(this.previewDir, latestPreviewFilename);

    writeFileSync(filepath, html);
    writeFileSync(latestPreviewPath, html);

    console.log(`[SUCCESS] Categorized preview saved to: ${filepath}`);
    return filepath;
  }

  /**
   * Generate editable categorized sections (returns sections object)
   */
  async getCategorizedEditableSections() {
    const data = await fetchAllCategorizedNewsletterData();
    return await compileAllCategorizedSections(
      data.articles,
      data.marketData,
      data.spotlightStock
    );
  }

  /**
   * Generate subject line with date
   */
  private async generateSubject(newsletter: any): Promise<string> {
    const oneLiner = await ai.generateShortText(
      `Select ONE topic from this newsletter and create a highly engaging 3-5 word hook describing the topic.
      Use abslutely NO markdown, quatations, or formatting of any kind other than plain text. Plain text only.

      Newsletter is:
      """
        ${newsletter}
      """
      `,
      2000
    );

    return `☕️ ${oneLiner}`;
  }

  /**
   * Get recipient list from environment
   */
  private getRecipients(): string[] {
    const subscribers = process.env["SUBSCRIBERS_LIST"] || "";
    return subscribers
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.includes("@"));
  }
}

// Export singleton instance
export const newsletter = new Newsletter();
