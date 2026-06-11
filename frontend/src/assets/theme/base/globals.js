import pxToRem from "../functions/pxToRem.js";

const globals = {
  body: {
    margin: 0,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: pxToRem(14),
    fontWeight: 400,
    lineHeight: 1.5,
    color: "#e0e0e0",
    backgroundColor: "#0f0f23",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",

    "&::-webkit-scrollbar": {
      width: "8px",
      height: "8px",
    },

    "&::-webkit-scrollbar-track": {
      background: "rgba(224, 224, 224, 0.1)",
    },

    "&::-webkit-scrollbar-thumb": {
      background: "rgba(102, 126, 234, 0.5)",
      borderRadius: "4px",

      "&:hover": {
        background: "rgba(102, 126, 234, 0.7)",
      },
    },
  },

  html: {
    scrollBehavior: "smooth",
  },

  a: {
    color: "#667eea",
    textDecoration: "none",
    transition: "color 0.3s cubic-bezier(0.4, 0, 0.2, 1)",

    "&:hover": {
      color: "#764ba2",
    },
  },

  button: {
    cursor: "pointer",
  },

  "*": {
    boxSizing: "border-box",
  },

  "*::before, *::after": {
    boxSizing: "border-box",
  },
};

export default globals;
