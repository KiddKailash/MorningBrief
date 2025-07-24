import OpenAI from "openai";
import dotenv from "dotenv";
import { Article } from "../types/index.js";
import { brand, brandedGreeting } from "../branding/brand.js";

dotenv.config();

export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env["OPENAI_API_KEY"],
    });
  }

  async generateHeader(): Promise<string> {
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const greeting = brandedGreeting();

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a newsletter journalist for "${brand.name}" - ${brand.tagline}. 

Brand personality: ${brand.personality.voice}, ${brand.personality.tone}, ${brand.personality.style}

MARKDOWN FORMATTING AVAILABLE:
- **Bold text** for emphasis and important points
- *Italic text* for subtle emphasis and quotes
- ***Bold italic*** for maximum emphasis
- ~~Strikethrough~~ for humorous corrections
- [Link text](URL) for clickable links
- Lists: - item for bullet points

Create a professional yet engaging opening paragraph for today's newsletter that:
1. Uses this greeting: "${greeting}" 
2. Sets an informative but conversational tone
3. Mentions it's ${today}
4. Matches Morning Brew's style but with business/economic focus
5. Keep it brief but memorable (2-3 sentences max)
6. USE MARKDOWN FORMATTING to make it engaging (bold key phrases, italics for emphasis)

Example style: "**Good morning!** Lets dive into today's *market movements*? We've got some **major developments** in \`global markets\`, \`corporate news\`, and more..."`,
          },
          {
            role: "user",
            content: `Create the opening for ${brand.name} newsletter for ${today}`,
          },
        ],
        max_tokens: 300,
        temperature: 0.5,
      });

      const opening =
        completion.choices?.[0]?.message?.content ||
        `${greeting} Ready for today's business digest?`;
      return `${today}\n\n${opening}`;
    } catch (error) {
      console.error("Error generating header:", error);
      return `${today}\n\n${greeting} Ready for your daily dose of global business that matters?`;
    }
  }

  async generateMainSections(articles: Article[]): Promise<string> {
    const articlesText = articles
      .map(
        (article, i) =>
          `Article ${i + 1}:
Title: ${article.title}
Source: ${article.source.name}
Description: ${article.description}
Content Preview: ${(article.content ?? "").substring(0, 500)}...
URL: ${article.url}
---`
      )
      .join("\n\n");

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a newsletter writer for "${brand.name}" creating a Morning Brew-style business newsletter.

Brand voice: ${brand.personality.voice}
Brand tone: ${brand.personality.tone}

MARKDOWN FORMATTING AVAILABLE & REQUIRED:
- **Bold text** for emphasis, company names, key points
- *Italic text* for subtle emphasis, financial terms, quotes
- ***Bold italic*** for maximum impact moments
- ~~Strikethrough~~ for corrections, outdated info, or humor
- \`Inline code\` for financial figures, market indices, economic indicators
- [Link text](URL) for clickable references
- > Blockquotes for notable quotes or expert opinions
- Lists: * item or - item for key points, financial highlights, trends
- --- for section breaks when needed

Available section categories:
${Object.values(brand.sections.categories)
  .map((cat: any) => `- ${cat.name} (${cat.description})`)
  .join("\n")}

For each section:
1. Start with section header: "SECTION NAME"
2. Write engaging article summaries with punchy headlines using **bold** for key terms
3. Use markdown formatting throughout:
   - **Bold** for company names, key announcements, important financial figures
   - *Italic* for market terms, emphasis, economic concepts
   - \`Code formatting\` for financial figures, stock tickers, economic indicators
   - [Link text](URL) instead of "Read more: [URL]" format
4. Include "**Why this matters:**" or "**Bottom line:**" explanations in bold
5. Use professional yet conversational tone matching Morning Brew
6. NO HTML tags - use MARKDOWN formatting only
7. Group related articles intelligently by business theme
8. Add brief commentary that shows business/economic expertise

Make it engaging, informative, and professionally insightful with rich markdown formatting!`,
          },
          {
            role: "user",
            content: `Create organized newsletter sections from these business articles:\n\n${articlesText}`,
          },
        ],
        max_tokens: 2000,
        temperature: 0.5,
      });

      return (
        completion.choices?.[0]?.message?.content || "No content generated"
      );
    } catch (error) {
      console.error("Error generating main sections:", error);
      return this.createFallbackSections(articles);
    }
  }

  async generateClosingSections(): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a newsletter writer for "${brand.name}" creating the closing sections.

Brand voice: ${brand.personality.voice}
Brand tone: ${brand.personality.tone}

