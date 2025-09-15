/**
 * Email Template
 *
 * Professional newsletter template matching Morning Brief aesthetic
 */

import { NewsletterSections } from "../types";
import { brand } from "../config/brand";

/**
 * Convert markdown-style text to HTML with enhanced formatting
 */
function markdownToHTML(text: string): string {
  if (!text) return "";

  // Process in specific order to avoid conflicts
  let html = text
    // Headers - process from most specific to least specific (most hashes to fewest)
    .replace(/^###### (.*$)/gim, "<h6>$1</h6>")
    .replace(/^##### (.*$)/gim, '<h2 class="section-header">$1</h2>')
    .replace(/^#### (.*$)/gim, "<h4>$1</h4>")
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    // Bold and italic combinations
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Strikethrough for humorous/sarcastic corrections
    .replace(
      /~~(.+?)~~/g,
      '<del style="text-decoration: line-through;">$1</del>'
    )
    // Images (must come before links) - use full-width-image class for email compatibility
    .replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<div class="image-container full-width-image"><img src="$2" alt="$1" class="section-image"/></div>'
    )
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, `<a href="$2" target="_blank" style="color: ${brand.colors.text.primary}; text-decoration: underline;">$1</a>`)
    // Blockquotes
    .replace(
      /^> (.+)$/gim,
      `<blockquote style="border-left: 4px solid ${brand.colors.primary}; padding: 20px; background-color: ${brand.colors.background.paper}; font-style: italic; border-radius: 0 6px 6px 0;">$1</blockquote>`
    )
    // Lists - handle each list separately
    .replace(/^- (.+)$/gim, "<li>$1</li>");

  // Wrap consecutive <li> elements in <ul> tags
  html = html.replace(/((?:<li>.*?<\/li>\s*)+)/g, (match) => {
    return `<ul style="margin: 5px 0; padding-left: 10px; list-style-type: disc;">${match}</ul>`;
  });

  // Handle paragraphs - split by double newlines, then wrap non-HTML blocks
  const blocks = html.split(/\n\n+/);
  html = blocks
    .map((block) => {
      block = block.trim();
      if (!block) return "";
      // Don't wrap if it's already an HTML element
      if (block.match(/^<(?:h[1-6]|ul|ol|blockquote|div|p)/i)) {
        return block;
      }
      // Wrap text blocks in paragraphs
      return `<p style="margin: 5px 0;">${block}</p>`;
    })
    .filter(Boolean)
    .join("\n\n");

  return html;
}

/**
 * Format market data as HTML table
 */
function formatMarketTable(marketData: string): string {
  if (!marketData || !marketData.includes("|"))
    return markdownToHTML(marketData);

  // Split market data into indicators and commentary
  const parts = marketData.split("\n\n");
  const indicatorLine = parts[0] || "";

  // Parse the market data text into indicators
  const indicators = indicatorLine
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  let tableHTML = `
    <h2 class="section-header">MARKETS</h2>
    <table class="markets-table" style="width: 100%; border-collapse: collapse;">
      <tbody>`;

  indicators.forEach((indicator) => {
    // Parse each indicator (e.g., "S&P 500: 4783.45 (+0.73%)")
    const match = indicator.match(/^(.*?):\s*([\d.]+)\s*\(([-+]?[\d.]+)%\)$/);
    if (match) {
      const [, name, value, change] = match;
      const changeNum = parseFloat(change || "0");
      let arrow = "";
      let colorClass = "";
      let textClass = "";

      if (changeNum > 0) {
        arrow = "▲";
        colorClass = "price-positive";
        textClass = "price-positive-text";
      } else if (changeNum < 0) {
        arrow = "▼";
        colorClass = "price-negative";
        textClass = "price-negative-text";
      } else {
        arrow = "–";
        colorClass = "price-neutral";
        textClass = "price-neutral-text";
      }

      tableHTML += `<tr>
        <td style="padding: 8px 12px; text-align: center;" class="${colorClass}">${arrow}</td> 
        <td style="padding: 8px 12px;"><strong>${name}</strong></td>
        <td style="padding: 8px 12px; text-align: right;">$${value}</td>
        <td style="padding: 8px 12px; text-align: right;">
          <span class="${textClass}">${change}%</span>
        </td>
      </tr>`;
    }
  });

  tableHTML += `</tbody>
    </table>`;

  // Add market sentiment if available (parts[1] contains the sentiment)
  if (parts[1]) {
    const sentiment = parts[1].trim();
    if (sentiment) {
      tableHTML += `\n\n<p>${sentiment}</p>`;
    }
  }

  return tableHTML;
}

/**
 * Generate the complete HTML email
 */
export function generateHTML(
  newsletter: NewsletterSections,
  isPreview: boolean = false
): string {
  // Colors are hardcoded in the template to match the desired aesthetic
  const currentDate = new Date();
  const dateStr = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${brand.name} - ${dateStr}</title>
  <style>
    * {
      font-size: ${brand.fonts.size};
    }

    ul {
      list-style-type: disc;
      padding-left: 10px;
      margin: 4px 0;
    }

    /* Reset styles */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    a {
      color: ${brand.colors.text.primary};
      text-decoration: underline;
    }
    
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0 !important;
      padding: 0 !important;
      background-color: ${brand.colors.background.paper};
      line-height: 1.5;
    }

    h1 {
      font-size: 24px;
      margin-bottom: 2px;
    }

    h2 {
      margin-bottom: 0px;
    }

    /* CLASSES */ 

    /* Main container - email compatible */
    .newsletter-container {
      max-width: 670px;
      margin: 20px auto;
      width: 100%;
      border-radius: ${brand.shapes.border};
      overflow: hidden;
    }

    /* Section Container - email compatible */
    .section-container {
      max-width: 100%;
      border: 1px solid ${brand.colors.border};
      background-color: ${brand.colors.background.primary};
      border-radius: ${brand.shapes.border};
      margin-bottom: 10px;
      box-sizing: border-box;
      padding: 20px;
      position: relative;
      overflow: hidden;
    }

    /* Images that need to span full width - override container padding */
    .section-container > .image-container:first-child {
      margin: -20px -20px 20px -20px;
      width: calc(100% + 40px);
      max-width: calc(100% + 40px);
    }

    .section-container > .image-container:first-child img {
      display: block;
      width: 100%;
      height: auto;
      border-top-left-radius: ${brand.shapes.border};
      border-top-right-radius: ${brand.shapes.border};
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      padding: 0 !important;
      margin: 0 !important;
    }

    /* For email compatibility - use table-based approach for first images */
    .section-container .full-width-image {
      width: 100%;
      margin: 0;
      padding: 0;
    }

    .section-container .full-width-image img {
      display: block;
      width: 100%;
      height: auto;
      border-top-left-radius: ${brand.shapes.border};
      border-top-right-radius: ${brand.shapes.border};
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      padding: 0 !important;
      margin: 0 !important;
    }

    /* HEADERS AND TITLES */
    /* Newsletter Brand name */
    .newsletter-title {
      font-size: 48px;
      font-weight: bold;
      margin: 0;
      color: ${brand.colors.background.primary};
    }

    /* Section Headers */
    .section-header {
      text-transform: uppercase;
      font-weight: bold;
      color: ${brand.colors.primary};
      margin-top: 0;
      margin-bottom: 5px;
    }

    .advertiser-mention {
      text-align: center;
      padding: 10px;
      color: ${brand.colors.text.secondary}
    }
    
    /* Header */
    .newsletter-header {
      background: ${brand.colors.primary};
      border-radius: ${brand.shapes.border};
      padding: 20px;
      text-align: center;
      color: ${brand.colors.background.primary};
    }
    
    /* Markets table styling */
    .markets-table {
      width: 100%;
      border-collapse: collapse;
      background: ${brand.colors.background.primary};
      border-radius: ${brand.shapes.border};
      overflow: hidden;
    }

    .markets-table td {
      border-bottom: 1px solid ${brand.colors.border};
    }

    .markets-table tr:last-child td {
      border-bottom: none;
    }

    .price-positive {
      color: ${brand.colors.stock.profit.text};
      font-weight: bold;
    }

    .price-positive-text {
      background-color: ${brand.colors.stock.profit.background};
      color: ${brand.colors.stock.profit.text};
      font-weight: bold;
      padding: 8px;
      border-radius: ${brand.shapes.border};
    }

    .price-negative {
      color: ${brand.colors.stock.loss.text};
      font-weight: bold;
    }

    .price-negative-text {
      background-color: ${brand.colors.stock.loss.background};
      color: ${brand.colors.stock.loss.text};
      font-weight: bold;
      padding: 8px;
      border-radius: ${brand.shapes.border};
    }
      
    .price-neutral {
      color: ${brand.colors.stock.neutral.text};
      font-weight: bold;
    }

    .price-neutral-text {
      background-color: ${brand.colors.stock.neutral.background};
      color: ${brand.colors.stock.neutral.text};
      font-weight: bold;
      padding: 8px;
      border-radius: ${brand.shapes.border};
    }

    .quick-bytes {
      border-radius: ${brand.shapes.border};
      padding: 25px;
    }

    .community-section {
      border-radius: ${brand.shapes.border};
      padding: 25px;
    }

    .recommendations-section {
      border-radius: ${brand.shapes.border};
      padding: 25px;
    }

    .referral-cta {
      background: linear-gradient(135deg, #1976d2 0%, #9c27b0 100%);
      color: #ffffff;
      border-radius: ${brand.shapes.border};
      text-align: center;
      padding: 25px;
    }

    .referral-cta .section-header {
      color: ${brand.colors.background.primary};
    }

    .referral-cta .article-content {
      color: ${brand.colors.background.primary};
    }
    
    /* Article styling */
    .article {
      border-bottom: 1px solid #f5f5f5;
      padding-bottom: 20px;
    }
    
    .article:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    
    .article-content {
      color: rgba(0, 0, 0, 0.87);
    }
    
    /* Image styling */
    .image-container {
      position: relative;
      text-align: center;
    }
    
    .section-image {
      width: 100%;
      max-width: 100%;
      height: auto;
      transition: transform 0.2s ease;
    }
    
    /* Footer */
    .newsletter-footer {
      background-color: ${brand.colors.background.paper};
      padding: 30px 40px;
      text-align: center;
      border-top: 1px solid #eeeeee;
    }
    
    .footer-text {
      color: rgba(0, 0, 0, 0.38);
      margin: 0;
    }
    
    /* Nav bar - email compatible table layout */
    .nav-bar {
      width: 100%;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.87);
      box-sizing: border-box;
      margin-bottom: 10px;
    }
    
    /* Mobile responsiveness */
    @media only screen and (max-width: 600px) {
      .newsletter-header,
      .newsletter-footer {
        padding: 20px !important;
      }
      
      .newsletter-title {
        font-size: 28px !important;
      }
      
      .section-container {
        padding: 15px !important;
      }
    }
  </style>
</head>
<body>
  ${
    isPreview
      ? `
  <div style="background: #1f2937; color: white; padding: 15px; text-align: center; font-family: monospace; position: sticky; top: 0; z-index: 1000; border-bottom: 3px solid #10b981;">
    <h2 style="margin: 0; color: #10b981;">📧 Newsletter Preview</h2>
    <p style="margin: 5px 0 0 0; opacity: 0.8;">Generated: ${new Date().toLocaleString()}</p>
    <div style="margin-top: 10px;">
      <button onclick="window.print()" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin: 0 5px; cursor: pointer;">Print Preview</button>
      <button onclick="document.querySelector('.newsletter-container').style.maxWidth = document.querySelector('.newsletter-container').style.maxWidth === '100%' ? '670px' : '100%'" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin: 0 5px; cursor: pointer;">Toggle Width</button>
    </div>
  </div>
  `
      : ""
  }
  <div class="newsletter-container">

    <!-- Top navigation bar - email compatible table -->
    <table class="nav-bar" cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 10px;">
      <tr>
        <td style="text-align: left; color: rgba(0, 0, 0, 0.6); font-size: 12px;">
          ${dateStr}
        </td>
        <td style="text-align: right;">
          <a href="#" target="_blank" style="color: rgba(0, 0, 0, 0.6); text-decoration: underline; font-size: 12px;">Share with a Friend</a>
        </td>
      </tr>
    </table>

    <div class="section-container">
      <!-- Header -->
      <div class="newsletter-header">
        <h1 class="newsletter-title">${brand.name}</h1>
      </div>
      <div class="advertiser-mention">
        <p>Presented by <strong>Business Insider</strong></p>
      </div>
      <!-- Intro Hook -->
      <div>
        ${markdownToHTML(newsletter.header)}
      </div>
    </div>
    
    <!-- Content -->
    ${
      newsletter.marketSnapshot
        ? `
    <div class="section-container">
      ${formatMarketTable(newsletter.marketSnapshot)}  
    </div>
    `
        : ""
    }
    
    <!-- Stock Spotlight Section -->
    ${
      newsletter.stockSpotlight
        ? `
    <div class="section-container">
      ${markdownToHTML(newsletter.stockSpotlight)}
    </div>
    `
        : ""
    }
    
    <!-- Economy Section -->
    ${
      newsletter.economy
        ? `
    <div class="section-container">
      ${markdownToHTML(newsletter.economy)}
    </div>
    `
        : ""
    }
    
    <!-- World Section -->
    ${
      newsletter.world
        ? `
    <div class="section-container">
      ${markdownToHTML(newsletter.world)}
    </div>
    `
        : ""
    }
    
    <!-- Retail Section -->
    ${
      newsletter.retail
        ? `
    <div class="section-container">
      ${markdownToHTML(newsletter.retail)}
    </div>
    `
        : ""
    }
    
    <!-- ICYMI Section -->
    ${
      newsletter.icymi
        ? `
    <div class="section-container">
        ${markdownToHTML(newsletter.icymi)}

    </div>
    `
        : ""
    }
    
    <!-- Stat Section -->
    ${
      newsletter.stat
        ? `
    <div class="section-container">
        ${markdownToHTML(newsletter.stat)}
    </div>
    `
        : ""
    }
    
    <!-- News Section -->
    ${
      newsletter.news
        ? `
    <div class="section-container">
      ${markdownToHTML(newsletter.news)}
    </div>
    `
        : ""
    }
    
    <!-- Recommendations Section -->
    ${
      newsletter.recs
        ? `
    <div class="section-container">
        ${markdownToHTML(newsletter.recs)}
    </div>
    `
        : ""
    }
    
    <!-- Games Section -->
    ${
      newsletter.games
        ? `
    <div class="section-container">
      ${markdownToHTML(newsletter.games)}
    </div>
    `
        : ""
    }
    
    <!-- Share Section -->
    ${
      newsletter.shareTheBrew
        ? `
    <div class="section-container">
      <div class="referral-cta">
        ${markdownToHTML(newsletter.shareTheBrew)}
      </div>
    </div>
    `
        : `
    <div class="section-container">
      <div class="referral-cta">
        <h2 class="section-header">SHARE THE WEALTH</h2>
        <p class="article-content" style="color: white;">Love ${brand.name}? Share it with friends and earn rewards!</p>
        <a href="#" target="_blank" style="display: inline-block; background: #efefef; color: #1976d2; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; margin-top: 10px;">Start Sharing →</a>
      </div>
    </div>
    `
    }
    
    <!-- Word of the Day Section -->
    ${
      newsletter.wordOfDay
        ? `
    <div class="section-container">
      ${markdownToHTML(newsletter.wordOfDay)}
    </div>
    `
        : ""
    }
    
    <!-- Footer -->
    <div class="newsletter-footer">
      ${markdownToHTML(newsletter.footer)}
      <div style="margin: 20px 0; text-align: center;">
        <a href="#" target="_blank" style="color: rgba(0, 0, 0, 0.38); text-decoration: underline; margin: 0 10px; font-size: 12px;">Advertise with us</a>
        <a href="#" target="_blank" style="color: rgba(0, 0, 0, 0.38); text-decoration: underline; margin: 0 10px; font-size: 12px;">Unsubscribe</a>
        <p class="footer-text" style="margin-top: 10px; font-size: 12px; line-height: 1.4;">
          © ${new Date().getFullYear()} ${brand.name}. All rights reserved.
        </p>
      </div>

    </div>
  </div>
</body>
</html>`;

  return html;
}

/**
 * Generate plain text version of the newsletter
 */
export function generatePlainText(newsletter: NewsletterSections): string {
  const sections = [
    newsletter.header,
    newsletter.marketSnapshot
      ? "\n=== MARKETS ===\n" + newsletter.marketSnapshot
      : "",
    newsletter.stockSpotlight
      ? "\n=== STOCK SPOTLIGHT ===\n" + newsletter.stockSpotlight
      : "",
    newsletter.economy ? "\n=== ECONOMY ===\n" + newsletter.economy : "",
    newsletter.world ? "\n=== WORLD ===\n" + newsletter.world : "",
    newsletter.retail ? "\n=== RETAIL ===\n" + newsletter.retail : "",
    newsletter.icymi ? "\n=== ICYMI ===\n" + newsletter.icymi : "",
    newsletter.stat ? "\n=== STAT ===\n" + newsletter.stat : "",
    newsletter.news ? "\n=== NEWS ===\n" + newsletter.news : "",
    newsletter.community ? "\n=== COMMUNITY ===\n" + newsletter.community : "",
    newsletter.recs ? "\n=== RECOMMENDATIONS ===\n" + newsletter.recs : "",
    newsletter.games ? "\n=== GAMES ===\n" + newsletter.games : "",
    newsletter.shareTheBrew
      ? "\n=== SHARE ===\n" + newsletter.shareTheBrew
      : "",
    newsletter.wordOfDay
      ? "\n=== WORD OF THE DAY ===\n" + newsletter.wordOfDay
      : "",
    "\n---\n",
    newsletter.footer,
  ];

  return sections
    .filter(Boolean)
    .join("\n\n")
    .replace(/\*\*\*(.+?)\*\*\*/g, "$1") // Remove bold+italic
    .replace(/\*\*(.+?)\*\*/g, "$1") // Remove bold
    .replace(/\*(.+?)\*/g, "$1") // Remove italic
    .replace(/~~(.+?)~~/g, "[STRIKETHROUGH: $1]") // Format strikethrough
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "[IMAGE: $1 - $2]") // Format images
    .replace(/\[(.+?)\]\((.+?)\)/g, "$1 ($2)") // Format links
    .replace(/^> (.+)$/gim, '  "$1"') // Format blockquotes
    .replace(/^###### (.+)$/gim, "\n=== $1 ===\n") // Format h6 headers
    .replace(/^##### (.+)$/gim, "\n=== $1 ===\n") // Format section headers (h5)
    .replace(/^#### (.+)$/gim, "\n=== $1 ===\n") // Format h4 headers
    .replace(/^### (.+)$/gim, "\n=== $1 ===\n") // Format h3 headers
    .replace(/^## (.+)$/gim, "\n=== $1 ===\n") // Format h2 headers
    .replace(/^# (.+)$/gim, "\n=== $1 ===\n") // Format h1 headers
    .replace(/^#{1,6}(?! )(.+)$/gim, "\n=== $1 ===\n"); // Format headers without space after hash
}