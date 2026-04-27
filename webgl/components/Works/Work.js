import {component} from "bidello";
import {
  Object3D,
  Mesh,
  Vector2,
  Vector3
} from "three"

import gsap from "@/vendor/gsap"

import Viewport from "@/webgl/utils/Viewport"
import ResourceLoader from "@/webgl/vendor/resource-loader/ResourceLoader"
import {DOMPosition, DOMScale, DOMViewport} from "@/webgl/utils/DOM"
import {clamp} from "@/webgl/utils/Maths"

class Work extends component(Object3D) {
  constructor({ geometry, material, image, component, camera, index, background }) {
    super();

    this._component = component
    this._el = component.$el
    this._camera = camera
    this._image = image
    this._index = index

    this._mesh = new Mesh(geometry, material)
    this._background = background

    this._background.material = this._background.material.clone()

    if (this._el?.dataset?.display) {
      this._mesh.material.uniforms.uMask.value = ResourceLoader.get(this._el?.dataset?.display)
      this._background.material.uniforms.uMask.value = ResourceLoader.get(this._el?.dataset?.display)
    }

    this._bounds = this.getBounds()

    this._pos = { x: 0, y: 0 }

    this._isHover = false
    this.isMoving = false
    this.isVisible = true

    this._scale = { x: 0, y: 0, z: 0 }

    this._params = {
      scale: 1,
      hover: 0,
      status: 1,
      opacity: 0
    }

    this._tweens = {
      scale: null,
      status: null,
      opacity: null
    }

    this.add(this._mesh)
    this.add(this._background)

    this._oldCenteredMousePosition = new Vector2()
    this._centeredMousePosition = new Vector2()
    this._mousePosition = new Vector2()
    this._normalizedMousePosition = new Vector2()

    this._init()
  }

  async _init() {
    if (!ResourceLoader.has(this._image)) {
      const previewUrl = this._component.getPreviewVideo()
      if (previewUrl) {
        await ResourceLoader.loadResource({ name: this._image, type: 'video', path: previewUrl })
      } else {
        const posterUrl = this._component.data?.poster || this._component.data?.thumbnail_url
        if (posterUrl) {
          await ResourceLoader.loadResource({ name: this._image, type: 'texture', path: posterUrl })
        } else {
          this._el.dataset.loaded = true
          return
        }
      }
    }

    this._el.dataset.loaded = true

    const camera = DOMViewport(this._camera)
    const { texture, video } = ResourceLoader.get(this._image)

    this._video = video || null
    if (video) {
      video.currentTime = 0
      video.pause()
    }

    this._mesh.material.uniforms.uTexture.value = texture
    const w = texture.image.videoWidth || texture.image.naturalWidth || texture.image.width || 1920
    const h = texture.image.videoHeight || texture.image.naturalHeight || texture.image.height || 1080
    this._mesh.material.uniforms.uResolution.value = new Vector2(w, h)
    this._mesh.material.uniforms.uViewport.value = new Vector2(camera.x, camera.y)
    this._background.material.uniforms.uViewport.value = new Vector2(camera.x, camera.y)

    this._setScale()
    this._setPos()
  }

  _setScale() {
    const { width, height } = this._bounds

    const scale = DOMScale(this._camera, { x: width, y: height }, { x: Viewport.width, y: Viewport.height })
    this._scale = scale

    this._mesh.scale.set(scale.x, scale.y, scale.z)
    this._mesh.material.uniforms.uScale.value = new Vector2(scale.x, scale.y)

    this._background.scale.set(scale.x * .99, scale.y * .99, scale.z * .99)
    this._background.material.uniforms.uScale.value = new Vector2(scale.x, scale.y)
  }

  _setPos() {
    const { x, y } = this._bounds

    const pos = DOMPosition(this._camera, { x, y }, { x: Viewport.width, y: Viewport.height }, this._scale)

    this.position.x = pos.x
    this.position.y = pos.y
    this.position.z = .01 * this._index

    if (this.isVisible) {
      this._pos = pos
    }
  }

  _setRot() {
    const st = window.getComputedStyle(this._el, null)

    const tr = st.getPropertyValue("-webkit-transform") ||
      st.getPropertyValue("-moz-transform") ||
      st.getPropertyValue("-ms-transform") ||
      st.getPropertyValue("-o-transform") ||
      st.getPropertyValue("transform") ||
      false;

    if (tr && tr !== 'none') {
      let values = tr.split('(')[1]
      values = values.split(')')[0]
      values = values.split(',')

      this._mesh.rotation.z = -values[1]
      this._background.rotation.z = -values[1]
    }
  }

  checkTween (key) {
    if (this._tweens[key]) {
      this._tweens[key].kill()
      this._tweens[key] = null
    }
  }

  onScrollEnter(duration, delay = 0) {
    this.checkTween('opacity')
    this._tweens.opacity = gsap.to(this._params, {
      opacity: 1,
      delay,
      duration,
      onUpdate: () => {
        this._mesh.material.uniforms.uOpacity.value = this._params.opacity
        this._background.material.uniforms.uOpacity.value = this._params.opacity
      }
    })
  }

