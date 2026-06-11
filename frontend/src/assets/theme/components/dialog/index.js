import pxToRem from "../../functions/pxToRem.js";

const dialog = {
  styleOverrides: {
    paper: {
      backgroundColor: "#1a1a2e",
      backgroundImage: "none",
      border: "1px solid rgba(102, 126, 234, 0.2)",
      borderRadius: pxToRem(12),
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(102, 126, 234, 0.1)",
      backdropFilter: "blur(10px)",
    },
  },
};

export default dialog;
