# News Newsletter System

A sophisticated newsletter generation system that automatically fetches news articles, processes them with AI, and delivers beautifully formatted newsletters to subscribers. Inspired by Morning Brew's format and style.

## 🎯 System Overview

This system orchestrates a complete newsletter workflow:
1. **Fetch** latest news articles from GNews API
2. **Scrape** full article content from source websites
3. **Process** content using OpenAI to generate engaging newsletter sections
4. **Integrate** market data, images, and branding elements
5. **Generate** HTML newsletters with preview capabilities
6. **Deliver** via Gmail to subscriber list
7. **Automate** the entire process with cron scheduling

## 📁 Project Structure

### Root Configuration Files
- **`package.json`** - Project dependencies, scripts, and metadata
- **`package-lock.json`** - Locked dependency versions for consistency
- **`tsconfig.json`** - TypeScript compilation configuration
- **`.gitignore`** - Version control exclusions
- **`previews/`** - Generated HTML preview files for testing
- **`public/`** - Static assets (fonts, images) for newsletter templates

### Core System (`src/`)

#### 🚀 Main Entry Point
- **`newsletter.ts`** - Central orchestrator that coordinates the entire newsletter generation and delivery process. Validates environment, fetches articles, processes content, and sends emails. Supports preview mode for testing.

#### 🏗️ Core Architecture (`src/core/`)
- **`articleFetcher.ts`** - Orchestrates the article acquisition process by fetching from GNews API and scraping full content from source websites
- **`contentProcessor.ts`** - AI-powered content generation engine that transforms raw articles into engaging newsletter sections using OpenAI, integrates market data, and applies branding
- **`emailSender.ts`** - Email delivery system that handles Gmail SMTP configuration, subscriber management, and newsletter distribution
- **`newsletterPreview.ts`** - Preview generation system that creates HTML files for testing and review before sending to subscribers

#### 🔌 External Services (`src/services/`)
- **`gnewsService.ts`** - GNews API integration for fetching latest news articles by category and country
- **`scrapeArticle.ts`** - Web scraping service that extracts full article content from news websites using Cheerio
- **`openaiService.ts`** - OpenAI API integration for AI-powered content generation, summarization, and newsletter section creation
- **`unsplashService.ts`** - Unsplash API integration for fetching relevant stock images for newsletter sections
- **`marketData.ts`** - Financial data aggregation service that fetches stock prices, market indices, and financial metrics

#### 🎨 Branding & Design (`src/branding/`)
- **`brand.ts`** - Brand identity configuration including newsletter name, personality, section definitions, and content prompts
- **`colourScheme.ts`** - Color palette and theming system for consistent visual identity
- **`emailTemplate.ts`** - HTML email template system with responsive design and brand styling

#### 📊 Data Types (`src/types/`)
- **`index.ts`** - TypeScript type definitions for articles, API responses, configuration objects, and system interfaces

#### 🧪 Development & Testing (`src/dummydata/`)
- **`articleFetcher.js`** - Mock article data for development and testing without API calls
- **`marketData.js`** - Sample market data for testing financial sections

#### ⏰ Automation (`src/jobs/`)
- **`cron`** - Cron job configuration that schedules automatic newsletter generation daily at 8 AM

#### 🛠️ Utilities (`src/scripts/`)
- Empty directory reserved for utility scripts and one-off tools

## 🔄 System Workflow

### 1. Article Acquisition Pipeline
```
GNews API → Article Metadata → Web Scraping → Full Content → Content Validation
```
- `gnewsService.ts` fetches article metadata from GNews API
- `scrapeArticle.ts` extracts full article content from source URLs
- `articleFetcher.ts` orchestrates and validates the entire process

### 2. Content Processing Engine
```
Raw Articles + Market Data → OpenAI Processing → Branded Sections → Newsletter HTML
```
- `contentProcessor.ts` coordinates AI-powered content generation
- `openaiService.ts` transforms articles into engaging newsletter sections
- `marketData.ts` provides financial context and market snapshots
- `brand.ts` and templates apply consistent styling and voice

### 3. Delivery System
```
Newsletter Content → Gmail SMTP → Subscriber List → Email Delivery
```
- `emailSender.ts` handles SMTP configuration and email distribution
- Supports both individual and batch sending
- Includes delivery validation and error handling

### 4. Preview & Testing
```
Content Generation → HTML Preview → Browser Testing → Production Deployment
```
- `newsletterPreview.ts` creates local HTML files for review
- Supports both static and editable preview modes
- Enables testing without sending emails

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- TypeScript
- API keys for GNews, OpenAI, and Unsplash
- Gmail account with app password

### Environment Variables
Create a `.env` file with:

```env
# Required
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

### Installation & Usage

```bash
# Install dependencies
npm install

# Generate newsletter and send to subscribers
npm start

# Generate preview only (no emails sent)
npm run preview

# Generate editable preview for testing
npm run preview:edit

# Build for production
npm run build

# Run production build
npm run start:prod
```

### Automation Setup
The system includes cron scheduling for automatic daily newsletters:
```bash
# Install the cron job (runs daily at 8 AM)
crontab src/jobs/cron
```

## 🎨 Customization

### Brand Configuration
Modify `src/branding/brand.ts` to customize:
- Newsletter name and tagline
- Brand personality and voice
- Section definitions and categories
- Greeting variations and seasonal content

### Visual Design
Update `src/branding/colourScheme.ts` and `src/branding/emailTemplate.ts` to customize:
- Color palette and themes
- HTML template structure
- Typography and spacing
- Mobile responsiveness

### Content Processing
Adjust AI prompts and processing logic in:
- `src/services/openaiService.ts` - AI generation prompts
- `src/core/contentProcessor.ts` - Content organization and flow

## 🔧 Development Features

### Testing Mode
The system uses dummy data during development:
- `src/dummydata/articleFetcher.js` - Mock articles for testing
- `src/dummydata/marketData.js` - Sample financial data
- Switch to production mode by uncommenting API calls in `newsletter.ts`

### Preview System
Generate HTML previews without sending emails:
- **Static Preview**: `npm run preview` - Read-only HTML file
- **Editable Preview**: `npm run preview:edit` - Interactive testing interface

### Error Handling
Comprehensive error handling throughout:
- Environment validation
- API rate limiting and retry logic
- Graceful failure handling
- Detailed logging and debugging information

## 📈 Architecture Benefits

### Modular Design
- **Separation of Concerns**: Each service handles a specific responsibility
- **Scalability**: Easy to add new content sources or delivery methods
- **Maintainability**: Clear boundaries between components
- **Testability**: Mock services for development and testing

### Production Ready
- **Error Handling**: Comprehensive error catching and recovery
- **Monitoring**: Detailed logging and process tracking
- **Automation**: Cron-based scheduling for hands-off operation
- **Configuration**: Environment-based settings for different deployments

### Content Quality
- **AI Enhancement**: OpenAI integration for engaging content generation
- **Brand Consistency**: Centralized branding and style guidelines
- **Multi-source**: Combines news, market data, and curated content
- **Visual Appeal**: Professional HTML templates with image integration

This system represents a complete, production-ready newsletter solution that can be easily customized, deployed, and maintained for delivering high-quality automated newsletters to subscribers. 