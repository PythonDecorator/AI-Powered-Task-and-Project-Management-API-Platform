const stepConnector = {
  styleOverrides: {
    root: {
      top: 10,
    },

    line: {
      borderColor: "rgba(102, 126, 234, 0.2)",
      borderTopWidth: 2,
    },

    lineVertical: {
      marginLeft: 12,
      paddingLeft: 12,
    },

    active: {
      "& .MuiStepConnector-line": {
        borderColor: "#667eea",
      },
    },

    completed: {
      "& .MuiStepConnector-line": {
        borderColor: "#4caf50",
      },
    },
  },
};

export default stepConnector;
