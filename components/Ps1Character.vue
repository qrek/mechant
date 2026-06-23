<template>
  <div ref="root" class="Ps1Character">
    <canvas ref="canvas" class="Ps1Character_canvas" />
  </div>
</template>

<script>
// ─────────────────────────────────────────────────────────────────────────────
// Persos 3D façon PlayStation 1 (Three.js) — UN ou PLUSIEURS côte à côte.
//
// Look PS1 = vertex snapping + basse résolution upscalée + textures nearest +
// éclairage par sommet + banding couleur.
//
// Mise en scène : tous les persos sont posés sur un même sol (pieds à y=0),
// alignés de gauche à droite à leur ÉCHELLE RÉELLE (on ne recale pas chacun à
// la même hauteur → les différences de taille/carrure se voient). Chaque perso
// a une ombre de contact au sol. La caméra cadre le groupe avec une légère
// plongée pour que les ombres se lisent.
//
// RÉGLAGES LIVE (panneau en local) : pixelHeight, wobble, colorDepth, framing,
// offsetY, cameraPitch, spacing, shadowStrength, shadowScale.
// ─────────────────────────────────────────────────────────────────────────────
export default {
  name: 'Ps1Character',

  props: {
    // Liste [{ url, clip?, faceDeg?, scale? }] — gauche → droite
    characters: { type: Array, default: () => [] },
    // Fallback perso unique
    url: { type: String, default: '' },
    clip: { type: String, default: '' },
    faceDeg: { type: Number, default: 0 },
    // Rendu PS1
    pixelHeight: { type: Number, default: 200 },
    wobble: { type: Number, default: 160 },
    colorDepth: { type: Number, default: 30 },
    // Cadrage / compo
    framing: { type: Number, default: 1.15 },
    offsetY: { type: Number, default: 0 },
    cameraPitch: { type: Number, default: 10 }, // plongée caméra en degrés
    spacing: { type: Number, default: 0.35 },   // écart entre persos (unités monde)
    autoRotate: { type: Number, default: 0 },
    // Ombre de contact au sol
    shadow: { type: Boolean, default: true },
    shadowStrength: { type: Number, default: 0.8 },
    shadowScale: { type: Number, default: 0.75 },
    debug: { type: Boolean, default: false }
  },

  mounted () {
    if (typeof window === 'undefined') return
    this._raf = null
    this._chars = []
    this._shadows = []
    this._snapUniforms = []
    this._levelUniforms = []
    this._p = {
      pixelHeight: this.pixelHeight, wobble: this.wobble, colorDepth: this.colorDepth,
      framing: this.framing, offsetY: this.offsetY, cameraPitch: this.cameraPitch,
      spacing: this.spacing, autoRotate: this.autoRotate,
      shadowStrength: this.shadowStrength, shadowScale: this.shadowScale
    }
    this._boot()
  },

  beforeDestroy () { this._teardown() },

  methods: {
    async _boot () {
      const THREE = await import('three')
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
      this._THREE = THREE
      const canvas = this.$refs.canvas
      if (!canvas) return

      const scene = new THREE.Scene()
      this._scene = scene
      const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 1000)
      this._camera = camera
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
      renderer.setClearColor(0x000000, 0)
      this._renderer = renderer

      scene.add(new THREE.AmbientLight(0xffffff, 0.9))
      const dir = new THREE.DirectionalLight(0xffffff, 0.65)
      dir.position.set(1, 2, 2)
      scene.add(dir)

      const list = (this.characters && this.characters.length)
        ? this.characters
        : (this.url ? [{ url: this.url }] : [])

      const loader = new GLTFLoader()
      try {
        const gltfs = await Promise.all(list.map(c => loader.loadAsync(c.url)))
        gltfs.forEach((gltf, i) => this._setupChar(gltf, list[i]))
      } catch (e) { this.$emit('error'); return }

      if (this.shadow) this._buildShadows()
      this._layout()
      this._resize()
      this._maybeDebugPanel()
      this.$emit('ready')

      this._onResize = () => this._resize()
      window.addEventListener('resize', this._onResize)
      this._clock = new THREE.Clock()
      this._animate()
    },

    _setupChar (gltf, entry) {
      const THREE = this._THREE
      const model = gltf.scene
      const faceDeg = entry.faceDeg != null ? entry.faceDeg : this.faceDeg
      model.rotation.y = faceDeg * Math.PI / 180
      const scale = entry.scale != null ? entry.scale : 1
      if (scale !== 1) model.scale.setScalar(scale)

      model.traverse((o) => {
        if (!o.isMesh && !o.isSkinnedMesh) return
        o.frustumCulled = false
        const src = o.material
        const map = src && src.map ? src.map : null
        if (map) { map.magFilter = THREE.NearestFilter; map.minFilter = THREE.NearestFilter; map.generateMipmaps = false; map.needsUpdate = true }
        const mat = new THREE.MeshLambertMaterial({ map, color: src && src.color ? src.color : 0xffffff, skinning: !!o.isSkinnedMesh })
        this._applyPs1(mat)
        o.material = mat
      })

      this._scene.add(model)

      let mixer = null, action = null, clip = null
      if (gltf.animations && gltf.animations.length) {
        mixer = new THREE.AnimationMixer(model)
        const name = entry.clip || this.clip
        clip = name ? gltf.animations.find(a => a.name === name) : null
        if (!clip) clip = gltf.animations[0]
        action = mixer.clipAction(clip); action.play()
      }

      const { center, size } = this._charBounds(model, mixer, action, clip)
      // Pose au sol : pieds (min.y) à y = 0
      const feetY = center.y - size.y / 2
      model.position.y -= feetY
      center.y = size.y / 2

      this._chars.push({ model, mixer, action, center, size, faceDeg })
    },

    // Bornes monde des os, échantillonnées sur toute l'anim (sinon tête/bras
    // sortent du cadre selon la pose).
    _charBounds (model, mixer, action, clip) {
      const THREE = this._THREE
      const box = new THREE.Box3()
      const v = new THREE.Vector3()
      const addBones = () => {
        model.updateWorldMatrix(true, true)
        let used = false
        model.traverse((o) => {
          if (o.isSkinnedMesh && o.skeleton && o.skeleton.bones.length) {
            o.skeleton.bones.forEach((b) => { b.getWorldPosition(v); box.expandByPoint(v) }); used = true
          }
        })
        return used
      }
      let used = false
      if (mixer && action && clip && clip.duration > 0) {
        const N = 12
        for (let i = 0; i <= N; i++) { action.time = (i / N) * clip.duration; mixer.update(0); if (addBones()) used = true }
        action.time = 0; mixer.update(0)
      } else { used = addBones() }
      if (!used || box.isEmpty()) {
        model.traverse((o) => {
          if ((!o.isMesh && !o.isSkinnedMesh) || !o.geometry) return
          if (!o.geometry.boundingBox) o.geometry.computeBoundingBox()
          box.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld))
        })
      }
      const pad = box.getSize(new THREE.Vector3()).multiplyScalar(0.08)
      box.expandByVector(pad)
      return { center: box.getCenter(new THREE.Vector3()), size: box.getSize(new THREE.Vector3()) }
    },

    // Aligne les persos gauche → droite, groupe centré sur x=0, pieds au sol.
    _layout () {
      const gap = this._p.spacing
      let cursor = 0
      this._chars.forEach((ch) => {
        const targetX = cursor + ch.size.x / 2
        ch.model.position.x += targetX - ch.center.x
        ch.center.x = targetX
        cursor += ch.size.x + gap
      })
      const totalW = Math.max(0.0001, cursor - gap)
      const half = totalW / 2
      this._chars.forEach((ch) => { ch.model.position.x -= half; ch.center.x -= half })
      this._group = { width: totalW, height: Math.max.apply(null, this._chars.map(c => c.size.y)) }
      // (Re)positionne les ombres
      this._shadows.forEach((s, i) => {
        const ch = this._chars[i]
        if (!ch) return
        s.position.set(ch.center.x, 0.01, ch.center.z)
        const d = Math.max(ch.size.x, ch.size.z) * this._p.shadowScale
        s.scale.set(d, d, d)
      })
    },

    _buildShadows () {
      const THREE = this._THREE
      const c = document.createElement('canvas'); c.width = c.height = 128
      const ctx = c.getContext('2d')
      const g = ctx.createRadialGradient(64, 64, 2, 64, 64, 64)
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.55, 'rgba(0,0,0,0.6)'); g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128)
      const tex = new THREE.CanvasTexture(c)
      this._chars.forEach(() => {
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: this._p.shadowStrength, depthWrite: false })
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat)
        plane.rotation.x = -Math.PI / 2
        this._scene.add(plane); this._shadows.push(plane)
      })
    },

    // Cadre tout le groupe + légère plongée pour révéler le sol/les ombres
    _frameCamera () {
      const cam = this._camera
      if (!cam || !this._group) return
      const fovV = cam.fov * Math.PI / 180
      const tanV = Math.tan(fovV / 2)
      const distV = (this._group.height * this._p.framing / 2) / tanV
      const distH = (this._group.width * this._p.framing / 2) / (tanV * cam.aspect)
      const dist = Math.max(distV, distH)
      const p = this._p.cameraPitch * Math.PI / 180
      const ty = this._group.height * (0.45 + this._p.offsetY)
      cam.position.set(0, ty + dist * Math.sin(p), dist * Math.cos(p))
      cam.lookAt(0, ty, 0)
    },

    _applyPs1 (mat) {
      const THREE = this._THREE
      mat.onBeforeCompile = (shader) => {
        const uGrid = { value: new THREE.Vector2(this._p.wobble, this._p.wobble) }
        const uLevels = { value: this._p.colorDepth }
        shader.uniforms.uGrid = uGrid
        shader.uniforms.uLevels = uLevels
        this._snapUniforms.push(uGrid); this._levelUniforms.push(uLevels)
        shader.vertexShader = 'uniform vec2 uGrid;\n' + shader.vertexShader.replace(
          '#include <project_vertex>',
          ['#include <project_vertex>', 'vec4 ps1 = gl_Position;', 'ps1.xyz /= ps1.w;', 'ps1.xy = floor(ps1.xy * uGrid) / uGrid;', 'ps1.xyz *= ps1.w;', 'gl_Position = ps1;'].join('\n')
        )
        shader.fragmentShader = 'uniform float uLevels;\n' + shader.fragmentShader.replace(
          '#include <dithering_fragment>',
          ['#include <dithering_fragment>', 'gl_FragColor.rgb = floor(gl_FragColor.rgb * uLevels + 0.5) / uLevels;'].join('\n')
        )
      }
      mat.needsUpdate = true
    },

    _resize () {
      const root = this.$refs.root, r = this._renderer, cam = this._camera
      if (!root || !r || !cam) return
      const cssW = root.clientWidth, cssH = root.clientHeight
      if (!cssW || !cssH) return
      cam.aspect = cssW / cssH
      cam.updateProjectionMatrix()
      this._frameCamera()
      const ih = this._p.pixelHeight
      const iw = Math.max(1, Math.round(ih * cam.aspect))
      r.setPixelRatio(1)
      r.setSize(iw, ih, false)
    },

    _updateShadows () {
      this._shadows.forEach((s, i) => {
        const ch = this._chars[i]; if (!ch) return
        s.material.opacity = this._p.shadowStrength
        const d = Math.max(ch.size.x, ch.size.z) * this._p.shadowScale
        s.scale.set(d, d, d)
      })
    },

    _animate () {
      this._raf = requestAnimationFrame(() => this._animate())
      const dt = this._clock ? this._clock.getDelta() : 0.016
      this._chars.forEach((ch) => {
        if (ch.mixer) ch.mixer.update(dt)
        if (this._p.autoRotate) ch.model.rotation.y += this._p.autoRotate * dt
      })
      if (this._renderer && this._scene && this._camera) this._renderer.render(this._scene, this._camera)
    },

    async _maybeDebugPanel () {
      const host = (window.location && window.location.hostname) || ''
      const isLocal = this.debug || host === 'localhost' || host === '127.0.0.1' ||
        /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)
      if (!isLocal) return
      let Tweakpane
      try { Tweakpane = (await import('tweakpane')).default } catch (_) { return }
      const container = document.createElement('div')
      Object.assign(container.style, { position: 'fixed', top: '90px', right: '14px', width: '270px', maxHeight: '78vh', overflow: 'auto', zIndex: '2147483647', pointerEvents: 'auto' })
      document.body.appendChild(container)
      this._paneEl = container
      const pane = new Tweakpane({ title: 'PS1 — réglages', container })
      this._pane = pane
      const p = this._p
      pane.addInput(p, 'pixelHeight', { min: 60, max: 400, step: 5 }).on('change', () => this._resize())
      pane.addInput(p, 'wobble', { min: 30, max: 400, step: 2 }).on('change', () => this._snapUniforms.forEach(u => u.value.set(p.wobble, p.wobble)))
      pane.addInput(p, 'colorDepth', { min: 3, max: 64, step: 1 }).on('change', () => this._levelUniforms.forEach(u => { u.value = p.colorDepth }))
      pane.addInput(p, 'framing', { min: 1, max: 2.4, step: 0.05 }).on('change', () => this._frameCamera())
      pane.addInput(p, 'offsetY', { min: -0.5, max: 0.5, step: 0.02 }).on('change', () => this._frameCamera())
      pane.addInput(p, 'cameraPitch', { min: -5, max: 45, step: 1 }).on('change', () => this._frameCamera())
      pane.addInput(p, 'spacing', { min: -0.5, max: 2, step: 0.05 }).on('change', () => { this._layout(); this._frameCamera() })
      pane.addInput(p, 'shadowStrength', { min: 0, max: 1, step: 0.02 }).on('change', () => this._updateShadows())
      pane.addInput(p, 'shadowScale', { min: 0.2, max: 2, step: 0.05 }).on('change', () => this._updateShadows())
      pane.addInput(p, 'autoRotate', { min: 0, max: 1.5, step: 0.05 })
      pane.addButton({ title: 'Copier les props' }).on('click', () => {
        const tag = `:pixel-height="${p.pixelHeight}" :wobble="${p.wobble}" :color-depth="${p.colorDepth}" :framing="${p.framing}" :offset-y="${p.offsetY}" :camera-pitch="${p.cameraPitch}" :spacing="${p.spacing}" :shadow-strength="${p.shadowStrength}" :shadow-scale="${p.shadowScale}" :auto-rotate="${p.autoRotate}"`
        if (navigator.clipboard) navigator.clipboard.writeText(tag)
        console.log('Ps1Character props →\n', tag) // eslint-disable-line no-console
      })
    },

    _teardown () {
      if (this._raf) cancelAnimationFrame(this._raf)
      if (this._onResize) window.removeEventListener('resize', this._onResize)
      if (this._pane) { try { this._pane.dispose() } catch (_) {} }
      if (this._paneEl && this._paneEl.parentNode) this._paneEl.parentNode.removeChild(this._paneEl)
      ;(this._chars || []).forEach((ch) => { if (ch.mixer) ch.mixer.stopAllAction(); if (this._scene) this._scene.remove(ch.model) })
      if (this._renderer) { this._renderer.dispose(); this._renderer.forceContextLoss && this._renderer.forceContextLoss() }
      this._chars = []; this._shadows = []; this._snapUniforms = []; this._levelUniforms = []
      this._scene = null; this._camera = null; this._renderer = null; this._THREE = null
    }
  }
}
</script>

<style lang="sass" scoped>
.Ps1Character
  position: relative
  width: 100%
  height: 100%

  &_canvas
    width: 100%
    height: 100%
    display: block
    image-rendering: pixelated
    image-rendering: crisp-edges
</style>
