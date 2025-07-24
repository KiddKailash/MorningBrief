import { Article } from "../types/index.js";
import { gnewsService } from "../services/gnewsService.js";
import { scrapeArticle } from "../services/scrapeArticle.js";

const ArticleFetcher = async () => {
  console.log("[INFO] Starting article fetching process...");

  try {
    // Step 1: Fetch articles from GNews API
    const articles = await gnewsService.fetchArticles();

    if (!articles || articles.length === 0) {
      console.warn("[WARN] No articles found from GNews API");
      return [];
    }

    console.log(`📰 Found ${articles.length} articles from API`);
    console.log("🔍 Starting content scraping process...");

    // Step 2: Scrape content for each article with graceful error handling
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

      // Scrape the full content using the scrapeArticle service
      const scrapedContent = await scrapeArticle(article.url, article.title);

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
    console.log("Fetched Articles", JSON.stringify(articlesWithContent, null, 2));
    return articlesWithContent;
  } catch (error) {
    console.error("[ERROR] Error in article fetching process:", error);
    throw error;
  }
};

ArticleFetcher();

export default ArticleFetcher;
