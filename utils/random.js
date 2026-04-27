export function random (min, max) {
  return Math.random() * (max - min) + min
}

export function randomInt (min, max, excluded = []) {
  const r = Math.floor(Math.random() * (max - min + 1) + min)

  if (excluded.includes(r)) return randomInt(min, max, excluded)

  return r
}
