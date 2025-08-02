/**
 * Email Template
 * 
 * Professional newsletter template matching Morning Brief aesthetic
 */

import { NewsletterSections } from '../types';
import { brand } from '../config/brand';

/**
 * Convert markdown-style text to HTML with enhanced formatting
 */
function markdownToHTML(text: string): string {
  if (!text) return '';
  
  // Process in specific order to avoid conflicts
  let html = text
    // Headers - must come before other processing
    .replace(/^#### (.*$)/gim, '<h4 style="font-size: 18px; font-weight: bold; margin: 15px 0 10px 0; color: rgba(0, 0, 0, 0.87);">$1</h4>')
    .replace(/^### (.*$)/gim, '<h3 style="font-size: 20px; margin-bottom: 10px;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="font-size: 18px; font-weight: bold; color: #1976d2; text-transform: uppercase; margin: 15px 0 10px 0;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="newsletter-title">$1</h1>')
    // Special handling for "Why this matters" and "Bottom line"
    .replace(/\*\*Why this matters:\*\*/g, '<strong style="color: #ed6c02; font-weight: 600; display: block; margin-top: 10px;">Why this matters:</strong>')
    .replace(/\*\*Bottom line:\*\*/g, '<strong style="color: #ed6c02; font-weight: 600; display: block; margin-top: 10px;">Bottom line:</strong>')
    // Bold and italic combinations
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Strikethrough for humorous/sarcastic corrections
    .replace(/~~(.+?)~~/g, '<del style="text-decoration: line-through; color: rgba(0, 0, 0, 0.5);">$1</del>')
    // Code/monospace
    .replace(/`(.+?)`/g, '<code style="background-color: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: monospace; font-size: 0.9em;">$1</code>')
    // Images (must come before links)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<div class="image-container"><img src="$2" alt="$1" class="section-image" style="width: 100%; max-width: 100%; height: auto; border-radius: 8px; margin: 15px 0;"/></div>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" style="color: #1976d2; text-decoration: none;">$1</a>')
    // Blockquotes
    .replace(/^> (.+)$/gim, '<blockquote style="border-left: 4px solid #42a5f5; margin: 15px 0; padding: 12px 20px; background-color: #fafafa; font-style: italic; border-radius: 0 6px 6px 0;">$1</blockquote>')
    // Lists - handle each list separately
    .replace(/^- (.+)$/gim, '<li>$1</li>');
  
  // Wrap consecutive <li> elements in <ul> tags
  html = html.replace(/((?:<li>.*?<\/li>\s*)+)/g, (match) => {
    return `<ul style="margin: 10px 0; padding-left: 20px; list-style-type: disc;">${match}</ul>`;
  });
  
  // Handle paragraphs - split by double newlines, then wrap non-HTML blocks
  const blocks = html.split(/\n\n+/);
  html = blocks
    .map(block => {
      block = block.trim();
      if (!block) return '';
      // Don't wrap if it's already an HTML element
      if (block.match(/^<(?:h[1-6]|ul|ol|blockquote|div|p)/i)) {
        return block;
      }
      // Wrap text blocks in paragraphs
      return `<p style="margin: 10px 0;">${block}</p>`;
    })
    .filter(Boolean)
    .join('\n\n');
  
  return html;
}

/**
 * Format market data as HTML table
 */
function formatMarketTable(marketData: string): string {
  if (!marketData || !marketData.includes("|")) return markdownToHTML(marketData);

  // Split market data into indicators and commentary
  const parts = marketData.split('\n\n');
  const indicatorLine = parts[0] || '';
  const marketCommentary = parts.slice(1).join('\n\n');

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
      const isPositive = changeNum > 0;
      const arrow = isPositive ? "▲" : "▼";
      const colorClass = isPositive ? "price-positive" : "price-negative";

      tableHTML += `<tr>
        <td style="padding: 8px 12px; font-size: 16px; text-align: center;" class="${colorClass}">${arrow}</td> 
        <td style="padding: 8px 12px;"><strong>${name}</strong></td>
        <td style="padding: 8px 12px; text-align: right;">$${value}</td>
        <td style="padding: 8px 12px; text-align: right;" class="${colorClass}">
          ${isPositive ? "+" : ""}${change}%
        </td>
      </tr>`;
    }
  });

  tableHTML += `</tbody>
    </table>`;

  // Add market commentary if present
  if (marketCommentary) {
    tableHTML += markdownToHTML(marketCommentary);
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
    /* Reset styles */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    h2 {
      font-size: 14px;
      font-weight: 600;
      color: #1976d2;
      text-align: left;
    }
    
    body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: #fafafa;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.6;
      color: rgba(0, 0, 0, 0.87);
    }
    
    /* Main container */
    .newsletter-container {
      max-width: 670px;
      margin: 20px auto;
      display: flex;
      flex-direction: column;
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      gap: 10px;
    }

    /* Section Container */
    .section-container {
      display: flex;
      flex-direction: column;
      max-width: 100%;
      padding: 20px;
      border: 1px solid #eeeeee;
      background-color: #ffffff;
      border-radius: 8px;
      gap: 5px;
    }
    
    /* Header */
    .newsletter-header {
      background: #1976d2;
      border-radius: 8px;
      padding: 20px 30px;
      text-align: center;
      color: #ffffff;
    }
    
    .newsletter-title {
      font-size: 48px;
      font-weight: bold;
      margin: 0;
      color: #ffffff;
    }
    
    .newsletter-subtitle {
      font-size: 18px;
      margin: 0;
      opacity: 0.9;
    }
    
    /* Section headers */
    .section-header {
      font-size: 18px;
      font-weight: bold;
      color: #1976d2;
      text-transform: uppercase;
      margin: 0 0 5px 0;
    }
    
    /* Markets table styling */
    .markets-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      background: #efefef;
      border-radius: 8px;
      overflow: hidden;
    }

    .markets-table td {
      border-bottom: 1px solid #eeeeee;
      font-size: 14px;
    }

    .markets-table tr:last-child td {
      border-bottom: none;
    }

    .price-positive {
      color: #22c55e;
      font-weight: bold;
    }

    .price-negative {
      color: #ef4444;
      font-weight: bold;
    }

    /* Special section containers */
    .stock-spotlight {
      background: linear-gradient(135deg, #ed6c0208 0%, #2e7d3208 100%);
      border: 2px solid #ed6c0240;
      border-left: 6px solid #ed6c02;
      border-radius: 12px;
      margin: 25px 0;
      padding: 20px;
    }

    .icymi-section {
      background: linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%);
      border: 1px solid #e0e0e0;
      border-radius: 10px;
      margin: 20px 0;
      padding: 25px;
    }

    .quick-bytes {
      background: linear-gradient(135deg, #ed6c0208 0%, #d32f2f08 100%);
      border: 1px solid #ed6c0230;
      border-left: 4px solid #ed6c02;
      border-radius: 10px;
      padding: 25px;
      margin: 20px 0;
    }

    .community-section {
      background: linear-gradient(135deg, #ba68c808 0%, #42a5f508 100%);
      border: 2px solid #ba68c840;
      border-radius: 12px;
      margin: 25px 0;
      padding: 25px;
    }

    .recommendations-section {
      background: linear-gradient(135deg, #2e7d3208 0%, #42a5f508 100%);
      border: 1px solid #2e7d3230;
      border-left: 4px solid #2e7d32;
      border-radius: 10px;
      margin: 20px 0;
      padding: 25px;
    }

    .word-of-day {
      background: linear-gradient(135deg, #ba68c808 0%, #0288d108 100%);
      border: 1px solid #ba68c830;
      border-radius: 10px;
      margin: 20px 0;
      padding: 25px;
    }

    .referral-cta {
      background: linear-gradient(135deg, #1976d2 0%, #9c27b0 100%);
      color: #ffffff;
      border-radius: 12px;
      text-align: center;
      margin: 30px 0;
      padding: 25px;
    }

    .referral-cta .section-header {
      color: #ffffff;
    }

    .referral-cta .article-content {
      color: #ffffff;
    }
    
    /* Article styling */
    .article {
      margin-bottom: 25px;
      border-bottom: 1px solid #f5f5f5;
      padding-bottom: 20px;
    }
    
    .article:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    
    .article-content {
      font-size: 16px;
      margin: 10px 0;
      color: rgba(0, 0, 0, 0.87);
    }
    
    /* Image styling */
    .image-container {
      position: relative;
      margin: 15px 0;
      text-align: center;
    }
    
    .section-image {
      width: 100%;
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease;
    }
    
    .image-credit {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.5);
      text-align: center;
      font-style: italic;
      margin-top: 5px;
    }
    
    .image-credit a {
      color: rgba(0, 0, 0, 0.5);
      text-decoration: none;
    }
    
    .image-credit a:hover {
      text-decoration: underline;
    }
    
    /* Links */
    a {
      color: #1976d2;
      text-decoration: none;
      transition: color 0.2s ease;
    }
    
    a:hover {
      color: #1565c0;
      text-decoration: underline;
    }
    
    /* Footer */
    .newsletter-footer {
      background-color: #fafafa;
      padding: 30px 40px;
      text-align: center;
      border-top: 1px solid #eeeeee;
    }
    
    .footer-text {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.38);
      margin: 0;
    }
    
    /* Nav bar */
    .nav-bar {
      width: 100%;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.87);
      text-align: center;
      box-sizing: border-box;
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
  ${isPreview ? `
  <div style="background: #1f2937; color: white; padding: 15px; text-align: center; font-family: monospace; position: sticky; top: 0; z-index: 1000; border-bottom: 3px solid #10b981;">
    <h2 style="margin: 0; color: #10b981;">📧 Newsletter Preview</h2>
    <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">Generated: ${new Date().toLocaleString()}</p>
    <div style="margin-top: 10px;">
      <button onclick="window.print()" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin: 0 5px; cursor: pointer;">Print Preview</button>
      <button onclick="document.querySelector('.newsletter-container').style.maxWidth = document.querySelector('.newsletter-container').style.maxWidth === '100%' ? '670px' : '100%'" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin: 0 5px; cursor: pointer;">Toggle Width</button>
    </div>
  </div>
  ` : ''}
  <div class="newsletter-container">
    <div class="section-container">
      <!-- Header -->
      <!-- Top navigation bar -->
      <div class="nav-bar">
        <span style="color: rgba(0, 0, 0, 0.6); text-decoration: none;">
          ${dateStr}
        </span>
        <a href="#" target="_blank" style="color: rgba(0, 0, 0, 0.6); text-decoration: none;">Share with a Friend</a>
      </div>
      <div class="newsletter-header">
        <h1 class="newsletter-title">${brand.name}</h1>
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
      ${newsletter.stockSpotlight ? `
      <div class="stock-spotlight">
        ${markdownToHTML(newsletter.stockSpotlight)}
      </div>` : ''}
    </div>
    `
        : ""
    }
    
    <div class="section-container">
      <!-- Main News Section -->
      <div class="section-container" style="border: none; padding: 0;">
        <h2 class="section-header">HEADLINES</h2>
        ${markdownToHTML(newsletter.mainNews)}
      </div>
    </div>
    
    <div class="section-container">
      <!-- Other Sections -->
      ${
        newsletter.icymi
          ? `
      <div class="icymi-section">
        ${markdownToHTML(newsletter.icymi)}
      </div>`
          : ""
      }
      
      ${
        newsletter.quickHits
          ? `
      <div class="quick-bytes">
        ${markdownToHTML(newsletter.quickHits)}
      </div>`
          : ""
      }
      
      ${
        newsletter.wordOfDay
          ? `
      <div class="word-of-day">
        ${markdownToHTML(newsletter.wordOfDay)}
      </div>`
          : ""
      }
      
      <div class="referral-cta">
        <h2 class="section-header">SHARE THE WEALTH</h2>
        <p class="article-content" style="color: white;">Love ${brand.name}? Share it with friends and earn rewards!</p>
        <a href="#" target="_blank" style="display: inline-block; background: #efefef; color: #1976d2 !important; padding: 12px 30px; border-radius: 25px; text-decoration: none !important; font-weight: bold; margin-top: 10px;">Start Sharing →</a>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="newsletter-footer">
      ${markdownToHTML(newsletter.footer)}
      <div style="margin: 20px 0; text-align: center;">
        <a href="#" target="_blank" style="color: rgba(0, 0, 0, 0.38); text-decoration: none; margin: 0 10px; font-size: 12px;">Advertise with us</a>
        <a href="#" target="_blank" style="color: rgba(0, 0, 0, 0.38); text-decoration: none; margin: 0 10px; font-size: 12px;">Unsubscribe</a>
        <p class="footer-text" style="margin-top: 10px; font-size: 11px; line-height: 1.4;">
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
    '\n=== HEADLINES ===\n',
    newsletter.mainNews,
    newsletter.marketSnapshot ? '\n=== MARKETS ===\n' + newsletter.marketSnapshot : '',
    newsletter.stockSpotlight ? '\n=== SPOTLIGHT ===\n' + newsletter.stockSpotlight : '',
    newsletter.icymi,
    newsletter.quickHits,
    newsletter.wordOfDay,
    '\n---\n',
    newsletter.footer
  ];
  
  return sections
    .filter(Boolean)
    .join('\n\n')
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1')  // Remove bold+italic
    .replace(/\*\*(.+?)\*\*/g, '$1')  // Remove bold
    .replace(/\*(.+?)\*/g, '$1')      // Remove italic
    .replace(/~~(.+?)~~/g, '[STRIKETHROUGH: $1]')  // Format strikethrough
    .replace(/`(.+?)`/g, '$1')        // Remove code formatting
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '[IMAGE: $1 - $2]') // Format images
    .replace(/\[(.+?)\]\((.+?)\)/g, '$1 ($2)') // Format links
    .replace(/^> (.+)$/gim, '  "$1"')  // Format blockquotes
    .replace(/^#{1,4} (.+)$/gim, '\n=== $1 ===\n'); // Format headers
}