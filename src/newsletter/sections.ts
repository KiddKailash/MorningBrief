/**
 * Newsletter Sections
 * 
 * ALL NEWSLETTER CONTENT SECTIONS IN ONE PLACE
 * Each function generates a specific section of the newsletter
 * Easy to find and modify any section
 */

import { Article, MarketIndicator, NewsletterSections } from '../types';
import { openai } from '../integrations/openai';

/**
 * Generate the newsletter header with date and greeting
 */
export async function generateHeader(): Promise<string> {
  const date = new Date();
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
  
  const greeting = await openai.generateShortText(
    `Generate a witty, energetic morning greeting for a business newsletter on ${dayOfWeek}. Include a brief teaser about business/market news. Be conversational and engaging. Format: Start with a greeting, then add a punchy line about coffee/business.`,
    80
  );

  return `# Morning Brief\n${dayOfWeek}\n\n${greeting}\n\n*Written by the Morning Brief team*`;
}

/**
 * Generate the main news section from articles
 */
export async function generateMainNews(articles: Article[]): Promise<string> {
  if (!articles?.length) {
    return await openai.generateShortText(
      "Write a brief, apologetic message about no news being available today. Keep it light and promise better content tomorrow.",
      30
    );
  }

  const articlesText = articles
    .slice(0, 6) // Top 6 articles for better coverage
    .map((article, i) => 
      `Article ${i + 1}:
Title: ${article.title}
Source: ${article.source.name}
Summary: ${article.description}
Content: ${(article.content || '').substring(0, 600)}...
URL: ${article.url}`
    ).join('\n\n');

  const prompt = `Create a professional business newsletter HEADLINES section from these articles:

${articlesText}

Requirements:
1. Group articles into 2-3 thematic sections (e.g., "## Tech Titans", "## Market Moves", "## Corporate Chronicles")
2. For EACH article create:
   - #### **Bold headline that captures the essence** (use ####)
   - 2-3 sentence engaging summary with context
   - Include [Read more](url) link naturally in the text
   - End with either "**Why this matters:** [insight]" OR "**Bottom line:** [key takeaway]"
3. Use **bold** for all company names and key figures
4. Professional yet conversational tone
5. Make it scannable and engaging

Format exactly like this example:
## Tech Titans

#### **Apple Unveils Revolutionary AI Assistant**
Apple stunned the tech world today with its new AI assistant that can predict your coffee order before you even wake up. The Cupertino giant's latest innovation promises to revolutionize morning routines. [Read more](https://example.com)
**Why this matters:** This marks Apple's most ambitious AI play yet, potentially disrupting the $100 billion virtual assistant market.`;

  return await openai.generateContent(prompt, 2000);
}

/**
 * Generate market snapshot section
 */
export async function generateMarketSnapshot(marketData: MarketIndicator[]): Promise<string> {
  if (!marketData?.length) return "";

  // Format as pipe-separated for template parsing
  const marketText = marketData
    .map(indicator => 
      `${indicator.symbol || indicator.name}: ${indicator.value} (${indicator.changePercent > 0 ? '+' : ''}${indicator.changePercent}%)`
    ).join(' | ');

  const avgChange = marketData.reduce((sum, m) => sum + m.changePercent, 0) / marketData.length;
  const marketMood = await openai.generateShortText(
    `Write a single witty sentence about the market mood based on ${avgChange > 0 ? 'positive' : 'negative'} ${Math.abs(avgChange).toFixed(2)}% average movement. Be clever and avoid clichés. Reference coffee, morning, or business metaphors.`,
    40
  );

  return `${marketText}\n\n${marketMood}`;
}

/**
 * Generate In Case You Missed It section
 */
export async function generateICYMI(): Promise<string> {
  const prompt = `Generate 5 quirky "In Case You Missed It" business news items.

Format EXACTLY like this:
## 📰 IN CASE YOU MISSED IT

- **Company Name** does something unexpected — *witty one-liner comment*
- **Another Company** announces something absurd — *sarcastic observation*

Requirements:
- Mix real tech/business companies with plausible but humorous scenarios
- Each item is ONE sentence only
- Company names always in **bold**
- Witty comments always in *italics*
- Make them funny but believable enough to be real news`;

  return await openai.generateContent(prompt, 400);
}

