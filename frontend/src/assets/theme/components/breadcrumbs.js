const breadcrumbs = {
  styleOverrides: {
    root: {
      color: "#b0b0b0",

      "& a": {
        color: "#667eea",
        cursor: "pointer",

        "&:hover": {
          color: "#764ba2",
          textDecoration: "underline",
        },
      },
    },

    separator: {
      color: "rgba(224, 224, 224, 0.3)",
      margin: "0 8px",
    },

    li: {
      color: "#b0b0b0",

      "&.active": {
        color: "#e0e0e0",
      },
    },
  },
};

export default breadcrumbs;
