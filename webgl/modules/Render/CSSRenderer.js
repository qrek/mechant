import { component } from 'bidello'
import { sRGBEncoding } from 'three'
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer'

import Viewport from '../../utils/Viewport'

class CSSRenderer extends component(CSS2DRenderer) {
  constructor () {
    super()

    this.physicallyCorrectLights = true
    this.outputEncoding = sRGBEncoding
    this.domElement.style.position = 'absolute'
    this.domElement.style.top = 0
    this.domElement.style.pointerEvents = 'none'
    this.setSize(Viewport.width, Viewport.height)
  }

  onResize ({ width, height }) {
    this.setSize(width, height)
  }
}

export default new CSSRenderer()
