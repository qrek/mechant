<template>
  <section class="Playground">

    <div class="Playground_canvas" ref="canvas"></div>

    <!-- HUD -->
    <header class="Playground_hud Playground_hud--top">
      <div class="Playground_label">
        <span class="dot"></span>
        Playground
      </div>
      <div class="Playground_meta">
        <span v-if="stats.tris">{{ stats.tris }}k tris</span>
        <span v-if="stats.fileSize">· {{ stats.fileSize }}</span>
      </div>
    </header>

    <footer class="Playground_hud Playground_hud--bottom">
      <span>{{ comingSoon }}</span>
    </footer>

    <!-- Loader -->
    <transition name="fade">
      <div v-if="loading" class="Playground_loader">
        <div class="Playground_loader_inner">
          <div class="Playground_loader_label">Loading scene</div>
          <div v-if="progress > 0" class="Playground_loader_track">
            <div class="Playground_loader_bar" :style="{ width: progress + '%' }"></div>
          </div>
        </div>
      </div>
    </transition>

  </section>
</template>

<script>
export default {
  name: 'Playground',

  head () {
    return {
      title: 'Playground — MÉCHANT',
      meta: [{ hid: 'description', name: 'description', content: 'Studio playground — soon home to our 3D characters.' }]
    }
  },

  data () {
    return {
      sceneUrl: '/playground/scene.glb',
      loading: true,
      progress: 0,
      comingSoon: 'Théo & Ronan dropping in soon',
      stats: { tris: 0, fileSize: '' }
    }
  },

  mounted () {
    this._initThree()
  },

  beforeDestroy () {
    this._destroyThree()
  },

  methods: {
    async _initThree () {
      const THREE = await import('three')
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
      this._THREE = THREE

      const container = this.$refs.canvas
      const width = container.clientWidth
      const height = container.clientHeight

      // ── Scene : fond blanc cassé, fog blanc pour adoucir la profondeur ──
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0xf5f5f5)
      scene.fog = new THREE.Fog(0xf5f5f5, 8, 30)
      this._scene = scene

      // ── Camera : fixe, de face, rotation Y = 0 ─────────────────────
      const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100)
      camera.position.set(0, 1.6, 5)
      camera.lookAt(0, 1.4, 0)
      this._camera = camera

      // ── Renderer ─────────────────────────────────────────────────
      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.outputEncoding = THREE.sRGBEncoding
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.05
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.physicallyCorrectLights = true
      container.appendChild(renderer.domElement)
      this._renderer = renderer

      // ── Lumières : éclairage studio clean ─────────────────────────
      this._buildLights()

      // ── Charge la scène GLB ──────────────────────────────────────
      try {
        const head = await fetch(this.sceneUrl, { method: 'HEAD' })
        const bytes = parseInt(head.headers.get('content-length') || '0', 10)
        if (bytes) this.stats.fileSize = this._formatBytes(bytes)
      } catch (_) {}

      const loader = new GLTFLoader()
      loader.load(
        this.sceneUrl,
        (gltf) => {
          const model = gltf.scene
          this._sceneModel = model
          scene.add(model)

          // Active les ombres sur tous les meshes
          let tris = 0
          model.traverse((obj) => {
            if (obj.isMesh) {
              obj.castShadow = true
              obj.receiveShadow = true
              const geo = obj.geometry
              if (geo.index) tris += geo.index.count / 3
              else if (geo.attributes.position) tris += geo.attributes.position.count / 3
            }
          })
          this.stats.tris = Math.round(tris / 1000)

          // Auto-frame : recentre la scène et ajuste la caméra selon la bbox
          this._frameScene()
          this.loading = false
        },
        (xhr) => {
          if (xhr.lengthComputable) {
            this.progress = Math.round((xhr.loaded / xhr.total) * 100)
          }
        },
        (err) => {
          console.error('Scene load error:', err)
          this.loading = false
        }
      )

      // ── Resize ───────────────────────────────────────────────────
      this._onResize = () => {
        const w = container.clientWidth
        const h = container.clientHeight
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }
      window.addEventListener('resize', this._onResize)

      // ── Animation loop ───────────────────────────────────────────
      this._tick = () => {
        renderer.render(scene, camera)
        this._raf = requestAnimationFrame(this._tick)
      }
      this._tick()
    },

    _frameScene () {
      if (!this._sceneModel || !this._THREE) return
      const THREE = this._THREE

      const box = new THREE.Box3().setFromObject(this._sceneModel)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())

      // Repositionne la scène : pieds au sol (y=0), centrée sur X/Z
      this._sceneModel.position.set(
        -center.x,
        -box.min.y,
        -center.z
      )

      // Recalcule la bbox après repositionnement pour cadrer la caméra
      const newBox = new THREE.Box3().setFromObject(this._sceneModel)
      const newSize = newBox.getSize(new THREE.Vector3())

      // Place la caméra à distance suffisante pour voir toute la profondeur
      // tout en gardant rotation Y = 0 (regard horizontal vers -Z)
      const maxHorizontal = Math.max(newSize.x, newSize.z)
      const distance = maxHorizontal * 0.8
      const eyeHeight = Math.min(1.7, newSize.y * 0.55)

      this._camera.position.set(0, eyeHeight, distance)
      this._camera.lookAt(0, eyeHeight, 0)
      this._camera.updateProjectionMatrix()
    },

    _buildLights () {
      const THREE = this._THREE
      const scene = this._scene

      // Hemisphere : ciel blanc / sol légèrement teinté pour pas être plat
      const hemi = new THREE.HemisphereLight(0xffffff, 0xe0e0e6, 0.85)
      scene.add(hemi)

      // Key light : directionnelle douce depuis le haut-avant droit
      const key = new THREE.DirectionalLight(0xffffff, 1.2)
      key.position.set(4, 8, 6)
      key.castShadow = true
      key.shadow.mapSize.set(2048, 2048)
      key.shadow.camera.near = 0.5
      key.shadow.camera.far = 30
      key.shadow.camera.left = -8
      key.shadow.camera.right = 8
      key.shadow.camera.top = 8
      key.shadow.camera.bottom = -8
      key.shadow.bias = -0.0005
      key.shadow.normalBias = 0.02
      scene.add(key)

      // Fill light : douce depuis l'autre côté pour adoucir les ombres
      const fill = new THREE.DirectionalLight(0xffffff, 0.4)
      fill.position.set(-5, 4, 4)
      scene.add(fill)

      // Rim subtle pour décoller du fond (chaud léger, comme une lumière naturelle)
      const rim = new THREE.DirectionalLight(0xfff4e6, 0.3)
      rim.position.set(0, 3, -6)
      scene.add(rim)
    },

    _formatBytes (bytes) {
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    },

    _destroyThree () {
      cancelAnimationFrame(this._raf)
      window.removeEventListener('resize', this._onResize)

      if (this._scene) {
        this._scene.traverse((obj) => {
          if (obj.isMesh || obj.isPoints) {
            if (obj.geometry) obj.geometry.dispose()
            if (obj.material) {
              const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
              mats.forEach((m) => {
                Object.keys(m).forEach((key) => {
                  const val = m[key]
                  if (val && val.isTexture) val.dispose()
                })
                m.dispose()
              })
            }
          }
        })
      }
      if (this._renderer) {
        this._renderer.dispose()
        this._renderer.forceContextLoss?.()
        if (this._renderer.domElement?.parentNode) {
          this._renderer.domElement.parentNode.removeChild(this._renderer.domElement)
        }
      }
      this._scene = null
      this._camera = null
      this._renderer = null
      this._sceneModel = null
      this._THREE = null
    }
  }
}
</script>

