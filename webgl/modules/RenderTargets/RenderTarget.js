import { Color, PerspectiveCamera, Scene, Vector2, WebGLRenderTarget } from 'three'

class RenderTarget {
  constructor ({ sizes = new Vector2(), mesh, color = null }) {
    this._sizes = sizes
    this._mesh = mesh
    this._color = color

    this._init()
  }

  _init () {
    this._rt = new WebGLRenderTarget(
      this._sizes.x,
      this._sizes.y
    )

    this._camera = new PerspectiveCamera(45, 1, 0.1, 1000)
    this._camera.position.z = 2

    this._scene = new Scene()

    if (this._color) {
      this._scene.background = new Color(this._color)
    }

    this._scene.add(this._mesh)
  }

  setSize (width, height) {
    if (this._rt)
      this._rt.setSize(width, height)
  }

  get rt () {
    return this._rt
  }

  get scene () {
    return this._scene
  }

  get camera () {
    return this._camera
  }
}

export default RenderTarget
