import Singleton from '@/webgl/utils/Singleton'

class RenderTargetsManager extends Singleton {
  onInit () {
    this.targets = []
  }

  registerRenderTarget (item) {
    this.targets.push(item)
  }

  render (renderer) {
    for (let i = 0; i < this.targets.length; i++) {
      const target = this.targets[i]
      renderer.setRenderTarget(target.rt)
      renderer.clear()
      renderer.render(target.scene, target.camera)
      renderer.setRenderTarget(null)
    }
  }
}

export default RenderTargetsManager
