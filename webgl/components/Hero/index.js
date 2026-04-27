import {component} from "bidello";
import {
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneBufferGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderTarget
} from "three";

import gsap, {Power1} from "@/vendor/gsap";

import {DOMPosition, DOMScale} from "@/webgl/utils/DOM";
import Viewport from "@/webgl/utils/Viewport";
import renderer from "@/webgl/modules/Render/Renderer"

import slideFragmentShader from "@/webgl/shaders/slide/fragment.glsl";
import slideVertexShader from "@/webgl/shaders/slide/vertex.glsl";

import heroFragmentShader from "@/webgl/shaders/hero/fragment.glsl";
import heroVertexShader from "@/webgl/shaders/hero/vertex.glsl";

import {debounce} from "@/utils/functions"
import {lerp} from "@/webgl/utils/Maths"

import Slide from "@/webgl/components/Hero/Slide"
import Root from "@/webgl/utils/Root"
import {checker} from "three/examples/jsm/nodes/shadernode/ShaderNodeElements";

class Hero extends component(Object3D) {
  constructor({ el, scene, images, onUpdateCbk = null }) {
    super();

    this._root = new Root()

    this._scene = scene
    this._camera = scene.camera
    this._fboCamera = scene.camera

    this._el = el
    this._images = images
    this._index = 0
    this._realIndex = 0

    this._bounds = this._el.getBoundingClientRect()

    this._items = []

    this._isMoving = false
    this._isMovingNav = false

    this._params = {
      strength: 0,
      target: 0,
    }

    this._tweens = {
      strength: null,
      target: null
    }

    this._origin = {
      x: 0,
      y: 0
    }

    this._translate = {
      factor: 0.1,
      target: 0,
      start: 0,
      last: 0,
      current: 0,
      position: 0,
      ease: 0.1
    }

    this._onCheckDebounce = debounce(this._onCheck, 200)

    this._onUpdateCbk = onUpdateCbk

    this._initBackground()
    this._initFBO()
    this._initSlides()
  }

  _initFBO() {
    this._fbo = new WebGLRenderTarget(this._bounds.width, this._bounds.height)
    this._fboScene = new Scene()

    this._sliderGeometry = new PlaneBufferGeometry()
    this._sliderMaterial = new ShaderMaterial({
      vertexShader: heroVertexShader,
      fragmentShader: heroFragmentShader,
      uniforms: {
        uTexture: { type: 'sampler2D', value: null },
        uOffset: { type: 'vec2', value: new Vector2(0, .0075) },
        uStrength: { type: 'f', value: this._params.strength },
        uResolution: { type: 'vec2', value: new Vector2(Viewport.width, Viewport.height) },
      },
      defines: {
        PI: Math.PI
      },
      side: DoubleSide,
      transparent: true,
      alphaTest: true
    })

    this._slider = new Mesh(this._sliderGeometry, this._sliderMaterial)

    this.add(this._slider)
  }

  _initSlides() {
    this._wrapper = new Object3D()

    this._slideGeometry = new PlaneBufferGeometry(1, 1, 10, 10)
    this._slideMaterial = new ShaderMaterial({
      vertexShader: slideVertexShader,
      fragmentShader: slideFragmentShader,
      uniforms: {
        uTexture: { type: 'sampler2D', value: null },
        uResolution: { type: 'vec2', value: new Vector2() },
        uScale: { type: 'vec2', value: new Vector2() },
        uOffsetR: { type: 'vec2', value: new Vector2() },
        uOffsetG: { type: 'vec2', value: new Vector2() },
        uOffsetB: { type: 'vec2', value: new Vector2() },
        uViewport: { type: 'vec2', value: new Vector2() },
        uPower: { type: 'f', value: .5 },
        uStrength: { type: 'f', value: this._params.strength },
      },
      defines: {
        PI: Math.PI
      },
      side: DoubleSide,
      transparent: true,
      alphaTest: true
    })

    for (let i = 0; i < (this._images.length); i++) {
      const slide = new Slide({
        geometry: this._slideGeometry,
        material: this._slideMaterial.clone(),
        index: i - this._images.length,
        key: i,
        realIndex: this._realIndex,
        image: `${this._images[i % this._images.length].id}_hero`,
        el: this._el,
        camera: this._camera,
        getParams: this.getParams.bind(this)
      })

      this._items.push(slide)

      this._wrapper.add(slide)
    }

    this._fboScene.add(this._wrapper)
  }

