import Singleton from '@/webgl/utils/Singleton'

class Root extends Singleton {
  onInit ({ nuxtRoot }) {
    this._nuxtRoot = nuxtRoot
  }

  get locale () {
    return this.root.$i18n.locale
  }

  get localeData () {
    return this.root.$i18n.messages[this.locale]
  }

  get root () {
    return this._nuxtRoot
  }

  get store () {
    return this._nuxtRoot.$store
  }

  // Custom
  static events = {}

  getStoreValue (store, key) {
    return this.store.getters[`${store}/${key}`]
  }

  setStoreValue (type, payload) {
    this.triggerValueChange(type, payload)

    return this.store.dispatch(type, payload)
  }

  onStoreValueChange (type, event) {
    if (Root.events[type]) {
      Root.events[type].push(event)
    } else {
      Root.events[type] = [event]
    }
  }

  triggerValueChange (type, payload) {
    if (Root.events[type] && Root.events[type].length) {
      for (let i = 0; i < Root.events[type].length; i++) {
        Root.events[type][i](payload)
      }
    }
  }
}

export default Root
