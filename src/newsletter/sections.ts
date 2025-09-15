/**
 * Newsletter Sections
 *
 * ALL NEWSLETTER CONTENT SECTIONS IN ONE PLACE
 * Each function generates a specific section of the newsletter
 * Easy to find and modify any section
 */

import {
  Article,
  MarketIndicator,
  NewsletterSections,
  CategorizedArticles,
} from "../types";
import { ai } from "../integrations/ai";
import { unsplashService } from "../integrations/unsplash";

/**
 * Generate the newsletter header with date and greeting
 */
export async function generateHeader(sources: Article[]): Promise<string> {
  if (!sources?.length) {
    const date = new Date();
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
    return `Good Morning! Welcome to your ${dayOfWeek} business briefing.`;
  }

  const date = new Date();
  const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });

  // Format article sources with their scraped content for AI
  const sourcesText = sources
    .slice(0, 3)
    .map(
      (article, i) =>
        `Article ${i + 1}:
          Title: ${article.title}
          Source: ${article.source.name}
          Summary: ${article.description}
          Content: ${(article.content || "").substring(0, 500)}...
          URL: ${article.url}`
    )
    .join("\n\n");

  const greeting = await ai.generateShortText(
    `Generate an engaging hook for a business newsletter on ${dayOfWeek}. Start with "Good Morning!" or another greeting, 
      then move swiftly on to an observation about current events or business using ONLY ONE of these article sources:
      ${sourcesText}
      
      Make it conversational, concise, and reference specific key details from the article.`,
    400
  );

  return `${greeting}`;
}

/**
 * Generate Economy section from business articles
 */
export async function generateEconomySection(
  businessArticles: Article[]
): Promise<string> {
  if (!businessArticles?.length) {
    return "";
  }

  // Select the top business/economy article
  const topArticle = businessArticles[0];
  if (!topArticle) {
    return "";
  }

  const articleContent = `Article:
    Title: ${topArticle.title}
    Source: ${topArticle.source.name}
    Summary: ${topArticle.description}
    Content: ${(topArticle.content || "").substring(0, 1000)}...
    URL: ${topArticle.url}
    `;

  const economyContent = await ai.generateContent(
    `Write a detailed but brief economic news section. 
    
    Use this article as the basis:
    ${articleContent}

    Requirements:
    1. Start with a compelling headline that captures the economic impact
    2. Explain complex economic concepts in simple terms
    3. Include specific numbers, data, and context
    4. Add analysis of what this means for readers
    5. End with forward-looking implications
    6. Use 1-3 paragraphs
    7. Include relevant subheadings for structure
    8. Make it engaging and accessible to non-experts
    9. Include the original article URL naturally in the text, it may be embedded anywhere relevant using [text](url). Do not mention the article authors, just embed the link naturally.
    `,    
    2000
  );

  // Generate a search term for the economy image
  const unsplashSearchTerm =
    await ai.generateUnsplashSearchTerm(articleContent);

  // Get an economy-related image
  const economyImage = await unsplashService.getImageForSection(
    "ECONOMY",
    unsplashSearchTerm
  );

  if (economyImage) {
    return `##### ECONOMY

![${economyImage.alt}](${economyImage.url})
*[${economyImage.credit}](${economyImage.link})*

${economyContent}`;
  }

  return `##### ECONOMY

${economyContent}`;
}

/**
 * Generate World section from world news articles
 */
