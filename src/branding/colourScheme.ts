// Material-UI Inspired Newsletter Color Scheme

export const colors = {
  // Primary Brand Colors (Material-UI Primary)
  primary: {
    main: "#1976d2", // Material-UI primary main
    dark: "#1565c0", // Material-UI primary dark
    light: "#42a5f5", // Material-UI primary light
    contrastText: "#fff", // Material-UI contrast text
  },

  // Secondary Colors (Material-UI Secondary)
  secondary: {
    main: "#9c27b0", // Material-UI secondary main
    dark: "#7b1fa2", // Material-UI secondary dark
    light: "#ba68c8", // Material-UI secondary light
    contrastText: "#fff", // Material-UI contrast text
  },

  // Accent Colors (Material-UI Semantic Colors)
  accent: {
    warning: "#ed6c02", // Material-UI warning main
    warningLight: "#ff9800", // Material-UI warning light
    success: "#2e7d32", // Material-UI success main
    successLight: "#4caf50", // Material-UI success light
    error: "#d32f2f", // Material-UI error main
    errorLight: "#ef5350", // Material-UI error light
    info: "#0288d1", // Material-UI info main
    infoLight: "#03a9f4", // Material-UI info light
  },

  // Material-UI Grey Palette
  neutral: {
    white: "#ffffff",
    gray50: "#fafafa", // Material-UI grey 50
    gray100: "#f5f5f5", // Material-UI grey 100
    gray200: "#eeeeee", // Material-UI grey 200
    gray300: "#e0e0e0", // Material-UI grey 300
    gray400: "#bdbdbd", // Material-UI grey 400
    gray500: "#9e9e9e", // Material-UI grey 500
    gray600: "#757575", // Material-UI grey 600
    gray700: "#616161", // Material-UI grey 700
    gray800: "#424242", // Material-UI grey 800
    gray900: "#212121", // Material-UI grey 900
    black: "#000000", // Material-UI common black
  },

  // Material-UI Text Colors
  text: {
    primary: "rgba(0, 0, 0, 0.87)", // Material-UI text primary
    secondary: "rgba(0, 0, 0, 0.6)", // Material-UI text secondary
    disabled: "rgba(0, 0, 0, 0.38)", // Material-UI text disabled
    inverse: "#ffffff", // White text on dark backgrounds
  },

  // Material-UI Background Colors
  background: {
    default: "#ffffff", // Material-UI background default
    paper: "#ffffff", // Material-UI background paper
    newsletter: "#fafafa", // Light grey for newsletter wrapper
  },

  // Material-UI Action Colors
  action: {
    active: "rgba(0, 0, 0, 0.54)",
    hover: "rgba(0, 0, 0, 0.04)",
    selected: "rgba(0, 0, 0, 0.08)",
    disabled: "rgba(0, 0, 0, 0.26)",
    disabledBackground: "rgba(0, 0, 0, 0.12)",
    focus: "rgba(0, 0, 0, 0.12)",
  },

  // Material-UI Divider
  divider: "rgba(0, 0, 0, 0.12)",
};

export const gradients = {
  primary: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
  secondary: `linear-gradient(135deg, ${colors.secondary.main} 0%, ${colors.secondary.dark} 100%)`,
  accent: `linear-gradient(135deg, ${colors.accent.warning} 0%, ${colors.accent.error} 100%)`,
  newsletter: `linear-gradient(135deg, ${colors.primary.light} 0%, ${colors.secondary.light} 100%)`,
  success: `linear-gradient(135deg, ${colors.accent.success} 0%, ${colors.accent.successLight} 100%)`,
  warning: `linear-gradient(135deg, ${colors.accent.warning} 0%, ${colors.accent.warningLight} 100%)`,
  info: `linear-gradient(135deg, ${colors.accent.info} 0%, ${colors.accent.infoLight} 100%)`,
};

// Material-UI Box Shadows
export const shadows = [
  "none",
  "0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)",
  "0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)",
  "0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)",
  "0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)",
  "0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)",
  "0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)",
];

// Material-UI Border Radius
export const borderRadius = {
  xs: "4px", // Material-UI default border radius
  sm: "6px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  round: "50%",
};
