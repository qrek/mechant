export const DOMScale = (camera, size = { x: window.innerWidth, y: window.innerHeight }, screen = { x: window.innerWidth, y: window.innerHeight }) => {
  const vp = DOMViewport(camera)

  const x = size.x / screen.x * vp.x
  const y = size.y / screen.y * vp.y

  return { x, y, z: 1 }
}

export const DOMPosition = (camera, pos = { x: 0, y: 0 }, screen = { x: window.innerWidth, y: window.innerHeight }, scale = { x: 1, y: 1 }) => {
  const vp = DOMViewport(camera)

  const x = (scale.x / 2) - (vp.x / 2) + (pos.x / screen.x * vp.x)
  const y = -(scale.y / 2) + (vp.y / 2) - (pos.y / screen.y * vp.y)

  return { x, y }
}

export const DOMViewport = (camera) => {
  const fov = camera.fov * (Math.PI / 180)
  const y = 2 * Math.tan(fov / 2) * camera.position.z
  const x = y * camera.aspect

  return { x, y }
}