export async function generateWorldSection(
  worldArticles: Article[]
): Promise<string> {
  if (!worldArticles?.length) {
    return "";
  }

  // Select top 3 world news articles
  const topArticles = worldArticles.slice(0, 3);

  const articlesText = topArticles
    .map(
      (article, i) =>
        `Article ${i + 1}:
Title: ${article.title}
Source: ${article.source.name}
Summary: ${article.description}
Content: ${(article.content || "").substring(0, 600)}...
URL: ${article.url}`
    )
    .join("\n\n");

  const worldContent = await ai.generateContent(
    `Create a "World" section with the format "Tour de headlines". Use these world news articles:

${articlesText}

Requirements:
1. Create bullet points for each story starting with a bold emoji or symbol, link the article url to the article naturally in the text, it may be embedded anywhere relevant using [text](url). Do not mention the article authors, just embed the link naturally.
2. Each bullet should be 1-2 sentences maximum.
3. Include specific details, names, and context.
4. Add clever commentary or observations.
5. Make it informative but engaging.

Format like this example:

 **Trump says he repositioned nuclear subs after Russian official's threats.** In an escalation of tensions with Russia, President Trump said on social media yesterday that he had "ordered two nuclear submarines" to be moved into "appropriate regions".

Focus on international politics, conflicts, trade, and major global events.`,
    2000
  );

  return `##### WORLD

${worldContent}`;
}

/**
 * Generate Retail section from technology/entertainment articles
 */
export async function generateRetailSection(
  techArticles: Article[],
  entertainmentArticles: Article[]
): Promise<string> {
  // Combine and select best article for retail focus
  const allArticles = [...techArticles, ...entertainmentArticles];
  if (!allArticles?.length) {
    return "";
  }

  const topArticle = allArticles[0];
  if (!topArticle) {
    return "";
  }

  const articleContent = `Article:
Title: ${topArticle.title}
Source: ${topArticle.source.name}
Summary: ${topArticle.description}
Content: ${(topArticle.content || "").substring(0, 1000)}...
URL: ${topArticle.url}`;

  const retailContent = await ai.generateContent(
    `Write a retail/consumer focused section. Use this article as inspiration to focus on a company's product, business strategy, or consumer impact:

${articleContent}

Requirements:
1. Focus on consumer products, brand strategies, or market trends
2. Include specific details about products, pricing, market impact
3. Add commentary about consumer behavior or business strategy
4. Use 1-2 paragraphs
5. Include subheadings for structure
6. Make it relatable to everyday consumers and investors
`,
    2400
  );

  // Generate a search term for the retail image
  const unsplashSearchTerm = await ai.generateUnsplashSearchTerm(retailContent);

  // Get a retail-related image
  const retailImage = await unsplashService.getImageForSection(
    "RETAIL",
    unsplashSearchTerm
  );

  if (retailImage) {
    return `##### RETAIL

![${retailImage.alt}](${retailImage.url})
*[${retailImage.credit}](${retailImage.link})*

${retailContent}`;
  } else {
    return `##### RETAIL

${retailContent}`;
  }
}

/**
 * Generate market snapshot section
 */
export async function generateMarketSnapshot(
  marketData: MarketIndicator[],
  spotlightStock?: any
): Promise<string> {
  if (!marketData?.length) return "";

  // Separate regular indicators from spotlight stock
  let regularIndicators = marketData.filter(indicator => 
    !indicator.name.includes('(Spotlight)')
  );
  
  // Add spotlight stock as final entry if provided
  if (spotlightStock?.spotlightStock) {
    const spotlight = spotlightStock.spotlightStock;
    regularIndicators.push({
      name: spotlight.name,
      symbol: spotlight.symbol,
      value: spotlight.price,
      changePercent: spotlight.changesPercentage,
    });
  }

  // Format as pipe-separated for template parsing
  const marketText = regularIndicators
    .map(
      (indicator) => {
        const changePercent = typeof indicator.changePercent === 'string' 
          ? parseFloat(indicator.changePercent) 
          : indicator.changePercent;
        const validChangePercent = isNaN(changePercent) ? 0 : changePercent;
        return `${indicator.symbol || indicator.name}: ${indicator.value} (${validChangePercent > 0 ? "+" : ""}${validChangePercent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%)`;
      }
    )
    .join(" | ");

  const marketMood = await ai.generateShortText(
    `Write a brief 2-3 sentence analysis of the market and investor sentiment based on these market indicators: ${marketText}. Focus on overall market trends and what this means for investors.`,
    1000
  );

  return `${marketText}

${marketMood}`;
}

