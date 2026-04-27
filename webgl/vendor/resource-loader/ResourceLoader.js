import EventManager from '../../utils/EventManager'
import isAbsolutePath from '../../../utils/isAbsolutePath'

export default class ResourceLoader extends EventManager {
  constructor () {
    super()

    this._progress = 0
    this._resourcesToPreload = []
    this._preloadedResources = 0

    this._preloadStartHandler = this._preloadStartHandler.bind(this)
    this._preloadProgressHandler = this._preloadProgressHandler.bind(this)
    this._preloadCompleteHandler = this._preloadCompleteHandler.bind(this)
    this._preloadErrorHandler = this._preloadErrorHandler.bind(this)
  }

  /**
   * Static
   */
  static resources = []

  static cache = []

  static basePath = ''

  static loaders = {}

  static preloadByDefault = false

  /**
   * Load resource
   * @param resource
   * @returns {Promise}
   */
  static loadResource (resource) {
    if (!resource.name) throw new Error('Resource name should be defined')

    const loader = this.loaders[resource.type]

    if (!loader) throw new Error(`Resource Loader: No loader is available for type "${resource.type}"`)

    if (!resource.path) throw new Error(`Resource Loader: Could not find resource path for "${resource.name}"`)

    const path = this.resolvePath(resource.path)

    const promise = loader.load({ path, name: resource.name, type: resource.type, basePath: this.basePath, options: resource.options })

    // When the promise is resolved dispatch response
    // in resource data to make it accessible
    promise.then((response) => {
      resource.data = response

      // See if resource already pushed in cache
      // In case where same resources are load at the same time
      for (let i = 0, len = this.cache.length; i < len; i++) {
        if (this.cache[i].name === resource.name) return
      }

      this.cache.push(resource)
    })

    return promise
  }

  /**
   * Get Ressource path
   * @param path
   * @returns {*|string}
   */
  static resolvePath (path) {
    return isAbsolutePath(path) ? path : `${this.basePath}${path}`
  }

  /**
   * Register a new loader for a specific type of asset
   * @param {Loader} loader
   * @param {String} type
   */
  static registerLoader (loader, type, options = {}) {
    const ClassName = loader
    this.loaders[type] = new ClassName({ type, ...options })
  }


  /**
   * Check resource by its name
   * @param {String} resourceName
   * @returns {Promise}
   */
  static has (resourceName) {
    for (let i = 0, len = this.cache.length; i < len; i++) {
      if (this.cache[i].name === resourceName) {
        return !!this.cache[i]
      }
    }

    return null
  }

  /**
   * Get a resource by its name
   * @param {String} resourceName
   * @returns {Promise}
   */
  static get (resourceName) {
    const resource = this.getResourceByName(resourceName)
    return resource.data
  }

  /**
   *
   * @param name
   * @returns {*}
   */
  static getResourceByName (name) {
    // Retrieve resource in the cache
    for (let i = 0, len = this.cache.length; i < len; i++) {
      if (this.cache[i].name === name) {
        return this.cache[i]
      }
    }

    throw new Error(`Resource Loader: Resource with name '${name}' was not found`)
  }

  /**
   * Fill resources
   * @param {Array<Object>} resources
   * @param {String} namespace
   * @param {Boolean} preload
   * @returns {Array<Object>}
   */
  add ({ resources, namespace, preload }) {
    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i]

      if (namespace) {
        if (resource.namespace) console.warn(`Resource Loader: resource namespace "${resource.namespace}" will override the original name space for resource "${resource.name}"`)
        resource.namespace = namespace
      }

      // Set preload state if defined but without overriding the option defined in the resource itself
      if (preload !== undefined && resource.preload === undefined) {
        resource.preload = preload
      }

      // Set preload default value
      if (resource.preload === undefined) {
        resource.preload = ResourceLoader.preloadByDefault
      }

      // Check if resource has already been added
      if (ResourceLoader.isResourceAdded(resource)) {
        console.warn(`Resource loader : Resource with same name or path has already been added for "${resource.name}". It will not be added.`)
      } else {
        ResourceLoader.resources.push(resource)
      }
    }

    return ResourceLoader.resources
  }

  /**
   * First preload assets
   * @returns {Promise<Array>}
   */
  preload () {
    const promises = []

    const resources = ResourceLoader.resources.filter((resource) => {
      return resource.preload
    })

    this._preloadStartHandler(resources)

    for (let i = 0, len = resources.length; i < len; i++) {
      const promise = ResourceLoader.loadResource(resources[i])
      // On rattrape les erreurs individuelles pour ne pas bloquer le chargement global
      const safe = promise.then(this._preloadProgressHandler).catch((err) => {
        console.warn('ResourceLoader: ressource ignorée —', resources[i].name, err?.message)
      })
      promises.push(safe)
    }

    return Promise.all(promises)
      .then(this._preloadCompleteHandler)
      .catch(this._preloadErrorHandler)
  }

  /**
   * Destroy ResourceLoader instance parameters
   * @returns {Promise<Array>}
   */
  destroy () {
    ResourceLoader.cache = []
    ResourceLoader.loaders = {}
    ResourceLoader.resources = []
    this._progress = null
    this._resourcesToPreload = null
    this._preloadedResources = null
  }

  /**
   * Events
   */
  /**
   * On start event
   * @param resources
   * @private
   */
  _preloadStartHandler (resources) {
    this._resourcesToPreload = resources
    this.dispatchEvent('start', this._resourcesToPreload)
  }

  /**
   * On progress event
   * @param resource
   * @private
   */
  _preloadProgressHandler (resource) {
    this._preloadedResources++
    this._progress = this._preloadedResources / this._resourcesToPreload.length

    this.dispatchEvent('progress', this._progress)
  }

  /**
   * On progress event
   * @param resources
   * @private
   */
  _preloadCompleteHandler (resources) {
    this.dispatchEvent('complete', resources)
  }

  /**
   * On error event
   * @private
   */
  _preloadErrorHandler () {
    console.error('Resource Loader : Something went wrong while preloading resources')
    this.dispatchEvent('error')
  }

  /**
   * Utils
   */
  static isResourceAdded (resource) {
    for (let i = 0; i < ResourceLoader.resources.length; i++) {
      if (ResourceLoader.resources[i].type === resource.type && (ResourceLoader.resources[i].name === resource.name || ResourceLoader.resources[i].path === resource.path)) return true
    }
  }
}
