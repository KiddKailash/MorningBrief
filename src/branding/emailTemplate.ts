// Email Template System with Brand Integration

import { colors } from "./colourScheme";
import { brand } from "./brand";

export interface EmailTemplateOptions {
  subject: string;
  content: string;
  previewText?: string;
}

export const createNewsletterHTML = (options: EmailTemplateOptions): string => {
  const {
    subject,
    content,
    previewText = "Your morning business brief",
  } = options;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${subject}</title>
    <style>
        /* Reset styles */
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        
        body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: ${colors.background.newsletter};
            font-family: ${brand.email.fontFamily};
            line-height: 1.6;
            color: ${colors.text.primary};
        }
        
        /* Main container */
        .newsletter-container {
            max-width: ${brand.email.maxWidth};
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
            border: 1px solid ${colors.neutral.gray200};
            background-color: ${colors.background.default};
            border-radius: 8px;
            gap: 10px;
        }
        
        /* Header */
        .newsletter-header {
            background: ${colors.primary.main};
            border-radius: 8px;
            padding: 20px 30px;
            text-align: center;
            color: ${colors.text.inverse};
        }
        
        .newsletter-title {
            font-size: ${brand.typography.newsletter.title.fontSize};
            font-weight: ${brand.typography.newsletter.title.fontWeight};
        }
        
        .newsletter-subtitle {
            font-size: ${brand.typography.newsletter.subtitle.fontSize};
            margin: 0;
            opacity: 0.9;
        }
        
        /* Content area */
        .newsletter-content {
            padding: 10px 30px;
        }
                
        .section-container:last-child {
            margin-bottom: 0;
        }
        
        /* Section images */
        .section-image {
            width: 100%;
            max-width: 100%;
            max-height: 450px;
            height: 100%;
            object-fit: cover;
            border-radius: 8px;
            transition: transform 0.2s ease;
        }
        
        .image-container {
            position: relative;
            margin: 5px 0;
            text-align: center;
        }
        
        .image-credit {
            font-size: 12px;
            color: ${colors.text.disabled};
            text-align: left;
            font-style: italic;
        }
        
        .image-credit a {
            color: ${colors.text.disabled};
            text-decoration: none;
        }
        
        .image-credit a:hover {
            color: ${colors.text.disabled};
            text-decoration: underline;
        }
        
        /* Section headers */
        .section-header {
            font-size: ${brand.typography.newsletter.sectionHeader.fontSize};
            font-weight: ${brand.typography.newsletter.sectionHeader.fontWeight};
            color: ${colors.primary.main};
            margin: 0 0 20px 0;
            background: linear-gradient(135deg, ${colors.primary.light}15 0%, ${colors.secondary.light}15 100%);
            border: 1px solid ${colors.primary.light}30;
            border-radius: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        /* Special styling for intro section */
        .intro-section {
            background: linear-gradient(135deg, ${colors.background.newsletter} 0%, ${colors.neutral.gray50} 100%);
            border: 1px solid ${colors.divider};
            border-radius: 12px;
            margin-bottom: 25px;
        }

        /* Markets snapshot table styling */
        .markets-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: ${colors.background.paper};
            border-radius: 8px;
            overflow: hidden;
        }

        .markets-table th {
            background: ${colors.primary.main};
            color: ${colors.text.inverse};
            text-align: left;
            font-weight: bold;
            font-size: 14px;
        }

        .markets-table td {
            border-bottom: 1px solid ${colors.neutral.gray200};
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

        .price-neutral {
            color: ${colors.text.secondary};
            font-weight: bold;
        }

        /* Special section containers */
        .markets-snapshot {
            background: linear-gradient(135deg, ${colors.primary.light}10 0%, ${colors.secondary.light}10 100%);
            border: 2px solid ${colors.primary.light};
            border-radius: 12px;
            margin: 25px 0;
        }

        .stock-spotlight {
            background: linear-gradient(135deg, ${colors.accent.warning}08 0%, ${colors.accent.success}08 100%);
            border: 2px solid ${colors.accent.warning}40;
            border-left: 6px solid ${colors.accent.warning};
            border-radius: 12px;
            margin: 25px 0;
        }

        .icymi-section {
            background: linear-gradient(135deg, ${colors.neutral.gray100} 0%, ${colors.neutral.gray50} 100%);
            border: 1px solid ${colors.neutral.gray300};
            border-radius: 10px;
            margin: 20px 0;
        }

        .community-section {
            background: linear-gradient(135deg, ${colors.secondary.light}08 0%, ${colors.primary.light}08 100%);
            border: 2px solid ${colors.secondary.light}40;
            border-radius: 12px;
            margin: 25px 0;
        }

        .recommendations-section {
            background: linear-gradient(135deg, ${colors.accent.success}08 0%, ${colors.primary.light}08 100%);
            border: 1px solid ${colors.accent.success}30;
            border-left: 4px solid ${colors.accent.success};
            border-radius: 10px;
            margin: 20px 0;
        }

        .real-estate-section {
            background: linear-gradient(135deg, ${colors.background.newsletter} 0%, ${colors.neutral.gray50} 100%);
            border: 2px solid ${colors.primary.light}40;
            border-radius: 12px;
            margin: 25px 0;
            text-align: center;
        }

        .word-of-day {
            background: linear-gradient(135deg, ${colors.secondary.light}08 0%, ${colors.accent.info}08 100%);
            border: 1px solid ${colors.secondary.light}30;
            border-radius: 10px;
            margin: 20px 0;
        }

        .sponsored-section {
            background: linear-gradient(135deg, ${colors.accent.warning}05 0%, ${colors.accent.info}05 100%);
            border: 2px dashed ${colors.accent.warning}40;
            border-radius: 12px;
            margin: 25px 0;
            position: relative;
        }

        .sponsored-label {
            position: absolute;
            top: -10px;
            left: 20px;
            background: ${colors.accent.warning};
            color: white;
            border-radius: 20px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
        }

        /* Referral CTA styling */
        .referral-cta {
            background: linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%);
            color: ${colors.text.inverse};
            border-radius: 12px;
            text-align: center;
            margin: 30px 0;
        }

        .referral-button {
            display: inline-block;
            background: ${colors.background.paper};
            color: ${colors.primary.main} !important;
            padding: 12px 30px;
            border-radius: 25px;
            text-decoration: none !important;
            font-weight: bold;
            margin-top: 10px;
            border: none;
            transition: all 0.2s ease;
        }

        .referral-button:hover {
            transform: translateY(-1px);
        }

        .sponsor-section {
            opacity: 0.8;
            color: ${colors.text.inverse};
            border-radius: 8px;
            font-size: 14px;
            padding: 10px 20px;
        }
        
        /* Article styling */
        .article {
            margin-bottom: 25px;
            border-bottom: 1px solid ${colors.neutral.gray100};
        }
        
        .article:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        
        .article-title {
            font-size: ${brand.typography.newsletter.articleTitle.fontSize};
            font-weight: ${brand.typography.newsletter.articleTitle.fontWeight};
            color: ${colors.text.primary};
            margin: 0 0 10px 0;
            line-height: ${brand.typography.newsletter.articleTitle.lineHeight};
        }
        
        .article-content {
            font-size: ${brand.typography.newsletter.body.fontSize};
            margin: 10px 0;
            color: ${colors.text.secondary};
        }
        
        .article-meta {
            font-size: ${brand.typography.newsletter.caption.fontSize};
            color: ${colors.text.disabled};
            margin-top: 10px;
        }
        
        /* Links */
        a {
            color: ${colors.primary.main};
            text-decoration: none;
            transition: color 0.2s ease;
        }
        
        a:hover {
            color: ${colors.primary.dark};
            text-decoration: underline;
        }
        
        /* Markdown formatting styles */
        em {
            font-style: italic;
            color: ${colors.text.primary};
        }
        
        strong {
            font-weight: bold;
            color: ${colors.text.primary};
        }
        
        code {
            background-color: ${colors.neutral.gray100};
            color: ${colors.text.primary};
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
            font-size: 0.9em;
        }
        
        pre {
            background-color: ${colors.neutral.gray100};
            border: 1px solid ${colors.neutral.gray200};
            border-radius: 6px;
            padding: 12px;
            margin: 15px 0;
            overflow-x: auto;
        }
        
        pre code {
            background-color: transparent;
            padding: 0;
            font-size: 0.85em;
            line-height: 1.4;
        }
        
        blockquote {
            border-left: 4px solid ${colors.primary.light};
            background-color: ${colors.background.newsletter};
            margin: 15px 0;
            padding: 12px 20px;
            font-style: italic;
            color: ${colors.text.secondary};
            border-radius: 0 6px 6px 0;
        }
        
        del {
            text-decoration: line-through;
            color: ${colors.text.disabled};
        }
        
        hr {
            border: none;
            border-top: 2px solid ${colors.neutral.gray200};
            margin: 25px 0;
            opacity: 0.6;
        }
        
        /* Enhanced list styling */
        ul {
            margin: 12px 0;
            padding-left: 24px;
        }
        
        li {
            margin-bottom: 6px;
            line-height: 1.5;
        }
        
        /* Nested formatting combinations */
        strong em, em strong {
            font-weight: bold;
            font-style: italic;
            color: ${colors.primary.dark};
        }
        
        /* Call-to-action buttons */
        .cta-button {
            display: inline-block;
            background: ${colors.primary.main};
            color: ${colors.text.inverse} !important;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none !important;
            font-weight: bold;
            margin: 10px 0;
            border: none;
            transition: all 0.2s ease;
        }
        
        .cta-button:hover {
            transform: translateY(-1px);
            color: ${colors.text.inverse} !important;
        }
        
        /* Quick bytes - special styling */
        .quick-bytes {
            background: linear-gradient(135deg, ${colors.accent.warning}08 0%, ${colors.accent.error}08 100%);
            border: 1px solid ${colors.accent.warning}30;
            border-left: 4px solid ${colors.accent.warning};
            border-radius: 10px;
            padding: 25px;
            margin: 20px 0;
        }
        
        .quick-bytes .section-header {
            background: transparent;
            border: none;
            padding: 0 0 15px 0;
            color: ${colors.accent.warning};
        }
        
        .quick-bytes ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        
        .quick-bytes li {
            margin-bottom: 8px;
            color: ${colors.text.disabled};
        }
        
        /* Worth a click section */
        .worth-click {
            background: linear-gradient(135deg, ${colors.secondary.light}08 0%, ${colors.primary.light}08 100%);
            border: 1px solid ${colors.secondary.light}30;
            border-left: 4px solid ${colors.secondary.light};
            border-radius: 10px;
            padding: 25px;
            margin: 20px 0;
        }
        
        .worth-click .section-header {
            background: transparent;
            border: none;
            padding: 0 0 15px 0;
            color: ${colors.secondary.main};
        }
        
        /* Footer */
        .newsletter-footer {
            background-color: ${colors.neutral.gray50};
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid ${colors.neutral.gray200};
        }
        
        .footer-text {
            font-size: ${brand.typography.newsletter.caption.fontSize};
            color: ${colors.text.disabled};
            margin: 0;
        }
        
        /* Mobile responsiveness */
        @media only screen and (max-width: 600px) {
            .newsletter-header,
            .newsletter-content,
            .newsletter-footer {
                padding: 20px !important;
            }
            
            .newsletter-title {
                font-size: 28px !important;
            }
            
            .section-header {
                font-size: 20px !important;
            }
            
            .article-title {
                font-size: 18px !important;
            }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            .newsletter-container {
                background-color: ${colors.neutral.gray800};
            }
            
            .newsletter-content {
                color: ${colors.neutral.gray200};
            }
            
            .article-title {
                color: ${colors.neutral.white};
            }
        }
    </style>
