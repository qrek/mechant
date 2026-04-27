import { Clock, Vector2 } from 'three'

import Stats from 'three/examples/jsm/libs/stats.module.js'

import bidello from 'bidello'

import { gsap } from '@/vendor/gsap'

import Root from '@/webgl/utils/Root'

import renderer from '@/webgl/modules/Render/Renderer'
import cssrenderer from '@/webgl/modules/Render/CSSRenderer'
import postfx from '@/webgl/modules/Render/PostFx'

import MainScene from '@/webgl/scenes/MainScene'
import SceneManager from '@/webgl/scenes/SceneManager'

import Viewport from '@/webgl/utils/Viewport'

class Webgl {
  constructor ({ el, nuxtRoot }) {
    this._el = el
    this._rootApp = new Root({ nuxtRoot })
    this._nuxtRoot = this._rootApp.root

    this._width = Viewport.width
    this._height = Viewport.height
    this._ratio = Viewport.ratio
    this._pixelRatio = Viewport.pixelRatio

    this._clock = this._initClock()

    this._el.appendChild(renderer.domElement)
    this._el.appendChild(cssrenderer.domElement)

    this._canvas = renderer.domElement
    this._cssWrapper = cssrenderer.domElement

    // MOUSE ATTR
    this._allowMouseInteractions = true
    this._mousePosition = new Vector2()
    this._normalizedMousePosition = new Vector2()
    this._centeredMousePosition = new Vector2()

    this._setupEventListeners()
    this._resize()
  }

  /**
   * Public
   */
  setup (activeScene = null, cbk = null) {
    this._sceneManager = this._initSceneManager(activeScene)
    this._scene = this._initScene()

    postfx.setup(this._scene, this._scene.camera)

    if (this._scene && this._scene.setup)
      this._scene.setup()

    if (cbk)
      cbk()
  }

  destroy () {
    this._removeEventListeners()
    this._removeStats()
    this._clock.stop()
    renderer.dispose()
    if (this._scene.destroy) this._scene.destroy()
  }

  /**
   * Private
   */
  _initClock () {
    return new Clock()
  }

  _initSceneManager (activeScene = null) {
    return new SceneManager({
      scenes: {
        MainScene
      },
      activeScene
    })
  }

  _initScene () {
    const constructor = this._sceneManager.getActiveScene()

    const scene = new constructor({
      width: this._width,
      height: this._height,
      ratio: this._ratio,
      pixelRatio: this._pixelRatio,
      nuxtRoot: this._nuxtRoot
    })

    return scene
  }

  _initStats () {
    const stats = new Stats()
    document.body.appendChild(stats.dom)

    return stats
  }

  _removeStats () {
    if (!this._stats || !!this._stats.dom) return
    document.body.removeChild(this._stats.dom)
    this._stats = null
  }

  // EVENTS
  _setupEventListeners () {
    Viewport.addEventListener('resize', () => this._resize())
    gsap.ticker.add(() => this._update())

    // window.addEventListener('mousedown', e => this._mousedownHandler(e))
    window.addEventListener('mousemove', e => this._mousemoveHandler(e))
    // window.addEventListener('mouseup', e => this._tapHandler(e))

    // window.addEventListener('touchstart', e => this._touchstartHandler(e))
    // window.addEventListener('touchmove', e => this._touchmoveHandler(e))
    // window.addEventListener('touchend', e => this._tapHandler(e))
  }

  _removeEventListeners () {
    Viewport.removeEventListener('resize', () => this._resize())
    gsap.ticker.remove(() => this._update())

    window.removeEventListener('mousemove', e => this._mousemoveHandler(e))
    // window.removeEventListener('mouseup', e => this._tapHandler(e))
    //
    // window.removeEventListener('touchend', e => this._tapHandler(e))
  }

  _resize () {
    this._width = Viewport.width
    this._height = Viewport.height
    this._ratio = Viewport.ratio
    this._pixelRatio = Viewport.pixelRatio

    this._triggerBidelloResize()
  }