/**
 * Generate In Case You Missed It section
 */
export async function generateICYMI(articles: Article[]): Promise<string> {
  if (!articles?.length) {
    return "";
  }

  // Select diverse articles from different sources
  const selectedArticles = articles.slice(0, 8); // More articles for better variety

  const articlesText = selectedArticles
    .map(
      (article, i) =>
        `${i + 1}. ${article.title} - ${article.source.name} (${article.url})`
    )
    .join("\n");

  const prompt = `Generate 5 quirky "In Case You Missed It" business news items. Use these diverse articles from various categories: 

${articlesText}

Format EXACTLY like this:
Have you heard...

Here's everything that didn't make it into this week's newsletters but we immediately sent to the group chat.

 **Google** paid $12,500 to a man who was photographed naked by a Street View cam while in his yard, exposing his rear end. That's a violation of privacy, no ifs, ands, or butts about it.

 **Authorities in Chile** are returning six watches that were stolen from Keanu Reeves in 2023. Scary to think what would have happened to the thieves if the watches were puppies.

Requirements:
- Start each item with a bullet point and company/organization in **bold** with the link to the article over the entity name using [entity](article link)
- Each item should be factual, and humorous.
- Keep the tone playful and conversational
- Mix different types of companies and situations
- Use the provided articles and make it engaging
`;

  const content = await ai.generateContent(prompt, 1200);
  return `##### In Case You Missed It

  ${content}`;
}

/**
 * Generate News section (What else is brewing)
 */
export async function generateNewsSection(
  generalArticles: Article[]
): Promise<string> {
  if (!generalArticles?.length) {
    return "";
  }

  // Select 6-8 articles for brief updates, ensuring diversity
  const newsArticles = generalArticles.slice(0, 8);

  const articlesText = newsArticles
    .map(
      (article, i) =>
        `${i + 1}. ${article.title} - ${article.source.name} (${article.url})`
    )
    .join("\n");

  const prompt = `Generate a "What else is brewing" news section using these articles:

${articlesText}

Format EXACTLY like this:
What else is brewing

- The NFL and ESPN are said to be on the verge of a multibillion-dollar deal, to be announced next week, that would hand most of the league's media holdings, including RedZone and the NFL Network, over to the Disney-owned sports network in exchange for an equity stake.
- The nearly 8 million student loan borrowers enrolled in the Biden-era SAVE program, which was struck down by court rulings, will see their bills go up as interest on their loans started accruing again yesterday.

Requirements:
- Each bullet point should be one clear, informative sentence
- Include specific details, numbers, and context
- Write in a straightforward news style (less humor than other sections)
- Cover diverse topics from the provided articles
- Make each item scannable and easy to digest
- Include key facts and implications
- Prioritize different types of news (not just business)
- Create 5-7 bullet points from the provided articles`;

  const content = await ai.generateContent(prompt, 1400);
  return `##### News
  
  ${content}
  `;
}

/**
 * Generate Word of the Day section
 */
export async function generateWordOfDay(): Promise<string> {
  const prompt = `Generate a "Word of the Day".

Format EXACTLY like this:
**Term** *(part of speech)*

Clear, simple definition in plain English.

*Example*: "Relatable example sentence showing the term in use."

Requirements:
- Pick a random word from the dictionary - it can be anything, but a business/finance/tech term is preferable.
- Make the definition accessible to non-experts
- Example should be practical and memorable
- Keep it concise`;

  const content = await ai.generateContent(prompt, 400);
  return `##### 📚 WORD OF THE DAY

  ${content}`;
}

/**
 * Generate newsletter footer
 */
export async function generateFooter(): Promise<string> {
  const signOff = await ai.generateShortText(
    "Generate a brief, friendly newsletter sign-off. Should feel warm and forward-looking. One short sentence.",
    400
  );

  return `Written by the Morning Brief team\n\n${signOff}`;
}

