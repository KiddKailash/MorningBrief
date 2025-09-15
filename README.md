# Morning Brief Newsletter System

An automated morning newsletter service that gathers news from multiple sources, generates articles with AI, adds market data and images, and delivers polished newsletters to subscribers—all in 1–2 minutes. Preview a system-generated [newsletter](https://morning-brief-66541p5d1-kailashs-projects-1ccb175a.vercel.app/example/newsletter-categorized-preview-2025-09-09T08-27-08).

## How It Works

**Morning Brief** follows a content pipeline:

1. **Multi-Category Fetching** - Collects 60+ articles across 7 categories from Google News API
2. **Content Enrichment** - Scrapes full article content from original sources with quality validation
3. **AI Content Generation** - Uses OpenAI or Anthropic to create engaging, branded newsletter sections
4. **Market Integration** - Aggregates financial data from Financial Model Prep (FMP).
5. **Selects a newsworthy stock** by identifying the market’s most volatile movements using FMP. Candidates are filtered based on company size and size of the movement. For the top candidate, articles are fetched using gnews. If no articles are found, the process continues with the next candidate.
6. **Professional Templating** - Renders responsive HTML newsletters with consistent branding
7. **Smart Delivery** - Sends via Gmail SMTP with individual recipient handling for privacy

## Quick Start

### Prerequisites
- **Node.js 18+** with ES modules support
- **API Keys**: [Google News](https://gnews.io/), [OpenAI](https://openai.com/api/) or [Anthropic](https://www.anthropic.com/api), [Financial Model Prep](https://site.financialmodelingprep.com/developer/docs), [Polygon](https://polygon.io/), [Alpha Vantage](https://www.alphavantage.co/), [Unsplash](https://unsplash.com/developers)
- **Gmail Account** with app-specific password enabled

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**

   Create a `.env` file with these **required** variables:
   ```env
   # Core APIs (Required)
   GNEWS_API_KEY=your_gnews_api_key
   AI_PROVIDER=openai                     # 'openai' | 'anthropic'
   OPENAI_API_KEY=your_openai_key         # if using OpenAI
   ANTHROPIC_API_KEY=your_anthropic_key   # if using Anthropic

   # Email Configuration (Required)
   GMAIL_ADDRESS=your_email@gmail.com
   GMAIL_APP_PASS=your_gmail_app_password
   SUBSCRIBERS_LIST=email1@domain.com,email2@domain.com

   # Market Data APIs (Optional - for financial content)
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
   FMP_API_KEY=your_fmp_key
   POLYGON_API_KEY=your_polygon_key

   # Content Enhancement (Optional)
   UNSPLASH_API_KEY=your_unsplash_key

   # Content Configuration (Optional)
   GNEWS_NUM_ARTICLES=10
   GNEWS_CATEGORY=business
   GNEWS_COUNTRY=us
   INCLUDE_MARKET_DATA=true
   INCLUDE_IMAGES=true
   ```

3. **Test the system**
   ```bash
   # Generate preview without sending emails
   npm run preview

   # Send newsletter to all subscribers
   npm start
   ```

4. **View your newsletter**

   Open `previews/latest.html` in your browser to see the newsletter generated with ```npm run preview```.

## Project Architecture

```
src/
├── index.ts                 # Main CLI entry point with command handling
├── config/
│   ├── brand.ts             # Brand personality, colors, fonts, voice
│   └── settings.ts          # Environment validation and configuration
├── integrations/            # External API integrations
│   ├── ai.ts                # Unified AI provider (OpenAI/Anthropic)
│   ├── email.ts             # Gmail SMTP delivery with error handling
│   ├── gnews.ts             # Google News API with rate limiting
│   ├── marketData.ts        # Multi-source financial data aggregation
│   ├── scraper.ts           # Web scraping with content validation
│   └── unsplash.ts          # Image fetching with attribution
├── newsletter/              # Core newsletter generation logic
│   ├── fetchers.ts          # Data collection orchestration
│   ├── index.ts             # Newsletter class with send/preview methods
│   ├── sections.ts          # AI-powered content generation for all sections
│   └── template.ts          # HTML/plain text template rendering
└── types.ts                 # Comprehensive TypeScript definitions
```

## Available Commands

```bash
# Core Operations
npm start             # Send newsletter to all subscribers
npm run preview       # Generate HTML preview (no emails sent)
npm run test          # Generate test sections and display structure

# Development
npm run build         # Compile TypeScript to JavaScript
npm run clean         # Remove compiled output directory

# Code Quality (if configured)
npx eslint src/**/*.ts           # Run ESLint on TypeScript files
npx eslint src/**/*.ts --fix     # Auto-fix ESLint issues
npx tsc --noEmit                 # Type-check without compilation
```

## Configuration

### **Brand Customization**
Edit `src/config/brand.ts` to customize:
- Newsletter name and tagline
- Brand personality and voice
- Color scheme and typography
- Content sections and structure

### **AI Configuration**
The system supports both OpenAI and Anthropic:
- **OpenAI**: Uses GPT-4o-mini for cost-effective generation
- **Anthropic**: Uses Claude-3-haiku for reliable, consistent output
- Switch providers via `AI_PROVIDER` environment variable

### **Content Tuning**
Modify prompts in `src/newsletter/sections.ts` to adjust:
- Writing style and tone
- Section structure and length
- Brand voice consistency
- Content focus and themes

## Security & Privacy

- **Individual Email Delivery**: Each subscriber receives a separate email for privacy
- **Environment Variable Validation**: Ensures required configurations are present
- **API Key Protection**: Secure handling of sensitive credentials
- **Rate Limiting**: Prevents API abuse and maintains good standing

## Development Workflow

### **Preview System**
The preview system generates timestamped HTML files in the `previews/` directory:
- View `previews/latest.html` for the most recent newsletter
- Preview mode includes debugging information and interactive controls
- No emails are sent during preview generation

### **Error Handling**
The system continues operation even when individual components fail:
- Missing market data falls back to mock data
- Image fetching errors don't stop newsletter generation
- Individual email failures don't prevent sending to other subscribers

### **Code Quality**
- **ESLint + Prettier**: Enforced code formatting and quality
- **TypeScript Strict Mode**: Comprehensive type checking
- **Modular Design**: Clean separation of concerns for maintainability

## Newsletter Sections

**Morning Brief** generates comprehensive newsletters with:

- **Header**: AI-generated greeting with current events hook
- **Markets**: Real-time financial data with visual indicators
- **Stock Spotlight**: Algorithmic stock selection with analysis
- **Economy**: Business news with economic impact analysis
- **World**: International news with geopolitical context
- **Retail**: Consumer-focused technology and entertainment news
- **ICYMI**: "In Case You Missed It" with quirky business stories
- **Statistics**: Data-driven stories with business implications
- **News**: "What else is brewing" general business updates
- **Community**: Reader engagement and feedback
- **Recommendations**: Curated tools, books, and resources
- **Games**: Interactive content (real estate guessing game)
- **Word of the Day**: Business/finance vocabulary building
- **Footer**: Sign-off and subscription management

## 📄 License

Licensed (Proprietary) — © 15/09/2025 Kailash Kidd. See LICENSE in repository.
``