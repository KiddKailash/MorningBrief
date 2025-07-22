// This file orchestrates sub-actions to retrieve, summarise and send a newsletter
// Designed to run via cron for daily newsletter automation

import { getArticles } from "./scripts/getResources";
import { summariseArticles } from "./scripts/summariseArticles";
import { sendNewsletter } from "./scripts/sendNewsletter";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const validateEnvironment = (): boolean => {
  const required = [
    'GNEWS_API_KEY',
    'OPENAI_API_KEY', 
    'GMAIL_ADDRESS',
    'GMAIL_APP_PASS',
    'SUBSCRIBERS_EMAIL'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach(key => console.error(`   - ${key}`));
    return false;
  }
  
  console.log("✅ All required environment variables are set");
  return true;
};

const main = async () => {
  const startTime = new Date();
  console.log(`🚀 Starting newsletter generation process at ${startTime.toISOString()}`);
  
  try {
    // Validate environment variables
    if (!validateEnvironment()) {
      process.exit(1);
    }
    
    // Step 1: Get articles
    console.log("📰 Fetching latest articles...");
    const articles = await getArticles();
    
    if (!articles || articles.length === 0) {
      console.warn("⚠️ No articles found. Skipping newsletter generation.");
      process.exit(0);
    }
    
    console.log(`✅ Successfully fetched ${articles.length} articles`);
    
    // Step 2: Generate newsletter
    console.log("✍️  Generating newsletter content...");
    const summary = await summariseArticles(articles);
    
    if (!summary || summary.trim().length === 0) {
      throw new Error("Newsletter content generation failed or returned empty content");
    }
    
    console.log("✅ Newsletter content generated successfully");
    
    // Step 3: Send newsletter
    console.log("📧 Sending newsletter to subscribers...");
    await sendNewsletter(summary);
    console.log("✅ Newsletter sent successfully!");
    
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    console.log(`🎉 Newsletter process completed successfully in ${duration}ms!`);
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Error in newsletter process:", error);
    
    // Log additional context for debugging
    console.error("Process details:");
    console.error("- Node version:", process.version);
    console.error("- Platform:", process.platform);
    console.error("- Working directory:", process.cwd());
    console.error("- Timestamp:", new Date().toISOString());
    
    process.exit(1);
  }
};

// Handle uncaught exceptions and rejections for cron reliability
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the main function
main();
