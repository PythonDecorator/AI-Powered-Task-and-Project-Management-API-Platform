import pxToRem from "../../functions/pxToRem.js";

const input = {
  styleOverrides: {
    root: {
      "& .MuiOutlinedInput-root": {
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(102, 126, 234, 0.3)",
        borderRadius: pxToRem(8),
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",

        "& fieldset": {
          borderColor: "rgba(102, 126, 234, 0.3)",
        },

        "&:hover fieldset": {
          borderColor: "rgba(102, 126, 234, 0.5)",
        },

        "&.Mui-focused fieldset": {
          borderColor: "#667eea",
          boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
        },

        "& input": {
          color: "#e0e0e0",

          "&::placeholder": {
            color: "rgba(224, 224, 224, 0.5)",
            opacity: 1,
          },
        },
      },
    },
  },
};

export default input;
