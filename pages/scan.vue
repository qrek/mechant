<template>
  <section class="ScanPage">

    <!-- Conteneur du canvas Three.js -->
    <div class="ScanPage_canvas" ref="canvas"></div>

    <!-- HUD : infos + contrôles -->
    <header class="ScanPage_hud ScanPage_hud--top">
      <div class="ScanPage_label">
        <span class="dot"></span>
        Studio scan
      </div>
      <div class="ScanPage_meta">
        <span v-if="stats.tris">{{ stats.tris }}k tris</span>
        <span v-if="fileSize">· {{ fileSize }}</span>
        <span v-if="loadTime">· loaded in {{ loadTime }}ms</span>
      </div>
    </header>

    <div class="ScanPage_hud ScanPage_hud--right">
      <button class="ScanPage_btn" :class="{ 'is-active': autoRotate }" @click="toggleAutoRotate">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M21 12a9 9 0 1 1-3-6.7"/>
          <polyline points="21 4 21 10 15 10"/>
        </svg>
        {{ autoRotate ? 'Stop' : 'Auto-rotate' }}
      </button>
      <button class="ScanPage_btn" @click="resetView">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M3 12a9 9 0 1 0 9-9"/>
          <polyline points="3 4 3 12 11 12"/>
        </svg>
        Reset view
      </button>
      <button class="ScanPage_btn" @click="toggleWireframe">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <rect x="3" y="3" width="18" height="18"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="12" y1="3" x2="12" y2="21"/>
        </svg>
        {{ wireframe ? 'Solid' : 'Wireframe' }}
      </button>
    </div>

    <footer class="ScanPage_hud ScanPage_hud--bottom">
      <span>Drag to rotate</span>
      <span class="sep">·</span>
      <span>Scroll to zoom</span>
      <span class="sep">·</span>
      <span>Right-click to pan</span>
    </footer>

    <!-- Loader pendant le téléchargement du GLB -->
    <transition name="fade">
      <div v-if="loading" class="ScanPage_loader">
        <div class="ScanPage_loader_inner">
          <div class="ScanPage_loader_label">Loading scan</div>
          <div class="ScanPage_loader_track">
            <div class="ScanPage_loader_bar" :style="{ width: progress + '%' }"></div>
          </div>
          <div class="ScanPage_loader_pct">{{ progress }}%</div>
        </div>
      </div>
    </transition>

    <!-- Erreur de chargement -->
    <div v-if="error" class="ScanPage_error">
      <p class="title">Couldn't load scan</p>
      <p class="message">{{ error }}</p>
    </div>

  </section>
</template>

<script>
// On importe Three.js et les loaders/contrôles à l'exécution (côté client uniquement)
// pour éviter les erreurs SSR de Nuxt.

