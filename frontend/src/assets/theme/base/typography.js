import pxToRem from "../functions/pxToRem.js";

const typography = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,

  h1: {
    fontSize: pxToRem(32),
    fontWeight: 700,
    lineHeight: 1.25,
    letterSpacing: -0.5,
  },

  h2: {
    fontSize: pxToRem(28),
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: -0.25,
  },

  h3: {
    fontSize: pxToRem(24),
    fontWeight: 700,
    lineHeight: 1.35,
  },

  h4: {
    fontSize: pxToRem(20),
    fontWeight: 600,
    lineHeight: 1.4,
  },

  h5: {
    fontSize: pxToRem(16),
    fontWeight: 600,
    lineHeight: 1.5,
  },

  h6: {
    fontSize: pxToRem(14),
    fontWeight: 600,
    lineHeight: 1.6,
  },

  subtitle1: {
    fontSize: pxToRem(16),
    fontWeight: 500,
    lineHeight: 1.5,
  },

  subtitle2: {
    fontSize: pxToRem(14),
    fontWeight: 500,
    lineHeight: 1.6,
  },

  body1: {
    fontSize: pxToRem(14),
    fontWeight: 400,
    lineHeight: 1.6,
  },

  body2: {
    fontSize: pxToRem(13),
    fontWeight: 400,
    lineHeight: 1.5,
  },

  button: {
    fontSize: pxToRem(14),
    fontWeight: 600,
    lineHeight: 1.5,
    textTransform: "none",
  },

  caption: {
    fontSize: pxToRem(12),
    fontWeight: 500,
    lineHeight: 1.5,
    opacity: 0.7,
  },

  overline: {
    fontSize: pxToRem(11),
    fontWeight: 700,
    lineHeight: 1.5,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
};

export default typography;