/**
 * Generate community corner section (optional)
 */
export async function generateCommunityCorner(): Promise<string> {
  const prompt = `Generate a "Community Corner" section with reader responses about business advice.

Format like this:

**This week's question**: What's the best business advice you've ever received?

**Your responses**:

> "First response with practical advice" - *Name, City*

> "Second response with different perspective" - ***Name, City***

> "Third response with unique insight" - **Name, City**

*Want to share your story? Just reply to this email!*

Make responses feel authentic and varied.`;

  const content = await ai.generateContent(prompt, 800);

  return `##### 💬 COMMUNITY CORNER

    ${content}
    `;
}

/**
 * Generate recommendations section (optional)
 */
export async function generateRecommendations(): Promise<string> {
  const prompt = `Generate a "Recommendations" section for a business newsletter.

Format like this:

Brief intro acknowledging you're an AI but sharing interesting finds.

**TOOL** → [Product Name](#): Brief description of why it's useful for business professionals.

**READ** → [Book Title by Author](#): Why this book matters for career/business growth.

**WATCH** → [Show/Documentary](#): What makes this relevant for business-minded viewers.

*Note about affiliate links*

Keep recommendations practical and valuable.`;

  const content = await ai.generateContent(prompt, 350);

  return `##### 👍 RECOMMENDATIONS
  
  ${content}`;
}

/**
 * Generate Stat section with data-driven story
 */
export async function generateStatSection(
  marketData: MarketIndicator[],
  businessArticles: Article[]
): Promise<string> {
  // Try to find an interesting stat from articles or create one from market data
  let statTopic = "market performance";
  let statValue = "mixed results";

  if (marketData?.length) {
    const avgChange =
      marketData.reduce((sum, m) => {
        const changePercent = typeof m.changePercent === 'string' 
          ? parseFloat(m.changePercent) 
          : m.changePercent;
        return sum + (isNaN(changePercent) ? 0 : changePercent);
      }, 0) / marketData.length;
    statValue = `${Math.abs(avgChange).toFixed(1)}%`;
    statTopic = avgChange > 0 ? "market gains" : "market decline";
  }

  // Use business articles to create context
  const articlesContext =
    businessArticles && businessArticles.length > 0
      ? businessArticles
          .slice(0, 2)
          .filter(article => article && (article.title || article.content || article.description))
          .map(
            (article) =>
              `${article.title || 'Untitled'} - ${(article.content || article.description || "No content available").substring(0, 300)}`
          )
          .join("\n")
      : "No business articles available for context";

  const prompt = `Generate a data-driven "STAT" section.

Context:
Market data: ${statTopic} showing ${statValue}
Articles context: ${articlesContext}

Format EXACTLY like this example:
**Prime number**: A 39% surprise

While most of Switzerland probably went to bed happily breathing in the cool mountain air, lulled to sleep by neighborly yodels, the nation awoke to the unpleasant shock that President Trump had slapped a 39% tariff on the country's imports into the US—one of the highest rates doled out among the dozens the president unveiled Thursday night:

- The rate is even more than the 31% President Trump had initially announced for Swiss goods in April (which was then paused along with other tariffs).
- The high rate would be a blow to Switzerland's export-driven economy, which notably sends the world pharmaceuticals, watches, jewelry, electronics, and chocolate.

Requirements:
1. Create a compelling narrative around a specific statistic
2. Include bullet points with supporting details
3. Focus on economic/business implications
4. Make the statistic surprising or noteworthy
5. Write 1-2 paragraphs plus bullet points`;

  const content = await ai.generateContent(prompt, 2400);

  // Generate a search term for the stat image
  const unsplashSearchTerm = await ai.generateUnsplashSearchTerm(content);

  // Get a stat-related image
  const statImage = await unsplashService.getImageForSection(
    "BUSINESS STATISTICS",
    unsplashSearchTerm
  );

  if (statImage) {
    return `##### STAT

    ![${statImage.alt}](${statImage.url})
    *[${statImage.credit}](${statImage.link})*

    ${content}`;
  }

  return content;
}

