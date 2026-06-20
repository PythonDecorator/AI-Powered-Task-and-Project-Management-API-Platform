export const createGradient = (color1, color2, angle = 135) => {
  return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
};

export const createNeonGlow = (color, opacity = 0.5) => {
  return `0 0 10px ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}, 0 0 20px ${color}${Math.round(opacity * 128).toString(16).padStart(2, '0')}, inset 0 0 10px ${color}${Math.round(opacity * 50).toString(16).padStart(2, '0')}`;
};
