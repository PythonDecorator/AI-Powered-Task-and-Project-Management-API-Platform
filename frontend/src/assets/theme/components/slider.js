const slider = {
  styleOverrides: {
    root: {
      color: "#667eea",
    },

    rail: {
      backgroundColor: "rgba(102, 126, 234, 0.2)",
    },

    track: {
      backgroundColor: "#667eea",
      border: "none",
    },

    thumb: {
      backgroundColor: "#667eea",
      border: "2px solid #1a1a2e",

      "&:hover, &.Mui-focusVisible": {
        boxShadow: "0 0 0 8px rgba(102, 126, 234, 0.16)",
      },
    },

    mark: {
      backgroundColor: "rgba(102, 126, 234, 0.3)",
    },

    markActive: {
      backgroundColor: "#667eea",
    },
  },
};

export default slider;