  /* BACKGROUND */
  _initBackground() {
    this._bgGeometry = new PlaneBufferGeometry()
    this._bgMaterial = new MeshBasicMaterial({
      color: '#000000',
      depthTest: false,
      depthWrite: false
    })

    this._bg = new Mesh(
      this._bgGeometry,
      this._bgMaterial
    )

    this._boundItems()

    this.add(this._bg)
  }

  _boundItems() {
    const { width, height, x, y } = this._bounds
    const scale = DOMScale(this._camera, { x: width, y: height }, { x: Viewport.width, y: Viewport.height })
    const pos = DOMPosition(this._camera, { x, y }, { x: Viewport.width, y: Viewport.height }, scale)

    this?._bg?.scale?.set(scale.x, scale.y, scale.z)
    this?._bg?.position?.set(pos.x, pos.y, 0)

    this?._slider?.scale?.set(scale.x, scale.y, scale.z)
    this?._slider?.position?.set(pos.x, pos.y, 0)
  }

  _setItemsParam (key, value, cbk1, cbk2) {
    for (let i = 0; i < this._items.length; i++) {
      this._items[i].material.uniforms[key].value = value

      if (cbk1)
        cbk1(this._items[i])
    }

    if (cbk2)
      cbk2()
  }

  checkTween (key) {
    if (this._tweens[key]) {
      this._tweens[key].kill()
      this._tweens[key] = null
    }
  }

  onDragStart(e = null) {
    if (this._isMovingNav) return

    this._translate.position = this._translate.current

    this._origin.x = e?.x
    this._origin.y = e?.y

    this._translate.start = e?.x

    this._isMoving = true

    this.checkTween('strength')
    this._tweens.strength = gsap.to(this._params, {
      strength: 1,
      duration: 0.3,
      ease: Power1.easeInOut,
      onUpdate: () => {
        this._setItemsParam('uStrength', this._params.strength, null,() => {
          this._wrapper.position.z = -this._params.strength * 1.5
          this._slider.material.uniforms.uStrength.value = this._params.strength
        })
      },
      onStart: () => {
        for (let i = 0; i < this._items.length; i++) {
          this._items[i].video.play()
        }
      }
    })
  }

  onDragMove({ x, y }) {
    if (this._isMovingNav) return
    if (!this._isMoving) return

    const deltaMove =  this._translate.start - x
    const distance = deltaMove * this._translate.factor

    const diffX = this._origin.x - x
    const diffY = this._origin.y - y

    if (Math.abs(diffY) < Math.abs(diffX) || !this._root.getStoreValue('layout', 'isMobile')) {
      this._translate.target = this._translate.position + distance
    }

  }

  onDragEnd(e = null) {
    if (this._isMovingNav) return

    this._origin.x = e?.x
    this._origin.y = e?.y

    this._isMoving = false
    this._onCheckDebounce()
    this.checkTween('strength')
    this._tweens.strength = gsap.to(this._params, {
      strength: 0,
      duration: 0.3,
      ease: Power1.easeInOut,
      onUpdate: () => {
        this._setItemsParam('uStrength', this._params.strength, null, () => {
          this._wrapper.position.z = -this._params.strength * 1.5
          this._slider.material.uniforms.uStrength.value = this._params.strength
        })
      },
      onComplete: () => {
        for (let i = 0; i < this._items.length; i++) {
          if (this._realIndex !== i) {
            this._items[i].video.pause()
          }
        }
      }
    })
  }