  _update () {
    if (this._stats) this._stats.begin()
    this._triggerBidelloUpdate()
    this._render()
    if (this._stats) this._stats.end()
  }

  _render () {
    if (this._scene)
      postfx.render(this._scene, this._scene.camera)
  }

  // MOUSE / TOUCH
  _mousedownHandler (e) {
    this._triggerBidelloMouseDown(e)
  }

  _mousemoveHandler (e) {
    if (!this._allowMouseInteractions) return false

    this._mousePosition.x = e.clientX
    this._mousePosition.y = e.clientY

    this._normalizedMousePosition.x = this._mousePosition.x / this._width
    this._normalizedMousePosition.y = 1.0 - this._mousePosition.y / this._height

    this._centeredMousePosition.x = (this._mousePosition.x / this._width) * 2 - 1
    this._centeredMousePosition.y = -(this._mousePosition.y / this._height) * 2 + 1

    this._triggerBidelloMouseMove(e)
  }

  _tapHandler (e) {
    if (!this._allowMouseInteractions) return false

    this._mousePosition.x = e.clientX || ((e.touches && e.touches.length) && e.touches[0].clientX)
    this._mousePosition.y = e.clientY || ((e.touches && e.touches.length) && e.touches[0].clientY)

    this._normalizedMousePosition.x = this._mousePosition.x / this._width
    this._normalizedMousePosition.y = 1.0 - this._mousePosition.y / this._height

    this._centeredMousePosition.x = (this._mousePosition.x / this._width) * 2 - 1
    this._centeredMousePosition.y = -(this._mousePosition.y / this._height) * 2 + 1

    this._triggerBidelloTap()
  }

  _touchstartHandler (e) {
    this._triggerBidelloTouchStart(e)
  }

  _touchmoveHandler (e) {
    this._triggerBidelloTouchMove(e)
  }

  // BIDELLO
  _triggerBidelloResize () {
    bidello.trigger({ name: 'resize', fireAtStart: true },
      {
        width: this._width,
        height: this._height,
        ratio: this._ratio,
        pixelRatio: this._pixelRatio
      }
    )
  }

  _triggerBidelloUpdate () {
    const delta = this._clock.getDelta()
    const time = this._clock.getElapsedTime()

    bidello.trigger({ name: 'update', fireAtStart: false },
      {
        delta,
        time
      }
    )
  }

  _triggerBidelloMouseDown () {
    bidello.trigger({ name: 'mousedown', fireAtStart: false },
      {
        mousePosition: this._mousePosition,
        normalizedMousePosition: this._normalizedMousePosition,
        centeredMousePosition: this._centeredMousePosition
      }
    )
  }

  _triggerBidelloMouseMove (e) {
    bidello.trigger({ name: 'mousemove', fireAtStart: false },
      {
        event: e,
        mousePosition: this._mousePosition,
        normalizedMousePosition: this._normalizedMousePosition,
        centeredMousePosition: this._centeredMousePosition
      }
    )
  }

  _triggerBidelloTap () {
    bidello.trigger({ name: 'click', fireAtStart: false },
      {
        mousePosition: this._mousePosition,
        normalizedMousePosition: this._normalizedMousePosition,
        centeredMousePosition: this._centeredMousePosition
      }
    )
  }

  _triggerBidelloTouchStart () {
    bidello.trigger({ name: 'touchstart', fireAtStart: false },
      {
        mousePosition: this._mousePosition,
        normalizedMousePosition: this._normalizedMousePosition,
        centeredMousePosition: this._centeredMousePosition
      }
    )
  }

  _triggerBidelloTouchMove (e) {
    bidello.trigger({ name: 'touchmove', fireAtStart: false },
      {
        event: e,
        mousePosition: this._mousePosition,
        normalizedMousePosition: this._normalizedMousePosition,
        centeredMousePosition: this._centeredMousePosition
      }
    )
  }

  /**
   * Getters
   */
  get scene () {
    return this._scene
  }
}

export default Webgl
