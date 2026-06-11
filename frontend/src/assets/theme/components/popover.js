import pxToRem from "../functions/pxToRem.js";

const popover = {
  styleOverrides: {
    paper: {
      backgroundColor: "#1a1a2e",
      backgroundImage: "none",
      border: "1px solid rgba(102, 126, 234, 0.2)",
      borderRadius: pxToRem(8),
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
    },
  },
};

export default popover;