</head>
<body>
    <!-- Preview text -->
    <div style="display: none; font-size: 1px; color: transparent; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        ${previewText}
    </div>
    
    <div class="newsletter-container">
        <div class="section-container">
            <!-- Header -->
            <!-- Top navigation bar -->
            <div class="nav-bar" style="width: 100%; display: flex; justify-content: space-between; font-size: 12px; color: ${colors.text.primary}; text-align: center; box-sizing: border-box;">
                <a href="#" style="color: ${colors.text.secondary}; text-decoration: none; &.on:hover { background-color: ${colors.background.paper}; }">${brand.sections.footer.links.signUp}</a>
                <span style="color: ${colors.text.secondary}; text-decoration: none;">
                  ${new Date().toLocaleDateString(undefined, { weekday: "long" })}, ${new Date().toLocaleDateString()}
                </span>
            </div>
            <div class="newsletter-header">
                <h1 class="newsletter-title">${brand.name}</h1>
            </div>
            <!-- Presented by / Sponsor space -->
            <div class="sponsor-section" style="color: ${colors.text.inverse}; border-radius: 8px; font-size: 14px; text-align: center;">
                <span style="color: ${colors.text.secondary};">Presented by</span> <strong style="color: ${colors.text.primary};">Business Insider</strong>
            </div>
        </div>
        
        <!-- Content -->
        <div class="newsletter-content">
            <!-- Content -->
            ${content}
        </div>
        
        <!-- Footer -->
        <div class="newsletter-footer">
            <p class="footer-text">
                ${brand.sections.editorial.credits}
            </p>
            <div style="margin: 20px 0; text-align: center;">
                <a href="#" style="color: ${colors.text.disabled}; text-decoration: none; margin: 0 10px; font-size: 12px;">${brand.sections.footer.links.advertising}</a>
                <a href="#" style="color: ${colors.text.disabled}; text-decoration: none; margin: 0 10px; font-size: 12px;">${brand.sections.footer.links.unsubscribe}</a>
            </div>
            <p class="footer-text" style="margin-top: 10px; font-size: 11px; line-height: 1.4;">
                © 2025 Morning Brief. All rights reserved. <strong>Questions?</strong> Reply to this email<br>
                ${brand.subtitle}
            </p>
        </div>
    </div>
