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

      video.onloadedmetadata = () => resolve({ texture, path, video })
      video.onerror = () => reject(new Error(`Video failed to load: ${path}`))

      // Timeout de sécurité : si la vidéo ne charge pas en 15s, on rejette
      setTimeout(() => reject(new Error(`Video load timeout: ${path}`)), 15000)
    })
  }
}

export default ThreeVideoLoader