MARKDOWN FORMATTING AVAILABLE & REQUIRED:
- **Bold text** for emphasis, company names, key points
- *Italic text* for subtle emphasis, financial terms
- ***Bold italic*** for maximum impact
- ~~Strikethrough~~ for humor or corrections
- \`Inline code\` for financial figures, market data, economic indicators
- [Link text](URL) for recommendations
- Lists: * item or - item for quick points

Create these sections with rich markdown formatting:

1. 🔥 QUICK BYTES - 2-3 brief business news items using markdown:
   - **Bold** company names and key announcements
   - *Italic* for market terms and emphasis
   - \`Code format\` for financial figures and economic data
   - Lists for multiple points

2. 🔗 WORTH A CLICK - 1-2 interesting business-related recommendations:
   - Use [Link Title](URL) format for clickable recommendations
   - **Bold** key benefits or reasons to click
   - *Italic* for descriptive elements

3. Closing paragraph with markdown that:
   - Thanks readers for reading **${brand.name}**
   - Ties everything together with *professional* language
   - **Teases tomorrow** with excitement
   - Matches our brand personality
   - Uses **bold** and *italic* for emphasis

Keep it brief, engaging, and maintain Morning Brew professional tone with rich markdown formatting throughout.`,
          },
          {
            role: "user",
            content:
              "Create engaging closing sections for today's business newsletter",
          },
        ],
        max_tokens: 500,
        temperature: 0.5,
      });

      return (
        completion.choices?.[0]?.message?.content ||
        this.generateFallbackClosing()
      );
    } catch (error) {
      console.error("Error generating closing sections:", error);
      return this.generateFallbackClosing();
    }
  }

  private createFallbackSections(articles: Article[]): string {
    let content = "📈 BUSINESS NEWS\n\n";

    articles.forEach((article, index) => {
      content += `**${article.title}**\n`;
      content += `${article.description}\n`;
      content += `*Source: ${article.source.name}* | [Read more](${article.url})\n\n`;

      if (index < articles.length - 1) {
        content += "---\n\n";
      }
    });

    return content;
  }

  private generateFallbackClosing(): string {
    return `🔥 QUICK BYTES
* **Markets** move *fast*, and so do we
* **Global business** never sleeps — new \`developments\` daily
* Tomorrow brings more **economic insights**

🔗 WORTH A CLICK  
* Keep exploring the **latest** in *business trends*
* Stay ***informed*** about what's next in \`global markets\` and \`economic policy\`

That's all for today's **${brand.name}**! The business world keeps *evolving*, and we'll be here tomorrow with more **insights**, *analysis*, and your daily dose of global business that matters. Until then, keep your portfolios diversified and your market awareness ***even sharper***! 📈`;
  }

  async generateICYMISection(): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are writing the "ICYMI (In Case You Missed It)" section for ${brand.name}.

Brand voice: ${brand.personality.voice}
Brand tone: ${brand.personality.tone}
Style: ${brand.personality.style}

Create 4-5 quirky, offbeat business news items that sound like they could be real but have a humorous twist. Each should be 1-2 sentences max. Use this format with MARKDOWN:

* **Company Name** does something unexpected — *witty commentary*
* **Another Company** announces feature that \`sounds technical\` but is actually funny

Include:
- Mix of real and fictional companies
- Business/tech humor
- Markdown formatting (**bold**, *italics*)
- ${brand.personality.tone} personality
- Keep items brief and punchy

Make it feel authentic to business news but with ${brand.name}'s signature wit.`,
          },
          {
            role: "user",
            content: "Generate today's ICYMI section",
          },
        ],
        max_tokens: 600,
        temperature: 0.5,
      });

      return (
        completion.choices?.[0]?.message?.content || this.getFallbackICYMI()
      );
    } catch (error) {
      console.error("Error generating ICYMI section:", error);
      return this.getFallbackICYMI();
    }
  }

  async generateStatsSection(): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are writing the "Stats & Reports" section for ${brand.name}.

Brand voice: ${brand.personality.voice}
Brand tone: ${brand.personality.tone}

Create a compelling "Stat of the Day" with:
1. An interesting business/economic statistic (can be fictional but plausible)
2. A witty, insightful explanation
3. Use MARKDOWN formatting

Format:
**Stat of the Day:** [impressive number/percentage]

[2-3 sentences explaining what it means, why it matters, with ${brand.personality.tone} commentary]

*Source: [Credible-sounding but potentially humorous source]*

