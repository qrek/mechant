import {component} from "bidello";
import {Mesh, Vector2} from "three";

import Viewport from "@/webgl/utils/Viewport";
import ResourceLoader from "@/webgl/vendor/resource-loader/ResourceLoader";
import {DOMPosition, DOMScale, DOMViewport} from "@/webgl/utils/DOM";
import Root from '@/webgl/utils/Root'

class Slide extends component(Mesh) {
  constructor({ geometry, material, index, key, image, el, content, camera, getParams, realIndex }) {
    super(geometry, material);

    this._root = new Root()

    this._el = el
    this._content = content
    this._camera = camera
    this._index = index
    this._key = key
    this._realIndex = realIndex
    this._image = image

    this._getParams = getParams

    this._posX = 0

    this._params = {
      extra: 0,
      isBefore: false,
      isAfter: false,
    }

    this._setParams()
    this._init()
  }

  _setParams() {
    this._params = {
      ...this._params,
      ...this._getParams()
    }
  }

  _init() {
    const camera = DOMViewport(this._camera)

    const { texture, video } = ResourceLoader.get((this.isMobile) ? `${this._image}_mobile` : this._image )

    if (video) {
      video.currentTime = 0
      if (this._realIndex !== 0) {
        video.autoplay = false
        video.pause()
      }
    }

    this._video = video || null

    const w = (texture.image.videoWidth || texture.image.naturalWidth || texture.image.width || 1920)
    const h = (texture.image.videoHeight || texture.image.naturalHeight || texture.image.height || 1080)
    this.material.uniforms.uResolution.value = new Vector2(w, h)
    this.material.uniforms.uTexture.value = texture
    this.material.uniforms.uViewport.value = new Vector2(camera.x, camera.y)

    const posX = this._params.width * this._key

    this.position.x = posX
    this.position.y = 0

    this._posX = posX

    this._setScale()
  }

  _setScale() {
    const { width, height } = this._params.bounds

    const scale = DOMScale(this._camera, { x: width, y: height }, { x: Viewport.width, y: Viewport.height })
    this.scale.set(scale.x, scale.y * 1.1, scale.z)
    this.material.uniforms.uScale.value = new Vector2(scale.x, scale.y * 1.1)
  }

  _setPos() {
    const { extra } = this._params

    this.position.x = this._posX - this._params.translate.current - extra

    const planeOffset = this._params.width

    const vFOV = this._camera.fov * (Math.PI / 180)
    const height = 2 * Math.tan( vFOV / 2 ) * this._camera.position.z;
    const width = height * this._camera.aspect;

    const viewportOffset = width / 2

    this._params.isBefore = this.position.x + planeOffset < -viewportOffset
    this._params.isAfter = this.position.x - planeOffset > viewportOffset

    if (this._params.isBefore) {
      this._params.extra -= this._params.widthTotal

      this._params.isBefore = false
      this._params.isAfter = false
    }

    if (this._params.isAfter) {
      this._params.extra += this._params.widthTotal

      this._params.isBefore = false
      this._params.isAfter = false
    }
  }

  onResize() {
    if (this._el) {
      const camera = DOMViewport(this._camera)

      this.material.uniforms.uViewport.value = new Vector2(camera.x, camera.y)

      this._params = {
        extra: 0,
        isBefore: false,
        isAfter: false,
      }

      this._setParams()

      const posX = this._params.width * this._key

      this.position.x = posX
      this.position.y = 0

      this._posX = posX

      this._setScale()
      this._setPos()
    }
  }

  onUpdate() {
    this._setParams()

    if (this._el) {
      this.material.uniforms.uOffsetR.value.set((this._params.translate.last - this._params.translate.current) * -.1, 0)
      // this.material.uniforms.uOffsetG.value.set((this._params.translate.last - this._params.translate.current) * .3, 0)
      this.material.uniforms.uOffsetB.value.set((this._params.translate.last - this._params.translate.current) * .1, 0)

      this._setScale()
      this._setPos()
    }
  }

  /**
   * Getters
   */
  get index() {
    return this._index
  }

  get realIndex() {
    return this._realIndex
  }

  get image() {
    return this._image
  }

  get isMobile () {
    return this._root.getStoreValue('layout', 'isMobile')
  }

  get video () {
    return this._video
  }
}

export default Slide
