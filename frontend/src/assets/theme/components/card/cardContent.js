import pxToRem from "../../functions/pxToRem.js";

const cardContent = {
  styleOverrides: {
    root: {
      padding: pxToRem(20),
      color: "#e0e0e0",

      "&:last-child": {
        paddingBottom: pxToRem(20),
      },
    },
  },
};

export default cardContent;
