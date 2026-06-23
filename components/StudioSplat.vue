<template>
  <div
    ref="root"
    class="StudioSplat"
    :class="{ 'is-active': active, 'is-ready': status === 'ready' }"
  >
    <canvas ref="canvas" class="StudioSplat_canvas" />

    <!-- État : chargement -->
    <div v-if="status !== 'ready'" class="StudioSplat_overlay StudioSplat_loading">
      <span class="spinner" />
      <span class="txt">{{ status === 'error' ? 'Scan indisponible' : 'Chargement du studio…' }}</span>
    </div>

    <!-- État : prêt, pas encore en exploration -->
    <button
      v-show="status === 'ready' && !active"
      class="StudioSplat_overlay StudioSplat_enter"
      type="button"
      @click="enter"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 11l18-8-8 18-2-8-8-2z" />
      </svg>
      <span>{{ isTouch ? 'Toucher pour explorer' : 'Cliquer pour explorer' }}</span>
    </button>

    <!-- État : exploration en cours -->
    <template v-if="active">
      <div class="StudioSplat_hud">
        <span v-if="!isTouch">ZQSD / flèches · souris pour regarder · Maj = rapide</span>
        <span v-else>Joystick = se déplacer · glisser = regarder</span>
      </div>
      <button class="StudioSplat_exit" type="button" @click="exit" aria-label="Sortir">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
        </svg>
        <span v-if="!isTouch">Échap</span>
      </button>

      <!-- Joystick mobile (déplacement) -->
      <div
        v-if="isTouch"
        ref="stick"
        class="StudioSplat_stick"
        @touchstart.prevent="onStickStart"
        @touchmove.prevent="onStickMove"
        @touchend.prevent="onStickEnd"
        @touchcancel.prevent="onStickEnd"
      >
        <span class="StudioSplat_stick_knob" :style="knobStyle" />
      </div>
    </template>
  </div>
</template>

