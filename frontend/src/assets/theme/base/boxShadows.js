import boxShadow from "../functions/boxShadow.js";

const boxShadows = {
  xs: boxShadow([0, 2], [4, 4], "0, 0, 0", 0.05),
  sm: boxShadow([0, 4], [8, 4], "0, 0, 0", 0.08),
  md: boxShadow([0, 8], [12, 8], "0, 0, 0", 0.12),
  lg: boxShadow([0, 12], [16, 12], "0, 0, 0", 0.16),
  xl: boxShadow([0, 16], [24, 16], "0, 0, 0", 0.2),
  xxl: boxShadow([0, 20], [32, 20], "0, 0, 0", 0.24),
  inset: "inset 0 0 20px rgba(0, 0, 0, 0.3)",

  // Neon glow effects
  neonCyan: "0 0 20px rgba(0, 212, 255, 0.5), 0 0 40px rgba(0, 212, 255, 0.3)",
  neonMagenta: "0 0 20px rgba(255, 0, 110, 0.5), 0 0 40px rgba(255, 0, 110, 0.3)",
  neonLime: "0 0 20px rgba(0, 255, 65, 0.5), 0 0 40px rgba(0, 255, 65, 0.3)",
  neonPurple: "0 0 20px rgba(164, 0, 255, 0.5), 0 0 40px rgba(164, 0, 255, 0.3)",
};

export default boxShadows;
