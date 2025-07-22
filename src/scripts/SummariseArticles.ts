// Use OpenAI to summarise articles and create a Morning Brew-style newsletter

import OpenAI from "openai";
import dotenv from "dotenv";
import { brand, brandedGreeting } from "../branding/brand";

// Load environment variables from .env file
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

interface Article {
  title: string;
  description: string;
  source: { name: string };
  publishedAt: string;
  url: string;
  content?: string;
}

// Generate the newsletter header and opening
const generateHeader = async (): Promise<string> => {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const greeting = brandedGreeting();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a newsletter writer for "${brand.name}" - ${brand.tagline}. 

Brand personality: ${brand.personality.voice}, ${brand.personality.tone}, ${brand.personality.style}

Create a witty, engaging opening paragraph for today's newsletter that:
1. Uses this greeting: "${greeting}"
2. Sets an informative but conversational tone
3. Mentions it's ${today}
4. Creates excitement for the tech news ahead
5. Matches Morning Brew's style but with tech focus
6. Keep it brief but memorable (2-3 sentences max)`,
        },
        {
          role: "user",
          content: `Create the opening for ${brand.name} newsletter for ${today}`,
        },
      ],
      max_tokens: 300,
      temperature: 0.8,
    });

    const opening =
      completion.choices[0]?.message?.content ||
      `${greeting} Ready for today's tech digest?`;
    return `${today}\n\n${opening}`;
  } catch (error) {
    console.error("Error generating header:", error);
    return `${today}\n\n${greeting} Ready for your daily dose of tech that matters?`;
  }
};

// Categorize and generate main content sections
const generateMainSections = async (articles: Article[]): Promise<string> => {
  const articlesText = articles
    .map(
      (article, i) =>
        `Article ${i + 1}:
Title: ${article.title}
Source: ${article.source.name}
Description: ${article.description}
Content Preview: ${article.content?.substring(0, 500)}...
URL: ${article.url}
---`
    )
    .join("\n\n");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a newsletter writer for "${brand.name}" creating a Morning Brew-style tech newsletter.

Brand voice: ${brand.personality.voice}
Brand tone: ${brand.personality.tone}

Available section categories with emojis:
${Object.values(brand.sections.categories)
  .map((cat) => `- ${cat.emoji} ${cat.name} (${cat.description})`)
  .join("\n")}

For each section:
1. Start with section header: "🎯 SECTION NAME" (use appropriate emoji)
2. Write engaging article summaries with punchy headlines
3. Include "Why this matters:" or "Bottom line:" explanations
4. Use conversational, witty tone matching Morning Brew
5. NO HTML tags - use plain text formatting
6. Include relevant article URLs as "Read more: [URL]"
7. Group related articles intelligently
8. Add brief commentary that shows expertise

Make it engaging, informative, and fun to read!`,
        },
        {
          role: "user",
          content: `Create organized newsletter sections from these tech articles:\n\n${articlesText}`,
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "No content generated";
  } catch (error) {
    console.error("Error generating main sections:", error);
    return createFallbackSections(articles);
  }
};

// Generate closing sections (news briefs, recommendations)
const generateClosingSections = async (): Promise<string> => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a newsletter writer for "${brand.name}" creating the closing sections.

Brand voice: ${brand.personality.voice}
Brand tone: ${brand.personality.tone}

Create these sections:
1. 🔥 QUICK BYTES - 2-3 brief tech news items (can be fictional but plausible recent tech news)
2. 🔗 WORTH A CLICK - 1-2 interesting tech-related recommendations
3. Closing paragraph that:
   - Thanks readers for reading ${brand.name}
   - Ties everything together
   - Teases tomorrow with excitement
   - Matches our brand personality

Keep it brief, engaging, and maintain Morning Brew conversational tone. NO HTML tags.`,
        },
        {
          role: "user",
          content:
            "Create engaging closing sections for today's tech newsletter",
        },
      ],
      max_tokens: 500,
      temperature: 0.8,
    });

    return completion.choices[0]?.message?.content || generateFallbackClosing();
  } catch (error) {
    console.error("Error generating closing sections:", error);
    return generateFallbackClosing();
  }
};

// Main function to generate the complete newsletter
export const summariseArticles = async (
  articles: Article[]
): Promise<string> => {
  if (!articles || articles.length === 0) {
    throw new Error("No articles provided for summarization");
  }

  console.log(
    `Processing ${articles.length} articles for Morning Brew-style newsletter...`
  );

  try {
    console.log("📝 Generating newsletter header...");
    const header = await generateHeader();

    console.log("📰 Processing articles into sections...");
    const mainContent = await generateMainSections(articles);

    console.log("✨ Creating closing sections...");
    const closingSections = await generateClosingSections();

    // Combine all sections
    const newsletter = `${header}

${mainContent}

${closingSections}

---
Thanks for reading! This newsletter was generated with AI and delivered with ❤️
Powered by OpenAI | Questions? Reply to this email`;

    console.log("Generated Morning Brew-style newsletter:");
    console.log("=".repeat(80));
    console.log(newsletter);
    console.log("=".repeat(80));

    return newsletter;
  } catch (error) {
    console.error("Error generating newsletter:", error);

    // Fallback: create a basic newsletter if AI fails
    console.log("Creating fallback newsletter...");
    const fallbackNewsletter = createFallbackNewsletter(articles);
    console.log("Generated fallback newsletter");
    return fallbackNewsletter;
  }
};

// Fallback section creation if main AI call fails
const createFallbackSections = (articles: Article[]): string => {
  let content = "TECH NEWS\n\n";

  articles.forEach((article, index) => {
    content += `${article.title}\n`;
    content += `${article.description}\n`;
    content += `Source: ${article.source.name} | Read more: ${article.url}\n\n`;

    if (index < articles.length - 1) {
      content += "---\n\n";
    }
  });

  return content;
};

// Fallback closing sections
const generateFallbackClosing = (): string => {
  return `🔥 QUICK BYTES
• Tech moves fast, and so do we
• Innovation never sleeps
• Tomorrow brings more digital adventures

🔗 WORTH A CLICK  
• Keep exploring the latest in tech
• Stay curious about what's next

That's all for today's ${brand.name}! The tech world keeps spinning, and we'll be here tomorrow with more insights, updates, and your daily dose of tech that matters. Until then, keep your devices charged and your curiosity even more charged! 🚀`;
};

// Fallback newsletter creation if OpenAI completely fails
const createFallbackNewsletter = (articles: Article[]): string => {
  const today = new Date().toLocaleDateString();

  let newsletter = `${today}\n\nMorning Brief\n\nHere are today's top global stories:\n\n`;

  articles.forEach((article, index) => {
    newsletter += `${index + 1}. ${article.title}\n`;
    newsletter += `${article.description}\n`;
    newsletter += `Source: ${article.source.name} | ${article.url}\n\n`;
  });

  newsletter += `That's all for today! See you tomorrow with more tech news.`;

  return newsletter;
};
