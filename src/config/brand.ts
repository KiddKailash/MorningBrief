/**
 * Brand Configuration
 *
 * Minimal brand configuration - most text is AI-generated
 */

export const brand = {
  // Core Brand Identity (minimal required config)
  name: "Morning Brief",

  // Brand Voice Guidelines (for AI generation)
  personality: {
    tone: "witty, sarcastic, relatable, concise, and informed",
    expertise: "business-focused",
    political: "left-centrist",
  },

  // Visual Design (keep these as they're styling, not content)
  colors: {
    primary: "#1976d2", // Blue
    secondary: "#202124", // Dark gray
    border: "#eeeeee", // Light gray for borders

    background: {
      primary: "#ffffff", // Light gray
      paper: "#fafafa", // Very light gray
    },

    text: {
      primary: "rgba(0, 0, 0, 0.87)", // Dark gray
      secondary: "rgba(0, 0, 0, 0.6)", // Medium gray
      hover: "rgba(0, 0, 0, 0.04)", // Very light gray for hover
    },
    
    stock: {
      profit: {
        text: "#0b8a3e", // Strong green for positive change
        background: "#e6f4ea", // Very light green background
      },
      loss: {
        text: "#c0392b", // Strong red for negative change
        background: "#fdecea", // Very light red background
      },
      neutral: {
        text: "#555555", // Muted dark gray for neutral
        background: "#f3f3f3", // Very light gray background
      },
    },
  },

  shapes: {
    border: "8px",
  },

  fonts: {
    size: "18px",
    heading:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    body: "Georgia, 'Times New Roman', serif",
  },
};
