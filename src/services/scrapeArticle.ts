import * as cheerio from "cheerio";

// ~ Public Functions

export const scrapeArticle = async (
  url: string,
  title: string = ""
): Promise<string> => {
  try {
    console.log(`[INFO] Scraping content from: ${url.substring(0, 60)}...`);

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
      console.log(
        `[WARN] HTTP ${response.status}${title ? ` for: ${title}` : ""}`
      );
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
      console.log(
        `[SUCCESS] Successfully scraped ${content.length} characters`
      );
      return content;
    } else {
      console.log(
        `[WARN] Content too short (${content.length} chars)${title ? ` for: ${title}` : ""}`
      );
      return "";
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(
        `[ERROR] Failed to scrape${title ? ` "${title}"` : ""}: ${error.message}`
      );
    } else {
      console.log(
        `[ERROR] Failed to scrape${title ? ` "${title}"` : ""}: Unknown error`
      );
    }
    return "";
  }
};
