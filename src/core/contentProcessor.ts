import { Article } from "../types/index.js";
import { openaiService } from "../services/openaiService.js";
import { unsplashService } from "../services/unsplashService.js";
// import { aggregateAllMarketData } from "../services/marketData.js"; // TODO: Uncomment this when testing is done
// @ts-ignore
import aggregateAllMarketData from "../dummydata/marketData";

import { brand, getRandomCommunityPrompt, getTodaysWordOfDay } from "../branding/brand.js";

export class ContentProcessor {
  async generateNewsletter(articles: Article[]): Promise<string> {
    if (!articles || articles.length === 0) {
      throw new Error("No articles provided for newsletter generation");
    }

    console.log(
      `[INFO] Processing ${articles.length} articles for comprehensive Morning Brief newsletter...`
    );

    try {
      // Step 1: Generate header with greeting and editorial credits
      console.log("📝 Generating newsletter header...");
      const header = await this.generateMorningBrewHeader();

      // Step 2: Fetch market data for snapshot and spotlight
      console.log("📊 Fetching market data...");
      // const marketData = await aggregateAllMarketData(); // TODO: Uncomment this when testing is done
      const marketData = aggregateAllMarketData;

      // Step 3: Generate markets snapshot
      console.log("📈 Creating markets snapshot...");
      const marketsSnapshot = this.generateMarketsSnapshot(marketData);

      // Step 4: Generate stock spotlight
      console.log("🔍 Creating stock spotlight...");
      const stockSpotlight = this.generateStockSpotlight(marketData);

      // Step 5: Process main news articles into categories
      console.log("📰 Processing main news sections...");
      const mainNewsContent = await openaiService.generateMainSections(articles);

      // Step 6: Generate special sections
       console.log("✨ Creating special sections...");
       const icymiSection = await this.generateICYMISection();
       const statsSection = await this.generateStatsSection();
       const quickHitsSection = await this.generateQuickHitsSection();
       const communitySection = await this.generateCommunitySection();
       const recommendationsSection = await this.generateRecommendationsSection();
       const gamesSection = await this.generateGamesSection();
       const realEstateSection = await this.generateRealEstateSection();
       const referralSection = this.generateReferralSection();
       const wordOfDaySection = this.generateWordOfDaySection();

      // Step 7: Combine all sections
      const allSections = [
        header,
        marketsSnapshot,
        stockSpotlight,
        mainNewsContent,
        icymiSection,
        statsSection,
        quickHitsSection,
        communitySection,
        recommendationsSection,
        gamesSection,
        realEstateSection,
        wordOfDaySection,
        referralSection
             ].filter(section => section && section.trim().length > 0);

      console.log("🖼️ Integrating section images...");
      const combinedContent = allSections.join('\n\n');
      const newsletter = await this.generateNewsletterWithImages('', combinedContent, '');

      console.log("[SUCCESS] Generated comprehensive Morning Brief newsletter with images");
      console.log("=".repeat(80));
      console.log(newsletter);
      console.log("=".repeat(80));

      return newsletter;
    } catch (error) {
      console.error("[ERROR] Error generating newsletter:", error);

      // Fallback: create a basic newsletter if AI fails
      console.log("[INFO] Creating fallback newsletter...");
      const fallbackNewsletter = this.createFallbackNewsletter(articles);
      console.log("[INFO] Generated fallback newsletter");
      return fallbackNewsletter;
    }
  }

  private async generateMorningBrewHeader(): Promise<string> {
    const header = await openaiService.generateHeader();
    const editorialCredits = `\n\n*${brand.sections.editorial.credits}*\n\n---\n`;
    return header + editorialCredits;
  }

  private generateMarketsSnapshot(marketData: any): string {
    if (!marketData?.majorIndicators || marketData.majorIndicators.length === 0) {
      return '';
    }

    let snapshot = `<div class="markets-snapshot">\n`;
    snapshot += `## ${brand.sections.special.MARKETS_SNAPSHOT.name}\n\n`;
    
    snapshot += `<table class="markets-table">\n`;
    snapshot += `<thead><tr><th>Index/Asset</th><th>Price</th><th>Change</th><th>% Change</th></tr></thead>\n`;
    snapshot += `<tbody>\n`;
    
    marketData.majorIndicators.forEach((indicator: any) => {
      const changeClass = indicator.changePercent > 0 ? 'price-positive' : 
                         indicator.changePercent < 0 ? 'price-negative' : 'price-neutral';
      const changeSymbol = indicator.changePercent > 0 ? '+' : '';
      
      snapshot += `<tr>`;
      snapshot += `<td><strong>${indicator.name}</strong></td>`;
      snapshot += `<td>$${indicator.price}</td>`;
      snapshot += `<td class="${changeClass}">${changeSymbol}${indicator.change}</td>`;
      snapshot += `<td class="${changeClass}">${changeSymbol}${indicator.changePercent}%</td>`;
      snapshot += `</tr>\n`;
    });
    
    snapshot += `</tbody></table>\n\n`;
    snapshot += `**Market Vibes:** Markets are ${this.getMarketMood(marketData.majorIndicators)} today. `;
    snapshot += `${this.getMarketCommentary(marketData.majorIndicators)}\n\n`;
    snapshot += `</div>\n`;
    
    return snapshot;
  }

