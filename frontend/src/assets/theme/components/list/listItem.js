const listItem = {
  styleOverrides: {
    root: {
      color: "#e0e0e0",
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",

      "&:hover": {
        backgroundColor: "rgba(102, 126, 234, 0.08)",
      },

      "&.Mui-selected": {
        backgroundColor: "rgba(102, 126, 234, 0.15)",

        "&:hover": {
          backgroundColor: "rgba(102, 126, 234, 0.2)",
        },
      },
    },
  },
};

export default listItem;
