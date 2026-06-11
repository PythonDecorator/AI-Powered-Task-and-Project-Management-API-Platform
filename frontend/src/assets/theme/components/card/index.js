import pxToRem from "../../functions/pxToRem.js";

const card = {
  styleOverrides: {
    root: {
      backgroundColor: "#1a1a2e",
      backgroundImage: "none",
      border: "1px solid rgba(102, 126, 234, 0.2)",
      borderRadius: pxToRem(12),
      boxShadow: "0 8px 16px rgba(0, 0, 0, 0.3)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",

      "&:hover": {
        boxShadow: "0 12px 32px rgba(102, 126, 234, 0.2), 0 0 20px rgba(0, 212, 255, 0.1)",
        borderColor: "rgba(102, 126, 234, 0.4)",
        transform: "translateY(-4px)",
      },
    },
  },
};

export default card;
