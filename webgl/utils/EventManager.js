class EventManager {
  constructor () {
    this.listeners = {}
  }

  addEventListener (name, listener) {
    if (this.listeners[name] === undefined)
      this.listeners[name] = []

    if (!this.listeners[name].includes(listener))
      this.listeners[name].push(listener)
  }

  removeEventListener (name, listener) {
    if (!Object.keys(this.listeners).length || !this.listeners[name])
      return false

    const index = this.listeners[name].indexOf(listener)

    if (index !== -1)
      this.listeners[name].splice(index, 1)
  }

  dispatchEvent (name, data) {
    if (!Object.keys(this.listeners).length || !this.listeners[name])
      return false

    if (this.listeners[name].length > 0) {
      for (let i = 0; i < this.listeners[name].length; i++) {
        this.listeners[name][i].call(this, data)
      }
    }
  }
}

export default EventManager