  private generateStockSpotlight(marketData: any): string {
    const spotlight = marketData?.spotlightStock;
    if (!spotlight?.spotlightStock) {
      return '';
    }

    const stock = spotlight.spotlightStock;
    let section = `<div class="stock-spotlight">\n`;
    section += `## ${brand.sections.special.STOCK_SPOTLIGHT.name}\n\n`;
    
    section += `### **${stock.name} (${stock.symbol})**\n\n`;
    section += `**Price:** $${stock.price} | `;
    section += `**Change:** ${stock.changePercent > 0 ? '+' : ''}${stock.changePercent}% `;
    section += `(${stock.changePercent > 0 ? '+' : ''}$${stock.change})\n\n`;
    
    if (spotlight.spotlightStockArticles?.results?.length > 0) {
      const article = spotlight.spotlightStockArticles.results[0];
      section += `**What's happening:** ${article.title}\n\n`;
      if (article.content && article.content.length > 200) {
        section += `${article.content.substring(0, 400)}...\n\n`;
      }
      section += `**Why this matters:** This ${stock.changePercent > 0 ? 'surge' : 'drop'} in ${stock.name} `;
      section += `reflects broader market sentiment around ${this.getIndustryContext(stock.symbol)}. `;
      section += `With a market cap of $${(stock.marketCap / 1e6).toFixed(1)}M, moves like this `;
      section += `${stock.changePercent > 0 ? 'boost' : 'dampen'} investor confidence across the sector.\n\n`;
      section += `[Read the full story](${article.article_url})\n\n`;
    } else {
      section += `**The story:** ${stock.name} made headlines today with a ${Math.abs(stock.changePercent)}% `;
      section += `${stock.changePercent > 0 ? 'jump' : 'tumble'}, catching investors' attention. `;
      section += `This kind of move in a company with a $${(stock.marketCap / 1e6).toFixed(1)}M market cap `;
      section += `signals significant market forces at play.\n\n`;
    }
    
    section += `</div>\n`;
    return section;
  }

  private async generateICYMISection(): Promise<string> {
    const aiContent = await openaiService.generateICYMISection();
    const section = `<div class="icymi-section">
## ${brand.sections.special.ICYMI.name}

${aiContent}

</div>`;
    return section;
  }

  private async generateStatsSection(): Promise<string> {
    const aiContent = await openaiService.generateStatsSection();
    const section = `##${brand.sections.special.STATS_REPORTS.name}

${aiContent}`;
    
    return section;
  }

  private async generateQuickHitsSection(): Promise<string> {
    const aiContent = await openaiService.generateQuickHitsSection();
    const section = `##${brand.sections.special.QUICK_HITS.name}

${aiContent}`;
    
    return section;
  }

  private async generateCommunitySection(): Promise<string> {
    const prompt = getRandomCommunityPrompt();
    const aiResponses = await openaiService.generateCommunityResponses(prompt);
    
    const section = `<div class="community-section">
## ${brand.sections.special.COMMUNITY.name}

**This week's question:** ${prompt}

**Your responses made us smile:**

${aiResponses.map(response => `> ${response}`).join('\n\n')}

**Want to share your story?** Just reply to this email—we read every response and feature the best ones!

</div>`;
    
    return section;
  }

  private async generateRecommendationsSection(): Promise<string> {
    const aiContent = await openaiService.generateRecommendations();
    
    const section = `<div class="recommendations-section">
## ${brand.sections.special.RECS.name}

${aiContent}

</div>`;
    
    return section;
  }

  private async generateGamesSection(): Promise<string> {
    const aiContent = await openaiService.generateBusinessCrossword();
    
    const section = `## ${brand.sections.special.GAMES.name}

${aiContent}`;
    
    return section;
  }

  private async generateRealEstateSection(): Promise<string> {
    const todaysProperty = await openaiService.generateRealEstateProperty();
    
    const section = `<div class="real-estate-section">
## ${brand.sections.special.REAL_ESTATE.name}

**Guess the Price!**

📍 **${todaysProperty.location}**  
🛏️ ${todaysProperty.beds} bed, ${todaysProperty.baths} bath  
📐 ${todaysProperty.sqft.toLocaleString()} sq ft  

${todaysProperty.description}

**Your guess:**
${brand.realEstate.priceRanges.map(range => `[ ] ${range}`).join('  ')}

*We'll reveal the answer in tomorrow's newsletter!*

</div>`;
    
    return section;
  }

  private generateReferralSection(): string {
    const section = `<div class="referral-cta">
## 🚀 Love Morning Brief? Share the Wealth!

**${brand.cta.referral.text}**

Forward this newsletter to your smartest friends and colleagues. When they subscribe, you both win:

* **3 referrals:** Morning Brief sticker pack
* **5 referrals:** Exclusive business insights newsletter  
* **10 referrals:** Morning Brief coffee mug
* **25 referrals:** Private Discord community access

<a href="#" class="referral-button">Start Sharing →</a>

</div>`;
    
    return section;
  }

