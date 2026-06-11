const menuItem = {
  styleOverrides: {
    root: {
      color: "#e0e0e0",
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",

      "&:hover": {
        backgroundColor: "rgba(102, 126, 234, 0.1)",
        color: "#667eea",
      },

      "&.Mui-selected": {
        backgroundColor: "rgba(102, 126, 234, 0.15)",
        color: "#667eea",
        fontWeight: 500,

        "&:hover": {
          backgroundColor: "rgba(102, 126, 234, 0.2)",
        },
      },

      "&.Mui-disabled": {
        opacity: 0.5,
        cursor: "not-allowed",
      },
    },
  },
};

export default menuItem;
