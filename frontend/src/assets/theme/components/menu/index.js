import pxToRem from "../../functions/pxToRem.js";

const menu = {
  styleOverrides: {
    paper: {
      backgroundColor: "#1a1a2e",
      backgroundImage: "none",
      border: "1px solid rgba(102, 126, 234, 0.2)",
      borderRadius: pxToRem(8),
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
      marginTop: pxToRem(8),
    },

    list: {
      padding: `${pxToRem(8)} 0`,
    },
  },
};

export default menu;
