const tab = {
  styleOverrides: {
    root: {
      color: "#b0b0b0",
      textTransform: "none",
      fontWeight: 500,
      fontSize: "0.9375rem",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",

      "&:hover": {
        color: "#667eea",
      },

      "&.Mui-selected": {
        color: "#667eea",
        fontWeight: 600,
      },

      "&.Mui-disabled": {
        color: "rgba(224, 224, 224, 0.4)",
      },
    },
  },
};

export default tab;
