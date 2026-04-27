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

      video.onloadedmetadata = () => {
        resolve({
          texture,
          path,
          video
        })
      }
    })
  }
}

export default ThreeVideoLoader
