import pxToRem from "../functions/pxToRem.js";

const iconButton = {
  styleOverrides: {
    root: {
      color: "#667eea",
      borderRadius: pxToRem(8),
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",

      "&:hover": {
        backgroundColor: "rgba(102, 126, 234, 0.1)",
        transform: "scale(1.1)",
      },

      "&:active": {
        transform: "scale(0.95)",
      },

      "&.Mui-disabled": {
        opacity: 0.6,
        cursor: "not-allowed",
      },
    },

    sizeSmall: {
      padding: pxToRem(6),
    },

    sizeMedium: {
      padding: pxToRem(8),
    },

    sizeLarge: {
      padding: pxToRem(12),
    },
  },
};

export default iconButton;
