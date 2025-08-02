/**
 * @fileoverview Market Data Service
 *
 * This service retrieves market data including:
 *  - Select a large cap, large 1d % move stock, and retrieve articles on this spotlighted security.
 *  - Financial market indicators (Treasury yields, Bitcoin, major indexes)
 *
 * The service integrates with multiple APIs:
 *  - Financial Modeling Prep (FMP) for market data
 *  - Polygon.io for news articles
 *
 */

import dotenv from "dotenv";
import { scraper } from "./scraper";

// Type definitions for Alpha Vantage market data
interface MarketDataPoint {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

/**
 * Fetches crude oil data using Alpha Vantage WTI API
 * @private
 */
const getAlphaVantageOil = async (): Promise<MarketDataPoint | null> => {
  try {
    const apiKey = process.env["ALPHA_VANTAGE_API_KEY"] as string;
    const url = `https://www.alphavantage.co/query?function=WTI&interval=daily&apikey=${apiKey}`;

    const response = await fetch(url);
    const data = (await response.json()) as any;

    if (data["Error Message"] || data["Note"]) {
      throw new Error(data["Error Message"] || data["Note"]);
    }

    const timeSeries = data["data"];
    if (!timeSeries || timeSeries.length < 2) {
      throw new Error("Insufficient oil price data");
    }

    const latest = timeSeries[0];
    const previous = timeSeries[1];

    const latestPrice = parseFloat(latest.value);
    const previousPrice = parseFloat(previous.value);

    const change = latestPrice - previousPrice;
    const changePercent = (change / previousPrice) * 100;

    return {
      symbol: "CL=F",
      name: "Crude Oil (WTI)",
      price: Number(latestPrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
    };
  } catch (error) {
    console.error("Error fetching oil data from Alpha Vantage:", error);
    return null;
  }
};

/**
 * Fetches 10-year Treasury yield using Alpha Vantage TREASURY_YIELD API
 * @private
 */
const getAlphaVantageTreasury = async (): Promise<MarketDataPoint | null> => {
  try {
    const apiKey = process.env["ALPHA_VANTAGE_API_KEY"] as string;
    const url = `https://www.alphavantage.co/query?function=TREASURY_YIELD&interval=daily&maturity=10year&apikey=${apiKey}`;

    const response = await fetch(url);
    const data = (await response.json()) as any;

    if (data["Error Message"] || data["Note"]) {
      throw new Error(data["Error Message"] || data["Note"]);
    }

    const timeSeries = data["data"];
    if (!timeSeries || timeSeries.length < 2) {
      throw new Error("Insufficient treasury yield data");
    }

    const latest = timeSeries[0];
    const previous = timeSeries[1];

    const latestYield = parseFloat(latest.value);
    const previousYield = parseFloat(previous.value);

    const change = latestYield - previousYield;
    const changePercent = (change / previousYield) * 100;

    return {
      symbol: "^TNX",
      name: "10-Year Treasury Yield",
      price: Number(latestYield.toFixed(3)),
      change: Number(change.toFixed(3)),
      changePercent: Number(changePercent.toFixed(2)),
    };
  } catch (error) {
    console.error("Error fetching treasury yield from Alpha Vantage:", error);
    return null;
  }
};

/**
 * Fetches stock/ETF data using Alpha Vantage TIME_SERIES_DAILY API
 * @private
 */
const getAlphaVantageStock = async (
  symbol: string,
  name: string
): Promise<MarketDataPoint | null> => {
  try {
    const apiKey = process.env["ALPHA_VANTAGE_API_KEY"] as string;
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;

    const response = await fetch(url);
    const data = (await response.json()) as any;

    if (data["Error Message"] || data["Note"]) {
      throw new Error(data["Error Message"] || data["Note"]);
    }

    const timeSeries = data["Time Series (Daily)"];
    if (!timeSeries) {
      throw new Error("No time series data found");
    }

    const dates = Object.keys(timeSeries).sort().reverse();
    const latestDate = dates[0];
    const previousDate = dates[1];

    if (!latestDate || !previousDate) {
      throw new Error("Insufficient data for calculation");
    }

    const latestPrice = parseFloat(timeSeries[latestDate]["4. close"]);
    const previousPrice = parseFloat(timeSeries[previousDate]["4. close"]);

    const change = latestPrice - previousPrice;
    const changePercent = (change / previousPrice) * 100;

    return {
      symbol: symbol,
      name: name,
      price: Number(latestPrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
    };
  } catch (error) {
    console.error(`Error fetching ${symbol} data from Alpha Vantage:`, error);
    return null;
  }
};

// Load environment variables from .env file
dotenv.config();

// ~ TYPE DEFINITIONS

/** Polygon API article structure */
interface PolygonArticle {
  id: string;
  publisher: {
    name: string;
    homepage_url: string;
    logo_url: string;
    favicon_url: string;
  };
  title: string;
  author: string;
  published_utc: string;
  article_url: string;
  tickers: string[];
  amp_url: string;
  image_url: string;
  description: string;
  keywords: string[];
}

/** Polygon API article with scraped content */
interface PolygonArticleWithContent extends PolygonArticle {
  content: string;
}

/** Polygon API response structure */
interface PolygonNewsResponse {
  results: PolygonArticle[];
  status: string;
  request_id: string;
  count: number;
  next_url?: string;
}

/** Polygon API response with scraped content */
interface PolygonNewsResponseWithContent {
  results: PolygonArticleWithContent[];
  status: string;
  request_id: string;
  count: number;
  next_url?: string;
}

// ~ PRIVATE HELPER FUNCTIONS

/**
 * Fetches shares outstanding data for a specific stock symbol
 * @private
 * @param {string} stock - The stock symbol (e.g., 'AAPL', 'GOOGL')
 * @returns {Promise<any>} Shares float data including outstanding shares
 */
const getStockSharesOutstanding = async (stock: string) => {
  const apiKey = process.env["FMP_API_KEY"] as string;
  const url = `https://financialmodelingprep.com/stable/shares-float?symbol=${stock}&apikey=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

/**
 * Analyzes stock market movements and selects the most newsworthy stock
 * using a weighted algorithm that balances:
 * - Magnitude of price change (60% weight)
 * - Market capitalization size (40% weight)
 *
 * @private
 * @returns {Promise<Object>} Object containing spotlight stock and analysis data
 */
const stockSpotlight = async () => {
  const apiKey = process.env["FMP_API_KEY"] as string;

  // Fetch biggest gainers (top 50 to ensure we get at least 10 good ones)
  const biggestGainerRes = await fetch(
    `https://financialmodelingprep.com/stable/biggest-gainers?apikey=${apiKey}`
  );
  const biggestGainerData = await biggestGainerRes.json();

  // Fetch biggest losers (top 50 to ensure we get at least 10 good ones)
  const biggestLoserRes = await fetch(
    `https://financialmodelingprep.com/stable/biggest-losers?apikey=${apiKey}`
  );
  const biggestLoserData = await biggestLoserRes.json();

  // Take top movers from each list to focus on most significant moves
  const topGainers = (
    Array.isArray(biggestGainerData) ? biggestGainerData : []
  ).slice(0, 6);
  const topLosers = (
    Array.isArray(biggestLoserData) ? biggestLoserData : []
  ).slice(0, 6);

  // Combine and sort by absolute percentage change (highest moves first)
  const allMovers = [...topGainers, ...topLosers].sort((a, b) => {
    const absChangeA = Math.abs(a.changesPercentage || 0);
    const absChangeB = Math.abs(b.changesPercentage || 0);
    return absChangeB - absChangeA; // Descending order
  });

  // console.log(
  //   `Processing ${allMovers.length} stocks for market cap analysis...`
  // );

  // Enrich each stock with market cap data calculated from outstanding shares * price
  const stocksWithMarketCap = [];
  for (let i = 0; i < allMovers.length; i++) {
    const stock = allMovers[i];
    if (!stock || typeof stock.changesPercentage !== "number") continue;

    try {
      // console.log(`Fetching shares outstanding for ${stock.symbol}...`);
      const sharesData = await getStockSharesOutstanding(stock.symbol);
      const outstandingShares =
        Array.isArray(sharesData) && sharesData[0]
          ? sharesData[0].outstandingShares
          : 0;

      // Calculate market cap = outstanding shares * current price
      const marketCap =
        outstandingShares && stock.price ? outstandingShares * stock.price : 0;

      stocksWithMarketCap.push({
        ...stock,
        marketCap,
        outstandingShares,
        absChange: Math.abs(stock.changesPercentage),
      });

      // Add delay to avoid rate limiting (200ms between requests)
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error) {
      // console.log(
      //   `Failed to fetch shares outstanding for ${stock.symbol}:`,
      //   error
      // );
      // Still add the stock but with 0 market cap (will be filtered out)
      stocksWithMarketCap.push({
        ...stock,
        marketCap: 0,
        outstandingShares: 0,
        absChange: Math.abs(stock.changesPercentage),
      });
    }
  }

  // Filter out stocks with no market cap data (small/problematic companies)
  const validStocks = stocksWithMarketCap.filter(
    (stock) => stock.marketCap > 0
  );

  if (validStocks.length === 0) {
    // console.log("No stocks with valid market cap data found");
    return {
      biggestGainerData,
      biggestLoserData,
      biggestMover: null,
      spotlightStock: null,
    };
  }

  // Calculate normalized scores for weighted analysis
  const maxAbsChange = Math.max(...validStocks.map((s) => s.absChange));
  const minAbsChange = Math.min(...validStocks.map((s) => s.absChange));
  const maxMarketCap = Math.max(...validStocks.map((s) => s.marketCap));
  const minMarketCap = Math.min(...validStocks.map((s) => s.marketCap));

  // Calculate weighted scores (60% movement + 40% size)
  // This balances newsworthiness (big moves) with significance (large companies)
  const scoredStocks = validStocks.map((stock) => {
    // Normalize change score (0-1 scale)
    const changeScore =
      maxAbsChange > minAbsChange
        ? (stock.absChange - minAbsChange) / (maxAbsChange - minAbsChange)
        : 1;

    // Normalize market cap score (0-1 scale)
    const marketCapScore =
      maxMarketCap > minMarketCap
        ? (stock.marketCap - minMarketCap) / (maxMarketCap - minMarketCap)
        : 1;

    // Combined weighted score: 60% movement + 40% size
    const combinedScore = changeScore * 0.6 + marketCapScore * 0.4;

    return {
      ...stock,
      changeScore,
      marketCapScore,
      combinedScore,
    };
  });

  // Sort by combined score (highest first) to find the best spotlight candidate
  scoredStocks.sort((a, b) => b.combinedScore - a.combinedScore);

  // Find the original biggest mover (by absolute change only) for comparison
  const biggestMover = allMovers[0] || null;
  const topThreeCandidates = scoredStocks.slice(0, 3);

  // Display analysis results
  // console.log("\n=== STOCK SPOTLIGHT ANALYSIS ===");
  // console.log("Top 3 candidates by combined score:");
  // topThreeCandidates.forEach((stock, idx) => {
  //   console.log(`${idx + 1}. ${stock.symbol} (${stock.name})`);
  //   console.log(
  //     `   Change: ${stock.changesPercentage}% (Score: ${stock.changeScore.toFixed(3)})`
  //   );
  //   console.log(
  //     `   Market Cap: $${(stock.marketCap / 1e6).toFixed(1)}M (Score: ${stock.marketCapScore.toFixed(3)})`
  //   );
  //   console.log(`   Combined Score: ${stock.combinedScore.toFixed(3)}\n`);
  // });

  // console.log(`Biggest Mover: ${biggestMover.symbol} (${biggestMover.name})`);
  // console.log(`Change: ${biggestMover.changesPercentage}%`);
  // console.log(`Market Cap: $${(biggestMover.marketCap / 1e6).toFixed(1)}M`);

  return {
    biggestMover: biggestMover,
    topThreeCandidates: topThreeCandidates,
  };
};

/**
 * Fetches recent news articles for a specific stock and scrapes their content
 * @private
 * @param {string} stock - The stock symbol to fetch articles for
 * @returns {Promise<PolygonNewsResponseWithContent>} Articles with scraped content
 */
const getArticlesOnStock = async (
  stock: string
): Promise<PolygonNewsResponseWithContent> => {
  const maxArticles = 5; // Maximum number of articles to be fetched from Polygon API
  const apiKey = process.env["POLYGON_API_KEY"] as string;
  const url = `https://api.polygon.io/v2/reference/news?ticker=${stock}&order=desc&limit=${maxArticles}&sort=published_utc&apiKey=${apiKey}`;
  const response = await fetch(url);
  const data = (await response.json()) as PolygonNewsResponse;

  // Calculate cutoff date (2 months ago) to filter for recent, relevant articles
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2); // 2 months ago

  // Check if we have articles to process
  if (data.results && Array.isArray(data.results)) {
    // Filter articles to only include those from the last 2 months
    const recentArticles = data.results.filter((article) => {
      if (!article?.published_utc) return false;
      const articleDate = new Date(article.published_utc);
      return articleDate >= twoMonthsAgo;
    });

    // console.log(
    //   `Filtered to ${recentArticles.length} articles from the last 2 months`
    // );

    // Scrape content for each recent article
    const articlesWithContent: PolygonArticleWithContent[] = [];

    for (let i = 0; i < recentArticles.length; i++) {
      const article = recentArticles[i];

      // Skip if article is undefined (safety check)
      if (!article) {
        continue;
      }

      // Scrape the full content from the article URL using our scraping service
      const scrapedContent = await scraper.scrapeArticleContent(
        article.article_url
      );

      // Build article object with only the essential fields
      const articleWithContent: PolygonArticleWithContent = {
        article_url: article.article_url,
        content: scrapedContent || "", // Scraped full article content
        publisher: article.publisher,
        title: article.title,
        author: article.author,
        tickers: article.tickers,
        image_url: article.image_url,
        // Required fields for interface compliance
        id: article.id,
        published_utc: article.published_utc,
        amp_url: article.amp_url,
        description: article.description,
        keywords: article.keywords,
      };

      articlesWithContent.push(articleWithContent);

      // Add a small delay between requests to be respectful to servers
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Return the modified data with scraped content
    return {
      ...data,
      results: articlesWithContent,
    };
  }

  // Return empty results if no articles found
  return {
    ...data,
    results: [],
  };
};

/**
 * Retrieves major stock market indexes using Alpha Vantage APIs
 * @returns {Promise<MarketDataPoint[]>} Major market indexes data with price and percentage changes
 */
const getMajorIndicators = async (): Promise<MarketDataPoint[]> => {
  const indicators: MarketDataPoint[] = [];

  try {
    // Fetch major stock indices using TIME_SERIES_DAILY
    const stockPromises = [
      getAlphaVantageStock("SPY", "S&P 500"), // S&P 500 ETF
      getAlphaVantageStock("DIA", "Dow Jones"), // Dow Jones ETF
      getAlphaVantageStock("QQQ", "NASDAQ"), // NASDAQ ETF
      getAlphaVantageStock("GLD", "Gold"), // Gold ETF
    ];

    // Fetch other indicators
    const otherPromises = [
      getBitcoinMove(),
      getAlphaVantageOil(),
      getAlphaVantageTreasury(),
    ];

    // Execute all API calls in parallel
    const [stockResults, ...otherResults] = await Promise.all([
      Promise.all(stockPromises),
      ...otherPromises,
    ]);

    // Add successful stock results
    stockResults.forEach((result) => {
      if (result) indicators.push(result);
    });

    // Add other successful results
    otherResults.forEach((result) => {
      if (result) indicators.push(result);
    });

    // console.log("Major Indicators Retrieved:", indicators);
    return indicators;
  } catch (error) {
    console.error("Error fetching major indicators:", error);
    return indicators; // Return whatever we managed to fetch
  }
};

/**
 * Fetches current Bitcoin price and movement data using Alpha Vantage DIGITAL_CURRENCY_DAILY API
 * @returns {Promise<MarketDataPoint | null>} Bitcoin market data with price and percentage change
 */
const getBitcoinMove = async (): Promise<MarketDataPoint | null> => {
  try {
    const apiKey = process.env["ALPHA_VANTAGE_API_KEY"] as string;
    const url = `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=BTC&market=USD&apikey=${apiKey}`;

    const response = await fetch(url);
    const data = (await response.json()) as any;

    if (data["Error Message"] || data["Note"] || data["Information"]) {
      throw new Error(
        data["Error Message"] || data["Note"] || data["Information"]
      );
    }

    const timeSeries = data["Time Series (Digital Currency Daily)"];
    if (!timeSeries) {
      throw new Error("No time series data found for Bitcoin");
    }

    const dates = Object.keys(timeSeries).sort().reverse();
    const latestDate = dates[0];
    const previousDate = dates[1];

    if (!latestDate || !previousDate) {
      throw new Error("Insufficient Bitcoin data for calculation");
    }

    const latestPrice = parseFloat(timeSeries[latestDate]["4. close"]);
    const previousPrice = parseFloat(timeSeries[previousDate]["4. close"]);

    const change = latestPrice - previousPrice;
    const changePercent = (change / previousPrice) * 100;

    const bitcoinData: MarketDataPoint = {
      symbol: "BTC-USD",
      name: "Bitcoin",
      price: Number(latestPrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
    };

    // console.log("₿ Bitcoin Data Retrieved:", bitcoinData);
    return bitcoinData;
  } catch (error) {
    console.error("Error fetching Bitcoin data from Alpha Vantage:", error);
    return null;
  }
};

/**
 * Gets articles and data for the most newsworthy stock of the day
 *
 * Uses a sophisticated algorithm to select a stock that balances:
 * - Large price movements (60% weight) - for newsworthiness
 * - Significant market capitalization (40% weight) - for relevance
 *
 * This ensures we spotlight major companies with meaningful moves rather than
 * penny stocks with extreme but less significant percentage changes.
 *
 * If the top candidate doesn't have recent articles (within 2 months),
 * it will try the second and third candidates as fallbacks.
 *
 * @returns {Promise<{articlesOnLargestMover: PolygonNewsResponseWithContent, spotlightStock: any}>}
 *          Spotlight stock data and related articles with full scraped content
 * @example
 * Returns:
 * {
 *   spotlightStockArticles: { results: [...articles with content...] },
 *   spotlightStock: { symbol: "AAPL", name: "Apple Inc.", changesPercentage: 5.2, ... }
 * }
 */
const getArticlesOnSpotlightedStock = async () => {
  // Run spotlight analysis to find the most newsworthy stocks
  const spotlightData = await stockSpotlight();

  // Check if we have candidates to work with
  if (
    !spotlightData.topThreeCandidates ||
    spotlightData.topThreeCandidates.length === 0
  ) {
    // console.log("[WARN] No spotlight candidates available");
    return {
      spotlightStockArticles: {
        results: [],
        status: "OK",
        request_id: "",
        count: 0,
      },
      spotlightStock: null,
    };
  }

  // Try each of the top 3 candidates in order until we find one with recent articles
  for (let i = 0; i < spotlightData.topThreeCandidates.length; i++) {
    const candidate = spotlightData.topThreeCandidates[i];
    // console.log(
    //   `\n[INFO] Trying candidate ${i + 1}: ${candidate.symbol} (${candidate.name})`
    // );
    // console.log(
    //   `[INFO] Change: ${candidate.changesPercentage}%, Market Cap: $${(candidate.marketCap / 1e6).toFixed(1)}M`
    // );

    // Fetch and scrape articles for this candidate
    const articlesResult = await getArticlesOnStock(candidate.symbol);

    // Check if this candidate has recent articles
    if (articlesResult.results && articlesResult.results.length > 0) {
      // console.log(
      //   `[SUCCESS] Found ${articlesResult.results.length} recent articles for ${candidate.symbol}`
      // );
      // console.log(
      //   `[INFO] Selected spotlight stock: ${candidate.symbol} - ${candidate.name}\n`
      // );

      const output = {
        spotlightStockArticles: articlesResult,
        spotlightStock: candidate,
      };

      return output;
    } else {
      console.log(
        `[ERROR] No recent articles found for ${candidate.symbol}, trying next candidate...`
      );
    }
  }

  // If we get here, none of the top 3 candidates had recent articles
  // Return the first candidate anyway with empty articles
  const fallbackCandidate = spotlightData.topThreeCandidates[0];
  // console.log(
  //   `[WARN] No candidates had recent articles. Using fallback: ${fallbackCandidate.symbol}`
  // );

  return {
    spotlightStockArticles: {
      results: [],
      status: "OK",
      request_id: "",
      count: 0,
    },
    spotlightStock: fallbackCandidate,
  };
};

// ~ PUBLIC FUNCTIONS

export const aggregateAllMarketData = async () => {
  const majorIndicators = await getMajorIndicators();
  const spotlightStock = await getArticlesOnSpotlightedStock();

  const output = {
    majorIndicators: majorIndicators, // {symbol, name, price, change, changePercent} for S&P 500, NASDAQ, DOW, Oil, Gold
    spotlightStock: spotlightStock, // Spotlighted stock with name, ticker, price, % change, and related articles
  };
  console.log("Market Data Retrieved:", output);
  return output;
};
