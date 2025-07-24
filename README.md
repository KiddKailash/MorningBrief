# Morning Brief Newsletter System

An automated newsletter system that fetches news articles, processes them with AI, and delivers formatted newsletters to subscribers.

## How It Works

1. **Fetch** latest news from GNews API
2. **Scrape** full article content from sources
3. **Process** content using OpenAI for engaging summaries
4. **Add** market data and relevant images
5. **Generate** HTML newsletter with branding
6. **Send** via Gmail to subscribers
7. **Schedule** automatically with cron jobs

## Quick Start

### Prerequisites
- Node.js 18+
- API keys: GNews, OpenAI, (optional) Unsplash
- Gmail account with app password

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   Create `.env` file:
   ```env
   GNEWS_API_KEY=your_gnews_api_key
   OPENAI_API_KEY=your_openai_api_key
   GMAIL_ADDRESS=your_gmail@gmail.com
   GMAIL_APP_PASS=your_gmail_app_password
   SUBSCRIBERS_LIST=email1@example.com,email2@example.com
   
   # Optional
   UNSPLASH_API_KEY=your_unsplash_api_key
   GNEWS_CATEGORY=business
   GNEWS_COUNTRY=us
   GNEWS_NUM_ARTICLES=10
   ```

3. **Run the system**
   ```bash
   # Send newsletter to subscribers
   npm start
   
   # Generate preview only (no emails)
   npm run preview
   
   # Generate editable preview for testing
   npm run preview:edit
   ```

4. **Automate daily newsletters**
   ```bash
   crontab src/jobs/cron
   ```

## Project Structure

```
src/
├── newsletter.ts              # Main entry point
├── core/                      # Core functionality
│   ├── articleFetcher.ts      # News fetching & scraping
│   ├── contentProcessor.ts    # AI content generation
│   ├── emailSender.ts         # Email delivery
│   └── newsletterPreview.ts   # Preview generation
├── services/                  # External API integrations
│   ├── gnewsService.ts        # GNews API
│   ├── scrapeArticle.ts       # Web scraping
│   ├── openaiService.ts       # OpenAI integration
│   ├── unsplashService.ts     # Image fetching
│   └── marketData.ts          # Financial data
├── branding/                  # Design & styling
│   ├── brand.ts               # Brand configuration
│   ├── colourScheme.ts        # Color themes
│   └── emailTemplate.ts       # HTML templates
└── types/                     # TypeScript definitions
    └── index.ts
```

## Customization

### Brand Settings
Edit `src/branding/brand.ts` to customize:
- Newsletter name and personality
- Content sections and categories
- Greeting styles

### Visual Design
Modify `src/branding/colourScheme.ts` and `src/branding/emailTemplate.ts` for:
- Color schemes
- Template layout
- Typography

### Content Processing
Adjust AI prompts in `src/services/openaiService.ts` to change content style and tone.

## Development

### Testing Mode
The system includes dummy data for development. Switch between test and production modes in `newsletter.ts`.

### Preview System
- `npm run preview` - Static HTML preview
- `npm run preview:edit` - Interactive preview for testing

### Build & Deploy
```bash
npm run build        # Build for production
npm run start:prod   # Run production build
```

## Features

- **Automated Content**: AI-powered article summarization
- **Market Integration**: Real-time financial data
- **Professional Design**: Responsive HTML templates
- **Reliable Delivery**: Gmail SMTP with error handling
- **Easy Scheduling**: Cron-based automation
- **Development Tools**: Preview mode and dummy data
- **Customizable**: Configurable branding and content 