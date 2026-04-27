import { VideoTexture } from 'three'

class ThreeVideoLoader {
  load ({ path }) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')

      video.setAttribute('webkit-playsinline', 'webkit-playsinline')
      video.setAttribute('playsinline', '')

      video.controls = false
      video.playsinline = true
      video.muted = true
      video.loop = true
      video.autoplay = true
      video.crossOrigin = 'anonymous'

      video.src = path
      video.preload = 'auto'

      const texture = new VideoTexture(video)

      video.play()

      let resolved = false
      const timeout = setTimeout(() => {
        if (!resolved) reject(new Error(`Video load timeout: ${path}`))
      }, 8000)

      video.onloadedmetadata = () => {
        resolved = true
        clearTimeout(timeout)
        resolve({ texture, path, video })
      }
      video.onerror = () => {
        resolved = true
        clearTimeout(timeout)
        reject(new Error(`Video failed to load: ${path}`))
      }
    })
  }
}

export default ThreeVideoLoader
