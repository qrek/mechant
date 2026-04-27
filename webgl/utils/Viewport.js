import EventManager from './EventManager'

class Viewport extends EventManager {
  constructor () {
    super()

    this.width = this.getWidth()
    this.height = this.getHeight()
    this.ratio = this.width / this.height
    this.pixelRatio = Math.min(window.devicePixelRatio, 2)

    window.addEventListener('resize', () => this._resize())
    this._resize()
  }

  _resize () {
    this.width = this.getWidth()
    this.height = this.getHeight()
    this.ratio = this.width / this.height
    this.pixelRatio = Math.min(window.devicePixelRatio, 2)

    this.dispatchEvent('resize', {
      width: this.width,
      height: this.height,
      ratio: this.ratio,
      pixelRatio: this.pixelRatio
    })
  }

  getWidth () {
    return window.innerWidth
  }

  getHeight () {
    return window.innerHeight
  }
}

export default new Viewport()