</body>
</html>`;
};

// TODO: This is a mess, need to clean it up
export const formatContentForEmail = (plainTextContent: string): string => {
  // First, apply markdown parsing to the entire content
  let htmlContent = parseMarkdown(plainTextContent);

  // Handle special div containers and their content
  htmlContent = htmlContent.replace(
    /<div class="([^"]+)">\s*(.*?)\s*<\/div>/gs,
    (match, className, content) => {
      // Parse any remaining markdown inside divs
      const parsedContent = parseMarkdown(content);
      return `<div class="${className}">${parsedContent}</div>`;
    }
  );

  // Convert section headers with emojis (after markdown parsing)
  htmlContent = htmlContent.replace(
    /^(#{1,2})\s*(📈|🌍|🏢|⚡|🏛️|🚀|📊|🔍|📰|⚡|💬|👍|🎯|🏠|📚)\s*([A-Z\s&()]{3,})\s*$/gm,
    '<h2 class="section-header">$2 $3</h2>'
  );

  // Handle special sections with proper containers
  htmlContent = htmlContent.replace(
    /<h2 class="section-header">🔥\s*(QUICK.*?|ICYMI.*?)<\/h2>/g,
    '<div class="quick-bytes"><h2 class="section-header">🔥 $1</h2>'
  );

  htmlContent = htmlContent.replace(
    /<h2 class="section-header">🔗\s*(WORTH.*?)<\/h2>/g,
    '<div class="worth-click"><h2 class="section-header">🔗 $1</h2>'
  );

  // Handle other special section containers
  htmlContent = htmlContent.replace(
    /<h2 class="section-header">📊\s*(MARKETS.*?)<\/h2>/g,
    '<div class="markets-snapshot"><h2 class="section-header">📊 $1</h2>'
  );

  htmlContent = htmlContent.replace(
    /<h2 class="section-header">🔍\s*(STOCK.*?)<\/h2>/g,
    '<div class="stock-spotlight"><h2 class="section-header">🔍 $1</h2>'
  );

  htmlContent = htmlContent.replace(
    /<h2 class="section-header">📰\s*(ICYMI.*?)<\/h2>/g,
    '<div class="icymi-section"><h2 class="section-header">📰 $1</h2>'
  );

  htmlContent = htmlContent.replace(
    /<h2 class="section-header">💬\s*(COMMUNITY.*?)<\/h2>/g,
    '<div class="community-section"><h2 class="section-header">💬 $1</h2>'
  );

  htmlContent = htmlContent.replace(
    /<h2 class="section-header">👍\s*(RECOMMENDATIONS.*?)<\/h2>/g,
    '<div class="recommendations-section"><h2 class="section-header">👍 $1</h2>'
  );

  htmlContent = htmlContent.replace(
    /<h2 class="section-header">🏠\s*(OPEN.*?)<\/h2>/g,
    '<div class="real-estate-section"><h2 class="section-header">🏠 $1</h2>'
  );

  htmlContent = htmlContent.replace(
    /<h2 class="section-header">📚\s*(WORD.*?)<\/h2>/g,
    '<div class="word-of-day"><h2 class="section-header">📚 $1</h2>'
  );

  // Split into sections and format each one properly
  const sections = htmlContent.split(/<h2 class="section-header">/);
  let formattedSections = "";

  sections.forEach((section, index) => {
    if (index === 0 && section.trim()) {
      // This is content before any section header - usually intro
      const processedContent = formatSectionContent(section);
      if (
        processedContent.trim() &&
        !processedContent.includes('<div class="intro-section">')
      ) {
        formattedSections += `<div class="intro-section">${processedContent}</div>`;
      } else {
        formattedSections += processedContent;
      }
    } else if (section.trim()) {
      // This is a regular section
      const headerMatch = section.match(/^([^<]+)/);
      const sectionContent = section.replace(/^[^<]+/, "");

      if (headerMatch) {
        const header = headerMatch[1];
        const isSpecialSection =
          section.includes("quick-bytes") ||
          section.includes("worth-click") ||
          section.includes("markets-snapshot") ||
          section.includes("stock-spotlight") ||
          section.includes("icymi-section") ||
          section.includes("community-section") ||
          section.includes("recommendations-section") ||
          section.includes("real-estate-section") ||
          section.includes("word-of-day");

        if (!isSpecialSection) {
          formattedSections += `<div class="section-container">`;
          formattedSections += `<h2 class="section-header">${header}</h2>`;
          formattedSections += formatSectionContent(sectionContent);
          formattedSections += `</div>`;
        } else {
          // Special sections: close any existing containers and format content
          formattedSections += formatSectionContent(sectionContent);
          formattedSections += `</div>`;
        }
      }
    }
  });

  return formattedSections;
};

// Enhanced markdown interpreter function
const parseMarkdown = (text: string): string => {
  let formatted = text;

  // Handle code blocks first (to avoid conflicts with other formatting)
  formatted = formatted.replace(
    /```([^`]+)```/gs,
    "<pre><code>$1</code></pre>"
  );
  formatted = formatted.replace(
    /`([^`]+)`/g,
    '<code style="background-color: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: monospace; font-size: 0.9em;">$1</code>'
  );

  // Handle links [text](url) - more robust pattern
  formatted = formatted.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" style="color: ' +
      colors.primary.main +
      '; text-decoration: none;">$1</a>'
  );

  // Handle bold and italic (order matters!) - more comprehensive patterns
  // ***bold italic*** -> <strong><em>text</em></strong>
  formatted = formatted.replace(
    /\*\*\*([^*\n]+?)\*\*\*/g,
    "<strong><em>$1</em></strong>"
  );
  // **bold** -> <strong>text</strong>
  formatted = formatted.replace(/\*\*([^*\n]+?)\*\*/g, "<strong>$1</strong>");
  // *italic* -> <em>text</em> (but not at word boundaries to avoid conflicts)
  formatted = formatted.replace(/\*([^*\n]+?)\*/g, "<em>$1</em>");

  // Alternative bold/italic syntax
  // ___bold italic___ -> <strong><em>text</em></strong>
  formatted = formatted.replace(
    /___([^_\n]+?)___/g,
    "<strong><em>$1</em></strong>"
  );
  // __bold__ -> <strong>text</strong>
  formatted = formatted.replace(/__([^_\n]+?)__/g, "<strong>$1</strong>");
  // _italic_ -> <em>text</em>
  formatted = formatted.replace(/_([^_\n]+?)_/g, "<em>$1</em>");

  // Handle strikethrough ~~text~~
  formatted = formatted.replace(
    /~~([^~\n]+?)~~/g,
    '<del style="text-decoration: line-through; opacity: 0.7;">$1</del>'
  );

  // Handle markdown lists more comprehensively
  formatted = formatted.replace(/^\* (.+)$/gm, "<li>$1</li>");
  formatted = formatted.replace(/^- (.+)$/gm, "<li>$1</li>");
  formatted = formatted.replace(/^\+ (.+)$/gm, "<li>$1</li>");
  formatted = formatted.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

  // Wrap consecutive list items in ul tags
  formatted = formatted.replace(
    /(<li>.*?<\/li>(?:\s*<li>.*?<\/li>)*)/gs,
    '<ul style="margin: 10px 0; padding-left: 20px; list-style-type: disc;">$1</ul>'
  );

  // Handle headers that weren't caught by section processing
  formatted = formatted.replace(
    /^### ([^\n]+)/gm,
    '<h4 style="font-size: 18px; font-weight: bold; margin: 15px 0 10px 0; color: ' +
      colors.text.primary +
      ';">$1</h4>'
  );
  formatted = formatted.replace(
    /^#### ([^\n]+)/gm,
    '<h5 style="font-size: 16px; font-weight: bold; margin: 10px 0 8px 0; color: ' +
      colors.text.primary +
      ';">$1</h5>'
  );

  // Handle blockquotes > text (more robust)
  formatted = formatted.replace(
    /^> (.+)$/gm,
    '<blockquote style="border-left: 4px solid ' +
      colors.primary.light +
      "; margin: 15px 0; padding: 12px 20px; background-color: " +
      colors.background.newsletter +
      '; font-style: italic; border-radius: 0 6px 6px 0;">$1</blockquote>'
  );

  // Handle horizontal rules --- or ***
  formatted = formatted.replace(
    /^(---|___|\*\*\*)$/gm,
    '<hr style="border: none; border-top: 2px solid ' +
      colors.neutral.gray200 +
      '; margin: 25px 0; opacity: 0.6;">'
  );

  // Clean up any remaining line breaks and whitespace
  formatted = formatted.replace(/\n\s*\n/g, "\n\n");

  return formatted;
};

// Helper function to format content within sections
const formatSectionContent = (content: string): string => {
  let formatted = content;

  // First, handle image tags before other formatting
  formatted = parseImageTags(formatted);

  // Apply comprehensive markdown parsing
  formatted = parseMarkdown(formatted);

  // Convert article titles (lines that look like headlines - not all caps, end before description)
  formatted = formatted.replace(
    /^([^.\n<]{10,}?)(?=\n[^A-Z\n<])/gm,
    '<h3 class="article-title">$1</h3>'
  );

  // Convert "Why this matters:" or "Bottom line:" to styled text (after markdown parsing)
  formatted = formatted.replace(
    /(Why this matters|Bottom line)(:.*?)(?=\n|$)/gi,
    '<strong style="color: ' +
      colors.accent.warning +
      '; font-weight: 600;">$1$2</strong>'
  );

  // Convert "Read more:" links
  formatted = formatted.replace(
    /Read more:\s*(https?:\/\/[^\s]+)/g,
    '<a href="$1" class="cta-button">Read Full Article</a>'
  );

  // Convert standalone URLs to proper links (but not ones already in HTML)
  formatted = formatted.replace(
    /(?<!href="|">)(https?:\/\/[^\s<]+)(?![^<]*<\/a>)/g,
    '<a href="$1" style="color: ' + colors.primary.main + ';">Read more</a>'
  );

  // Handle bullet points that weren't caught by markdown parsing
  formatted = formatted.replace(/^[•·-]\s+(.+)$/gm, "<li>$1</li>");
  formatted = formatted.replace(/^\+\s+(.+)$/gm, "<li>$1</li>"); // Handle + bullets
  formatted = formatted.replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>"); // Handle numbered lists

  // Wrap consecutive list items in ul tags
  formatted = formatted.replace(
    /(<li>.*?<\/li>(?:\s*<li>.*?<\/li>)*)/gs,
    '<ul style="margin: 10px 0; padding-left: 20px;">$1</ul>'
  );

  // Convert paragraphs - split on double newlines
  const paragraphs = formatted.split(/\n\s*\n/);
  formatted = paragraphs
    .filter((p) => p.trim())
    .map((p) => {
      const trimmed = p.trim();
      // Don't wrap these elements in paragraph tags
      if (
        trimmed.includes("<h") ||
        trimmed.includes("<ul>") ||
        trimmed.includes("<ol>") ||
        trimmed.includes("<blockquote>") ||
        trimmed.includes("<hr>") ||
        trimmed.includes("<pre>") ||
        trimmed.includes('<a class="cta-button">') ||
        trimmed.includes('<div class="image-container">') ||
        trimmed.includes("<table") ||
        trimmed.startsWith("<div") ||
        trimmed.startsWith("<")
      ) {
        return trimmed;
      }
      return `<p class="article-content">${trimmed}</p>`;
    })
    .join("\n");

  return formatted;
};

// Parse image tags and convert to HTML
const parseImageTags = (content: string): string => {
  // Match [IMAGE:url|ALT:alt|CREDIT:credit|LINK:link] format
  const imageTagRegex =
    /\[IMAGE:([^|]+)\|ALT:([^|]*)\|CREDIT:([^|]*)\|LINK:([^\]]*)\]/g;

  return content.replace(imageTagRegex, (url, alt, credit, link) => {
    // Create HTML for the image with proper attribution
    return `<div class="image-container">
      <div class="image-credit">
        <a href="${link}" target="_blank">${credit}</a> on Unsplash
      </div>
      <a href="${link}" target="_blank" style="display: block;">
        <img src="${url}" alt="${alt}" class="section-image" loading="lazy" />
      </a>
    </div>`;
  });
};
