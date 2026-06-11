import pxToRem from "./functions/pxToRem.js";

// Gradient utilities for elegant, modern designs
export const createGradient = (color1, color2, angle = 135) => {
  return `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`;
};

// Neon glow effect utilities
export const createNeonGlow = (color, intensity = 0.5) => {
  const baseGlow = `0 0 20px rgba(${hexToRgb(color)}, ${intensity})`;
  const secondGlow = `0 0 40px rgba(${hexToRgb(color)}, ${intensity * 0.6})`;
  return `${baseGlow}, ${secondGlow}`;
};

// Convert hex color to RGB string for use in rgba()
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0, 0, 0";
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
};

// Spacing utilities
export const spacing = {
  xs: pxToRem(4),
  sm: pxToRem(8),
  md: pxToRem(12),
  lg: pxToRem(16),
  xl: pxToRem(24),
  xxl: pxToRem(32),
  xxxl: pxToRem(48),
};

// Border radius utilities
export const borderRadius = {
  xs: pxToRem(4),
  sm: pxToRem(6),
  md: pxToRem(8),
  lg: pxToRem(12),
  xl: pxToRem(16),
  xxl: pxToRem(20),
  xxxl: pxToRem(24),
};

// Transition utilities for consistent animations
export const transitions = {
  smooth: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  fast: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
  slow: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
};

// Common elevation shadows
export const elevations = {
  none: "none",
  sm: "0 2px 8px rgba(0, 0, 0, 0.15)",
  md: "0 8px 16px rgba(0, 0, 0, 0.2)",
  lg: "0 12px 32px rgba(0, 0, 0, 0.25)",
  xl: "0 16px 48px rgba(0, 0, 0, 0.3)",
};

// Neon color palette
export const neonColors = {
  cyan: "#00d4ff",
  magenta: "#ff006e",
  lime: "#00ff41",
  purple: "#a400ff",
  pink: "#ff1493",
  blue: "#0099ff",
};

// Primary gradients
export const gradients = {
  primary: createGradient("#667eea", "#764ba2"),
  secondary: createGradient("#00d4ff", "#667eea"),
  success: createGradient("#4caf50", "#81c784"),
  warning: createGradient("#ff9800", "#ffb74d"),
  error: createGradient("#f44336", "#ef5350"),
  neon: createGradient("#00d4ff", "#a400ff"),
};

export default {
  createGradient,
  createNeonGlow,
  spacing,
  borderRadius,
  transitions,
  elevations,
  neonColors,
  gradients,
};
