function hexToRgb(hex) {
  return hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => {
    return `#${r}${r}${g}${g}${b}${b}`;
  })
    .substring(1)
    .match(/.{1,2}/g)
    .map((x) => parseInt(x, 16))
    .join(", ");
}

export default hexToRgb;
