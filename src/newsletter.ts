/**
 * Central Newsletter Orchestrator
 * 
 * This file serves as the main entry point for the newsletter application.
 * It orchestrates the entire process of fetching articles, generating content,
 * and sending the newsletter to subscribers.
 * 
 * Run this file to execute the complete newsletter generation and delivery process.
 */

import dotenv from 'dotenv';
// import articleFetcher from './core/articleFetcher.js';  // TODO: Uncomment this when testing is done
// @ts-ignore
import articleFetcher from './dummydata/articleFetcher';
import { contentProcessor } from './core/contentProcessor.js';
import { emailSender } from './core/emailSender.js';
import { newsletterPreview } from './core/newsletterPreview.js';

// Load environment variables
dotenv.config();

/**
 * Validates that all required environment variables are set
 */
const validateEnvironment = (): boolean => {
  const required = [
    'GNEWS_API_KEY',
    'OPENAI_API_KEY', 
    'GMAIL_ADDRESS',
    'GMAIL_APP_PASS',
    'SUBSCRIBERS_LIST'
  ];
  
  const optional = [
    'UNSPLASH_API_KEY',
    'GNEWS_CATEGORY',
    'GNEWS_COUNTRY',
    'GNEWS_NUM_ARTICLES'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  const missingOptional = optional.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error("[ERROR] Missing required environment variables:");
    missing.forEach(key => console.error(`   - ${key}`));
    return false;
  }
  
  if (missingOptional.length > 0) {
    console.warn("[WARN] Missing optional environment variables (features will be disabled):");
    missingOptional.forEach(key => console.warn(`   - ${key}`));
  }
  
  console.log("[SUCCESS] All required environment variables are set");
  return true;
};

/**
 * Check command line arguments for preview mode
 */
const isPreviewMode = process.argv.includes('--preview');
const isEditablePreview = process.argv.includes('--editable');

/**
 * Main newsletter generation and distribution process
 */
const runNewsletterProcess = async (): Promise<void> => {
  const startTime = new Date();
  console.log(`[INFO] Starting newsletter generation process at ${startTime.toISOString()}`);
  
  try {
    // Step 1: Validate environment variables
    console.log("[INFO] Validating environment configuration...");
    if (!validateEnvironment()) {
      process.exit(1);
    }
    
    // Step 2: Validate email configuration
    console.log("[INFO] Validating email configuration...");
    const emailValid = await emailSender.validateEmailConfiguration();
    if (!emailValid) {
      console.error("[ERROR] Email configuration is invalid. Please check your Gmail credentials.");
      process.exit(1);
    }
    
    // Step 3: Fetch articles with content
    console.log("[INFO] Fetching latest articles...");
    // const articles = await articleFetcher(); // TODO: Uncomment this when testing is done
    const articles = articleFetcher;
    
    if (!articles || articles.length === 0) {
      console.warn("[WARN] No articles found. Skipping newsletter generation.");
      process.exit(0);
    }
    
    console.log(`[SUCCESS] Successfully fetched ${articles.length} articles with content`);
    
    // Handle preview mode
    if (isPreviewMode) {
      console.log("[INFO] Running in preview mode - generating HTML preview...");
      
      if (isEditablePreview) {
        const previewPath = await newsletterPreview.generateEditablePreview(articles);
        console.log(`[SUCCESS] Editable preview generated: ${previewPath}`);
        console.log(`[INFO] Open in browser: file://${process.cwd()}/${previewPath}`);
      } else {
        const previewPath = await newsletterPreview.generateLivePreview(articles);
        console.log(`[SUCCESS] Preview generated: ${previewPath}`);
        console.log(`[INFO] Open in browser: file://${process.cwd()}/${previewPath}`);
      }
      
      console.log("[INFO] Preview mode complete - no emails sent");
      process.exit(0);
    }
    
    // Step 4: Generate newsletter content
    console.log("[INFO] Generating newsletter content...");
    const newsletterContent = await contentProcessor.generateNewsletter(articles);
    
    if (!newsletterContent || newsletterContent.trim().length === 0) {
      throw new Error("Newsletter content generation failed or returned empty content");
    }
    
    console.log("[SUCCESS] Newsletter content generated successfully");
    
    // Step 5: Send newsletter to subscribers
    console.log("[INFO] Sending newsletter to subscribers...");
    await emailSender.sendNewsletter(newsletterContent);
    console.log("[SUCCESS] Newsletter sent successfully!");
    
    // Step 6: Log completion statistics
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    console.log(`[SUCCESS] Newsletter process completed successfully in ${duration}ms!`);
    
    process.exit(0);
    
  } catch (error) {
    console.error("[ERROR] Error in newsletter process:", error);
    
    // Log additional context for debugging
    console.error("       Process details:");
    console.error("       - Node version:", process.version);
    console.error("       - Platform:", process.platform);
    console.error("       - Working directory:", process.cwd());
    console.error("       - Timestamp:", new Date().toISOString());
    
    process.exit(1);
  }
};

// Handle uncaught exceptions and rejections for cron reliability
process.on('uncaughtException', (error) => {
  console.error('[ERROR] Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[ERROR] Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the main newsletter process
runNewsletterProcess(); 