/**
 * Generate Community section
 */
export async function generateCommunitySection(): Promise<string> {
  const prompt = `Generate a "Community Corner" section for a business newsletter.

Format EXACTLY like this:

Last week, we asked, "What is a wildcard summertime food or beverage that defines the season for you?" Here are some of our favorite responses:

"This season is defined by this grilled peach salad with salsa verde, honey, olive oil, salt, and a quality mix of greens topped with blue goat cheese."—Josie from Chicago, IL

"Definitely gazpacho, a cold soup from the south of Spain. Tomatoes, cucumbers, bell peppers, some garlic…It's just SO fresh that nothing compares to it on a hot Andalusian or Catalan beach during the summer."—Julián from Madrid

This week's question
If you could have a lifetime supply of any product, what would you choose and why?

Requirements:
- Include realistic reader responses with names and locations
- Make responses feel authentic and varied
- Ask an engaging question for next week
- Keep the tone community-focused and friendly`;

  const content = await ai.generateContent(prompt, 800);

  return `##### COMMUNITY

  ${content}`;
}

/**
 * Generate Recommendations section
 */
export async function generateRecsSection(): Promise<string> {
  const prompt = `Generate a "Recommendations" section for a business newsletter.

Format EXACTLY like this:
Todays to-do list:

 **Treat**: Having a furry friend doesn't mean your kitchen needs to be cluttered.

 **Spot the fakes**: Test your ability to tell AI-generated images from genuine ones in this study from Northwestern University.

 **Read, then drive**: The ultimate road trip books (besides On the Road).

 **Watch**: A new wrinkle in the "Are birds real?" debate.

Requirements:
- Include different categories: Treat, Read, Watch, etc.
- Keep recommendations practical and valuable
- Write brief, engaging descriptions
- Focus on business/productivity/lifestyle content
- Include a variety of content types`;

  const content = await ai.generateContent(prompt, 350);

  return `##### RECS

  ${content}`;
}

/**
 * Generate Games section
 */
export async function generateGamesSection(): Promise<string> {
  const locations = [
    "New York, NY",
    "Los Angeles, CA",
    "Miami, FL",
    "Austin, TX",
    "Seattle, WA",
    "Chicago, IL",
    "Boston, MA",
    "San Francisco, CA",
    "Denver, CO",
    "Nashville, TN",
  ];

  const randomLocation =
    locations[Math.floor(Math.random() * locations.length)];
  const randomPrice = Math.floor(Math.random() * 10) * 500000 + 1000000; // $1M-$6M range
  const formatPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(randomPrice);

  const prompt = `Generate a real estate guessing game section called "Open House".

Location: ${randomLocation}
Price: ${formatPrice}

Format EXACTLY like this:
Games available

**Crossword**: Jack has dreamed up an extra fun puzzle for you and your co-players. Check it out here.

**Open House**
Welcome to Open House, the only newsletter section that is anticipating a hot new bombshell entering the villa at any moment. We'll give you a few facts about a listing and you try to guess the price.

Today's home might be in ${randomLocation}, but it gives off a Love Island vibe. The listing claims the property boasts 2020's "Best Pool in America." We couldn't verify that, but it does appear to be pretty cool. Amenities include:

- 5 beds, 6 baths
- Four outdoor fire pits
- Plenty of vibrantly colored chairs placed far from the action to sit and watch your friends having fun

How much for your own little oasis?

**Answer**: ${formatPrice}

Requirements:
- Create realistic but interesting property details
- Use humor and personality in the description
- Include specific amenities that sound appealing
- Keep the tone playful and engaging`;

  const content = await ai.generateContent(prompt, 400);

  return `##### PLAY

  ${content}`;
}

/**
 * Generate Stock Spotlight section from articles about the spotlight stock
 */