  _onCheck () {
    if (this._isMovingNav)
      return

    const { target } = this._translate

    const width = this._bg.scale.x
    const index = Math.round(Math.abs(target) / width)

    const item = (width * index)
    this._index = index * Math.sign(item)

    if (Math.round(target / width) < 0) {
      const realIndex = this._items.length - (Math.round(Math.abs(target) / width) % this._items.length)
      this._realIndex = realIndex === this._items.length ? 0 : realIndex
    } else {
      const realIndex = Math.round(target / width) % this._items.length
      this._realIndex = realIndex === this._items.length ? 0 : realIndex
    }

    if (this._translate.target < 0)
      this._translate.target = -item
    else
      this._translate.target = item
  }

  goToPrev() {
    this.checkTween('strength')
    this.checkTween('target')

    const duration = 0.5
    this._isMovingNav = true
    this._index = this._index - 1

    this._tweens.target = gsap.fromTo(this._params, {
      target: this._translate.target
    }, {
      target: (this._index) * (this._bg.scale.x),
      duration: duration * 2,
      ease: Power1.easeInOut,
      onStart: () => {
        for (let i = 0; i < this._items.length; i++) {
          if (!this._items[i].video.paused) {
            this._items[i].video.play()
          }
        }
      },
      onUpdate: () => {
        this._translate.target = this._params.target
      },
      onComplete: () => {
        this._isMovingNav = false
      }
    })

    this._tweens.strength = gsap.to(this._params, {
      strength: 1,
      duration: duration,
      ease: Power1.easeInOut,
      onUpdate: () => {
        this._setItemsParam('uStrength', this._params.strength, null,(item) => {
          this._wrapper.position.z = -this._params.strength * 1.5
          this._slider.material.uniforms.uStrength.value = this._params.strength
        })
      },
      onComplete: () => {
        const target = (this._index) * (this._bg.scale.x)

        const width = this._bg.scale.x

        if (Math.round(target / width) < 0) {
          const realIndex = this._items.length - (Math.round(Math.abs(target) / width) % this._items.length)
          this._realIndex = realIndex === this._items.length ? 0 : realIndex
        } else {
          const realIndex = Math.round(target / width) % this._items.length
          this._realIndex = realIndex === this._items.length ? 0 : realIndex
        }

        this.checkTween('strength')

        this._tweens.strength = gsap.to(this._params, {
          strength: 0,
          duration: duration,
          ease: Power1.easeInOut,
          onUpdate: () => {
            this._setItemsParam('uStrength', this._params.strength, null,(item) => {
              this._wrapper.position.z = -this._params.strength * 1.5
              this._slider.material.uniforms.uStrength.value = this._params.strength
            })
          },
          onComplete: () => {
            for (let i = 0; i < this._items.length; i++) {
              if (this._realIndex !== i) {
                this._items[i].video.pause()
              } else if (this._items[i].video.paused) {
                this._items[i].video.play()
              }
            }
          }
        })
      }
    })
  }

