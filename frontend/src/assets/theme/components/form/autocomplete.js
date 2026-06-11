import pxToRem from "../../functions/pxToRem.js";

const autocomplete = {
  styleOverrides: {
    root: {
      "& .MuiOutlinedInput-root": {
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: pxToRem(8),
      },
    },

    paper: {
      backgroundColor: "#1a1a2e",
      backgroundImage: "none",
      border: "1px solid rgba(102, 126, 234, 0.2)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
      marginTop: pxToRem(8),
    },

    option: {
      color: "#e0e0e0",

      "&:hover": {
        backgroundColor: "rgba(102, 126, 234, 0.1)",
      },

      "&[aria-selected='true']": {
        backgroundColor: "rgba(102, 126, 234, 0.2)",
      },
    },
  },
};

export default autocomplete;
