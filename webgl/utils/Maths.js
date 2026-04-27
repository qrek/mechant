export function lerp (x, y, t) {
  return (1 - t) * x + t * y
}

export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max)
}
