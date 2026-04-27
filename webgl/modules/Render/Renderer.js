import { component } from 'bidello'
import { WebGLRenderer, sRGBEncoding, ACESFilmicToneMapping } from 'three'

import Viewport from '../../utils/Viewport'

class Renderer extends component(WebGLRenderer) {
  constructor () {
    super({
      powerPreference: 'high-performance',
      premultipliedAlpha: false,
      depth: false,
      stencil: false,
      antialias: false
    })

    this.outputEncoding = sRGBEncoding
    this.toneMapping = ACESFilmicToneMapping
    this.toneMappingExposure = 1.0

    this.setSize(Viewport.width, Viewport.height)

    this.setClearColor(0x000000, 0.0)
    this.setPixelRatio(Viewport.pixelRatio)
  }

  onResize ({ width, height }) {
    this.setSize(width, height)
    this.setPixelRatio(Viewport.pixelRatio)
  }
}

export default new Renderer()
