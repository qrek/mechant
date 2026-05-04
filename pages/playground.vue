<template>
  <section class="Playground">

    <div class="Playground_canvas" ref="canvas"></div>

    <!-- HUD -->
    <header class="Playground_hud Playground_hud--top">
      <div class="Playground_label">
        <span class="dot"></span>
        Training arena
      </div>
      <div class="Playground_meta">
        <span>{{ stats.tris }}k tris</span>
        <span>· 60fps</span>
      </div>
    </header>

    <div class="Playground_hud Playground_hud--right">
      <button class="Playground_btn" :class="{ 'is-active': lightsOn }" @click="toggleLights">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="12" r="4"/>
          <line x1="12" y1="2" x2="12" y2="4"/>
          <line x1="12" y1="20" x2="12" y2="22"/>
          <line x1="2" y1="12" x2="4" y2="12"/>
          <line x1="20" y1="12" x2="22" y2="12"/>
        </svg>
        {{ lightsOn ? 'Lights off' : 'Lights on' }}
      </button>
    </div>

    <footer class="Playground_hud Playground_hud--bottom">
      <span>{{ comingSoon }}</span>
    </footer>

    <!-- Loader -->
    <transition name="fade">
      <div v-if="loading" class="Playground_loader">
        <div class="Playground_loader_label">Booting arena</div>
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
      meta: [{ hid: 'description', name: 'description', content: 'Training arena — soon home to our 3D characters.' }]
    }
  },

  data () {
    return {
      loading: true,
      lightsOn: true,
      comingSoon: 'Characters coming soon — Théo & Ronan in 3D',
      stats: { tris: 0 }
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
      this._THREE = THREE

      const container = this.$refs.canvas
      const width = container.clientWidth
      const height = container.clientHeight

      // ── Scene ────────────────────────────────────────────────────────
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x050505)
      scene.fog = new THREE.FogExp2(0x000000, 0.045)
      this._scene = scene

      // ── Camera : fixe, face au stage, légèrement surélevée ─────────
      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100)
      camera.position.set(0, 3, 11)
      camera.lookAt(0, 1.2, 0)
      this._camera = camera

      // ── Renderer ─────────────────────────────────────────────────────
      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.outputEncoding = THREE.sRGBEncoding
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.0
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.physicallyCorrectLights = true
      container.appendChild(renderer.domElement)
      this._renderer = renderer

      // ── Construction de la box ───────────────────────────────────────
      this._buildArena()

      // ── Lumières ─────────────────────────────────────────────────────
      this._buildLights()

      // ── Pas de controls : la caméra est fixe (seuls les persos bougeront) ──

      // ── Resize ───────────────────────────────────────────────────────
      this._onResize = () => {
        const w = container.clientWidth
        const h = container.clientHeight
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }
      window.addEventListener('resize', this._onResize)

      // ── Animation loop ───────────────────────────────────────────────
      const clock = new THREE.Clock()
      this._tick = () => {
        const elapsed = clock.getElapsedTime()

        // Subtle pulse sur les LEDs orange
        if (this._rimLights) {
          this._rimLights.forEach((light, i) => {
            light.intensity = 1.6 + Math.sin(elapsed * 1.5 + i) * 0.2
          })
        }

        // Particules de poussière qui descendent doucement
        if (this._dust) {
          const positions = this._dust.geometry.attributes.position.array
          for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] -= 0.005
            if (positions[i + 1] < 0) positions[i + 1] = 8
          }
          this._dust.geometry.attributes.position.needsUpdate = true
        }

        renderer.render(scene, camera)
        this._raf = requestAnimationFrame(this._tick)
      }
      this._tick()

      // Fade out du loader
      setTimeout(() => { this.loading = false }, 400)
    },

    // Construction du stage : sol + mur fond + 2 murs latéraux (ouvert vers la caméra)
    _buildArena () {
      const THREE = this._THREE
      const scene = this._scene

      const STAGE = { w: 14, h: 8, d: 12 }   // largeur, hauteur murs, profondeur
      let triCount = 0

      // ── Sol ────────────────────────────────────────────────────────
      const floorGeo = new THREE.PlaneGeometry(STAGE.w, STAGE.d, 1, 1)
      const floorMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        roughness: 0.85,
        metalness: 0.15
      })
      const floor = new THREE.Mesh(floorGeo, floorMat)
      floor.rotation.x = -Math.PI / 2
      // Décale le sol vers l'arrière (z négatif) pour que la caméra soit "hors stage"
      floor.position.z = -STAGE.d / 2 + 1
      floor.receiveShadow = true
      scene.add(floor)
      triCount += 2

      // ── Grille au sol (style training stage) ──────────────────────
      const grid = new THREE.GridHelper(STAGE.w, 14, 0x222222, 0x111111)
      grid.position.set(0, 0.01, -STAGE.d / 2 + 1)
      scene.add(grid)
      this._grid = grid

      // ── Murs : fond + gauche + droite (pas de plafond, pas de mur devant) ─
      const wallMat = new THREE.MeshStandardMaterial({
        color: 0x141414,
        roughness: 0.95,
        metalness: 0.05,
        side: THREE.DoubleSide
      })

      const makeWall = (w, h, pos, rot) => {
        const wall = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat)
        wall.position.set(...pos)
        wall.rotation.set(...rot)
        wall.receiveShadow = true
        scene.add(wall)
        triCount += 2
        return wall
      }

      const zBack = -STAGE.d + 1
      makeWall(STAGE.w, STAGE.h, [0, STAGE.h / 2, zBack], [0, 0, 0])                       // back
      makeWall(STAGE.d, STAGE.h, [-STAGE.w / 2, STAGE.h / 2, -STAGE.d / 2 + 1], [0, Math.PI / 2, 0])  // left
      makeWall(STAGE.d, STAGE.h, [STAGE.w / 2, STAGE.h / 2, -STAGE.d / 2 + 1],  [0, -Math.PI / 2, 0]) // right

      // ── Stage central : plateforme circulaire ──────────────────────
      const stageGeo = new THREE.CylinderGeometry(3.0, 3.2, 0.25, 64, 1)
      const stageMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.4,
        metalness: 0.7
      })
      const stage = new THREE.Mesh(stageGeo, stageMat)
      stage.position.set(0, 0.125, -STAGE.d / 2 + 1)
      stage.receiveShadow = true
      stage.castShadow = true
      scene.add(stage)
      triCount += 128

      // Anneau lumineux orange autour du stage
      const ringGeo = new THREE.TorusGeometry(3.1, 0.035, 8, 100)
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xff4500 })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = Math.PI / 2
      ring.position.set(0, 0.27, -STAGE.d / 2 + 1)
      scene.add(ring)
      triCount += 800

      // ── Néons orange sur les arêtes hautes (rim light visuel) ──────
      // Sur les 3 murs présents : back, left, right
      const stripMat = new THREE.MeshBasicMaterial({ color: 0xff4500 })
      const stripThickness = 0.04
      const stripDepth = 0.04
      const makeStrip = (length, pos, rot) => {
        const geo = new THREE.BoxGeometry(length, stripThickness, stripDepth)
        const mesh = new THREE.Mesh(geo, stripMat)
        mesh.position.set(...pos)
        mesh.rotation.set(...rot)
        scene.add(mesh)
        triCount += 12
      }
      const yTop = STAGE.h - 0.1
      makeStrip(STAGE.w, [0, yTop, zBack + 0.05], [0, 0, 0])                                            // back top
      makeStrip(STAGE.d, [-STAGE.w / 2 + 0.05, yTop, -STAGE.d / 2 + 1], [0, Math.PI / 2, 0])            // left top
      makeStrip(STAGE.d, [STAGE.w / 2 - 0.05, yTop, -STAGE.d / 2 + 1], [0, Math.PI / 2, 0])             // right top

      // ── Particules de poussière dans l'air (volume du stage) ──────
      const dustCount = 150
      const dustGeo = new THREE.BufferGeometry()
      const dustPos = new Float32Array(dustCount * 3)
      for (let i = 0; i < dustCount; i++) {
        dustPos[i * 3]     = (Math.random() - 0.5) * STAGE.w * 0.85
        dustPos[i * 3 + 1] = Math.random() * STAGE.h
        dustPos[i * 3 + 2] = -STAGE.d / 2 + 1 + (Math.random() - 0.5) * STAGE.d * 0.85
      }
      dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
      const dustMat = new THREE.PointsMaterial({
        color: 0xffaa66,
        size: 0.04,
        transparent: true,
        opacity: 0.5,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
      const dust = new THREE.Points(dustGeo, dustMat)
      scene.add(dust)
      this._dust = dust

      this.stats.tris = Math.round(triCount / 1000) || 1
    },

    _buildLights () {
      const THREE = this._THREE
      const scene = this._scene
      const lights = []

      // Le centre du stage est à (0, 0, -5) — toutes les lumières gravitent autour
      const STAGE_CENTER = { x: 0, y: 0, z: -5 }

      // Ambient très doux
      const hemi = new THREE.HemisphereLight(0x202030, 0x0a0a0a, 0.4)
      scene.add(hemi)
      lights.push(hemi)

      // Spot principal au-dessus du stage, pointe vers les persos
      const spot = new THREE.SpotLight(0xffffff, 4.0, 20, Math.PI / 5, 0.4, 1)
      spot.position.set(STAGE_CENTER.x, 7, STAGE_CENTER.z)
      spot.target.position.set(STAGE_CENTER.x, 0, STAGE_CENTER.z)
      spot.castShadow = true
      spot.shadow.mapSize.set(1024, 1024)
      spot.shadow.bias = -0.0005
      scene.add(spot)
      scene.add(spot.target)
      lights.push(spot)

      // Rim light orange front-left (vient de la caméra côté gauche)
      const rim1 = new THREE.PointLight(0xff4500, 1.8, 16, 1.5)
      rim1.position.set(-5, 3, -2)
      scene.add(rim1)
      lights.push(rim1)

      // Rim light orange front-right
      const rim2 = new THREE.PointLight(0xff4500, 1.8, 16, 1.5)
      rim2.position.set(5, 3, -2)
      scene.add(rim2)
      lights.push(rim2)

      // Cool blue accent depuis l'arrière pour décoller les persos du mur du fond
      const back = new THREE.PointLight(0x4080ff, 0.7, 16, 1.5)
      back.position.set(0, 4, -9)
      scene.add(back)
      lights.push(back)

      this._lights = lights
      this._rimLights = [rim1, rim2]
    },

    toggleLights () {
      this.lightsOn = !this.lightsOn
      if (!this._lights) return
      this._lights.forEach((l) => {
        l.visible = this.lightsOn
      })
      // Garde un minimum d'ambient même éteint pour pas être dans le noir total
      if (!this.lightsOn && this._lights[0]) {
        this._lights[0].visible = true
        this._lights[0].intensity = 0.08
      } else if (this._lights[0]) {
        this._lights[0].intensity = 0.4
      }
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
      this._lights = null
      this._rimLights = null
      this._dust = null
      this._THREE = null
    }
  }
}
</script>