/**
 * Generate Quick Hits section
 */
export async function generateQuickHits(): Promise<string> {
  const prompt = `Generate 5 rapid-fire business updates for a "Quick Hits" section.

Format EXACTLY like this:
## 🔥 QUICK HITS

- **Company** action/announcement with \`number/stat\` — *brief insight or quip*
- **Another Company** unveils *new thing* — clever observation

Requirements:
- Each item is ONE punchy sentence
- Include specific numbers/stats in \`backticks\` when possible
- Company names in **bold**
- Key concepts in *italics*
- Mix of industries (tech, finance, retail, etc.)
- Professional but snappy tone`;

  return await openai.generateContent(prompt, 350);
}

/**
 * Generate Word of the Day section
 */
export async function generateWordOfDay(): Promise<string> {
  const prompt = `Generate a "Word of the Day" for a business newsletter.

Format EXACTLY like this:
## 📚 WORD OF THE DAY

**Term** *(part of speech)*

Clear, simple definition in plain English.

*Example*: "Relatable example sentence showing the term in use."

Requirements:
- Pick a relevant, timely business/finance/tech term
- Make the definition accessible to non-experts
- Example should be practical and memorable
- Keep it concise`;

  const content = await openai.generateContent(prompt, 200);
  return content + '\n\n*Submitted by a reader*';
}

/**
 * Generate newsletter footer
 */
export async function generateFooter(): Promise<string> {
  const signOff = await openai.generateShortText(
    "Generate a brief, friendly newsletter sign-off. Should feel warm and forward-looking. One short sentence.",
    20
  );

  return `Written by the Morning Brief team\n\n${signOff}`;
}

/**
 * Generate community corner section (optional)
 */
export async function generateCommunityCorner(): Promise<string> {
  const prompt = `Generate a "Community Corner" section with reader responses about business advice.

Format like this:
## 💬 COMMUNITY CORNER

**This week's question**: What's the best business advice you've ever received?

**Your responses**:

> "First response with practical advice" - *Name, City*

> "Second response with different perspective" - ***Name, City***

> "Third response with unique insight" - **Name, City**

*Want to share your story? Just reply to this email!*

Make responses feel authentic and varied.`;

  return await openai.generateContent(prompt, 400);
}

/**
 * Generate recommendations section (optional)
 */
export async function generateRecommendations(): Promise<string> {
  const prompt = `Generate a "Recommendations" section for a business newsletter.

Format like this:
## 👍 RECOMMENDATIONS

Brief intro acknowledging you're an AI but sharing interesting finds.

**TOOL** → [Product Name](#): Brief description of why it's useful for business professionals.

**READ** → [Book Title by Author](#): Why this book matters for career/business growth.

**WATCH** → [Show/Documentary](#): What makes this relevant for business-minded viewers.

*Note about affiliate links*

Keep recommendations practical and valuable.`;

  return await openai.generateContent(prompt, 350);
}

/**
 * Compile all sections into complete newsletter
 */
export async function compileAllSections(
  articles: Article[], 
  marketData: MarketIndicator[]
): Promise<NewsletterSections> {
  console.log("📝 Generating newsletter sections...");
  
  // Generate all sections in parallel for efficiency
  const [
    header, 
    mainNews, 
    marketSnapshot, 
    icymi, 
    quickHits, 
    wordOfDay, 
    footer
  ] = await Promise.all([
    generateHeader(),
    generateMainNews(articles),
    generateMarketSnapshot(marketData),
    generateICYMI(),
    generateQuickHits(),
    generateWordOfDay(),
    generateFooter()
  ]);

  return {
    header,
    intro: "", // Intro is part of header now
    mainNews,
    marketSnapshot,
    stockSpotlight: "", // Can be added if needed
    icymi,
    quickHits,
    wordOfDay,
    footer
  };
}