export async function generateStockSpotlight(
  spotlightStock: any,
  stockArticles: any[]
): Promise<string> {
  if (!spotlightStock || !stockArticles?.length) {
    return "";
  }

  // Format the stock information
  const stockName = spotlightStock.name || spotlightStock.symbol;
  const stockSymbol = spotlightStock.symbol;
  const stockPrice = spotlightStock.price;
  const changePercent = spotlightStock.changesPercentage;
  const isPositive = changePercent > 0;
  const changeDirection = isPositive ? "gained" : "lost";
  const changeSign = isPositive ? "+" : "";

  // Format articles for AI processing
  const articlesText = stockArticles
    .slice(0, 3)
    .map(
      (article, i) =>
        `Article ${i + 1}:
        Title: ${article.title}
        Publisher: ${article.publisher?.name || article.publisher}
        Content: ${(article.content || article.description || "").substring(0, 800)}...
        URL: ${article.article_url}`
    )
    .join("\n\n");

  const spotlightContent = await ai.generateContent(
    `Create an article about ${stockName} (${stockSymbol}), which has ${stockPrice} & ${changeDirection} ${changeSign}${Math.abs(changePercent).toFixed(2)}% today.

      Use these recent articles about the company:

      ${articlesText}

      Requirements:
      1. Within the article you are to give an overview of the company and the industry, analyze and explain why the stock moved based on the article content - identify industry trends, and explain the business context and what this means for investors.
      4. Include details from the articles about company or industry.
      5. Make it accessible to both novice and experienced investors.
      6. Use 2-3 paragraphs.
      7. Include the original article URL.
      `,
    2400
  );

  // Generate a search term for the stock image
  const unsplashSearchTerm =
    await ai.generateUnsplashSearchTerm(spotlightContent);

  // Get a stock-related image
  const stockImage = await unsplashService.getImageForSection(
    "STOCK SPOTLIGHT",
    unsplashSearchTerm
  );

  if (stockImage) {
    return `##### STOCK SPOTLIGHT

## ${stockName}

![${stockImage.alt}](${stockImage.url})
*[${stockImage.credit}](${stockImage.link})*

${spotlightContent}`;
  }

  return `${spotlightContent}`;
}

/**
 * Generate Share the Brew section
 */
export async function generateShareSection(): Promise<string> {
  return `##### SHARE THE BREW

          Share Morning Brief with your friends, acquire free Brew swag, and then acquire more friends as a result of your fresh Brew swag.

          We're saying we'll give you free stuff and more friends if you share a link. One link.

          Your referral count: 0

          [Click to Share](#)

          Or copy & paste your referral link to others:
          morningbrief.com/daily/r/?kid=abc123`;
}

/**
 * Compile all sections into complete newsletter (legacy version)
 */
export async function compileAllSections(
  articles: Article[],
  marketData: MarketIndicator[]
): Promise<NewsletterSections> {
  console.log("📝 Generating newsletter sections (legacy)...");

  // Generate all sections in parallel for efficiency
  const [
    header,
    economySection,
    marketSnapshot,
    stat,
    icymi,
    news,
    wordOfDay,
    footer,
  ] = await Promise.all([
    generateHeader(articles),
    generateEconomySection(articles), // Use all articles as business articles
    generateMarketSnapshot(marketData),
    generateStatSection(marketData, articles),
    generateICYMI(articles),
    generateNewsSection(articles),
    generateWordOfDay(),
    generateFooter(),
  ]);

  return {
    header,
    intro: "", // Intro is part of header now
    marketSnapshot,
    economy: economySection,
    world: "", // Not available in legacy mode
    retail: "", // Not available in legacy mode
    icymi,
    stat,
    news,
    community: "", // Not available in legacy mode
    recs: "", // Not available in legacy mode
    games: "", // Not available in legacy mode
    shareTheBrew: "", // Not available in legacy mode
    wordOfDay,
    footer,
  };
}

/**
 * Distribute articles to prevent duplication across sections
 */
