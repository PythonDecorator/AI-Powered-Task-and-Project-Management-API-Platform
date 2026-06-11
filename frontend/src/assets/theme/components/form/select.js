import pxToRem from "../../functions/pxToRem.js";

const select = {
  styleOverrides: {
    root: {
      "& .MuiOutlinedInput-root": {
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: pxToRem(8),

        "& fieldset": {
          borderColor: "rgba(102, 126, 234, 0.3)",
        },

        "&:hover fieldset": {
          borderColor: "rgba(102, 126, 234, 0.5)",
        },

        "&.Mui-focused fieldset": {
          borderColor: "#667eea",
        },
      },
    },
  },
};

export default select;
