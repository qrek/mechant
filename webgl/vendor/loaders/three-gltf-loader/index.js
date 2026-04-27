import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

class ThreeGLTFLoader {
  constructor () {
    this._gltfLoader = new GLTFLoader()
  }

  load ({ path }) {
    return new Promise((resolve, reject) => {
      this._gltfLoader.load(path, resolve, null, reject)
    })
  }
}

export default ThreeGLTFLoader
