const switchButton = {
  styleOverrides: {
    root: {
      width: 48,
      height: 26,
      padding: 0,

      "& .MuiSwitch-switchBase": {
        padding: 3,

        "&.Mui-checked": {
          color: "#667eea",

          "& + .MuiSwitch-track": {
            backgroundColor: "rgba(102, 126, 234, 0.3)",
          },
        },
      },

      "& .MuiSwitch-track": {
        backgroundColor: "rgba(102, 126, 234, 0.15)",
        borderRadius: 13,
      },

      "& .MuiSwitch-thumb": {
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
      },
    },
  },
};

export default switchButton;