function distributeArticles(categorizedArticles: CategorizedArticles) {
  // Create a used articles tracker
  const usedArticles = new Set<string>();

  // Helper function to get unused articles from a category
  const getUnusedArticles = (articles: Article[], count: number): Article[] => {
    const unused = articles.filter((article) => !usedArticles.has(article.url));
    const selected = unused.slice(0, count);
    selected.forEach((article) => usedArticles.add(article.url));
    return selected;
  };

  return {
    // Header gets first business article
    headerArticles: getUnusedArticles(categorizedArticles.business, 3),

    // Economy section gets next business articles
    economyArticles: getUnusedArticles(categorizedArticles.business, 2),

    // World section gets world articles
    worldArticles: categorizedArticles.world,

    // Retail section gets tech + entertainment
    technologyArticles: categorizedArticles.technology,
    entertainmentArticles: categorizedArticles.entertainment,

    // Stat section gets remaining business articles
    statBusinessArticles: getUnusedArticles(categorizedArticles.business, 3),

    // ICYMI gets first half of general articles
    icymiArticles: getUnusedArticles(
      categorizedArticles.general,
      Math.floor(categorizedArticles.general.length / 2)
    ),

    // News section gets second half of general articles
    newsArticles: getUnusedArticles(
      categorizedArticles.general,
      categorizedArticles.general.length
    ),

    // Add science and health to general pool for variety
    additionalGeneralArticles: [
      ...categorizedArticles.science,
      ...categorizedArticles.health,
    ],
  };
}

/**
 * Compile all sections into complete newsletter using categorized articles
 */
export async function compileAllCategorizedSections(
  categorizedArticles: CategorizedArticles,
  marketData: MarketIndicator[],
  spotlightStock?: any
): Promise<NewsletterSections> {
  console.log("📝 Generating categorized newsletter sections...");

  // Distribute articles to prevent duplication
  const distributedArticles = distributeArticles(categorizedArticles);

  console.log("📊 Article distribution:", {
    header: distributedArticles.headerArticles.length,
    economy: distributedArticles.economyArticles.length,
    world: distributedArticles.worldArticles.length,
    technology: distributedArticles.technologyArticles.length,
    entertainment: distributedArticles.entertainmentArticles.length,
    stat: distributedArticles.statBusinessArticles.length,
    icymi: distributedArticles.icymiArticles.length,
    news: distributedArticles.newsArticles.length,
  });

  // Generate all sections in parallel for maximum efficiency
  const [
    header,
    economySection,
    worldSection,
    retailSection,
    marketSnapshot,
    stockSpotlight,
    stat,
    icymi,
    news,
    community,
    recs,
    games,
    shareTheBrew,
    wordOfDay,
    footer,
  ] = await Promise.all([
    generateHeader(distributedArticles.headerArticles),
    generateEconomySection(distributedArticles.economyArticles),
    generateWorldSection(distributedArticles.worldArticles),
    generateRetailSection(
      distributedArticles.technologyArticles,
      distributedArticles.entertainmentArticles
    ),
    generateMarketSnapshot(marketData, spotlightStock),
    generateStockSpotlight(
      spotlightStock?.spotlightStock,
      spotlightStock?.spotlightStockArticles?.results || []
    ),
    generateStatSection(marketData, distributedArticles.statBusinessArticles),
    generateICYMI([
      ...distributedArticles.icymiArticles,
      ...distributedArticles.additionalGeneralArticles,
    ]),
    generateNewsSection(distributedArticles.newsArticles),
    generateCommunitySection(),
    generateRecsSection(),
    generateGamesSection(),
    generateShareSection(),
    generateWordOfDay(),
    generateFooter(),
  ]);

  return {
    header,
    intro: "", // Intro is part of header now
    marketSnapshot,
    stockSpotlight,
    economy: economySection,
    world: worldSection,
    retail: retailSection,
    icymi,
    stat,
    news,
    community,
    recs,
    games,
    shareTheBrew,
    wordOfDay,
    footer,
  };
}