<script>
// ─────────────────────────────────────────────────────────────────────────────
// Viewer de Gaussian Splatting (PlayCanvas, moteur autonome — n'utilise PAS
// le three.js 0.140 du reste du site, donc aucun conflit de version).
//
// • Idle  : auto-orbite douce autour du studio (aperçu).
// • Actif : vol libre. Desktop = pointer lock + ZQSD/WASD/flèches + souris.
//           Mobile = joystick (déplacement) + glisser (regarder).
// • Émet 'enter' / 'exit' pour que la page gèle/relance le smooth scroll.
// ─────────────────────────────────────────────────────────────────────────────
export default {
  name: 'StudioSplat',

  props: {
    desktopUrl: { type: String, required: true },
    mobileUrl: { type: String, default: '' }
  },

  data () {
    return {
      status: 'loading',   // loading | ready | error
      active: false,
      isTouch: false,
      knob: { x: 0, y: 0 } // position visuelle du knob du joystick (-1..1)
    }
  },

  computed: {
    knobStyle () {
      return { transform: `translate(${this.knob.x * 26}px, ${this.knob.y * 26}px)` }
    }
  },

  mounted () {
    if (typeof window === 'undefined') return
    this.isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window
    // État de pilotage (hors data : pas besoin de réactivité, et évite que Vue
    // proxifie des objets PlayCanvas).
    this._input = { f: false, b: false, l: false, r: false, up: false, down: false, fast: false }
    this._yaw = 0
    this._pitch = 0
    this._orbitA = 0
    this._framed = false
    this._center = null
    this._radius = 1
    this._stickVec = { x: 0, y: 0 }
    this._boot()
  },

  beforeDestroy () {
    this._teardown()
  },

  methods: {
    // PlayCanvas est chargé depuis un CDN au runtime (pas bundlé) : son build
    // UMD fait 3.7 Mo d'optional-chaining/class-fields que le webpack 4 de
    // Nuxt 2 devrait transpiler via Babel -> build Vercel très lent. Le script
    // n'est chargé que quand ce composant monte (scan studio, sous la ligne
    // de flottaison), donc aucun impact sur le reste du site.
    _loadPlayCanvas () {
      if (window.pc) return Promise.resolve(window.pc)
      if (this.__pcPromise) return this.__pcPromise
      this.__pcPromise = new Promise((resolve, reject) => {
        const s = document.createElement('script')
        s.src = 'https://cdn.jsdelivr.net/npm/playcanvas@2.19.7/build/playcanvas.min.js'
        s.async = true
        s.onload = () => resolve(window.pc)
        s.onerror = reject
        document.head.appendChild(s)
      })
      return this.__pcPromise
    },

    async _boot () {
      let pc
      try {
        pc = await this._loadPlayCanvas()
      } catch (_) { this.status = 'error'; return }
      if (!pc) { this.status = 'error'; return }
      this._pc = pc
      const canvas = this.$refs.canvas
      if (!canvas) return

      const app = new pc.Application(canvas, {
        mouse: new pc.Mouse(canvas),
        touch: 'ontouchstart' in window ? new pc.TouchDevice(canvas) : null,
        graphicsDeviceOptions: { antialias: true, alpha: false, powerPreference: 'high-performance' }
      })
      this._app = app

      // Filets de sécurité : si la version du moteur n'enregistre pas le gsplat
      // automatiquement, on l'ajoute à la main.
      if (!app.systems.gsplat && pc.GSplatComponentSystem) app.systems.add(new pc.GSplatComponentSystem(app))
      if (!app.loader.getHandler('gsplat') && pc.GSplatHandler) app.loader.addHandler('gsplat', new pc.GSplatHandler(app))

      app.setCanvasFillMode(pc.FILLMODE_NONE)
      app.setCanvasResolution(pc.RESOLUTION_AUTO)

      // Caméra (fond noir #0a0a0a comme la section)
      const cam = new pc.Entity('camera')
      cam.addComponent('camera', {
        clearColor: new pc.Color(0.039, 0.039, 0.039, 1),
        fov: 70,
        nearClip: 0.01,
        farClip: 1000
      })
      app.root.addChild(cam)
      this._cam = cam

      // Choix de la source selon l'écran
      const url = (this.isTouch && this.mobileUrl) ? this.mobileUrl : this.desktopUrl

      app.assets.loadFromUrl(url, 'gsplat', (err, asset) => {
        if (err || !asset) { this.status = 'error'; return }
        const splat = new pc.Entity('studio')
        splat.addComponent('gsplat', { asset })
        app.root.addChild(splat)
        this._splat = splat
        this.status = 'ready'
      })

      app.on('update', this._tick, this)
      app.start()

      // Resize
      this._onResize = () => this._resize()
      window.addEventListener('resize', this._onResize)
      this._resize()

      // Inputs desktop
      if (!this.isTouch) {
        this._onKeyDown = (e) => this._key(e, true)
        this._onKeyUp = (e) => this._key(e, false)
        this._onMouseMove = (e) => this._look(e.movementX || 0, e.movementY || 0)
        this._onPointerLockChange = () => {
          const locked = document.pointerLockElement === canvas
          if (!locked && this.active) this.exit()
        }
        this._onWheel = (e) => { if (this.active) e.preventDefault() }
        window.addEventListener('keydown', this._onKeyDown)
        window.addEventListener('keyup', this._onKeyUp)
        document.addEventListener('mousemove', this._onMouseMove)
        document.addEventListener('pointerlockchange', this._onPointerLockChange)
        window.addEventListener('wheel', this._onWheel, { passive: false })
      } else {
        // Mobile : glisser n'importe où (hors joystick) = regarder
        this._lookTouchId = null
        this._lastTouch = null
        this._onTouchStart = (e) => this._touchLookStart(e)
        this._onTouchMove = (e) => this._touchLookMove(e)
        this._onTouchEnd = (e) => this._touchLookEnd(e)
        canvas.addEventListener('touchstart', this._onTouchStart, { passive: false })
        canvas.addEventListener('touchmove', this._onTouchMove, { passive: false })
        canvas.addEventListener('touchend', this._onTouchEnd)
        canvas.addEventListener('touchcancel', this._onTouchEnd)
      }
    },

    _resize () {
      const root = this.$refs.root
      const app = this._app
      if (!root || !app) return
      const w = root.clientWidth
      const h = root.clientHeight
      app.resizeCanvas(w, h)
    },

    // ── Boucle : framing initial, orbite idle ou vol libre ─────────────────
    _tick (dt) {
      const pc = this._pc
      const cam = this._cam
      if (!pc || !cam) return

      // Framing initial dès que les bornes du splat sont connues
      if (!this._framed && this._splat) {
        const mi = this._splat.gsplat && this._splat.gsplat.instance && this._splat.gsplat.instance.meshInstance
        const aabb = mi && mi.aabb
        if (aabb && aabb.halfExtents.length() > 0.0001) {
          this._center = aabb.center.clone()
          this._radius = aabb.halfExtents.length()
          this._framed = true
        }
      }
      if (!this._framed) return

      if (this.active) {
        this._fly(dt)
      } else {
        // Orbite douce autour du centre
        this._orbitA += dt * 0.12
        const r = this._radius * 1.9
        const px = this._center.x + Math.sin(this._orbitA) * r
        const pz = this._center.z + Math.cos(this._orbitA) * r
        const py = this._center.y + this._radius * 0.15
        cam.setPosition(px, py, pz)
        cam.lookAt(this._center)
      }
    },

    _fly (dt) {
      const pc = this._pc
      const cam = this._cam
      // Orientation depuis yaw/pitch
      cam.setEulerAngles(this._pitch, this._yaw, 0)

      // Déplacement
      const speed = this._radius * (this._input.fast ? 2.4 : 0.9) * dt
      const move = new pc.Vec3()
      const fwd = cam.forward
      const right = cam.right
      const inp = this._input
      let mx = 0, mz = 0
      if (inp.f) mz += 1
      if (inp.b) mz -= 1
      if (inp.r) mx += 1
      if (inp.l) mx -= 1
      // Apport joystick mobile
      mx += this._stickVec.x
      mz += -this._stickVec.y
      if (mx || mz) {
        move.add(new pc.Vec3(fwd.x * mz, fwd.y * mz, fwd.z * mz))
        move.add(new pc.Vec3(right.x * mx, right.y * mx, right.z * mx))
      }
      if (inp.up) move.y += 1
      if (inp.down) move.y -= 1
      if (move.length() > 0) {
        move.normalize().mulScalar(speed)
        const p = cam.getPosition()
        cam.setPosition(p.x + move.x, p.y + move.y, p.z + move.z)
      }
    },

    // ── Entrée / sortie du mode exploration ────────────────────────────────
    enter () {
      if (this.status !== 'ready') return
      // Repart de l'orientation actuelle (pas de saut)
      const e = this._cam.getEulerAngles()
      this._pitch = e.x
      this._yaw = e.y
      this.active = true
      this.$emit('enter')
      if (!this.isTouch && this.$refs.canvas.requestPointerLock) {
        this.$refs.canvas.requestPointerLock()
      }
    },

    exit () {
      if (!this.active) return
      this.active = false
      this._resetInput()
      this.$emit('exit')
      if (!this.isTouch && document.pointerLockElement) document.exitPointerLock()
      // Reprend l'orbite depuis la position courante
      if (this._center) {
        const p = this._cam.getPosition()
        this._orbitA = Math.atan2(p.x - this._center.x, p.z - this._center.z)
      }
    },

    // ── Desktop input ──────────────────────────────────────────────────────
    _key (e, down) {
      const k = e.key.toLowerCase()
      const i = this._input
      switch (k) {
        case 'z': case 'w': case 'arrowup': i.f = down; break
        case 's': case 'arrowdown': i.b = down; break
        case 'q': case 'a': case 'arrowleft': i.l = down; break
        case 'd': case 'arrowright': i.r = down; break
        case ' ': i.up = down; break
        case 'control': case 'c': i.down = down; break
        case 'shift': i.fast = down; break
        default: return
      }
      if (this.active) e.preventDefault()
    },

    _look (dx, dy) {
      if (!this.active) return
      const sens = 0.12
      this._yaw -= dx * sens
      this._pitch -= dy * sens
      this._pitch = Math.max(-85, Math.min(85, this._pitch))
    },

    // ── Mobile : regarder (glisser hors joystick) ──────────────────────────
    _touchLookStart (e) {
      if (!this.active) return
      const t = e.changedTouches[0]
      // Ignore si le toucher démarre dans la zone du joystick
      const stick = this.$refs.stick
      if (stick) {
        const r = stick.getBoundingClientRect()
        if (t.clientX >= r.left && t.clientX <= r.right && t.clientY >= r.top && t.clientY <= r.bottom) return
      }
      this._lookTouchId = t.identifier
      this._lastTouch = { x: t.clientX, y: t.clientY }
    },

    _touchLookMove (e) {
      if (!this.active || this._lookTouchId === null) return
      for (const t of e.changedTouches) {
        if (t.identifier !== this._lookTouchId) continue
        const dx = t.clientX - this._lastTouch.x
        const dy = t.clientY - this._lastTouch.y
        this._lastTouch = { x: t.clientX, y: t.clientY }
        this._look(dx * 1.6, dy * 1.6)
      }
    },

    _touchLookEnd (e) {
      for (const t of e.changedTouches) {
        if (t.identifier === this._lookTouchId) { this._lookTouchId = null; this._lastTouch = null }
      }
    },

    // ── Mobile : joystick de déplacement ───────────────────────────────────
    onStickStart (e) { this._stickId = e.changedTouches[0].identifier; this._updateStick(e.changedTouches[0]) },
    onStickMove (e) {
      for (const t of e.changedTouches) if (t.identifier === this._stickId) this._updateStick(t)
    },
    onStickEnd () { this._stickId = null; this._stickVec = { x: 0, y: 0 }; this.knob = { x: 0, y: 0 } },
    _updateStick (t) {
      const r = this.$refs.stick.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      let nx = (t.clientX - cx) / (r.width / 2)
      let ny = (t.clientY - cy) / (r.height / 2)
      const len = Math.hypot(nx, ny)
      if (len > 1) { nx /= len; ny /= len }
      this.knob = { x: nx, y: ny }
      this._stickVec = { x: nx, y: ny }
    },

    _resetInput () {
      this._input = { f: false, b: false, l: false, r: false, up: false, down: false, fast: false }
      this._stickVec = { x: 0, y: 0 }
      this.knob = { x: 0, y: 0 }
    },

    _teardown () {
      if (this.active) this.exit()
      if (this._onResize) window.removeEventListener('resize', this._onResize)
      if (this._onKeyDown) window.removeEventListener('keydown', this._onKeyDown)
      if (this._onKeyUp) window.removeEventListener('keyup', this._onKeyUp)
      if (this._onMouseMove) document.removeEventListener('mousemove', this._onMouseMove)
      if (this._onPointerLockChange) document.removeEventListener('pointerlockchange', this._onPointerLockChange)
      if (this._onWheel) window.removeEventListener('wheel', this._onWheel)
      const canvas = this.$refs.canvas
      if (canvas && this._onTouchStart) {
        canvas.removeEventListener('touchstart', this._onTouchStart)
        canvas.removeEventListener('touchmove', this._onTouchMove)
        canvas.removeEventListener('touchend', this._onTouchEnd)
        canvas.removeEventListener('touchcancel', this._onTouchEnd)
      }
      if (this._app) {
        try { this._app.destroy() } catch (_) {}
        this._app = null
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.StudioSplat
  position: relative
  width: 100%
  height: 100%

  &_canvas
    width: 100%
    height: 100%
    display: block
    touch-action: none

  &.is-active &_canvas
    cursor: none

  // ── Overlays ──────────────────────────────────────────────────────────
  &_overlay
    position: absolute
    inset: 0
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    gap: 1rem
    font-family: $apfel
    color: $white

  &_loading
    pointer-events: none
    background: #0a0a0a

    .spinner
      width: 1.6rem
      height: 1.6rem
      border: 1px solid rgba(255,255,255,0.2)
      border-top-color: rgba(255,255,255,0.7)
      border-radius: 50%
      animation: splatspin 0.8s linear infinite

    .txt
      font-size: 0.8rem
      letter-spacing: 0.15em
      text-transform: uppercase
      opacity: 0.6

  // Bouton "explorer"
  &_enter
    appearance: none
    border: none
    background: transparent
    cursor: pointer
    color: $white
    transition: opacity 0.3s ease, background 0.3s ease
    background: rgba(10,10,10,0.28)

    svg
      opacity: 0.9
    span
      font-size: 0.78rem
      letter-spacing: 0.18em
      text-transform: uppercase
      opacity: 0.85

    &:hover
      background: rgba(10,10,10,0.12)
      span
        opacity: 1

  // HUD pendant l'exploration
  &_hud
    position: absolute
    top: 1rem
    left: 1rem
    font-family: $apfel
    font-size: 0.7rem
    letter-spacing: 0.12em
    text-transform: uppercase
    color: rgba(255,255,255,0.7)
    pointer-events: none
    text-shadow: 0 1px 8px rgba(0,0,0,0.5)

  &_exit
    position: absolute
    top: 0.8rem
    right: 0.8rem
    display: flex
    align-items: center
    gap: 0.4rem
    appearance: none
    border: 1px solid rgba(255,255,255,0.25)
    background: rgba(10,10,10,0.4)
    color: $white
    border-radius: 999px
    padding: 0.4rem 0.8rem
    font-family: $apfel
    font-size: 0.68rem
    letter-spacing: 0.1em
    text-transform: uppercase
    cursor: pointer
    z-index: 3

    &:hover
      background: rgba(10,10,10,0.7)

  // Joystick mobile
  &_stick
    position: absolute
    left: 1.2rem
    bottom: 1.2rem
    width: 6.5rem
    height: 6.5rem
    border-radius: 50%
    background: rgba(255,255,255,0.08)
    border: 1px solid rgba(255,255,255,0.2)
    display: flex
    align-items: center
    justify-content: center
    z-index: 3
    touch-action: none

    &_knob
      width: 2.6rem
      height: 2.6rem
      border-radius: 50%
      background: rgba(255,255,255,0.85)

@keyframes splatspin
  to
    transform: rotate(360deg)
</style>
