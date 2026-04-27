import {component} from "bidello";
import {
  DoubleSide,
  Object3D,
  PlaneBufferGeometry,
  ShaderMaterial,
  Mesh,
  Vector2,
  sRGBEncoding,
  NearestFilter,
  LinearMipMapLinearFilter
} from "three";

import gsap from '@/vendor/gsap'

import {clamp} from "@/webgl/utils/Maths";

import vertexShader from "@/webgl/shaders/works/vertex.glsl";
import fragmentShader from "@/webgl/shaders/works/fragment.glsl";

import backgroundVertexShader from "@/webgl/shaders/works-bg/vertex.glsl";
import backgroundFragmentShader from "@/webgl/shaders/works-bg/fragment.glsl";

import Work from "@/webgl/components/Works/Work";
import ResourceLoader from "~/webgl/vendor/resource-loader/ResourceLoader";
import Viewport from "@/webgl/utils/Viewport";
import {debounce} from "@/utils/functions";

class Works extends component(Object3D) {
  constructor({ scene, works }) {
    super();

    this._scene = scene
    this._camera = scene.camera

    this._params = {
      ease: 0.1,
      factor: 0.01,
      drag: .5,
      current: 0,
      target: 0,
      power: 1,
      scroll: {
        current: 0,
        target: 0
      },
      strength: {
        current: 0,
        target: 0
      }
    }

    this._works = works

    this._items = []

    this._mask = ResourceLoader.get('work_alpha_mask')
    this._mask.encoding = sRGBEncoding
    this._mask.magFilter = NearestFilter
    this._mask.minFilter = LinearMipMapLinearFilter

    this.isWheeling = false

    this._onCheckDebounce = debounce(() => {
      this.isWheeling = false
    }, 10)

    this._initBg()
    this._initItems()
  }

  /**
   * Private Methods
   */
  _initBg () {
    this._bgGeometry = new PlaneBufferGeometry(1, 1, 10, 10)
    this._bgMaterial = new ShaderMaterial({
      vertexShader: backgroundVertexShader,
      fragmentShader: backgroundFragmentShader,
      uniforms: {
        uMask: { type: 'sampler2D', value: this._mask },
        uResolution: { type: 'vec2', value: new Vector2() },
        uScale: { type: 'vec2', value: new Vector2() },
        uViewport: { type: 'vec2', value: new Vector2() },
        uPower: { type: 'f', value: this._params.power },
        uStrength: { type: 'f', value: this._params.strength.current },
        uHover: { type: 'f', value: 0 },
        uStatus: { type: 'f', value: 1 },
        uOpacity: { type: 'f', value: 1 },
        uVisibility: { type: 'f', value: 0 },
      },
      defines: {
        PI: Math.PI
      },
      side: DoubleSide,
      transparent: true,
      alphaTest: true,
      depthTest: false,
      depthWrite: false
    })

    this._bg = new Mesh(this._bgGeometry, this._bgMaterial)
  }

  _initItems () {
    this._workGeometry = new PlaneBufferGeometry(1, 1, 10, 10)
    this._workMaterial = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { type: 'sampler2D', value: null },
        uMask: { type: 'sampler2D', value: this._mask },
        uResolution: { type: 'vec2', value: new Vector2() },
        uScale: { type: 'vec2', value: new Vector2() },
        uViewport: { type: 'vec2', value: new Vector2() },
        uMouse: { type: 'vec2', value: new Vector2() },
        uMouseDistance: { type: 'f', value: 0 },
        uPower: { type: 'f', value: this._params.power },
        uStrength: { type: 'f', value: this._params.strength.current },
        uHover: { type: 'f', value: 0 },
        uStatus: { type: 'f', value: 1 },
        uOpacity: { type: 'f', value: 1 },
      },
      defines: {
        PI: Math.PI
      },
      side: DoubleSide,
      transparent: true,
      alphaTest: true
    })

    for (let i = 0; i < this._works.length; i++) {
      const item = new Work({
        geometry: this._workGeometry,
        material: this._workMaterial.clone(),
        index: i,
        image: `${this._works[i].getId()}_preview_video`,
        component: this._works[i],
        camera: this._camera,
        background: this._bg.clone()
      })

      this.add(item)
      this._items.push(item)
    }
  }

  _setItemsParam (key, value, cbk) {
    for (let i = 0; i < this._items.length; i++) {
      this._items[i].material.uniforms[key].value = value

      if (cbk)
        cbk(this._items[i])
    }
  }

  /**
   * Public Methods
   */
  filterByCategory (category) {
    const activeItems = this.findByCategory(category)
    const hiddenItems = this._items.filter(n => !activeItems.includes(n))

    for (let i = 0; i < hiddenItems.length; i++) {
      const item = hiddenItems[i]

      item.hide()
    }

    for (let i = 0; i < activeItems.length; i++) {
      const item = activeItems[i]

      item.show()
    }
  }

  findByCategory (category) {
    if (category === 'all')
      return this._items

    return this._items.filter(i => i.categories.includes(category))
  }

  updateWorks (projects, els) {
    for (let i = 0; i < els.length; i++) {
      const el = els[i]
      const id = el.getId()

      if (projects[id]) {
        const item = new Work({
          geometry: this._workGeometry,
          material: this._workMaterial.clone(),
          index: i,
          image: `${id}_preview_video`,
          component: el,
          camera: this._camera,
          background: this._bg.clone()
        })

        this.add(item)
        this._items.push(item)
      }
    }
  }

  /**
   * Events
   */
  onDrag(e) {
    this._params.target = this._params.current + (e.deltaY * this._params.drag)
  }

  onWheel(e) {
    this.isWheeling = true
    this._params.scroll.target = e.scrollY()

    this._onCheckDebounce()

    this._params.target = this._params.current + (e.deltaY * this._params.factor)
  }

  onMouseEnter(e, i) {
    if (this._items[i] && this._items[i].onMouseEnter)
      this._items[i].onMouseEnter(e, i)
  }

  onMouseLeave(e, i) {
    if (this._items[i] && this._items[i].onMouseLeave)
      this._items[i].onMouseLeave(e, i)
  }

  /**
   * Destroy
   */
  destroy() {
    for (let i = 0; i < this._items.length; i++) {
      const item = this._items[i]
      item.destroy()

      this.remove(item)
    }

    super.destroy()
  }

  /**
   * Update Cycle
   */
  onUpdate() {
    const delta = 1.0 - Math.pow(1.0 - this._params.ease, gsap.ticker.deltaRatio())

    // const str = clamp(((Math.abs(this._params.target - this._params.current))), 0, .75)

    this._params.current = gsap.utils.interpolate(this._params.current, this._params.target, delta)

    this._params.scroll.current = gsap.utils.interpolate(this._params.scroll.current, this._params.scroll.target, .1)

    // const str = clamp(this._params.target - this._params.current, -.75, .75)
    const str = clamp((this._params.scroll.target - this._params.scroll.current) / (Viewport.height / 2), -.75, .75)

    if (!this.isWheeling) {
      this._params.strength.current = gsap.utils.interpolate(this._params.strength.current, str, delta)
    } else {
      if (Math.abs(str) > Math.abs(this._params.strength.current)) {
        this._params.strength.current = gsap.utils.interpolate(this._params.strength.current, str, delta)
      }
    }

    this._setItemsParam('uStrength', this._params.strength.current, (item) => {
      item.background.material.uniforms.uStrength.value = this._params.strength.current
    })
  }

  get items () {
    return this._items
  }
}

export default Works
