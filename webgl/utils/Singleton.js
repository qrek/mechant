class Singleton {
  static instance = null

  constructor (options) {
    if (!(this.constructor).instance)
      (this.constructor).instance = this
    else
      return (this.constructor).instance

    if (this.onInit)
      this.onInit(options)
  }
}

export default Singleton

const singleton = (superclass = class T {}) => class Singleton extends superclass {
  static instance = null

  constructor (...args) {
    if (!(Singleton).instance) {
      super(...args);
      (Singleton).instance = this
      this.onInit && this.onInit(...args)
    } else
      return (Singleton).instance
  }
}

export { singleton }