export default {
  name: 'ScanPage',

  head () {
    return {
      title: 'Scan — MÉCHANT',
      meta: [{ hid: 'description', name: 'description', content: 'Studio scan 3D viewer.' }]
    }
  },

  data () {
    return {
      // URL du modèle — éditable via query string ?model=/scan/autre.glb
      modelUrl: '/scan/studio.glb',
      loading: true,
      progress: 0,
      error: null,
      autoRotate: false,
      wireframe: false,
      fileSize: '',
      loadTime: 0,
      stats: {
        tris: 0,
        meshes: 0
      }
    }
  },

  mounted () {
    // Override modelUrl si query string ?model=...
    if (this.$route.query.model) {
      this.modelUrl = this.$route.query.model
    }
    this._initThree()
  },

  beforeDestroy () {
    this._destroyThree()
  },

  methods: {
    async _initThree () {
      // Imports dynamiques — Three n'est pas tree-shakeable à fond, on charge ce qu'il faut
      const THREE = await import('three')
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')

      this._THREE = THREE

      const container = this.$refs.canvas
      const width = container.clientWidth
      const height = container.clientHeight

      // ── Scene ───────────────────────────────────────────────────────
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x0a0a0a)
      this._scene = scene

      // ── Camera ──────────────────────────────────────────────────────
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000)
      camera.position.set(3, 2, 4)
      this._camera = camera

      // ── Renderer ────────────────────────────────────────────────────
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.outputEncoding = THREE.sRGBEncoding
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.0
      renderer.physicallyCorrectLights = true
      container.appendChild(renderer.domElement)
      this._renderer = renderer

      // ── Lumières ────────────────────────────────────────────────────
      // Hemisphere : ciel doux + sol gris pour fill global
      const hemi = new THREE.HemisphereLight(0xffffff, 0x404040, 0.8)
      scene.add(hemi)

      // Directional : lumière principale (style soleil)
      const key = new THREE.DirectionalLight(0xffffff, 1.2)
      key.position.set(5, 8, 4)
      scene.add(key)

      // Fill light pour adoucir les ombres
      const fill = new THREE.DirectionalLight(0xa0c0ff, 0.4)
      fill.position.set(-5, 3, -2)
      scene.add(fill)

      // ── Controls ────────────────────────────────────────────────────
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.08
      controls.rotateSpeed = 0.7
      controls.zoomSpeed = 0.8
      controls.panSpeed = 0.6
      controls.minDistance = 0.3
      controls.maxDistance = 50
      controls.autoRotateSpeed = 0.6
      this._controls = controls

      // ── Chargement du modèle GLB ────────────────────────────────────
      const loader = new GLTFLoader()
      const startTime = performance.now()

      // Récupère la taille du fichier via fetch HEAD
      try {
        const head = await fetch(this.modelUrl, { method: 'HEAD' })
        const bytes = parseInt(head.headers.get('content-length') || '0', 10)
        if (bytes) this.fileSize = this._formatBytes(bytes)
      } catch (_) {}

      loader.load(
        this.modelUrl,
        (gltf) => {
          const model = gltf.scene
          this._model = model
          scene.add(model)

          // Auto-frame : centre + ajuste la caméra sur la bounding box
          this._frameModel()

          // Stats : compte les triangles
          let tris = 0
          let meshes = 0
          model.traverse((obj) => {
            if (obj.isMesh) {
              meshes++
              const geo = obj.geometry
              if (geo.index) tris += geo.index.count / 3
              else if (geo.attributes.position) tris += geo.attributes.position.count / 3
            }
          })
          this.stats.tris = Math.round(tris / 1000)
          this.stats.meshes = meshes

          this.loadTime = Math.round(performance.now() - startTime)
          this.loading = false
        },
        (xhr) => {
          if (xhr.lengthComputable) {
            this.progress = Math.round((xhr.loaded / xhr.total) * 100)
          }
        },
        (err) => {
          console.error('GLB load error:', err)
          this.error = err?.message || 'Unknown error'
          this.loading = false
        }
      )

      // ── Resize handler ──────────────────────────────────────────────
      this._onResize = () => {
        const w = container.clientWidth
        const h = container.clientHeight
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }
      window.addEventListener('resize', this._onResize)

      // ── Animation loop ──────────────────────────────────────────────
      this._tick = () => {
        controls.autoRotate = this.autoRotate
        controls.update()
        renderer.render(scene, camera)
        this._raf = requestAnimationFrame(this._tick)
      }
      this._tick()
    },

    _frameModel () {
      if (!this._model) return
      const THREE = this._THREE

      const box = new THREE.Box3().setFromObject(this._model)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())

      // Recentre le modèle à l'origine
      this._model.position.sub(center)

      // Calcule la distance idéale pour cadrer le modèle
      const maxDim = Math.max(size.x, size.y, size.z)
      const fov = this._camera.fov * (Math.PI / 180)
      const distance = (maxDim / 2) / Math.tan(fov / 2) * 1.4

      // Position iso : 3/4 face en hauteur
      this._camera.position.set(distance, distance * 0.7, distance)
      this._camera.lookAt(0, 0, 0)
      this._camera.near = distance / 100
      this._camera.far = distance * 100
      this._camera.updateProjectionMatrix()

      this._controls.target.set(0, 0, 0)
      this._controls.update()

      // Sauvegarde la pose initiale pour Reset view
      this._initialCameraPos = this._camera.position.clone()
      this._initialTarget = this._controls.target.clone()
    },

    resetView () {
      if (!this._initialCameraPos || !this._THREE) return
      const THREE = this._THREE
      const startPos = this._camera.position.clone()
      const startTarget = this._controls.target.clone()
      const endPos = this._initialCameraPos
      const endTarget = this._initialTarget

      // Tween manuel sur 600ms
      const duration = 600
      const t0 = performance.now()
      const ease = (t) => 1 - Math.pow(1 - t, 3) // easeOutCubic

      const animate = () => {
        const elapsed = performance.now() - t0
        const t = Math.min(elapsed / duration, 1)
        const e = ease(t)
        this._camera.position.lerpVectors(startPos, endPos, e)
        this._controls.target.lerpVectors(startTarget, endTarget, e)
        if (t < 1) requestAnimationFrame(animate)
      }
      animate()
    },

    toggleAutoRotate () {
      this.autoRotate = !this.autoRotate
    },

    toggleWireframe () {
      if (!this._model) return
      this.wireframe = !this.wireframe
      this._model.traverse((obj) => {
        if (obj.isMesh && obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.wireframe = this.wireframe)
          } else {
            obj.material.wireframe = this.wireframe
          }
        }
      })
    },

    _formatBytes (bytes) {
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    },

    _destroyThree () {
      cancelAnimationFrame(this._raf)
      window.removeEventListener('resize', this._onResize)

      if (this._controls) this._controls.dispose()
      if (this._model) {
        this._model.traverse((obj) => {
          if (obj.isMesh) {
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
      this._controls = null
      this._model = null
      this._THREE = null
    }
  }
}
</script>

<style lang="sass" scoped>
.ScanPage
  position: fixed
  inset: 0
  background: #0a0a0a
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

  // ── HUD ──────────────────────────────────────────────────────────────
  &_hud
    position: absolute
    z-index: 5
    color: $white
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

    &--right
      top: 5rem
      right: 1.5rem
      display: flex
      flex-direction: column
      gap: 0.6rem
      align-items: flex-end
      pointer-events: auto

      +breakpoint(mobile)
        top: auto
        bottom: 5rem
        right: 1rem
        left: 1rem
        flex-direction: row
        justify-content: center

    &--bottom
      bottom: 1.5rem
      left: 50%
      transform: translateX(-50%)
      display: flex
      align-items: center
      gap: 0.6rem
      font-size: 0.7rem
      letter-spacing: 0.15em
      text-transform: uppercase
      color: rgba(255, 255, 255, 0.4)
      white-space: nowrap

      +breakpoint(mobile)
        bottom: 1rem
        font-size: 0.6rem
        flex-wrap: wrap
        justify-content: center
        max-width: 90vw

      .sep
        opacity: 0.4

  &_label
    display: inline-flex
    align-items: center
    gap: 0.6rem
    font-size: 0.75rem
    letter-spacing: 0.2em
    text-transform: uppercase
    font-weight: 700

    .dot
      width: 0.5rem
      height: 0.5rem
      border-radius: 50%
      background: #ff4500
      animation: pulse 2s ease-in-out infinite

  &_meta
    font-size: 0.7rem
    letter-spacing: 0.1em
    color: rgba(255, 255, 255, 0.5)
    display: flex
    gap: 0.4rem
    flex-wrap: wrap

  &_btn
    display: inline-flex
    align-items: center
    gap: 0.5rem
    padding: 0.6rem 1rem
    background: rgba(255, 255, 255, 0.06)
    border: 1px solid rgba(255, 255, 255, 0.12)
    border-radius: 999px
    color: $white
    font-family: $apfel
    font-weight: 700
    font-size: 0.7rem
    letter-spacing: 0.12em
    text-transform: uppercase
    cursor: pointer
    backdrop-filter: blur(8px)
    -webkit-backdrop-filter: blur(8px)
    transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease

    &:hover
      background: rgba(255, 255, 255, 0.12)
      border-color: rgba(255, 255, 255, 0.25)
      transform: translateY(-1px)

    &:active
      transform: translateY(0)

    &.is-active
      background: #ff4500
      border-color: #ff4500
      color: $black

  // ── Loader ───────────────────────────────────────────────────────────
  &_loader
    position: absolute
    inset: 0
    z-index: 10
    display: flex
    align-items: center
    justify-content: center
    background: #0a0a0a

    &_inner
      display: flex
      flex-direction: column
      align-items: center
      gap: 1.2rem
      width: min(360px, 80vw)

    &_label
      font-family: $apfel
      font-weight: 700
      font-size: 0.75rem
      letter-spacing: 0.2em
      text-transform: uppercase
      color: rgba(255, 255, 255, 0.6)

    &_track
      width: 100%
      height: 2px
      background: rgba(255, 255, 255, 0.1)
      overflow: hidden
      border-radius: 1px

    &_bar
      height: 100%
      background: #ff4500
      transition: width 0.2s ease

    &_pct
      font-family: $apfel
      font-weight: 900
      font-size: 2.5rem
      color: $white
      letter-spacing: -0.02em
      line-height: 1

  // ── Erreur ───────────────────────────────────────────────────────────
  &_error
    position: absolute
    top: 50%
    left: 50%
    transform: translate(-50%, -50%)
    text-align: center
    color: $white
    z-index: 6

    .title
      font-family: $apfel
      font-weight: 900
      font-size: 1.4rem
      text-transform: uppercase
      letter-spacing: -0.01em
      margin: 0 0 0.5rem

    .message
      font-family: $apfel
      font-size: 0.85rem
      color: rgba(255, 255, 255, 0.5)
      margin: 0

@keyframes pulse
  0%, 100%
    opacity: 1
    transform: scale(1)
  50%
    opacity: 0.5
    transform: scale(0.8)

.fade-enter-active, .fade-leave-active
  transition: opacity 0.4s ease

.fade-enter, .fade-leave-to
  opacity: 0
</style>
