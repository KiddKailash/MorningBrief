/**
 * Application Settings
 * 
 * Central configuration for all app settings
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const settings = {
  // API Keys
  apis: {
    gnews: process.env['GNEWS_API_KEY'] || '',
    openai: process.env['OPENAI_API_KEY'] || '',
    anthropic: process.env['ANTHROPIC_API_KEY'] || '',
    unsplash: process.env['UNSPLASH_API_KEY'] || ''
  },
  
  // AI Provider Configuration
  ai: {
    provider: (process.env['AI_PROVIDER'] || 'openai').toLowerCase() as 'openai' | 'anthropic'
  },
  
  // Email Configuration
  email: {
    address: process.env['GMAIL_ADDRESS'] || '',
    password: process.env['GMAIL_APP_PASS'] || '',
    subscribers: (process.env['SUBSCRIBERS_LIST'] || '').split(',').map(e => e.trim())
  },
  
  // Content Settings
  content: {
    numArticles: parseInt(process.env['GNEWS_NUM_ARTICLES'] || '10'),
    category: process.env['GNEWS_CATEGORY'] || 'business',
    country: process.env['GNEWS_COUNTRY'] || 'us',
    language: process.env['GNEWS_LANGUAGE'] || 'en'
  },
  
  // Feature Flags
  features: {
    includeMarketData: process.env['INCLUDE_MARKET_DATA'] !== 'false',
    includeImages: process.env['INCLUDE_IMAGES'] !== 'false',
    debugMode: process.env['DEBUG'] === 'true'
  }
};

// Validate required settings
export function validateSettings() {
  // Determine which AI provider API key is required
  const aiProviderKey = settings.ai.provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY';
  const aiProviderPath = settings.ai.provider === 'anthropic' ? 'apis.anthropic' : 'apis.openai';
  
  const required = [
    { key: 'apis.gnews', name: 'GNEWS_API_KEY' },
    { key: aiProviderPath, name: aiProviderKey },
    { key: 'email.address', name: 'GMAIL_ADDRESS' },
    { key: 'email.password', name: 'GMAIL_APP_PASS' }
  ];
  
  const missing = required.filter(({ key }) => {
    const value = key.split('.').reduce((obj, k) => obj?.[k], settings as any);
    return !value;
  });
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.map(m => m.name).join(', ')}`
    );
  }
}