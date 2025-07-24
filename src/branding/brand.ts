// Newsletter Brand Identity and Guidelines

export const brand = {
  // Brand Identity
  name: "Morning Brief",
  tagline: "Smarter about business in just 5 minutes",
  subtitle: "Sharp takes on markets, money, and more—fresh with your coffee",

  // Brand Personality
  personality: {
    voice: "conversational", // How we communicate
    tone: "witty but informed", // Our attitude
    style: "morning-brew-inspired", // Our approach
    expertise: "business-focused", // Our domain
  },

  // Newsletter Sections
  sections: {
    header: {
      greeting: "Morning! Let's make sense of the markets.",
      alternateGreetings: [
        "Morning, coffee warriors!",
        "Hello, future millionaires!",
        "Top of the morning, market movers!",
        "Let's caffeinate and calculate.",
        "Morning, deal makers and dream chasers!",
        "Ready to brew some business knowledge?",
        "Morning, spreadsheet scholars!",
        "Time to percolate some profits!",
      ],
      seasonal: {
        spring: ["Spring has sprung, and so have stock prices!", "April showers bring May market powers!"],
        summer: ["Summer vibes and portfolio highs!", "Hot market takes for a hot summer day!"],
        fall: ["Fall into these market insights!", "Autumn leaves and portfolio achievements!"],
        winter: ["Winter wisdom for your wealth!", "Cold outside, hot takes inside!"]
      },
      astrology: [
        "Mercury's in microfinance, so let's talk money!",
        "The stars say buy low, sell high (shocking, we know).",
        "Venus is ascending, just like your portfolio!",
        "Mars is in the money house—time to invest!"
      ]
    },

    // Main content categories matching Morning Brief structure
    categories: {
      ENTERTAINMENT: {
        name: "ENTERTAINMENT",
        description: "Hollywood deals, streaming wars, and celeb business moves",
      },
      WORLD: {
        name: "WORLD",
        description: "Global business, international trade, and economic diplomacy",
      },
      TRAVEL: {
        name: "TRAVEL & TRANSPORTATION",
        description: "Airlines, hospitality, and the business of getting around",
      },
      MEDIA_TECH: {
        name: "MEDIA & TECH",
        description: "Digital disruption, social media trends, and tech titans",
      },
      REGULATION: {
        name: "REGULATION & POLICY",
        description: "Rules, regulations, and the intersection of policy and profit",
      },
      CRYPTO: {
        name: "CRYPTO & FINANCE",
        description: "Digital assets, fintech, and the future of money",
      },
      BUSINESS: {
        name: "BUSINESS & CORPORATE",
        description: "M&A, earnings, and the corporate soap opera",
      },
    },

    // Special sections for Morning Brief structure
    special: {
      MARKETS_SNAPSHOT: {
        name: "MARKETS SNAPSHOT",
        description: "Your daily dose of market data and financial indicators"
      },
      STOCK_SPOTLIGHT: {
        name: "STOCK SPOTLIGHT",
        description: "Deep dive into today's most notable market mover"
      },
      ICYMI: {
        name: "ICYMI (In Case You Missed It)",
        description: "Quick hits and quirky news nuggets"
      },
      STATS_REPORTS: {
        name: "STATS & REPORTS",
        description: "Data-driven insights and interesting statistics"
      },
      QUICK_HITS: {
        name: "QUICK HIT NEWS",
        description: "Bullet-point business briefs"
      },
      COMMUNITY: {
        name: "COMMUNITY CORNER",
        description: "Reader responses and community engagement"
      },
      RECS: {
        name: "RECOMMENDATIONS",
        description: "Things we love, endorse, or think you should try"
      },
      GAMES: {
        name: "GAMES & PUZZLES",
        description: "Daily crossword and interactive content"
      },
      REAL_ESTATE: {
        name: "OPEN HOUSE",
        description: "Guess the price on today's featured property"
      },
      WORD_OF_DAY: {
        name: "WORD OF THE DAY",
        description: "Expand your business vocabulary"
      },
      SPONSORED: {
        name: "PRESENTED BY",
        description: "Sponsored content that matches our editorial tone"
      }
    },

    // Editorial credits and team
    editorial: {
      writers: ["Alex Kleiner", "Toby Howell", "Ryan Duffy", "Cassandra Cassidy"],
      editors: ["Austin Rief", "Alex Lieberman"],
      credits: "Written by the Morning Brief team"
    },

    // Footer navigation links
    footer: {
      links: {
        webView: "View in browser",
        signUp: "Share with a Friend",
        shop: "Morning Brief Shop",
        podcasts: "Business Casual Podcast",
        advertising: "Advertise with us",
        unsubscribe: "Unsubscribe"
      }
    }
  },

  // Typography Scale
  typography: {
    newsletter: {
      title: {
        fontSize: "48px",
        fontWeight: "bold",
        lineHeight: "1.2",
      },
      subtitle: {
        fontSize: "18px",
        fontWeight: "normal",
        lineHeight: "1.4",
      },
      sectionHeader: {
        fontSize: "24px",
        fontWeight: "bold",
        lineHeight: "1.3",
      },
      articleTitle: {
        fontSize: "18px",
        fontWeight: "bold",
        lineHeight: "1.3",
      },
      body: {
        fontSize: "18px",
        fontWeight: "normal",
        lineHeight: "1.6",
      },
      caption: {
        fontSize: "12px",
        fontWeight: "normal",
        lineHeight: "1.5",
      },
    },
  },

  // Email Styling
  email: {
    maxWidth: "670px",
    padding: "0px",
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // Call-to-Action Styles
  cta: {
    primary: {
      text: "Read More, Worry Less",
      style: "button",
    },
    secondary: {
      text: "Catch the Full Story",
      style: "link",
    },
    referral: {
      text: "Earn swag and friends by sharing Morning Brief",
      style: "button"
    }
  },

  // Community prompts and engagement
  community: {
    weeklyPrompts: [
      "What's your boldest business prediction for this year?",
      "Share a money lesson you learned the hard way.",
      "What company do you think will surprise everyone in 2024?",
      "Tell us about your side hustle success story.",
      "What's the best business advice you've ever received?"
    ],
    responseCategories: ["Funny", "Heartwarming", "Insightful", "Bold"]
  },

  // Real estate game settings
  realEstate: {
    priceRanges: ["Under $500K", "$500K-$1M", "$1M-$2M", "$2M-$5M", "Over $5M"],
    revealFormat: "The answer: ${price} - ${percentCorrect}% of you guessed correctly!"
  }
};

export const brandedGreeting = () => {
  const greetings = brand.sections.header.alternateGreetings;
  const seasonal = getCurrentSeasonalGreeting();
  const astrology = brand.sections.header.astrology;
  
  // 60% chance regular greeting, 25% seasonal, 15% astrology
  const rand = Math.random();
  if (rand < 0.15) {
    return astrology[Math.floor(Math.random() * astrology.length)];
  } else if (rand < 0.4 && seasonal.length > 0) {
    return seasonal[Math.floor(Math.random() * seasonal.length)];
  } else {
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
};

const getCurrentSeasonalGreeting = (): string[] => {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return brand.sections.header.seasonal.spring;
  if (month >= 6 && month <= 8) return brand.sections.header.seasonal.summer;
  if (month >= 9 && month <= 11) return brand.sections.header.seasonal.fall;
  return brand.sections.header.seasonal.winter;
};

export const getCategoryInfo = (categoryKey: string) => {
  return (
    brand.sections.categories[
      categoryKey as keyof typeof brand.sections.categories
    ] || {
      name: "BUSINESS NEWS",
      description: "The business world, explained—without the jargon",
    }
  );
};

export const getSpecialSectionInfo = (sectionKey: string) => {
  return (
    brand.sections.special[
      sectionKey as keyof typeof brand.sections.special
    ] || {
      name: "BUSINESS UPDATE",
      description: "Important business updates and insights",
    }
  );
};

export const getRandomCommunityPrompt = (): string => {
  const prompts = brand.community.weeklyPrompts;
  if (!prompts || prompts.length === 0) {
    return "What's your boldest business prediction for this year?";
  }
  const randomIndex = Math.floor(Math.random() * prompts.length);
  return prompts[randomIndex] || prompts[0] || "What's your boldest business prediction for this year?";
};

export const getTodaysWordOfDay = () => {
  // Simple word rotation based on day of year
  const words = [
    { word: "Arbitrage", definition: "Buying and selling the same security in different markets to profit from price differences", reader: "Sarah from Chicago" },
    { word: "Capitalization", definition: "The total value of a company's shares, or the practice of funding with equity vs debt", reader: "Mike from Austin" },
    { word: "Diversification", definition: "Spreading investments across various assets to reduce risk", reader: "Lisa from Portland" },
    { word: "Equity", definition: "Ownership interest in a company, or the value of an asset minus debt against it", reader: "David from NYC" },
    { word: "Liquidity", definition: "How easily an asset can be converted to cash without affecting its price", reader: "Emma from Seattle" },
    { word: "Volatility", definition: "The degree of variation in a trading price over time", reader: "Carlos from Miami" },
    { word: "Yield", definition: "The income return on an investment, usually expressed as a percentage", reader: "Anna from Denver" }
  ];
  
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return words[dayOfYear % words.length];
};
