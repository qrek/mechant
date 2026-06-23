<template>
  <div ref="root" class="Ps1Character">
    <canvas ref="canvas" class="Ps1Character_canvas" />
  </div>
</template>

<script>
// ─────────────────────────────────────────────────────────────────────────────
// Personnage 3D façon PlayStation 1 (Three.js, même moteur que /scan /playground).
//
// Look PS1 = vertex snapping (tremblement) + basse résolution upscalée (gros
// pixels) + textures nearest + éclairage par sommet + banding couleur (dither).
//
// RÉGLAGES LIVE : en local (localhost) un petit panneau de sliders s'affiche
// en haut à droite pour ajuster le rendu en direct. Une fois la bonne combine
// trouvée, on fige les valeurs en props sur la balise <Ps1Character>.
//
// Props (toutes ajustables) :
//   pixelHeight : hauteur du buffer interne en px — PLUS BAS = plus pixelisé
//   wobble      : finesse grille de snapping — PLUS BAS = plus tremblant
//   colorDepth  : niveaux de couleur par canal — PLUS BAS = plus de banding
//   faceDeg     : rotation Y du perso (180 s'il est de dos)
//   framing     : marge de cadrage (1 = serré, 1.6 = plus d'air)
//   offsetY     : décalage vertical du cadrage (+ monte, - descend)
//   autoRotate  : vitesse de rotation auto (0 = figé)
// ─────────────────────────────────────────────────────────────────────────────
export default {
  name: 'Ps1Character',

  props: {
    url: { type: String, required: true },
    clip: { type: String, default: '' },
    pixelHeight: { type: Number, default: 150 },
    wobble: { type: Number, default: 120 },
    colorDepth: { type: Number, default: 14 },
    faceDeg: { type: Number, default: 0 },
    framing: { type: Number, default: 1.55 },
    offsetY: { type: Number, default: 0 },
    autoRotate: { type: Number, default: 0 },
    debug: { type: Boolean, default: false }
  },

  mounted () {
    if (typeof window === 'undefined') return
    this._raf = null
    this._snapUniforms = []
    this._levelUniforms = []
    // Valeurs de travail (modifiables en live par le panneau debug)
    this._p = {
      pixelHeight: this.pixelHeight,
      wobble: this.wobble,
      colorDepth: this.colorDepth,
      faceDeg: this.faceDeg,
      framing: this.framing,
      offsetY: this.offsetY,
      autoRotate: this.autoRotate
    }
    this._boot()
  },

  beforeDestroy () {
    this._teardown()
  },

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

      const loader = new GLTFLoader()
      loader.load(this.url, (gltf) => {
        const model = gltf.scene
        this._model = model
        model.rotation.y = this._p.faceDeg * Math.PI / 180

        model.traverse((o) => {
          if (!o.isMesh && !o.isSkinnedMesh) return
          o.frustumCulled = false
          const src = o.material
          const map = src && src.map ? src.map : null
          if (map) {
            map.magFilter = THREE.NearestFilter
            map.minFilter = THREE.NearestFilter
            map.generateMipmaps = false
            map.needsUpdate = true
          }
          const mat = new THREE.MeshLambertMaterial({
            map,
            color: src && src.color ? src.color : 0xffffff,
            skinning: !!o.isSkinnedMesh
          })
          this._applyPs1(mat)
          o.material = mat
        })

        scene.add(model)

        // Bornes fiables : union des boundingBox de géométrie (les SkinnedMesh
        // piègent Box3.setFromObject -> on calcule à la main en pose de repos).
        this._computeBounds()
        this._frameCamera()

        if (gltf.animations && gltf.animations.length) {
          this._mixer = new THREE.AnimationMixer(model)
          let clip = this.clip ? gltf.animations.find(a => a.name === this.clip) : null
          if (!clip) clip = gltf.animations[0]
          this._mixer.clipAction(clip).play()
        }

        this._resize()
        this._maybeDebugPanel()
        this.$emit('ready')
      }, undefined, () => this.$emit('error'))

      this._onResize = () => this._resize()
      window.addEventListener('resize', this._onResize)
      this._resize()

      this._clock = new THREE.Clock()
      this._animate()
    },

    _computeBounds () {
      const THREE = this._THREE
      const box = new THREE.Box3()
      this._model.updateWorldMatrix(true, true)

      // Perso skinné : les vertices sont positionnés par les OS (le scale du
      // nœud mesh, souvent 0.01 façon Mixamo, est court-circuité par le
      // skinning). On mesure donc les positions monde des os du squelette.
      let usedBones = false
      const v = new THREE.Vector3()
      this._model.traverse((o) => {
        if (o.isSkinnedMesh && o.skeleton && o.skeleton.bones.length) {
          o.skeleton.bones.forEach((b) => { b.getWorldPosition(v); box.expandByPoint(v) })
          usedBones = true
        }
      })

      // Repli pour un mesh non skinné
      if (!usedBones) {
        this._model.traverse((o) => {
          if ((!o.isMesh && !o.isSkinnedMesh) || !o.geometry) return
          if (!o.geometry.boundingBox) o.geometry.computeBoundingBox()
          box.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld))
        })
      }

      // Les os sont à l'intérieur du maillage (tête/orteils dépassent) → marge
      const pad = box.getSize(new THREE.Vector3()).multiplyScalar(0.1)
      box.expandByVector(pad)
      this._center = box.getCenter(new THREE.Vector3())
      this._size = box.getSize(new THREE.Vector3())
    },

    // Cadre la caméra pour faire tenir tout le perso (hauteur) avec marge.
    _frameCamera () {
      const cam = this._camera
      if (!cam || !this._center) return
      const fov = cam.fov * Math.PI / 180
      const fitH = Math.max(this._size.y, this._size.x / cam.aspect) * this._p.framing
      const dist = (fitH / 2) / Math.tan(fov / 2)
      const cx = this._center.x
      const cy = this._center.y + this._p.offsetY * this._size.y
      const cz = this._center.z
      cam.position.set(cx, cy, cz + dist)
      cam.lookAt(cx, cy, cz)
    },

    _applyPs1 (mat) {
      const THREE = this._THREE
      mat.onBeforeCompile = (shader) => {
        const uGrid = { value: new THREE.Vector2(this._p.wobble, this._p.wobble) }
        const uLevels = { value: this._p.colorDepth }
        shader.uniforms.uGrid = uGrid
        shader.uniforms.uLevels = uLevels
        this._snapUniforms.push(uGrid)
        this._levelUniforms.push(uLevels)
        // Vertex snapping (après le skinning, qui est dans project_vertex)
        shader.vertexShader = 'uniform vec2 uGrid;\n' + shader.vertexShader.replace(
          '#include <project_vertex>',
          [
            '#include <project_vertex>',
            'vec4 ps1 = gl_Position;',
            'ps1.xyz /= ps1.w;',
            'ps1.xy = floor(ps1.xy * uGrid) / uGrid;',
            'ps1.xyz *= ps1.w;',
            'gl_Position = ps1;'
          ].join('\n')
        )
        // Banding couleur (quantification) en fin de fragment
        shader.fragmentShader = 'uniform float uLevels;\n' + shader.fragmentShader.replace(
          '#include <dithering_fragment>',
          [
            '#include <dithering_fragment>',
            'gl_FragColor.rgb = floor(gl_FragColor.rgb * uLevels + 0.5) / uLevels;'
          ].join('\n')
        )
      }
      mat.needsUpdate = true
    },

    _resize () {
      const root = this.$refs.root
      const r = this._renderer
      const cam = this._camera
      if (!root || !r || !cam) return
      const cssW = root.clientWidth
      const cssH = root.clientHeight
      if (!cssW || !cssH) return
      cam.aspect = cssW / cssH
      cam.updateProjectionMatrix()
      this._frameCamera()
      const ih = this._p.pixelHeight
      const iw = Math.max(1, Math.round(ih * cam.aspect))
      r.setPixelRatio(1)
      r.setSize(iw, ih, false)
    },

    _animate () {
      this._raf = requestAnimationFrame(() => this._animate())
      const dt = this._clock ? this._clock.getDelta() : 0.016
      if (this._mixer) this._mixer.update(dt)
      if (this._model && this._p.autoRotate) this._model.rotation.y += this._p.autoRotate * dt
      if (this._renderer && this._scene && this._camera) {
        this._renderer.render(this._scene, this._camera)
      }
    },

    // ── Panneau de réglages live (local uniquement) ────────────────────────
    async _maybeDebugPanel () {
      const host = (window.location && window.location.hostname) || ''
      const isLocal = this.debug || host === 'localhost' || host === '127.0.0.1' ||
        /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)
      if (!isLocal) return
      let Tweakpane
      try { Tweakpane = (await import('tweakpane')).default } catch (_) { return }
      const pane = new Tweakpane({ title: 'PS1 — réglages' })
      this._pane = pane
      const p = this._p
      pane.addInput(p, 'pixelHeight', { min: 60, max: 400, step: 5 }).on('change', () => this._resize())
      pane.addInput(p, 'wobble', { min: 30, max: 400, step: 2 }).on('change', () => this._snapUniforms.forEach(u => u.value.set(p.wobble, p.wobble)))
      pane.addInput(p, 'colorDepth', { min: 3, max: 64, step: 1 }).on('change', () => this._levelUniforms.forEach(u => { u.value = p.colorDepth }))
      pane.addInput(p, 'faceDeg', { min: -180, max: 180, step: 5 }).on('change', () => { if (this._model) this._model.rotation.y = p.faceDeg * Math.PI / 180 })
      pane.addInput(p, 'framing', { min: 1, max: 2.4, step: 0.05 }).on('change', () => this._frameCamera())
      pane.addInput(p, 'offsetY', { min: -0.6, max: 0.6, step: 0.02 }).on('change', () => this._frameCamera())
      pane.addInput(p, 'autoRotate', { min: 0, max: 1.5, step: 0.05 })
      // Bouton pour copier la balise prête à coller
      pane.addButton({ title: 'Copier les props' }).on('click', () => {
        const tag = `:pixel-height="${p.pixelHeight}" :wobble="${p.wobble}" :color-depth="${p.colorDepth}" :face-deg="${p.faceDeg}" :framing="${p.framing}" :offset-y="${p.offsetY}" :auto-rotate="${p.autoRotate}"`
        if (navigator.clipboard) navigator.clipboard.writeText(tag)
        // eslint-disable-next-line no-console
        console.log('Ps1Character props →\n', tag)
      })
    },

    _teardown () {
      if (this._raf) cancelAnimationFrame(this._raf)
      if (this._onResize) window.removeEventListener('resize', this._onResize)
      if (this._pane) { try { this._pane.dispose() } catch (_) {} }
      if (this._mixer) this._mixer.stopAllAction()
      if (this._model && this._scene) this._scene.remove(this._model)
      if (this._renderer) {
        this._renderer.dispose()
        this._renderer.forceContextLoss && this._renderer.forceContextLoss()
      }
      this._mixer = null
      this._model = null
      this._scene = null
      this._camera = null
      this._renderer = null
      this._THREE = null
      this._snapUniforms = []
      this._levelUniforms = []
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
