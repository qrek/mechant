import { component } from 'bidello'
import {
  Scene,
  Vector3,
  Color
} from 'three'

import MainCamera from '@/webgl/modules/Camera/MainCamera'
import Hero from "@/webgl/components/Hero";
import Works from "@/webgl/components/Works";

class MainScene extends component(Scene) {
  constructor (options) {
    super()

    this._width = options.width
    this._height = options.height
    this._ratio = options.ratio
    this._nuxtRoot = options.nuxtRoot

    this._centeredMousePosition = { x: null, y: null }

    this._cameras = new MainCamera()

    this.background = new Color('#000000')

    this._mesh = {}

    this.add(this._cameras)
  }

  /**
   * Setup After Loading
   */
  setup () {}

  initHero(props) {
    this._hero = new Hero({ ...props, scene: this })
    this.add(this._hero)
  }

  destroyHero() {
    this._hero.destroy()
    this.remove(this._hero)
    this._hero = null
  }

  initWorks(props) {
    this._works = new Works({ ...props, scene: this })
    this.add(this._works)
  }

  destroyWorks() {
    this._works.destroy()
    this.remove(this._works)
    this._works = null
  }

  /**
   * Resize Event
   */
  onResize ({ width, height, ratio }) {
    this._width = width
    this._height = height

    this._cameras?.resize({ width, height, ratio })
  }

  /**
   * Mousemove Event
   */
  onMousemove ({ centeredMousePosition }) {
    this._centeredMousePosition = centeredMousePosition
  }

  /**
   * Getters
   */
  get cameras () {
    return this._cameras
  }

  get camera () {
    return this._cameras.camera
  }

  get hero() {
    return this._hero
  }

  get works() {
    return this._works
  }

  /**
   * Utils
   */
  getOptions () {
    return {
      width: this._width,
      height: this._height,
      ratio: this._ratio,
      nuxtRoot: this._nuxtRoot
    }
  }
}

export default MainScene
