export const createGradient = (color1, color2, angle = 135) => {
  return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
};
