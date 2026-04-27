import { TextureLoader } from 'three'

class ThreeTextureLoader {
  constructor () {
    this._loader = new TextureLoader()
  }

  load ({ path }) {
    return new Promise((resolve, reject) => {
      this._loader.load(path, resolve, null, reject)
    })
  }
}

export default ThreeTextureLoader
