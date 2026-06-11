import pxToRem from "../functions/pxToRem.js";

const avatar = {
  styleOverrides: {
    root: {
      backgroundColor: "#667eea",
      color: "#ffffff",
      fontSize: pxToRem(14),
      fontWeight: 600,
    },

    colorDefault: {
      backgroundColor: "rgba(102, 126, 234, 0.3)",
      color: "#667eea",
    },

    img: {
      objectFit: "cover",
    },
  },
};

export default avatar;