Make it:
- Business-focused
- Surprising but believable  
- ${brand.personality.tone} in explanation
- Educational yet entertaining`,
          },
          {
            role: "user",
            content: "Generate today's business stat",
          },
        ],
        max_tokens: 200,
        temperature: 0.5,
      });

      return (
        completion.choices?.[0]?.message?.content || this.getFallbackStats()
      );
    } catch (error) {
      console.error("Error generating stats section:", error);
      return this.getFallbackStats();
    }
  }

  async generateQuickHitsSection(): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are writing the "Quick Hit News" section for ${brand.name}.

Brand voice: ${brand.personality.voice}  
Brand tone: ${brand.personality.tone}

Create 4-5 bullet points of brief business news items using MARKDOWN formatting:

* **Company** does something significant for \`$amount\` — brief witty context
* **Another Company** announces *business move* — why it matters in one line
* **Tech Company** launches feature that *sounds impressive* but is actually \`technical detail\`

Requirements:
- Each item is ONE sentence max
- Mix of M&A, product launches, financial moves, tech announcements
- Use **bold** for companies, *italics* for emphasis, \`backticks\` for numbers/tech terms
- ${brand.personality.tone} but informative
- Feel like real business headlines but with personality
- Cover different business sectors`,
          },
          {
            role: "user",
            content: "Generate today's quick business news hits",
          },
        ],
        max_tokens: 300,
        temperature: 0.5,
      });

      return (
        completion.choices?.[0]?.message?.content || this.getFallbackQuickHits()
      );
    } catch (error) {
      console.error("Error generating quick hits section:", error);
      return this.getFallbackQuickHits();
    }
  }

  async generateCommunityResponses(prompt: string): Promise<string[]> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are generating reader responses for ${brand.name}'s community section.

Brand voice: ${brand.personality.voice}
Brand tone: ${brand.personality.tone}

Create 3 diverse, authentic-sounding reader responses to this prompt: "${prompt}"

Each response should:
- Feel like a real person wrote it
- Show different perspectives/personalities
- Include a name and city (varied demographics)
- Be 1-2 sentences max
- Range from funny to insightful to bold
- Use natural, conversational language
- Relate to business/career/money themes

Format each as: "Response text" - Name, City

Make them feel genuine and diverse, not corporate or fake.`,
          },
          {
            role: "user",
            content: `Generate 3 reader responses to: "${prompt}"`,
          },
        ],
        max_tokens: 300,
        temperature: 0.5,
      });

      const content = completion.choices?.[0]?.message?.content;
      if (content) {
        return content.split("\n").filter((line) => line.trim().length > 0);
      }
      return this.getFallbackCommunityResponses();
    } catch (error) {
      console.error("Error generating community responses:", error);
      return this.getFallbackCommunityResponses();
    }
  }

  async generateRecommendations(): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are writing the "Recommendations" section for ${brand.name}.

Brand voice: ${brand.personality.voice}
Brand tone: ${brand.personality.tone}

Create 2-3 recommendations in different categories using MARKDOWN:

**CATEGORY NAME** → [Product/Service Name](#): Brief description of why it's worth your time/money

Categories to choose from:
- TREAT YOURSELF (food, drinks, lifestyle)  
- WATCH (shows, documentaries, business content)
- READ (books, articles, newsletters)
- LISTEN (podcasts, music for productivity)
- TRY (apps, tools, experiences)
- INVEST (not financial advice, but interesting opportunities)

Each recommendation should:
- Be genuinely useful for business-minded people
- Have ${brand.personality.tone} commentary  
- Feel like insider knowledge
- Include why it matters for your audience

End with: "*Some links may be affiliate partnerships, but we only recommend things we actually use and love.*"`,
          },
          {
            role: "user",
            content: "Generate today's recommendations",
          },
        ],
        max_tokens: 250,
        temperature: 0.5,
      });

      return (
        completion.choices?.[0]?.message?.content ||
        this.getFallbackRecommendations()
      );
    } catch (error) {
      console.error("Error generating recommendations:", error);
      return this.getFallbackRecommendations();
    }
  }

  async generateBusinessCrossword(): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are creating a business-themed crossword puzzle teaser for ${brand.name}.

Brand voice: ${brand.personality.voice}
Brand tone: ${brand.personality.tone}

Create 3 crossword clues with answers related to business, finance, or economics. Use MARKDOWN formatting:

**Today's Business Crossword**

*1 Across:* [Clever clue about business topic] ([number] letters)
*5 Down:* [Another business clue with wordplay] ([number] letters)  
*8 Across:* [Third clue, maybe about markets/money] ([number] letters)

