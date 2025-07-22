// Centralized branding exports for easy importing

export { colors, gradients } from "./colourScheme";
export { brand, brandedGreeting, getCategoryInfo } from "./brand";
export {
  createNewsletterHTML,
  formatContentForEmail,
  type EmailTemplateOptions,
} from "./emailTemplate";

// Quick access to key brand elements
export const BRAND_NAME = "TechPulse Daily";
export const BRAND_TAGLINE = "Your daily dose of tech that matters";
export const BRAND_COLORS = {
  primary: "#1976d2", // Material-UI primary
  secondary: "#9c27b0", // Material-UI secondary
  accent: "#ed6c02", // Material-UI warning (for CTAs)
  success: "#2e7d32", // Material-UI success
  error: "#d32f2f", // Material-UI error
  text: "rgba(0, 0, 0, 0.87)", // Material-UI text primary
};
