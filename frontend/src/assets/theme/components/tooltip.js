import pxToRem from "../functions/pxToRem.js";

const tooltip = {
  styleOverrides: {
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      color: "#ffffff",
      fontSize: pxToRem(12),
      fontWeight: 500,
      padding: `${pxToRem(8)} ${pxToRem(12)}`,
      borderRadius: pxToRem(6),
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
    },

    arrow: {
      color: "rgba(0, 0, 0, 0.8)",
    },
  },
};

export default tooltip;
