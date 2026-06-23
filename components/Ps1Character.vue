<template>
  <div ref="root" class="Ps1Character">
    <canvas ref="canvas" class="Ps1Character_canvas" />
  </div>
</template>

<script>
// ─────────────────────────────────────────────────────────────────────────────
// Personnage 3D façon PlayStation 1 (Three.js, même moteur que /scan /playground).
//
// Look PS1 obtenu par :
//  • vertex snapping  : on arrondit la position en espace écran dans le vertex
//    shader (le tremblement caractéristique), injecté APRÈS le skinning.
//  • basse résolution : on rend dans un petit buffer puis on agrandit en
//    image-rendering: pixelated (gros pixels).
//  • textures nearest : pas de filtrage → texels nets.
//  • éclairage par sommet (MeshLambert) au lieu de PBR par pixel.
//
// Charge un GLB animé (Mixamo). Joue le clip `clip` ou la 1re animation trouvée.
// ─────────────────────────────────────────────────────────────────────────────
export default {
  name: 'Ps1Character',

  props: {
    url: { type: String, required: true },
    clip: { type: String, default: '' },
    // Hauteur du buffer de rendu interne (px) : plus bas = plus pixelisé
    pixelHeight: { type: Number, default: 260 },
    // Finesse de la grille de snapping : plus bas = plus tremblant
    wobble: { type: Number, default: 160 },
    // Rotation Y initiale du modèle en degrés (180 si le perso est de dos)
    faceDeg: { type: Number, default: 0 }
  },

  mounted () {
    if (typeof window === 'undefined') return
    this._raf = null
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
      const root = this.$refs.root
      if (!canvas || !root) return

      const scene = new THREE.Scene()
      this._scene = scene

      const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100)
      camera.position.set(0, 0, 3.9)
      camera.lookAt(0, 0, 0)
      this._camera = camera

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
      renderer.setClearColor(0x000000, 0) // transparent → se pose sur le hero orange
      this._renderer = renderer

      // Éclairage doux par sommet (rendu PS1 = Gouraud, pas PBR par pixel)
      scene.add(new THREE.AmbientLight(0xffffff, 0.85))
      const dir = new THREE.DirectionalLight(0xffffff, 0.7)
      dir.position.set(1, 2, 2)
      scene.add(dir)

      const loader = new GLTFLoader()
      loader.load(this.url, (gltf) => {
        const model = gltf.scene
        model.rotation.y = this.faceDeg * Math.PI / 180

        // Centre le modèle sur l'origine (pieds en bas), cadrage stable
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        model.position.x -= center.x
        model.position.z -= center.z
        model.position.y -= center.y // centré verticalement aussi

        // Style PS1 sur chaque matériau : Lambert + textures nearest + snapping
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
          this._applyPs1Snap(mat)
          o.material = mat
        })

        scene.add(model)
        this._model = model

        // Animation : clip demandé sinon la première
        if (gltf.animations && gltf.animations.length) {
          this._mixer = new THREE.AnimationMixer(model)
          let clip = null
          if (this.clip) clip = gltf.animations.find(a => a.name === this.clip)
          if (!clip) clip = gltf.animations[0]
          this._mixer.clipAction(clip).play()
        }

        this._resize()
        this.$emit('ready')
      }, undefined, () => this.$emit('error'))

      this._onResize = () => this._resize()
      window.addEventListener('resize', this._onResize)
      this._resize()

      this._clock = new THREE.Clock()
      this._animate()
    },

    // Injecte le vertex snapping dans le shader du matériau (après skinning)
    _applyPs1Snap (mat) {
      const THREE = this._THREE
      const grid = this.wobble
      mat.onBeforeCompile = (shader) => {
        shader.uniforms.uGrid = { value: new THREE.Vector2(grid, grid) }
        shader.vertexShader = 'uniform vec2 uGrid;\n' + shader.vertexShader.replace(
          '#include <project_vertex>',
          [
            '#include <project_vertex>',
            'vec4 ps1 = gl_Position;',
            'ps1.xyz /= ps1.w;',                       // -> NDC
            'ps1.xy = floor(ps1.xy * uGrid) / uGrid;', // snap sur la grille
            'ps1.xyz *= ps1.w;',                       // -> clip space
            'gl_Position = ps1;'
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
      const aspect = cssW / cssH
      cam.aspect = aspect
      cam.updateProjectionMatrix()
      // Buffer interne basse réso ; le canvas (CSS 100%) est agrandi en pixelated
      const ih = this.pixelHeight
      const iw = Math.max(1, Math.round(ih * aspect))
      r.setPixelRatio(1)
      r.setSize(iw, ih, false) // false = ne touche pas au style CSS du canvas
    },

    _animate () {
      this._raf = requestAnimationFrame(() => this._animate())
      const dt = this._clock ? this._clock.getDelta() : 0.016
      if (this._mixer) this._mixer.update(dt)
      if (this._renderer && this._scene && this._camera) {
        this._renderer.render(this._scene, this._camera)
      }
    },

    _teardown () {
      if (this._raf) cancelAnimationFrame(this._raf)
      if (this._onResize) window.removeEventListener('resize', this._onResize)
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
    // Agrandissement net du buffer basse réso → gros pixels (look PS1)
    image-rendering: pixelated
    image-rendering: crisp-edges
</style>