  goToNext() {
    this.checkTween('strength')
    this.checkTween('target')

    const duration = 0.5
    this._isMovingNav = true
    this._index = this._index + 1

    this._tweens.target = gsap.fromTo(this._params, {
      target: this._translate.target
    }, {
      target: (this._index) * (this._bg.scale.x),
      duration: duration * 2,
      ease: Power1.easeInOut,
      onStart: () => {
        for (let i = 0; i < this._items.length; i++) {
          if (!this._items[i].video.paused) {
            this._items[i].video.play()
          }
        }
      },
      onUpdate: () => {
        this._translate.target = this._params.target
      },
      onComplete: () => {
        this._isMovingNav = false
      }
    })

    this._tweens.strength = gsap.to(this._params, {
      strength: 1,
      duration: duration,
      ease: Power1.easeInOut,
      onUpdate: () => {
        this._setItemsParam('uStrength', this._params.strength, null,(item) => {
          this._wrapper.position.z = -this._params.strength * 1.5
          this._slider.material.uniforms.uStrength.value = this._params.strength
        })
      },
      onComplete: () => {
        const target = (this._index) * (this._bg.scale.x)

        const width = this._bg.scale.x

        if (Math.round(target / width) < 0) {
          const realIndex = this._items.length - (Math.round(Math.abs(target) / width) % this._items.length)
          this._realIndex = realIndex === this._items.length ? 0 : realIndex
        } else {
          const realIndex = Math.round(target / width) % this._items.length
          this._realIndex = realIndex === this._items.length ? 0 : realIndex
        }

        this.checkTween('strength')
        this._tweens.strength = gsap.to(this._params, {
          strength: 0,
          duration: duration,
          ease: Power1.easeInOut,
          onUpdate: () => {
            this._setItemsParam('uStrength', this._params.strength, null,(item) => {
              this._wrapper.position.z = -this._params.strength * 1.5
              this._slider.material.uniforms.uStrength.value = this._params.strength
            })
          },
          onComplete: () => {
            for (let i = 0; i < this._items.length; i++) {
              if (this._realIndex !== i) {
                this._items[i].video.pause()
              } else if (this._items[i].video.paused) {
                this._items[i].video.play()
              }
            }
          }
        })
      }
    })
  }

  getParams() {
    return {
      items: this._items,
      activeIndex: this._index,
      translate: this._translate,
      widthTotal: this._bg.scale.x * (this._images.length),
      width: this._bg.scale.x,
      index: this._index,
      realIndex: this._realIndex,
      isMoving: this._isMoving || this._isMovingNav,
      bounds: this._bounds
    }
  }

  destroy() {
    this.checkTween('strength')
    this.checkTween('target')

    for (let i = 0; i < this._items.length; i++) {
      const slide = this._items[i]
      slide.material.dispose()
      slide.geometry.dispose()

      slide.destroy()

      this._fboScene.remove(slide)
    }

    this._fbo.dispose()

    super.destroy()
  }

  onResize() {
    if (this._el) {
      this._bounds = this._el.getBoundingClientRect()

      this._boundItems()

      if (this._fbo)
        this._fbo.setSize(this._bounds.width, this._bounds.height)

      if (this._slider)
        this._slider.material.uniforms.uResolution.value = new Vector2(Viewport.width, Viewport.height)

      this._onCheck()

      // const calc = Math.round(Math.abs(this._translate.current) / Math.abs(this._translate.target) * 1000) / 1000
      //
      // if (!(this._isMoving || this._isMovingNav) && calc === 1) {
      //   this._index = this._index % (this._items.length / 2)
      //   this._translate.target = (this._index) * (this._bg.scale.x)
      //   this._translate.current = (this._index) * (this._bg.scale.x)
      // }
    }
  }

  onUpdate() {
    const { current, target, ease } = this._translate

    this._translate.last = this._translate.current

    this._translate.current = lerp(current, target, ease)

    if (this._fbo) {
      renderer.setRenderTarget(this._fbo)
      renderer.clear()
      renderer.render(this._fboScene, this._fboCamera)
      renderer.setRenderTarget(null)
      renderer.clear()

      if (this._el && this._el.getBoundingClientRect) {
        this._bounds = this._el.getBoundingClientRect()
        this._boundItems()
      }

      this._slider.material.uniforms.uTexture.value = this._fbo.texture
    }

    this._onUpdateCbk && this._onUpdateCbk({
      index: this._index,
      realIndex: this._realIndex,
      isMoving: this._isMoving || this._isMovingNav
    })
  }

  get isMobile () {
    return this._root.getStoreValue('layout', 'isMobile')
  }
}

export default Hero