[**Play today's crossword →**](#)

*Yesterday's answers: [WORD1], [WORD2], [WORD3]*

Make clues:
- Business/finance themed
- Clever with wordplay
- Appropriate difficulty (6-8 letter answers)
- ${brand.personality.tone} in style
- Mix of serious business terms and lighter office humor`,
          },
          {
            role: "user",
            content: "Generate today's business crossword clues",
          },
        ],
        max_tokens: 200,
        temperature: 0.5,
      });

      return (
        completion.choices?.[0]?.message?.content || this.getFallbackCrossword()
      );
    } catch (error) {
      console.error("Error generating crossword:", error);
      return this.getFallbackCrossword();
    }
  }

  async generateRealEstateProperty(): Promise<any> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are creating a property for ${brand.name}'s "Open House" guessing game.

Brand voice: ${brand.personality.voice}
Brand tone: ${brand.personality.tone}

Generate a realistic property with:
- US city (tech hub, financial center, or trendy area)
- Bed/bath count (2-5 beds, 1-4 baths)  
- Square footage (800-4000 sq ft)
- Witty, memorable description highlighting unique features
- Price range that makes sense for the location

Return as JSON:
{
  "location": "City, State",
  "beds": number,
  "baths": number, 
  "sqft": number,
  "description": "Witty description with business/tech angle",
  "actualPrice": "$X.XM"
}

Make the description ${brand.personality.tone} and memorable - could reference business culture, remote work, tech amenities, etc.`,
          },
          {
            role: "user",
            content: "Generate a property for today's guessing game",
          },
        ],
        max_tokens: 200,
        temperature: 0.5,
      });

      const content = completion.choices?.[0]?.message?.content;
      if (content) {
        try {
          return JSON.parse(content);
        } catch {
          // If JSON parsing fails, return a fallback
          return this.getFallbackProperty();
        }
      }
      return this.getFallbackProperty();
    } catch (error) {
      console.error("Error generating real estate property:", error);
      return this.getFallbackProperty();
    }
  }

  // Fallback methods for when AI generation fails
  private getFallbackICYMI(): string {
    return `* **Microsoft** announces "Clippy 2.0" for Excel — now with *existential crisis detection*
* **Starbucks** tests \`AI baristas\` that still spell your name wrong **97% of the time**
* **Tesla** stock jumps **3%** after Musk tweets literally just the 📈 emoji
* ***Breaking:*** Local startup raises **$20M** for app that *reminds you to drink water* but make it \`blockchain\``;
  }

  private getFallbackStats(): string {
    return `**Stat of the Day:** 67%

of "quick" business meetings last longer than the **actual work** they were meant to discuss, according to productivity researchers.

*Source: The Institute for Meeting Management Studies*`;
  }

  private getFallbackQuickHits(): string {
    return `* **Goldman Sachs** raises \`Q4 GDP forecast\` to *3.2%* amid strong consumer confidence
* **Adobe** acquires design startup for \`$1.2B\` — promises not to ruin it *this time*
* **Zoom** stock rises **4%** after announcing "background blur for your voice" feature
* **Tesla** Supercharger network hits *50,000 stations* worldwide — still can't find one when you need it
* **Netflix** greenlights 12 new shows about **failed startups** and *cryptocurrency drama*`;
  }

  private getFallbackCommunityResponses(): string[] {
    return [
      '"My prediction: AI will solve climate change but somehow make printers even more confusing." - Sarah, Portland',
      '"Best money lesson: Never trust a business plan written entirely in Comic Sans." - Marcus, Chicago',
      '"My side hustle is teaching my houseplants about compound interest. They\'re surprisingly engaged." - Alex, Austin',
    ];
  }

  private getFallbackRecommendations(): string {
    return `**LISTEN** → [How I Built This](https://example.com): Business origin stories that make your commute actually worthwhile

**TREAT YOURSELF** → [Death Wish Coffee](https://example.com): Because regular coffee doesn't fuel *quarterly reports*

*Some links may be affiliate partnerships, but we only recommend things we actually use and love.*`;
  }

  private getFallbackCrossword(): string {
    return `**Today's Business Crossword**

*1 Across:* Where deals are made over overpriced salads (6 letters)
*5 Down:* What your portfolio does when you check it hourly (5 letters)  
*8 Across:* Essential fuel for quarterly reports (6 letters)

[**Play today's crossword →**](#)

*Yesterday's answers: OFFICE, PANIC, COFFEE*`;
  }

  private getFallbackProperty(): any {
    return {
      location: "Austin, TX",
      beds: 3,
      baths: 2,
      sqft: 1800,
      description:
        "Modern home with dedicated Zoom room and soundproof walls for your startup pitch calls",
      actualPrice: "$750K",
    };
  }
}

export const openaiService = new OpenAIService();