<style lang="sass" scoped>
.Playground
  position: fixed
  inset: 0
  background: #050505
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
        flex-wrap: wrap
        justify-content: center

    &--bottom
      bottom: 1.5rem
      left: 50%
      transform: translateX(-50%)
      font-size: 0.7rem
      letter-spacing: 0.15em
      text-transform: uppercase
      color: rgba(255, 255, 255, 0.4)
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

    .dot
      width: 0.5rem
      height: 0.5rem
      border-radius: 50%
      background: #ff4500
      animation: pulse 2s ease-in-out infinite
      box-shadow: 0 0 12px rgba(255, 69, 0, 0.8)

  &_meta
    font-size: 0.7rem
    letter-spacing: 0.1em
    color: rgba(255, 255, 255, 0.5)
    display: flex
    gap: 0.4rem

  &_btn
    display: inline-flex
    align-items: center
    gap: 0.5rem
    padding: 0.6rem 1rem
    background: rgba(255, 255, 255, 0.05)
    border: 1px solid rgba(255, 255, 255, 0.1)
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

    &.is-active
      background: #ff4500
      border-color: #ff4500
      color: $black

  &_loader
    position: absolute
    inset: 0
    z-index: 10
    display: flex
    align-items: center
    justify-content: center
    background: #050505

    &_label
      font-family: $apfel
      font-weight: 700
      font-size: 0.75rem
      letter-spacing: 0.2em
      text-transform: uppercase
      color: rgba(255, 255, 255, 0.5)
      animation: pulse 1.4s ease-in-out infinite

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
