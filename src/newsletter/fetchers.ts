/**
 * Data Fetchers
 *
 * All data fetching logic in one place
 * Handles articles, market data, and any other external data
 */

import { Article, MarketIndicator, CategorizedArticles } from "../types";
import { gnews } from "../integrations/gnews";
import { scraper } from "../integrations/scraper";
import { aggregateAllMarketData } from '../integrations/marketData';

/**
 * Fetch and enrich news articles (legacy method for backwards compatibility)
 */
export async function fetchArticles(): Promise<Article[]> {
  console.log("📰 Fetching articles...");

  try {
    // Get articles from GNews
    const articles = await gnews.fetchLatestArticles();

    if (!articles?.length) {
      console.warn("No articles found from news API");
      return [];
    }

    console.log(`Found ${articles.length} articles, enriching with content...`);

    // Enrich articles with scraped content
    const enrichedArticles = await Promise.all(
      articles.map(async (article) => {
        try {
          const content = await scraper.scrapeArticleContent(article.url);
          if (content && content.length > 50) {
            return { ...article, content };
          } else {
            console.warn(`Insufficient content scraped from ${article.url}, using description as fallback`);
            return { ...article, content: article.description || "" };
          }
        } catch (error) {
          console.warn(`Failed to scrape ${article.url}:`, error);
          // Use description as fallback content
          return { ...article, content: article.description || "" };
        }
      })
    );

    console.log(
      "Articles:",
      enrichedArticles.filter(
        (article) => article.content && article.content.length > 100
      )
    );
    // Filter out articles without sufficient content
    return enrichedArticles.filter(
      (article) => article.content && article.content.length > 100
    );
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

/**
 * Fetch categorized articles for themed newsletter sections
 */
export async function fetchCategorizedArticles(): Promise<CategorizedArticles> {
  console.log("📰 Fetching categorized articles...");

  try {
    // Get categorized articles from GNews
    const categorizedArticles = await gnews.fetchCategorizedArticles();

    // Enrich articles with scraped content for each category
    const enrichedCategorizedArticles: CategorizedArticles = {
      general: [],
      business: [],
      world: [],
      technology: [],
      entertainment: [],
      science: [],
      health: []
    };

    // Process each category
    for (const [category, articles] of Object.entries(categorizedArticles)) {
      if (articles.length === 0) {
        console.warn(`No articles found for category: ${category}`);
        continue;
      }

      console.log(`Enriching ${articles.length} ${category} articles with content...`);

      // Enrich articles in this category with scraped content
      const enrichedArticles = await Promise.all(
        articles.map(async (article: any) => {
          try {
            const content = await scraper.scrapeArticleContent(article.url);
            if (content && content.length > 50) {
              return { ...article, content };
            } else {
              console.warn(`Insufficient content scraped from ${article.url}, using description as fallback`);
              return { ...article, content: article.description || "" };
            }
          } catch (error) {
            console.warn(`Failed to scrape ${article.url}:`, error);
            // Use description as fallback content
            return { ...article, content: article.description || "" };
          }
        })
      );

      // Filter out articles without sufficient content
      enrichedCategorizedArticles[category as keyof CategorizedArticles] = enrichedArticles.filter(
        (article) => article.content && article.content.length > 100
      );
    }

    console.log("Categorized articles enriched:", Object.keys(enrichedCategorizedArticles).map(cat => 
      `${cat}: ${enrichedCategorizedArticles[cat as keyof CategorizedArticles].length} articles`
    ).join(', '));

    return enrichedCategorizedArticles;
  } catch (error) {
    console.error("Error fetching categorized articles:", error);
    // Return empty structure on error
    return {
      general: [],
      business: [],
      world: [],
      technology: [],
      entertainment: [],
      science: [],
      health: []
    };
  }
}

/**
 * Fetch market data from various sources
 */
export async function fetchMarketData(): Promise<{
  indicators: MarketIndicator[];
  spotlightStock: any;
}> {
  console.log("📊 Fetching market data...");

  try {
    // Use the market data service
    const marketData = await aggregateAllMarketData();

    // Transform major indicators to our format
    const indicators: MarketIndicator[] = marketData.majorIndicators.map(
      (indicator: any) => ({
        name: indicator.name,
        symbol: indicator.name,
        value: indicator.price,
        changePercent: indicator.changePercent.toFixed(2), // Go to 2 decimal places
      })
    );

    return {
      indicators,
      spotlightStock: marketData.spotlightStock,
    };
  } catch (error) {
    console.error("Error fetching market data:", error);
    // Return mock data as fallback
    const mockIndicators: MarketIndicator[] = [
      { name: "S&P 500", symbol: "SPX", value: 4500, changePercent: 0.5 },
      { name: "Dow Jones", symbol: "DJI", value: 35000, changePercent: 0.3 },
      { name: "NASDAQ", symbol: "IXIC", value: 14000, changePercent: 0.8 },
    ];
    return { indicators: mockIndicators, spotlightStock: null };
  }
}

/**
 * Fetch all data needed for newsletter (legacy - uses single category)
 */
export async function fetchAllNewsletterData() {
  console.log("🚀 Fetching all newsletter data...");

  const [articles, marketDataResult] = await Promise.all([
    fetchArticles(),
    fetchMarketData(),
  ]);

  return {
    articles,
    marketData: marketDataResult.indicators,
    spotlightStock: marketDataResult.spotlightStock,
    fetchedAt: new Date(),
  };
}

/**
 * Fetch all categorized data needed for the new newsletter structure
 */
export async function fetchAllCategorizedNewsletterData() {
  console.log("🚀 Fetching all categorized newsletter data...");

  const [categorizedArticles, marketDataResult] = await Promise.all([
    fetchCategorizedArticles(),
    fetchMarketData(),
  ]);

  return {
    articles: categorizedArticles,
    marketData: marketDataResult.indicators,
    spotlightStock: marketDataResult.spotlightStock,
    fetchedAt: new Date(),
  };
}
