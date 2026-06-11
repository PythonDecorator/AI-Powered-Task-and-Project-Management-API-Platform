import pxToRem from "../functions/pxToRem.js";

const appBar = {
  styleOverrides: {
    root: {
      backgroundColor: "#1a1a2e",
      backgroundImage: "none",
      border: "1px solid rgba(102, 126, 234, 0.1)",
      borderRadius: 0,
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
      padding: `${pxToRem(16)} ${pxToRem(24)}`,
    },

    colorPrimary: {
      backgroundColor: "#1a1a2e",
      color: "#e0e0e0",
    },
  },
};

export default appBar;