  private generateWordOfDaySection(): string {
    const wordData = getTodaysWordOfDay();
    
    if (!wordData) {
      return '';
    }
    
    const section = `<div class="word-of-day">
## ${brand.sections.special.WORD_OF_DAY.name}

**${wordData.word}** *(noun/verb)*

${wordData.definition}

*Submitted by ${wordData.reader}*

**Use it:** "The startup's **${wordData.word.toLowerCase()}** strategy paid off when they went public."

</div>`;
    
    return section;
  }

  private getMarketMood(indicators: any[]): string {
    const positiveCount = indicators.filter(i => i.changePercent > 0).length;
    const totalCount = indicators.length;
    const positiveRatio = positiveCount / totalCount;
    
    if (positiveRatio > 0.7) return "vibing high";
    if (positiveRatio > 0.5) return "cautiously optimistic";
    if (positiveRatio > 0.3) return "mixed but stable";
    return "feeling the pressure";
  }

  private getMarketCommentary(indicators: any[]): string {
    const comments = [
      "Investors are clearly caffeinated and ready to trade.",
      "The market's playing hard to get, but we're here for it.",
      "Someone definitely had their Wheaties this morning.",
      "It's giving 'quarterly earnings confidence' energy.",
      "The algos are doing their algorithmic thing."
    ];
    
    return comments[Math.floor(Math.random() * comments.length)] || comments[0] || "Market dynamics are in full swing.";
  }

  private getIndustryContext(symbol: string): string {
    const contexts: { [key: string]: string } = {
      'AAPL': 'consumer technology and iPhone demand',
      'TSLA': 'electric vehicles and sustainable energy',
      'AMZN': 'e-commerce and cloud computing dominance',
      'GOOGL': 'digital advertising and AI development',
      'MSFT': 'enterprise software and cloud services',
      'NVDA': 'AI chips and data center infrastructure'
    };
    
    return contexts[symbol] || 'the broader market landscape';
  }

  private async generateNewsletterWithImages(
    header: string, 
    mainContent: string, 
    closingSections: string
  ): Promise<string> {
    try {
      // Extract section names from the generated content
      const allContent = `${mainContent}\n${closingSections}`;
      const sectionNames = this.extractSectionNames(allContent);
      
      if (sectionNames.length > 0) {
        console.log(`🖼️ Fetching images for ${sectionNames.length} sections: ${sectionNames.join(', ')}`);
        
        // Fetch images for each section
        const sectionImages = await unsplashService.getImagesForSections(sectionNames);
        
        // Inject image data into content
        let enhancedContent = allContent;
        
        sectionImages.forEach((imageData, sectionName) => {
          if (imageData) {
            console.log(`✅ Got image for "${sectionName}": ${imageData.url}`);
            
            // Find the section header and inject image data right after it
            const sectionPattern = new RegExp(`^(🎯|🤖|📱|🎮|🌐|🏢|₿|🔥|🔗)\\s*${sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'gm');
            
            enhancedContent = enhancedContent.replace(sectionPattern, (match) => {
              return `${match}\n\n[IMAGE:${imageData.url}|ALT:${imageData.alt}|CREDIT:${imageData.credit}|LINK:${imageData.link}]`;
            });
          } else {
            console.log(`⚠️ No image available for "${sectionName}"`);
          }
        });
        
        return `${header}\n\n${enhancedContent}\n\n---\nQuestions? Reply to this email`;
      } else {
        console.log("⚠️ No sections found to add images to");
        return `${header}\n\n${allContent}\n\n---\nQuestions? Reply to this email`;
      }
    } catch (error) {
      console.error("❌ Error adding images to newsletter:", error);
      // Return original content if image integration fails
      return `${header}\n\n${mainContent}\n\n${closingSections}\n\n---\nQuestions? Reply to this email`;
    }
  }

  private extractSectionNames(content: string): string[] {
    const sectionRegex = /^(📈|🌍|🏢|⚡|🏛️|🚀|🔥|🔗)\s*([A-Z\s&]{3,})\s*$/gm;
    const sections: string[] = [];
    let match;
    
    while ((match = sectionRegex.exec(content)) !== null) {
      if (match[2]) {
        sections.push(match[2].trim());
      }
    }
    
    return sections;
  }

  private createFallbackNewsletter(articles: Article[]): string {
    const today = new Date().toLocaleDateString();

    let newsletter = `${today}\n\nMorning Brief\n\nHere are today's top global stories:\n\n`;

    articles.forEach((article, index) => {
      newsletter += `${index + 1}. ${article.title}\n`;
      newsletter += `${article.description}\n`;
      newsletter += `Source: ${article.source.name} | ${article.url}\n\n`;
    });

    newsletter += `That's all for today! See you tomorrow with more business news.`;

    return newsletter;
  }
}

export const contentProcessor = new ContentProcessor(); 