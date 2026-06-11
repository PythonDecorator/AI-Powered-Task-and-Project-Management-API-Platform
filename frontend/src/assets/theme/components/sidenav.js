import pxToRem from "../functions/pxToRem.js";

const sidenav = {
  styleOverrides: {
    paper: {
      backgroundColor: "#1a1a2e",
      backgroundImage: "none",
      border: "1px solid rgba(102, 126, 234, 0.1)",
      borderRight: "1px solid rgba(102, 126, 234, 0.1)",
      boxShadow: "2px 0 8px rgba(0, 0, 0, 0.3)",
      width: pxToRem(260),
    },

    paperAnchorLeft: {
      left: 0,
    },

    paperAnchorRight: {
      right: 0,
    },

    root: {
      backgroundColor: "#1a1a2e",
    },

    docked: {
      height: "100%",
    },
  },
};

export default sidenav;
