import pxToRem from "../functions/pxToRem.js";

const container = {
  maxWidth: pxToRem(1280),
  margin: "0 auto",
  padding: `0 ${pxToRem(24)}`,

  "@media (max-width: 600px)": {
    padding: `0 ${pxToRem(16)}`,
  },

  "@media (max-width: 960px)": {
    padding: `0 ${pxToRem(20)}`,
  },
};

export default container;
