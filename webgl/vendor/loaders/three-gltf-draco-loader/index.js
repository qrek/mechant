import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

class ThreeGLTFDracoLoader {
  constructor (options) {
    this._dracoDecoderPath = options.decoder

    this._gltfLoader = new GLTFLoader()

    if (this._dracoDecoderPath) {
      this._dracoLoader = new DRACOLoader()
      this._dracoLoader.setDecoderPath(this._dracoDecoderPath)
      this._gltfLoader.setDRACOLoader(this._dracoLoader)
    }
  }

  load ({ path }) {
    return new Promise((resolve, reject) => {
      this._gltfLoader.load(path, resolve, null, reject)
    })
  }
}

export default ThreeGLTFDracoLoader
