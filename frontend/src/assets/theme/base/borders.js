import pxToRem from "../functions/pxToRem.js";

const borders = {
  borderColor: "rgba(224, 224, 224, 0.12)",
  borderWidth: pxToRem(1),
  borderRadius: {
    xs: pxToRem(4),
    sm: pxToRem(6),
    md: pxToRem(8),
    lg: pxToRem(12),
    xl: pxToRem(16),
    xxl: pxToRem(20),
    xxxl: pxToRem(24),
  },
};

export default borders;
