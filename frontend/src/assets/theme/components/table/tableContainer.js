import pxToRem from "../../functions/pxToRem.js";

const tableContainer = {
  styleOverrides: {
    root: {
      backgroundColor: "#1a1a2e",
      backgroundImage: "none",
      border: "1px solid rgba(102, 126, 234, 0.15)",
      borderRadius: pxToRem(8),
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    },
  },
};

export default tableContainer;