<style lang="sass" scoped>
.Playground
  position: fixed
  inset: 0
  background: #f5f5f5
  overflow: hidden
  z-index: 1

  &_canvas
    position: absolute
    inset: 0
    width: 100%
    height: 100%

    ::v-deep canvas
      display: block
      outline: none

  &_hud
    position: absolute
    z-index: 5
    color: $black
    font-family: $apfel
    pointer-events: none

    button, a
      pointer-events: auto

    &--top
      top: 1.5rem
      left: 1.5rem
      right: 1.5rem
      display: flex
      justify-content: space-between
      align-items: center
      gap: 1.5rem
      flex-wrap: wrap

      +breakpoint(mobile)
        top: 1rem
        left: 1rem
        right: 1rem

    &--bottom
      bottom: 1.5rem
      left: 50%
      transform: translateX(-50%)
      font-size: 0.7rem
      letter-spacing: 0.15em
      text-transform: uppercase
      color: rgba(0, 0, 0, 0.4)
      white-space: nowrap

      +breakpoint(mobile)
        bottom: 1rem
        font-size: 0.6rem
        max-width: 90vw
        white-space: normal
        text-align: center

  &_label
    display: inline-flex
    align-items: center
    gap: 0.6rem
    font-size: 0.75rem
    letter-spacing: 0.2em
    text-transform: uppercase
    font-weight: 700
    color: $black

    .dot
      width: 0.5rem
      height: 0.5rem
      border-radius: 50%
      background: #ff4500
      animation: pulse 2s ease-in-out infinite
      box-shadow: 0 0 12px rgba(255, 69, 0, 0.4)

  &_meta
    font-size: 0.7rem
    letter-spacing: 0.1em
    color: rgba(0, 0, 0, 0.4)
    display: flex
    gap: 0.4rem

  &_loader
    position: absolute
    inset: 0
    z-index: 10
    display: flex
    align-items: center
    justify-content: center
    background: #f5f5f5

    &_inner
      display: flex
      flex-direction: column
      align-items: center
      gap: 1rem
      width: min(280px, 70vw)

    &_label
      font-family: $apfel
      font-weight: 700
      font-size: 0.75rem
      letter-spacing: 0.2em
      text-transform: uppercase
      color: rgba(0, 0, 0, 0.5)

    &_track
      width: 100%
      height: 2px
      background: rgba(0, 0, 0, 0.08)
      overflow: hidden
      border-radius: 1px

    &_bar
      height: 100%
      background: #ff4500
      transition: width 0.2s ease

@keyframes pulse
  0%, 100%
    opacity: 1
  50%
    opacity: 0.4

.fade-enter-active, .fade-leave-active
  transition: opacity 0.5s ease

.fade-enter, .fade-leave-to
  opacity: 0
</style>