  onMouseEnter(e, i) {
    this.checkTween('scale')
    this._isHover = true
    this?._video?.play()
    this._tweens.scale = gsap.to(this._params, {
      scale: (this._el?.dataset?.display === 'work_alpha_mask_vertical') ? .98 : .96,
      hover: 1,
      duration: .3,
      onStart: () => {
        this._background.material.uniforms.uVisibility.value = 1
      },
      onUpdate: () => {
        this._mesh.scale.y = this._scale.y * this._params.scale
        this._mesh.scale.x = this._scale.x - (this._scale.y - this._mesh.scale.y)
        this._mesh.material.uniforms.uScale.value = new Vector2(this._mesh.scale.x, this._mesh.scale.y)
        this._mesh.material.uniforms.uHover.value = this._params.hover

        this._background.material.uniforms.uHover.value = this._params.hover

        this._setPos()
      }
    })
  }

  onMouseLeave(e, i) {
    this.checkTween('scale')
    this._isHover = false
    this?._video?.pause()
    this._tweens.scale = gsap.to(this._params, {
      scale: 1,
      hover: 0,
      duration: .3,
      onUpdate: () => {
        this._mesh.scale.y = this._scale.y * this._params.scale
        this._mesh.scale.x = this._scale.x - (this._scale.y - this._mesh.scale.y)
        this._mesh.material.uniforms.uScale.value = new Vector2(this._mesh.scale.x, this._mesh.scale.y)
        this._mesh.material.uniforms.uHover.value = this._params.hover

        this._background.material.uniforms.uHover.value = this._params.hover

        this._setPos()
      },
      onComplete: () => {
        this._background.material.uniforms.uVisibility.value = 0
      }
    })
  }

  hide() {
    this.checkTween('status')

    this.isMoving = true
    this.isVisible = false

    this._background.material.uniforms.uStatus.value = 0

    this._tweens.status = gsap.timeline({
      onComplete: () => {
        this.isMoving = false
      }
    })

    this._tweens.status.to(this._params, {
      status: 0,
      duration: .3,
      onUpdate: () => {
        this._mesh.material.uniforms.uStatus.value = this._params.status
      }
    })
  }


  show() {
    this.checkTween('status')

    this.isMoving = true

    this._bounds = this.getBounds()

    const posCurr = new Vector3().copy(this._pos)
    const posNext = DOMPosition(this._camera, { x: this._bounds.x, y: this._bounds.y }, { x: Viewport.width, y: Viewport.height }, this._scale)

    this._tweens.status = gsap.timeline({
      onComplete: () => {
        this.isMoving = false
        this.isVisible = true
      }
    })

    this._tweens.status.add('anim')

    this._tweens.status.to(this._params, {
      status: 1,
      duration: .3,
      onUpdate: () => {
        this._mesh.material.uniforms.uStatus.value = this._params.status
      },
      onComplete: () => {
        this._background.material.uniforms.uStatus.value = 1
      },
    }, 'anim')

    this._tweens.status.to(posCurr, {
      x: posNext.x,
      y: posNext.y,
      duration: .3,
      onUpdate: () => {
        this.position.x = posCurr.x
        this.position.y = posCurr.y
      }
    }, 'anim')
  }

  /**
   * Mousemove Event
   */
  onMousemove ({ centeredMousePosition, mousePosition, normalizedMousePosition }) {
    this._centeredMousePosition = centeredMousePosition
    this._mousePosition = mousePosition
    this._normalizedMousePosition = normalizedMousePosition

    this._mesh.material.uniforms.uMouse.value = centeredMousePosition
  }

  onResize() {
    if (this._el) {
      this._bounds = this.getBounds()

      const camera = DOMViewport(this._camera)

      this._mesh.material.uniforms.uViewport.value = new Vector2(camera.x, camera.y)
      this._background.material.uniforms.uViewport.value = new Vector2(camera.x, camera.y)

      this._setScale()
      this._setPos()
      this._setRot()
    }
  }

  onUpdate() {
    this._oldCenteredMousePosition.lerp(this._centeredMousePosition, .1)

    this._mesh.material.uniforms.uMouseDistance.value = clamp(this._oldCenteredMousePosition.distanceTo(this._centeredMousePosition) * 10, 0, 1)

    if (
      this._el &&
      this._el.getBoundingClientRect &&
      window
    ) {
      this._bounds = this.getBounds()

      if (!this.isMoving) {
        this._setRot()
        this._setPos()
      }
    }
  }

  getBounds() {
    return {
      width: this._el.offsetWidth,
      height: this._el.offsetHeight,
      x: (this._el.offsetLeft) ? this._el.getBoundingClientRect().x : (this?._el?.offsetParent?.offsetLeft) ? this._el.offsetParent.getBoundingClientRect().x : 0,
      y: (this._el.offsetTop) ? this._el.getBoundingClientRect().y : (this?._el?.offsetParent?.offsetTop) ? this._el.offsetParent.getBoundingClientRect().y : 0
    }
  }

  destroy() {
    super.destroy()

    this.remove(this._mesh)

    this._mesh.material.dispose()
    this._mesh.geometry.dispose()

    this.remove(this._background)
    this._background.material.dispose()
    this._background.geometry.dispose()
  }

  /**
   * Getters
   */
  get image() {
    return this._image
  }

  get material() {
    return this._mesh.material
  }

  get geometry() {
    return this._mesh.geometry
  }

  get mesh() {
    return this._mesh
  }

  get background() {
    return this._background
  }

  get categories () {
    return this._component.data.categories
  }

  get params () {
    return this._params
  }
}

export default Work
