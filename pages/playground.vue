<template>
  <section class="Playground">

    <div class="Playground_canvas" ref="canvas" @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseup="onMouseUp" @mouseleave="onMouseUp"></div>

    <!-- HUD -->
    <header class="Playground_hud Playground_hud--top">
      <div class="Playground_label">
        <span class="dot"></span>
        Playground
      </div>
      <div class="Playground_meta">
        <span v-if="stats.tris">{{ stats.tris }}k tris</span>
        <span v-if="physicsReady">· physics ON</span>
      </div>
    </header>

    <div class="Playground_hud Playground_hud--right">
      <button class="Playground_btn" @click="resetCharacter" :disabled="!physicsReady">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M3 12a9 9 0 1 0 9-9"/>
          <polyline points="3 4 3 12 11 12"/>
        </svg>
        Reset
      </button>
    </div>

    <footer class="Playground_hud Playground_hud--bottom">
      <span>{{ hint }}</span>
    </footer>

    <!-- Loader -->
    <transition name="fade">
      <div v-if="loading" class="Playground_loader">
        <div class="Playground_loader_inner">
          <div class="Playground_loader_label">{{ loadingLabel }}</div>
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
      meta: [{ hid: 'description', name: 'description', content: 'Studio playground — grab the character with your mouse.' }]
    }
  },

  data () {
    return {
      characterUrl: '/playground/scene.glb',
      loading: true,
      loadingLabel: 'Loading character',
      progress: 0,
      physicsReady: false,
      hint: 'Click & drag the character',
      stats: { tris: 0 },

      // dimensions de la box (utilisées partout)
      BOX: { w: 20, h: 10, d: 20, zFront: 4, zBack: -16 }
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

      // ── Scene ────────────────────────────────────────────────────
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0xf2f2f0)
      scene.fog = new THREE.Fog(0xf2f2f0, 10, 35)
      this._scene = scene

      // ── Camera ───────────────────────────────────────────────────
      const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100)
      camera.position.set(0, 1.6, 4.5)
      camera.lookAt(0, 1.4, 0)
      this._camera = camera

      // ── Renderer ─────────────────────────────────────────────────
      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.outputEncoding = THREE.sRGBEncoding
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 0.95
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.physicallyCorrectLights = true
      container.appendChild(renderer.domElement)
      this._renderer = renderer

      // ── Raycaster pour le mouse picking ──────────────────────────
      this._raycaster = new THREE.Raycaster()
      this._mouse = new THREE.Vector2()
      // Plan de drag (parallèle à la caméra, à la profondeur initiale du perso)
      this._dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 2)

      // ── Construction de la scène visuelle ────────────────────────
      this._buildBox()
      this._buildLights()

      // ── Init Rapier physics + charge le perso en parallèle ───────
      const [_, gltf] = await Promise.all([
        this._initRapier(),
        this._loadCharacter()
      ])
      this._placeCharacter(gltf.scene)
      this._createCharacterBody()

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
      this._lastTime = performance.now()
      this._tick = () => {
        const now = performance.now()
        const dt = Math.min(1 / 30, (now - this._lastTime) / 1000) // clamp pour stabilité
        this._lastTime = now

        // Step physics
        if (this._world) {
          // Pendant le drag, le body suit la souris directement
          if (this._isDragging && this._mouseWorldPos) {
            this._characterBody.setNextKinematicTranslation(this._mouseWorldPos)
          }
          this._world.step()
          this._syncCharacterMesh()
        }

        renderer.render(scene, camera)
        this._raf = requestAnimationFrame(this._tick)
      }
      this._tick()

      this.physicsReady = true
      this.loading = false
    },

    // ── Init Rapier physics world + colliders statiques ───────────
    async _initRapier () {
      this.loadingLabel = 'Loading physics'
      const RapierMod = await import('@dimforge/rapier3d-compat')
      const RAPIER = RapierMod.default || RapierMod
      await RAPIER.init()
      this._RAPIER = RAPIER

      // Gravité un poil moins forte que la réelle pour un feel cartoon
      this._world = new RAPIER.World({ x: 0, y: -8.5, z: 0 })

      const BOX = this.BOX
      const zMid = (BOX.zFront + BOX.zBack) / 2

      // Sol (cuboid très plat, y=0)
      const floorBody = this._world.createRigidBody(
        RAPIER.RigidBodyDesc.fixed().setTranslation(0, -0.1, zMid)
      )
      this._world.createCollider(
        RAPIER.ColliderDesc.cuboid(BOX.w / 2, 0.1, BOX.d / 2)
          .setFriction(0.9).setRestitution(0.1),
        floorBody
      )

      // Mur du fond
      const backBody = this._world.createRigidBody(
        RAPIER.RigidBodyDesc.fixed().setTranslation(0, BOX.h / 2, BOX.zBack - 0.1)
      )
      this._world.createCollider(
        RAPIER.ColliderDesc.cuboid(BOX.w / 2, BOX.h / 2, 0.1)
          .setFriction(0.5).setRestitution(0.3),
        backBody
      )

      // Mur gauche
      const leftBody = this._world.createRigidBody(
        RAPIER.RigidBodyDesc.fixed().setTranslation(-BOX.w / 2 - 0.1, BOX.h / 2, zMid)
      )
      this._world.createCollider(
        RAPIER.ColliderDesc.cuboid(0.1, BOX.h / 2, BOX.d / 2)
          .setFriction(0.5).setRestitution(0.3),
        leftBody
      )

      // Mur droit
      const rightBody = this._world.createRigidBody(
        RAPIER.RigidBodyDesc.fixed().setTranslation(BOX.w / 2 + 0.1, BOX.h / 2, zMid)
      )
      this._world.createCollider(
        RAPIER.ColliderDesc.cuboid(0.1, BOX.h / 2, BOX.d / 2)
          .setFriction(0.5).setRestitution(0.3),
        rightBody
      )
    },

    // ── Charge le GLB du perso ────────────────────────────────────
    async _loadCharacter () {
      this.loadingLabel = 'Loading character'
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
      return new Promise((resolve, reject) => {
        const loader = new GLTFLoader()
        loader.load(
          this.characterUrl,
          (gltf) => resolve(gltf),
          (xhr) => {
            if (xhr.lengthComputable) {
              this.progress = Math.round((xhr.loaded / xhr.total) * 100)
            }
          },
          (err) => reject(err)
        )
      })
    },

    // ── Place le perso au centre, taille normalisée ──────────────
    // On wrap le mesh dans un Group dont l'origine = centre géométrique
    // du perso, pour que la rotation physique tourne autour du centre
    // (et pas autour des pieds).
    _placeCharacter (model) {
      const THREE = this._THREE

      let tris = 0
      model.traverse((obj) => {
        if (obj.isMesh || obj.isSkinnedMesh) {
          obj.castShadow = true
          obj.receiveShadow = true
          const geo = obj.geometry
          if (geo.index) tris += geo.index.count / 3
          else if (geo.attributes.position) tris += geo.attributes.position.count / 3
        }
      })
      this.stats.tris = Math.round(tris / 1000)

      // Scale à hauteur ~1.7
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const TARGET_HEIGHT = 1.7
      const scale = TARGET_HEIGHT / (size.y || 1)
      model.scale.setScalar(scale)

      // Mesures après scale
      const scaledBox = new THREE.Box3().setFromObject(model)
      const scaledSize = scaledBox.getSize(new THREE.Vector3())
      const scaledCenter = scaledBox.getCenter(new THREE.Vector3())

      // Décale le mesh à l'intérieur du wrapper : centre du mesh à l'origine
      model.position.x -= scaledCenter.x
      model.position.y -= scaledCenter.y
      model.position.z -= scaledCenter.z

      // Wrapper Group : son origine = centre du perso = position du rigid body
      const wrapper = new THREE.Group()
      wrapper.add(model)
      wrapper.position.set(0, TARGET_HEIGHT / 2, -2)
      this._scene.add(wrapper)

      this._character = wrapper
      this._characterSize = { x: scaledSize.x, y: scaledSize.y, z: scaledSize.z }
      this._characterHomeY = TARGET_HEIGHT / 2
    },

    // ── Crée le rigid body du perso (capsule) ─────────────────────
    _createCharacterBody () {
      const RAPIER = this._RAPIER
      const size = this._characterSize

      // Capsule = halfHeight + radius caps
      // halfHeight = (taille_y - 2 * radius) / 2
      const radius = Math.min(size.x, size.z) * 0.45
      const halfHeight = Math.max(0.1, (size.y - 2 * radius) / 2)

      const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(0, this._characterHomeY, -2)
        .setLinearDamping(0.5)
        .setAngularDamping(0.8)   // freine les rotations folles
        .setCcdEnabled(true)      // continuous collision detection (évite les passages à travers murs)
      const body = this._world.createRigidBody(bodyDesc)

      const colliderDesc = RAPIER.ColliderDesc.capsule(halfHeight, radius)
        .setFriction(0.8)
        .setRestitution(0.2)
        .setDensity(1.0)
      this._world.createCollider(colliderDesc, body)

      this._characterBody = body
      this._characterRadius = radius
      this._characterHalfHeight = halfHeight
    },

    // ── Sync mesh ← rigid body chaque frame ───────────────────────
    // Le wrapper a son origine au centre du perso (= au centre du body).
    // Donc on copie direct position et rotation.
    _syncCharacterMesh () {
      if (!this._character || !this._characterBody) return
      const t = this._characterBody.translation()
      const r = this._characterBody.rotation()
      this._character.position.set(t.x, t.y, t.z)
      this._character.quaternion.set(r.x, r.y, r.z, r.w)
    },

    // ── Mouse drag : grab le perso et le déplace ──────────────────
    onMouseDown (event) {
      if (!this.physicsReady || !this._characterBody) return
      const THREE = this._THREE
      this._updateMouseNDC(event)

      // Raycast pour voir si on touche le perso
      this._raycaster.setFromCamera(this._mouse, this._camera)
      const hits = this._raycaster.intersectObject(this._character, true)
      if (!hits.length) return

      // Démarre le drag : passe le body en kinematic
      this._isDragging = true
      this._characterBody.setBodyType(this._RAPIER.RigidBodyType.KinematicPositionBased, true)

      // Calcule le plan de drag (perpendiculaire à la caméra, passant par le perso)
      const charPos = this._characterBody.translation()
      const cameraDir = new THREE.Vector3()
      this._camera.getWorldDirection(cameraDir)
      this._dragPlane.setFromNormalAndCoplanarPoint(
        cameraDir.negate(),
        new THREE.Vector3(charPos.x, charPos.y, charPos.z)
      )

      // Historique des positions pour calculer la vélocité au release (throw)
      this._dragHistory = []

      this.hint = 'Drag to move · release to drop'
      this.$refs.canvas.style.cursor = 'grabbing'
      this._updateMouseWorldPos(event)
    },

    onMouseMove (event) {
      if (!this.physicsReady || !this._characterBody) return
      this._updateMouseNDC(event)

      if (this._isDragging) {
        this._updateMouseWorldPos(event)
        // Mémorise pour le throw
        this._dragHistory.push({
          time: performance.now(),
          pos: { ...this._mouseWorldPos }
        })
        if (this._dragHistory.length > 5) this._dragHistory.shift()
      } else {
        // Hover : change le cursor si on survole le perso
        this._raycaster.setFromCamera(this._mouse, this._camera)
        const hits = this._raycaster.intersectObject(this._character, true)
        this.$refs.canvas.style.cursor = hits.length ? 'grab' : 'default'
      }
    },

    onMouseUp () {
      if (!this._isDragging) return
      this._isDragging = false
      this.$refs.canvas.style.cursor = 'default'
      this.hint = 'Click & drag the character'

      // Calcule la vélocité du mouvement récent (effet "throw")
      let throwVelocity = { x: 0, y: 0, z: 0 }
      if (this._dragHistory.length >= 2) {
        const recent = this._dragHistory[this._dragHistory.length - 1]
        const previous = this._dragHistory[0]
        const dt = (recent.time - previous.time) / 1000
        if (dt > 0) {
          throwVelocity = {
            x: (recent.pos.x - previous.pos.x) / dt * 0.6,
            y: (recent.pos.y - previous.pos.y) / dt * 0.6,
            z: (recent.pos.z - previous.pos.z) / dt * 0.6
          }
        }
      }

      // Repasse le body en dynamic et lui applique la vélocité du throw
      this._characterBody.setBodyType(this._RAPIER.RigidBodyType.Dynamic, true)
      this._characterBody.setLinvel(throwVelocity, true)
      // Petit kick angulaire random pour que ça tombe pas droit comme un piquet
      this._characterBody.setAngvel({
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 4
      }, true)
    },

    _updateMouseNDC (event) {
      const rect = this.$refs.canvas.getBoundingClientRect()
      this._mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      this._mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    },

    _updateMouseWorldPos () {
      const THREE = this._THREE
      this._raycaster.setFromCamera(this._mouse, this._camera)
      const point = new THREE.Vector3()
      this._raycaster.ray.intersectPlane(this._dragPlane, point)
      if (point) {
        // Clamp aux limites de la box (avec marge pour la taille du perso)
        const margin = this._characterRadius + 0.5
        point.x = Math.max(-this.BOX.w / 2 + margin, Math.min(this.BOX.w / 2 - margin, point.x))
        point.y = Math.max(this._characterHomeY, Math.min(this.BOX.h - margin, point.y))
        this._mouseWorldPos = { x: point.x, y: point.y, z: point.z }
      }
    },

    // ── Reset : remet le perso debout au centre ───────────────────
    resetCharacter () {
      if (!this._characterBody || !this._RAPIER) return
      this._characterBody.setBodyType(this._RAPIER.RigidBodyType.Dynamic, true)
      this._characterBody.setTranslation({ x: 0, y: this._characterHomeY, z: -2 }, true)
      this._characterBody.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
      this._characterBody.setLinvel({ x: 0, y: 0, z: 0 }, true)
      this._characterBody.setAngvel({ x: 0, y: 0, z: 0 }, true)
    },

    // ── Construction de la box visuelle ───────────────────────────
    _buildBox () {
      const THREE = this._THREE
      const scene = this._scene
      const BOX = this.BOX
      const zMid = (BOX.zFront + BOX.zBack) / 2

      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(BOX.w, BOX.d),
        new THREE.MeshStandardMaterial({ color: 0xeeeeec, roughness: 0.9, metalness: 0.0 })
      )
      floor.rotation.x = -Math.PI / 2
      floor.position.z = zMid
      floor.receiveShadow = true
      scene.add(floor)

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
      makeWall(BOX.w, BOX.h, [0, BOX.h / 2, BOX.zBack], [0, 0, 0])
      makeWall(BOX.d, BOX.h, [-BOX.w / 2, BOX.h / 2, zMid], [0, Math.PI / 2, 0])
      makeWall(BOX.d, BOX.h, [BOX.w / 2, BOX.h / 2, zMid], [0, -Math.PI / 2, 0])
    },

    _buildLights () {
      const THREE = this._THREE
      const scene = this._scene

      const hemi = new THREE.HemisphereLight(0xffffff, 0xe8e8e6, 0.55)
      scene.add(hemi)

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
      key.shadow.radius = 4
      scene.add(key)

      const fill = new THREE.DirectionalLight(0xf0f4ff, 0.25)
      fill.position.set(-4, 3, 3)
      scene.add(fill)
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
      // Cleanup Rapier
      if (this._world) {
        // Rapier libère automatiquement les bodies/colliders quand on free le world
        // mais on peut juste mettre la ref à null
      }
      this._scene = null
      this._camera = null
      this._renderer = null
      this._character = null
      this._world = null
      this._characterBody = null
      this._THREE = null
      this._RAPIER = null
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
    user-select: none

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

    &--right
      top: 5rem
      right: 1.5rem
      display: flex
      flex-direction: column
      gap: 0.6rem
      align-items: flex-end
      pointer-events: auto

    &--bottom
      bottom: 1.5rem
      left: 50%
      transform: translateX(-50%)
      font-size: 0.7rem
      letter-spacing: 0.15em
      text-transform: uppercase
      color: rgba(0, 0, 0, 0.4)
      white-space: nowrap

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

  &_btn
    display: inline-flex
    align-items: center
    gap: 0.5rem
    padding: 0.6rem 1rem
    background: rgba(0, 0, 0, 0.05)
    border: 1px solid rgba(0, 0, 0, 0.12)
    border-radius: 999px
    color: $black
    font-family: $apfel
    font-weight: 700
    font-size: 0.7rem
    letter-spacing: 0.12em
    text-transform: uppercase
    cursor: pointer
    transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease

    &:hover:not(:disabled)
      background: rgba(0, 0, 0, 0.1)
      border-color: rgba(0, 0, 0, 0.25)
      transform: translateY(-1px)

    &:disabled
      opacity: 0.4
      cursor: default

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
