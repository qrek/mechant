import {
  PerspectiveCamera,
  Object3D,
  Vector3,
  Mesh,
  BoxBufferGeometry,
  MeshNormalMaterial
} from 'three'

import Viewport from '@/webgl/utils/Viewport'

import { singleton } from '@/webgl/utils/Singleton'

const FOV = 50

class MainCamera extends singleton(Object3D) {
  constructor () {
    super()
    this._ratio = Viewport.ratio

    this._params = {
      pos: new Vector3(0, 0, 5),
      target: new Vector3(0, 0, 0)
    }

    this._camera = this._initCamera()

    this.position.set(0, 0, 0)

    this.add(this._camera)
  }

  /**
   * Private
   */
  _initCamera () {
    const camera = new PerspectiveCamera(FOV, this._ratio, 0.01, 2000)

    camera.position.copy(this._params.pos)
    camera.fov = FOV

    camera.lookAt(0, 0, 0)

    return camera
  }

  /**
   * Getters
   */
  get camera () {
    return this._camera
  }

  /**
   * Resize
   */
  resize ({ width, height, ratio }) {
    this._camera.aspect = ratio
    this._camera.fov = FOV
    this._camera.updateProjectionMatrix()
  }
}

export default MainCamera
