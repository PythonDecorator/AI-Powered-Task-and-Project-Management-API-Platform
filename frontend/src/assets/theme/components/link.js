const link = {
  defaultProps: {
    underline: "hover",
  },

  styleOverrides: {
    root: {
      color: "#667eea",
      textDecoration: "none",
      transition: "color 0.3s cubic-bezier(0.4, 0, 0.2, 1)",

      "&:hover": {
        color: "#764ba2",
        textDecoration: "underline",
      },
    },
  },
};

export default link;
