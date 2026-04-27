import {
  EffectComposer,
  EffectPass,
  RenderPass,
  SMAAEffect
} from 'postprocessing'

import renderer from '@/webgl/modules/Render/Renderer'

class PostFx {
  setup (scene, camera) {
    this._renderer = renderer

    this.composer = new EffectComposer(renderer)
    this.composer.addPass(new RenderPass(scene, camera))
    this.composer.addPass(new EffectPass(camera, new SMAAEffect()))
  }

  render (scene, camera) {
    this.composer.render()
  }
}

export default new PostFx()
