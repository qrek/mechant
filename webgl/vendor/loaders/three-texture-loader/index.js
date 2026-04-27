import { TextureLoader } from 'three'

class ThreeTextureLoader {
  constructor () {
    this._loader = new TextureLoader()
    this._loader.crossOrigin = 'anonymous'
  }

  load ({ path }) {
    return new Promise((resolve, reject) => {
      this._loader.load(path, (texture) => {
        resolve({ texture, video: null, path })
      }, null, reject)
    })
  }
}

export default ThreeTextureLoader
