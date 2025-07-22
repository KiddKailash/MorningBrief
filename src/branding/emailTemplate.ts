// Email Template System with Brand Integration

import { colors, gradients } from "./colourScheme";
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
    previewText = "Your daily tech news digest",
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
            margin: 0 auto;
            background-color: ${colors.background.paper};
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        
        /* Header */
        .newsletter-header {
            background: ${gradients.newsletter};
            padding: 30px 40px;
            text-align: center;
            color: ${colors.text.inverse};
        }
        
        .newsletter-title {
            font-size: ${brand.typography.newsletter.title.fontSize};
            font-weight: ${brand.typography.newsletter.title.fontWeight};
            margin: 0 0 8px 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .newsletter-subtitle {
            font-size: ${brand.typography.newsletter.subtitle.fontSize};
            margin: 0;
            opacity: 0.9;
        }
        
        /* Content area */
        .newsletter-content {
            padding: 30px;
        }
        
        /* Section containers */
        .section-container {
            background-color: ${colors.background.paper};
            border: 1px solid ${colors.neutral.gray200};
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12);
            transition: box-shadow 0.2s ease;
        }
        
        .section-container:hover {
            box-shadow: 0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12);
        }
        
        .section-container:last-child {
            margin-bottom: 0;
        }
        
        /* Section headers */
        .section-header {
            font-size: ${brand.typography.newsletter.sectionHeader.fontSize};
            font-weight: ${brand.typography.newsletter.sectionHeader.fontWeight};
            color: ${colors.primary.main};
            margin: 0 0 20px 0;
            padding: 15px 20px;
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
            padding: 30px;
            margin-bottom: 25px;
            box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12);
        }
        
        /* Article styling */
        .article {
            margin-bottom: 25px;
            padding-bottom: 20px;
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
        
        /* Call-to-action buttons */
        .cta-button {
            display: inline-block;
            background: ${gradients.primary};
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
            box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
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
        <!-- Header -->
        <div class="newsletter-header">
            <h1 class="newsletter-title">${brand.name}</h1>
            <p class="newsletter-subtitle">${brand.tagline}</p>
        </div>
        
        <!-- Content -->
        <div class="newsletter-content">
            ${content}
        </div>
        
        <!-- Footer -->
        <div class="newsletter-footer">
            <p class="footer-text">
                Thanks for reading ${brand.name}! This newsletter was generated with AI and delivered with ❤️
            </p>
            <p class="footer-text" style="margin-top: 10px;">
                Powered by OpenAI | Questions? Reply to this email
            </p>
            <p class="footer-text" style="margin-top: 15px; font-size: 12px;">
                ${brand.subtitle}
            </p>
        </div>
    </div>
</body>
</html>`;
};

export const formatContentForEmail = (plainTextContent: string): string => {
  // Split content into sections and format each one
  let htmlContent = plainTextContent;

  // First, let's handle the intro section (everything before the first section header)
  const introMatch = htmlContent.match(/^(.*?)(?=🎯|🤖|📱|🎮|🌐|🏢|₿|🔥|🔗)/s);
  let introContent = "";
  if (introMatch && introMatch[1]) {
    introContent = `<div class="intro-section">${introMatch[1].trim()}</div>`;
    htmlContent = htmlContent.replace(introMatch[1], "");
  }

  // Convert section headers with emojis
  htmlContent = htmlContent.replace(
    /^(🎯|🤖|📱|🎮|🌐|🏢|₿)\s*([A-Z\s&]{3,})\s*$/gm,
    '<h2 class="section-header">$1 $2</h2>'
  );

  // Handle special sections
  htmlContent = htmlContent.replace(
    /^🔥\s*(QUICK BYTES)\s*$/gm,
    '</div><div class="quick-bytes"><h2 class="section-header">🔥 $1</h2>'
  );

  htmlContent = htmlContent.replace(
    /^🔗\s*(WORTH A CLICK)\s*$/gm,
    '</div><div class="worth-click"><h2 class="section-header">🔗 $1</h2>'
  );

  // Split into sections based on headers
  const sections = htmlContent.split(/<h2 class="section-header">/);
  let formattedSections = "";

  sections.forEach((section, index) => {
    if (index === 0 && section.trim()) {
      // This is content before any section header
      formattedSections += formatSectionContent(section);
    } else if (section.trim()) {
      // This is a regular section
      const headerMatch = section.match(/^([^<]+)/);
      const sectionContent = section.replace(/^[^<]+/, "");

      if (headerMatch) {
        const header = headerMatch[1];
        const isSpecialSection =
          section.includes("quick-bytes") || section.includes("worth-click");

        if (!isSpecialSection) {
          formattedSections += `<div class="section-container">`;
          formattedSections += `<h2 class="section-header">${header}</h2>`;
          formattedSections += formatSectionContent(sectionContent);
          formattedSections += `</div>`;
        } else {
          // Special sections already have their containers
          formattedSections += formatSectionContent(sectionContent);
          formattedSections += `</div>`;
        }
      }
    }
  });

  return introContent + formattedSections;
};

// Helper function to format content within sections
const formatSectionContent = (content: string): string => {
  let formatted = content;

  // Convert article titles (lines that look like headlines - not all caps, end before description)
  formatted = formatted.replace(
    /^([^.\n]{10,}?)(?=\n[^A-Z\n])/gm,
    '<h3 class="article-title">$1</h3>'
  );

  // Convert "Why this matters:" or "Bottom line:" to styled text
  formatted = formatted.replace(
    /(Why this matters|Bottom line)(:.*?)(?=\n|$)/gi,
    '<strong style="color: ' + colors.accent.warning + ';">$1$2</strong>'
  );

  // Convert "Read more:" links
  formatted = formatted.replace(
    /Read more:\s*(https?:\/\/[^\s]+)/g,
    '<a href="$1" class="cta-button">Read Full Article</a>'
  );

  // Convert other URLs to proper links
  formatted = formatted.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1">Read more</a>'
  );

  // Convert bullet points to proper list
  formatted = formatted.replace(/• (.+)(?=\n|$)/g, "<li>$1</li>");
  formatted = formatted.replace(
    /(<li>.*?<\/li>(?:\s*<li>.*?<\/li>)*)/gs,
    "<ul>$1</ul>"
  );

  // Convert paragraphs - split on double newlines
  const paragraphs = formatted.split(/\n\s*\n/);
  formatted = paragraphs
    .filter((p) => p.trim())
    .map((p) => {
      if (
        p.includes("<h3>") ||
        p.includes("<ul>") ||
        p.includes("<strong>") ||
        p.includes('<a class="cta-button">')
      ) {
        return p; // Don't wrap these in paragraph tags
      }
      return `<p class="article-content">${p.trim()}</p>`;
    })
    .join("\n");

  return formatted;
};
