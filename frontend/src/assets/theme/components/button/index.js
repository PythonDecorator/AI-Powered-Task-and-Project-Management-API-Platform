import pxToRem from "../../functions/pxToRem.js";

const button = {
  defaultProps: {
    disableRipple: false,
  },

  styleOverrides: {
    root: {
      fontSize: pxToRem(14),
      fontWeight: 600,
      textTransform: "none",
      padding: `${pxToRem(8)} ${pxToRem(20)}`,
      borderRadius: pxToRem(8),
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",

      "&:hover": {
        transform: "translateY(-2px)",
      },

      "&:active": {
        transform: "translateY(0)",
      },

      "&:disabled": {
        opacity: 0.6,
        cursor: "not-allowed",
      },
    },

    contained: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      boxShadow: "0 8px 16px rgba(102, 126, 234, 0.3)",
      color: "#ffffff",

      "&:hover": {
        boxShadow: "0 12px 24px rgba(102, 126, 234, 0.4)",
      },
    },

    outlined: {
      borderColor: "rgba(102, 126, 234, 0.5)",
      color: "#667eea",
      border: "1px solid rgba(102, 126, 234, 0.5)",

      "&:hover": {
        backgroundColor: "rgba(102, 126, 234, 0.08)",
        borderColor: "#667eea",
      },
    },

    text: {
      color: "#667eea",

      "&:hover": {
        backgroundColor: "rgba(102, 126, 234, 0.08)",
      },
    },

    sizeLarge: {
      padding: `${pxToRem(12)} ${pxToRem(28)}`,
      fontSize: pxToRem(16),
    },

    sizeSmall: {
      padding: `${pxToRem(6)} ${pxToRem(16)}`,
      fontSize: pxToRem(12),
    },
  },
};

export default button;
