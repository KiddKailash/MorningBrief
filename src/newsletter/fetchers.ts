/**
 * Data Fetchers
 * 
 * All data fetching logic in one place
 * Handles articles, market data, and any other external data
 */

import { Article, MarketIndicator } from '../types';
import { gnews } from '../integrations/gnews';
import { scraper } from '../integrations/scraper';

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
    
    // Filter out articles without sufficient content
    return enrichedArticles.filter(article => 
      article.content && article.content.length > 100
    );
    
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

/**
 * Fetch market data from various sources
 */
export async function fetchMarketData(): Promise<MarketIndicator[]> {
  console.log("📊 Fetching market data...");
  
  try {
    // For now, return mock data with realistic values
    // TODO: Integrate with real market data API
    const baseData = [
      { name: "S&P 500", symbol: "SPX", baseValue: 4500, volatility: 1.5 },
      { name: "Dow Jones", symbol: "DJI", baseValue: 35000, volatility: 1.2 },
      { name: "NASDAQ", symbol: "IXIC", baseValue: 14000, volatility: 2.0 },
      { name: "Gold", symbol: "GLD", baseValue: 1950, volatility: 0.8 },
      { name: "Bitcoin", symbol: "BTC", baseValue: 45000, volatility: 5.0 },
      { name: "Crude Oil (WTI)", symbol: "CL", baseValue: 75, volatility: 2.5 },
      { name: "10-Year Treasury Yield", symbol: "TNX", baseValue: 4.25, volatility: 0.5 }
    ];
    
    // Generate realistic daily changes
    const mockData: MarketIndicator[] = baseData.map(item => {
      const changePercent = (Math.random() - 0.5) * 2 * item.volatility;
      const value = item.baseValue * (1 + changePercent / 100);
      
      return {
        name: item.name,
        symbol: item.symbol,
        value: parseFloat(value.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2))
      };
    });
    
    return mockData;
    
  } catch (error) {
    console.error("Error fetching market data:", error);
    return [];
  }
}

/**
 * Fetch all data needed for newsletter
 */
export async function fetchAllNewsletterData() {
  console.log("🚀 Fetching all newsletter data...");
  
  const [articles, marketData] = await Promise.all([
    fetchArticles(),
    fetchMarketData()
  ]);
  
  return {
    articles,
    marketData,
    fetchedAt: new Date()
  };
}