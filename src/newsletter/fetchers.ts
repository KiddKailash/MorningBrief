/**
 * Data Fetchers
 *
 * All data fetching logic in one place
 * Handles articles, market data, and any other external data
 */

import { Article, MarketIndicator } from "../types";
import { gnews } from "../integrations/gnews";
import { scraper } from "../integrations/scraper";
import { aggregateAllMarketData } from '../integrations/marketData';

/**
 * Fetch and enrich news articles
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
          return { ...article, content };
        } catch (error) {
          console.warn(`Failed to scrape ${article.url}:`, error);
          return article; // Return without content if scraping fails
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
 * Fetch market data from various sources
 */
export async function fetchMarketData(): Promise<{
  indicators: MarketIndicator[];
  spotlightStock: any;
}> {
  console.log("📊 Fetching market data...");

  try {
    // Use the real market data service
    const marketData = await aggregateAllMarketData();

    // Transform major indicators to our format
    const indicators: MarketIndicator[] = marketData.majorIndicators.map(
      (indicator: any) => ({
        name: indicator.name,
        symbol: indicator.name,
        value: indicator.price,
        changePercent: indicator.changePercent,
      })
    );

    // Add the spotlight stock to the indicators list
    if (marketData.spotlightStock?.spotlightStock) {
      const spotlight = marketData.spotlightStock.spotlightStock;
      indicators.push({
        name: `${spotlight.name} (Spotlight)`,
        symbol: spotlight.name,
        value: spotlight.price,
        changePercent: spotlight.changesPercentage,
      });
    }

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
 * Fetch all data needed for newsletter
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
