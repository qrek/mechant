class SceneManager {
  constructor (options) {
    this.activeScene = options.activeScene || null
    this.scenes = options.scenes || {}
  }

  addScene (id, instance) {
    this.scenes[id] = instance
  }

  removeScene (id) {
    delete this.scenes[id]
  }

  getSceneInstance (id) {
    return (this.scenes[id]) ? this.scenes[id] : null
  }

  getActiveScene () {
    return this.activeScene ? this.scenes[this.activeScene] : Object.values(this.scenes)[0]
  }
}

export default SceneManager
