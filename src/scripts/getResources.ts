/**
 * Script to fetch top articles from the GNews API and scrape their content.
 * Run this file directly to retrieve and display top news articles with full content.
 */

import dotenv from "dotenv";
import * as cheerio from "cheerio";

// Load environment variables from .env file
dotenv.config();

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    id: string;
    name: string;
    url: string;
  };
}

interface GNewsResponse {
  totalArticles: number;
  articles: Article[];
}

/**
 * Scrapes the full article content from a given URL
 * @param url - The article URL to scrape
 * @param title - The article title for logging
 * @returns Promise<string> - The scraped content or empty string if failed
 */
const scrapeArticleContent = async (
  url: string,
  title: string
): Promise<string> => {
  try {
    console.log(`  🔍 Scraping content from: ${url.substring(0, 60)}...`);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      console.log(`  ⚠️  HTTP ${response.status} for: ${title}`);
      return "";
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $(
      "script, style, nav, header, footer, aside, .advertisement, .ads, .social-share"
    ).remove();

    // Try different content selectors commonly used by news sites
    let content = "";
    const contentSelectors = [
      "article",
      '[data-module="ArticleBody"]',
      ".article-content",
      ".post-content",
      ".entry-content",
      ".article-body",
      ".story-body",
      ".content",
      "main",
      ".post-body",
    ];

    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text().trim();
        if (content.length > 200) {
          // Ensure we got substantial content
          break;
        }
      }
    }

    // Fallback to paragraphs if no content found with selectors
    if (!content || content.length < 200) {
      const paragraphs = $("p")
        .map((_, el) => $(el).text().trim())
        .get();
      content = paragraphs.join(" ");
    }

    // Clean up the content
    content = content
      .replace(/\s+/g, " ") // Replace multiple whitespace with single space
      .replace(/\n+/g, " ") // Replace newlines with space
      .trim();

    if (content.length > 100) {
      console.log(`  ✅ Successfully scraped ${content.length} characters`);
      return content;
    } else {
      console.log(
        `  ⚠️  Content too short (${content.length} chars) for: ${title}`
      );
      return "";
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(`  ❌ Failed to scrape "${title}": ${error.message}`);
    } else {
      console.log(`  ❌ Failed to scrape "${title}": Unknown error`);
    }
    return "";
  }
};

export const getArticles = async (): Promise<Article[]> => {
  const apikey = process.env["GNEWS_API_KEY"] as string;
  const category = process.env["GNEWS_CATEGORY"] as string;

  // Debug environment variables
  console.log("Environment check:");
  console.log(
    "- API Key present:",
    apikey ? `Yes (${apikey.substring(0, 8)}...)` : "No"
  );
  console.log(
    "- Category:",
    category || "Not set (will use 'general' as default)"
  );

  if (!apikey) {
    throw new Error(
      "GNEWS_API_KEY environment variable is not set. Please set it before running the script."
    );
  }

  const url: string = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&country=us&max=10&apikey=${apikey}`;
  console.log("Request URL:", url.replace(apikey, "***API_KEY***")); // Hide API key in logs

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as GNewsResponse;
    const articles: Article[] = data.articles ?? [];

    console.log(`📰 Found ${articles.length} articles from API`);
    console.log("🔍 Starting content scraping process...");

    // Scrape content for each article with graceful error handling
    const articlesWithContent: Article[] = [];

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      if (!article) {
        console.log(`\n⚠️  Article ${i + 1} is undefined, skipping...`);
        continue;
      }

      console.log(
        `\n📄 Processing article ${i + 1}/${articles.length}: ${article.title}`
      );

      // Scrape the full content
      const scrapedContent = await scrapeArticleContent(
        article.url,
        article.title
      );

      if (scrapedContent && scrapedContent.length > 100) {
        // Article content was successfully scraped
        const articleWithContent: Article = {
          id: article.id,
          title: article.title,
          description: article.description,
          content: scrapedContent,
          url: article.url,
          image: article.image,
          publishedAt: article.publishedAt,
          source: article.source,
        };
        articlesWithContent.push(articleWithContent);
        console.log(`  ✅ Article added to final list`);
      } else {
        console.log(`  ⏭️  Article skipped due to insufficient content`);
      }

      // Add a small delay between requests to be respectful to servers
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log(
      `\n🎉 Successfully processed ${articlesWithContent.length}/${articles.length} articles with content`
    );

    // Log final articles summary
    if (articlesWithContent.length > 0) {
      console.log("\n📋 Final article list:");
      articlesWithContent.forEach((article, index) => {
        console.log(
          `${index + 1}. ${article.title} (${article.content.length} chars)`
        );
      });
    } else {
      console.warn("⚠️  No articles with content were successfully processed!");
    }

    return articlesWithContent;
  } catch (error) {
    console.error("Error fetching articles:", error);
    throw error; // Re-throw to allow caller to handle
  }
};

// Only run directly if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  getArticles()
    .then((articles) => {
      console.log(
        `\n🎉 Successfully fetched ${articles.length} articles with content`
      );
      if (articles.length > 0 && articles[0]) {
        console.log("\nFirst article content preview:");
        console.log("=".repeat(50));
        console.log(articles[0].content.substring(0, 300) + "...");
        console.log("=".repeat(50));
      }
    })
    .catch((error) => {
      console.error("Failed to fetch articles:", error);
      process.exit(1);
    });
}
