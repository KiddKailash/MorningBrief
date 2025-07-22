// Newsletter Brand Identity and Guidelines

export const brand = {
  // Brand Identity
  name: "TechPulse Daily",
  tagline: "Your daily dose of tech that matters",
  subtitle: "Curated tech news, delivered fresh every morning",

  // Brand Personality
  personality: {
    voice: "conversational", // How we communicate
    tone: "witty-but-informative", // Our attitude
    style: "morning-brew-inspired", // Our approach
    expertise: "tech-focused", // Our domain
  },

  // Newsletter Sections
  sections: {
    header: {
      greeting: "Good morning, tech innovators!",
      alternateGreetings: [
        "Morning, digital pioneers!",
        "Hello, future builders!",
        "Good morning, tech enthusiasts!",
        "Morning, innovation seekers!",
        "Hello, digital explorers!",
      ],
    },

    categories: {
      AI_INNOVATION: {
        name: "AI & INNOVATION",
        emoji: "🤖",
        description:
          "Artificial intelligence, biotech, and scientific breakthroughs",
      },
      MOBILE_DEVICES: {
        name: "MOBILE & DEVICES",
        emoji: "📱",
        description: "Smartphones, gadgets, and consumer tech",
      },
      GAMING: {
        name: "GAMING",
        emoji: "🎮",
        description: "Video games, esports, and gaming industry news",
      },
      PLATFORMS: {
        name: "PLATFORMS",
        emoji: "🌐",
        description: "Social media, online services, and digital platforms",
      },
      ENTERPRISE: {
        name: "ENTERPRISE",
        emoji: "🏢",
        description:
          "Business tech, enterprise software, and corporate innovation",
      },
      CRYPTO_WEB3: {
        name: "CRYPTO & WEB3",
        emoji: "₿",
        description: "Cryptocurrency, blockchain, and decentralized tech",
      },
    },
  },

  // Typography Scale
  typography: {
    newsletter: {
      title: {
        fontSize: "32px",
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
        fontSize: "20px",
        fontWeight: "bold",
        lineHeight: "1.3",
      },
      body: {
        fontSize: "16px",
        fontWeight: "normal",
        lineHeight: "1.6",
      },
      caption: {
        fontSize: "14px",
        fontWeight: "normal",
        lineHeight: "1.5",
      },
    },
  },

  // Email Styling
  email: {
    maxWidth: "1200px",
    padding: "20px",
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // Call-to-Action Styles
  cta: {
    primary: {
      text: "Read Full Article",
      style: "button",
    },
    secondary: {
      text: "Learn More",
      style: "link",
    },
  },
};

export const brandedGreeting = () => {
  const greetings = brand.sections.header.alternateGreetings;
  const randomGreeting =
    greetings[Math.floor(Math.random() * greetings.length)];
  return randomGreeting;
};

export const getCategoryInfo = (categoryKey: string) => {
  return (
    brand.sections.categories[
      categoryKey as keyof typeof brand.sections.categories
    ] || {
      name: "TECH NEWS",
      emoji: "💻",
      description: "Global news and updates",
    }
  );
};
