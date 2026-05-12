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
          <div class="Playground_loader_label">Loading character</div>
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
      // GLB du perso (placé dans la box blanche, face caméra)
      characterUrl: '/playground/scene.glb',
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

      // ── Scene : blanc cassé, fog blanc subtil pour adoucir les profondeurs ──
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0xf2f2f0)
      scene.fog = new THREE.Fog(0xf2f2f0, 10, 35)
      this._scene = scene

      // ── Camera : fixe, hauteur d'œil, regard horizontal pur ──────
      const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100)
      camera.position.set(0, 1.6, 4.5)
      camera.lookAt(0, 1.4, 0)        // rotation Y = 0, légère plongée
      this._camera = camera

      // ── Renderer ─────────────────────────────────────────────────
      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.outputEncoding = THREE.sRGBEncoding
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 0.95     // un poil sous-exposé = tamisé
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.physicallyCorrectLights = true
      container.appendChild(renderer.domElement)
      this._renderer = renderer

      // ── Box blanche (sol + 3 murs) ───────────────────────────────
      this._buildBox()

      // ── Lighting tamisée ─────────────────────────────────────────
      this._buildLights()

      // ── Charge le perso ──────────────────────────────────────────
      try {
        const head = await fetch(this.characterUrl, { method: 'HEAD' })
        const bytes = parseInt(head.headers.get('content-length') || '0', 10)
        if (bytes) this.stats.fileSize = this._formatBytes(bytes)
      } catch (_) {}

      const loader = new GLTFLoader()
      loader.load(
        this.characterUrl,
        (gltf) => {
          this._placeCharacter(gltf.scene)
          this.loading = false
        },
        (xhr) => {
          if (xhr.lengthComputable) {
            this.progress = Math.round((xhr.loaded / xhr.total) * 100)
          }
        },
        (err) => {
          console.error('Character load error:', err)
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

    // ── Box blanche : sol + mur fond + 2 murs latéraux ─────────────
    _buildBox () {
      const THREE = this._THREE
      const scene = this._scene

      const BOX = {
        w: 20,     // largeur (x)
        h: 10,     // hauteur murs (y)
        d: 20,     // profondeur (z)
        zFront: 4, // bord avant (derrière la caméra)
        zBack: -16 // bord arrière (mur du fond)
      }
      const zMid = (BOX.zFront + BOX.zBack) / 2

      // Sol — légèrement gris pour pas être 100% blanc plat (donne du contraste à l'ombre)
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(BOX.w, BOX.d),
        new THREE.MeshStandardMaterial({
          color: 0xeeeeec,
          roughness: 0.9,
          metalness: 0.0
        })
      )
      floor.rotation.x = -Math.PI / 2
      floor.position.z = zMid
      floor.receiveShadow = true
      scene.add(floor)

      // Murs — encore plus clairs que le sol
      const wallMat = new THREE.MeshStandardMaterial({
        color: 0xf5f5f3,
        roughness: 0.95,
        metalness: 0.0,
        side: THREE.DoubleSide
      })
      const makeWall = (w, h, pos, rot) => {
        const wall = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat)
        wall.position.set(...pos)
        wall.rotation.set(...rot)
        wall.receiveShadow = true
        scene.add(wall)
      }
      makeWall(BOX.w, BOX.h, [0, BOX.h / 2, BOX.zBack], [0, 0, 0])                        // back
      makeWall(BOX.d, BOX.h, [-BOX.w / 2, BOX.h / 2, zMid], [0, Math.PI / 2, 0])          // left
      makeWall(BOX.d, BOX.h, [BOX.w / 2, BOX.h / 2, zMid],  [0, -Math.PI / 2, 0])         // right
    },

    // ── Lighting : tamisée, légèrement chaude, ombres douces ───────
    _buildLights () {
      const THREE = this._THREE
      const scene = this._scene

      // Hemisphere : doux et froid légèrement (ciel/sol)
      const hemi = new THREE.HemisphereLight(0xffffff, 0xe8e8e6, 0.55)
      scene.add(hemi)

      // Key light : depuis le haut-avant, légèrement chaude (tamisée)
      const key = new THREE.DirectionalLight(0xfff6e8, 1.0)
      key.position.set(3, 6, 4)
      key.castShadow = true
      key.shadow.mapSize.set(2048, 2048)
      key.shadow.camera.near = 0.5
      key.shadow.camera.far = 20
      key.shadow.camera.left = -5
      key.shadow.camera.right = 5
      key.shadow.camera.top = 6
      key.shadow.camera.bottom = -2
      key.shadow.bias = -0.0005
      key.shadow.normalBias = 0.02
      key.shadow.radius = 4         // ombres très douces
      scene.add(key)

      // Fill light : depuis le côté opposé, plus froide
      const fill = new THREE.DirectionalLight(0xf0f4ff, 0.25)
      fill.position.set(-4, 3, 3)
      scene.add(fill)
    },

    // ── Place le perso au centre de la box, échelle normalisée ─────
    _placeCharacter (model) {
      const THREE = this._THREE
      this._character = model

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

      // Mesure le perso pour le normaliser à ~1.7 unités (hauteur humaine)
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())

      const TARGET_HEIGHT = 1.7
      const currentHeight = size.y || 1
      const scale = TARGET_HEIGHT / currentHeight
      model.scale.setScalar(scale)

      // Recalcule la bbox après scale pour bien le poser au sol
      const scaledBox = new THREE.Box3().setFromObject(model)
      const scaledCenter = scaledBox.getCenter(new THREE.Vector3())
      // Recentre sur X/Z et pose les pieds à y=0
      model.position.x -= scaledCenter.x
      model.position.z -= scaledCenter.z
      model.position.y -= scaledBox.min.y

      // Place le perso légèrement en arrière de la caméra (au centre de la box)
      model.position.z = -2

      this._scene.add(model)
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
      this._character = null
      this._THREE = null
    }
  }
}
</script>

<style lang="sass" scoped>
.Playground
  position: fixed
  inset: 0
  background: #f2f2f0
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
      box-shadow: 0 0 10px rgba(255, 69, 0, 0.4)

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
    background: #f2f2f0

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
