function boxShadow(offset = [], radius = [], color = "", opacity = 0.16) {
  const [x, y] = offset;
  const [blur, spread] = radius;

  return `${x}px ${y}px ${blur}px ${spread}px rgb(${color} / ${opacity})`;
}

export default boxShadow;
