<template>
  <section class="Playground">

    <div class="Playground_canvas" ref="canvas" @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseup="onMouseUp" @mouseleave="onMouseUp"></div>

    <header class="Playground_hud Playground_hud--top">
      <div class="Playground_label">
        <span class="dot"></span>
        Playground
      </div>
      <div class="Playground_meta">
        <span v-if="stats.tris">{{ stats.tris }}k tris</span>
        <span v-if="ragdollReady">· {{ stats.bones }} bones · physics ON</span>
      </div>
    </header>

    <div class="Playground_hud Playground_hud--right">
      <button class="Playground_btn" @click="resetCharacter" :disabled="!ragdollReady">
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
// Helpers de matching de bones — tolérant aux préfixes (mixamorig:, etc.)
// patterns peut contenir des string (includes) ou {all: ['a','b']} pour ALL-match
function findBone (skeleton, ...patterns) {
  for (const p of patterns) {
    if (typeof p === 'string') {
      const lp = p.toLowerCase()
      const bone = skeleton.bones.find(b => b.name.toLowerCase().includes(lp))
      if (bone) return bone
    } else if (p && p.all) {
      const parts = p.all.map(s => s.toLowerCase())
      const bone = skeleton.bones.find(b => {
        const n = b.name.toLowerCase()
        return parts.every(part => n.includes(part))
      })
      if (bone) return bone
    }
  }
  return null
}

export default {
  name: 'Playground',

  head () {
    return {
      title: 'Playground — MÉCHANT',
      meta: [{ hid: 'description', name: 'description', content: 'Grab the character with your mouse — full ragdoll physics.' }]
    }
  },

  data () {
    return {
      characterUrl: '/playground/scene.glb',
      loading: true,
      loadingLabel: 'Loading character',
      progress: 0,
      ragdollReady: false,
      hint: 'Click & drag the character',
      stats: { tris: 0, bones: 0 },

      // Box rétrécie : tu peux pousser le perso contre les murs facilement
      BOX: { w: 4.5, h: 3, d: 5 }
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

      // ── Scene ────────────────────────────────────────────────────
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0xf2f2f0)
      scene.fog = new THREE.Fog(0xf2f2f0, 5, 15)
      this._scene = scene

      // ── Camera : juste devant la box, cadre le perso entier ─────
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.05, 50)
      camera.position.set(0, 1.1, 3)
      camera.lookAt(0, 0.85, 0)
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

      this._raycaster = new THREE.Raycaster()
      this._mouse = new THREE.Vector2()

      // ── Décors visuels ───────────────────────────────────────────
      this._buildBox()
      this._buildLights()

      // ── Init physics + chargement perso en parallèle ─────────────
      const [_, gltf] = await Promise.all([
        this._initRapier(),
        this._loadCharacter()
      ])
      this._placeCharacter(gltf.scene)
      this._buildRagdoll()

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
        if (this._world) {
          // Si on drag : la body grabbée suit la souris en kinematic
          if (this._isDragging && this._grabbed && this._mouseWorldPos) {
            this._grabbed.body.setNextKinematicTranslation(this._mouseWorldPos)
          }
          this._world.step()
          this._syncRagdoll()
        }
        renderer.render(scene, camera)
        this._raf = requestAnimationFrame(this._tick)
      }
      this._tick()

      this.ragdollReady = true
      this.loading = false
    },

    // ── Rapier ──────────────────────────────────────────────────────
    async _initRapier () {
      this.loadingLabel = 'Loading physics'
      const RapierMod = await import('@dimforge/rapier3d-compat')
      const RAPIER = RapierMod.default || RapierMod
      await RAPIER.init()
      this._RAPIER = RAPIER

      this._world = new RAPIER.World({ x: 0, y: -8.5, z: 0 })

      const BOX = this.BOX
      // Sol
      const floor = this._world.createRigidBody(
        RAPIER.RigidBodyDesc.fixed().setTranslation(0, -0.1, 0)
      )
      this._world.createCollider(
        RAPIER.ColliderDesc.cuboid(BOX.w / 2, 0.1, BOX.d / 2).setFriction(0.9).setRestitution(0.05),
        floor
      )
      // Plafond invisible (évite que le perso s'envole)
      const ceiling = this._world.createRigidBody(
        RAPIER.RigidBodyDesc.fixed().setTranslation(0, BOX.h + 0.1, 0)
      )
      this._world.createCollider(
        RAPIER.ColliderDesc.cuboid(BOX.w / 2, 0.1, BOX.d / 2).setFriction(0.5).setRestitution(0.2),
        ceiling
      )
      // Mur du fond
      const back = this._world.createRigidBody(
        RAPIER.RigidBodyDesc.fixed().setTranslation(0, BOX.h / 2, -BOX.d / 2 - 0.1)
      )
      this._world.createCollider(
        RAPIER.ColliderDesc.cuboid(BOX.w / 2, BOX.h / 2, 0.1).setFriction(0.5).setRestitution(0.3),
        back
      )
      // Mur avant (invisible — derrière la caméra) pour pas que le perso s'échappe
      const front = this._world.createRigidBody(
        RAPIER.RigidBodyDesc.fixed().setTranslation(0, BOX.h / 2, BOX.d / 2 + 0.1)
      )
      this._world.createCollider(
        RAPIER.ColliderDesc.cuboid(BOX.w / 2, BOX.h / 2, 0.1).setFriction(0.5).setRestitution(0.3),
        front
      )
      // Mur gauche
      const left = this._world.createRigidBody(
        RAPIER.RigidBodyDesc.fixed().setTranslation(-BOX.w / 2 - 0.1, BOX.h / 2, 0)
      )
      this._world.createCollider(
        RAPIER.ColliderDesc.cuboid(0.1, BOX.h / 2, BOX.d / 2).setFriction(0.5).setRestitution(0.3),
        left
      )
      // Mur droit
      const right = this._world.createRigidBody(
        RAPIER.RigidBodyDesc.fixed().setTranslation(BOX.w / 2 + 0.1, BOX.h / 2, 0)
      )
      this._world.createCollider(
        RAPIER.ColliderDesc.cuboid(0.1, BOX.h / 2, BOX.d / 2).setFriction(0.5).setRestitution(0.3),
        right
      )
    },

    // ── Charge le GLB ───────────────────────────────────────────────
    async _loadCharacter () {
      this.loadingLabel = 'Loading character'
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
      return new Promise((resolve, reject) => {
        new GLTFLoader().load(
          this.characterUrl,
          (gltf) => resolve(gltf),
          (xhr) => {
            if (xhr.lengthComputable) this.progress = Math.round((xhr.loaded / xhr.total) * 100)
          },
          (err) => reject(err)
        )
      })
    },

    // ── Place perso à taille humaine au centre de la box ─────────────
    _placeCharacter (model) {
      const THREE = this._THREE

      let tris = 0
      let skinnedMesh = null
      model.traverse((obj) => {
        if (obj.isMesh || obj.isSkinnedMesh) {
          obj.castShadow = true
          obj.receiveShadow = true
          const geo = obj.geometry
          if (geo.index) tris += geo.index.count / 3
          else if (geo.attributes.position) tris += geo.attributes.position.count / 3
        }
        if (obj.isSkinnedMesh) skinnedMesh = obj
      })
      this.stats.tris = Math.round(tris / 1000)

      if (!skinnedMesh || !skinnedMesh.skeleton) {
        console.warn('[playground] No skinned mesh / skeleton found — ragdoll will be limited')
      } else {
        this._skinnedMesh = skinnedMesh
        this._skeleton = skinnedMesh.skeleton
        this.stats.bones = skinnedMesh.skeleton.bones.length
        // DEBUG : log tous les noms de bones pour qu'on les voie
        console.log('[playground] Skeleton bones (' + skinnedMesh.skeleton.bones.length + ') :')
        skinnedMesh.skeleton.bones.forEach((b, i) => {
          console.log(`  [${i}] ${b.name}`)
        })
      }

      // Scale à 1.7m
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const TARGET_HEIGHT = 1.7
      const scale = TARGET_HEIGHT / (size.y || 1)
      model.scale.setScalar(scale)

      // Recentre, pieds au sol
      const scaledBox = new THREE.Box3().setFromObject(model)
      const scaledCenter = scaledBox.getCenter(new THREE.Vector3())
      model.position.x -= scaledCenter.x
      model.position.z -= scaledCenter.z
      model.position.y -= scaledBox.min.y

      this._character = model
      this._scene.add(model)
      // Force la mise à jour des matrices monde pour avoir les positions bones correctes
      model.updateMatrixWorld(true)
    },

    // ── Multi-body ragdoll : 11 bodies + 10 joints sphériques ────────
    _buildRagdoll () {
      if (!this._skeleton) {
        // Pas de skeleton : on tombe sur un fallback simple (single capsule)
        console.warn('No skeleton — falling back to single-body mode')
        this._buildSingleBodyFallback()
        return
      }

      const THREE = this._THREE
      const RAPIER = this._RAPIER
      const sk = this._skeleton

      // Trouve les bones — patterns multiples, tolérants
      // L'ordre des patterns compte : plus spécifique d'abord
      const bones = {
        hips: findBone(sk, 'hips', 'pelvis', 'root_bone', 'root'),
        spine: findBone(sk, 'spine2', 'spine1', 'chest', 'upper_body', 'spine', 'torso'),
        head: findBone(sk, 'head'),

        // Bras : on cherche "upperarm" en premier (Meshy/Blender) puis variantes Mixamo
        lUpperArm: findBone(sk,
          { all: ['upperarm', 'l'] },
          { all: ['upper_arm', 'l'] },
          { all: ['arm', 'l'] },     // Mixamo "LeftArm"
          'leftarm', 'l_arm', 'arm_l', 'shoulder_l'
        ),
        lLowerArm: findBone(sk,
          { all: ['forearm', 'l'] },
          { all: ['lower_arm', 'l'] },
          { all: ['lowerarm', 'l'] },
          'leftforearm', 'l_forearm', 'forearm_l'
        ),
        rUpperArm: findBone(sk,
          { all: ['upperarm', 'r'] },
          { all: ['upper_arm', 'r'] },
          { all: ['arm', 'r'] },
          'rightarm', 'r_arm', 'arm_r', 'shoulder_r'
        ),
        rLowerArm: findBone(sk,
          { all: ['forearm', 'r'] },
          { all: ['lower_arm', 'r'] },
          { all: ['lowerarm', 'r'] },
          'rightforearm', 'r_forearm', 'forearm_r'
        ),

        // Jambes : "upleg" / "thigh" / "upperleg" d'abord pour ne pas
        // confondre avec "leg" qui matcherait les deux
        lUpperLeg: findBone(sk,
          { all: ['upleg', 'l'] },
          { all: ['upperleg', 'l'] },
          { all: ['upper_leg', 'l'] },
          { all: ['thigh', 'l'] },
          'leftupleg', 'l_thigh', 'thigh_l'
        ),
        lLowerLeg: findBone(sk,
          { all: ['lowerleg', 'l'] },
          { all: ['lower_leg', 'l'] },
          { all: ['shin', 'l'] },
          { all: ['calf', 'l'] },
          { all: ['leg', 'l'] },  // fallback large — testé en dernier
          'leftleg', 'l_calf', 'calf_l', 'shin_l'
        ),
        rUpperLeg: findBone(sk,
          { all: ['upleg', 'r'] },
          { all: ['upperleg', 'r'] },
          { all: ['upper_leg', 'r'] },
          { all: ['thigh', 'r'] },
          'rightupleg', 'r_thigh', 'thigh_r'
        ),
        rLowerLeg: findBone(sk,
          { all: ['lowerleg', 'r'] },
          { all: ['lower_leg', 'r'] },
          { all: ['shin', 'r'] },
          { all: ['calf', 'r'] },
          { all: ['leg', 'r'] },
          'rightleg', 'r_calf', 'calf_r', 'shin_r'
        )
      }

      // DEBUG : log de la résolution des bones (utile pour les rigs non-standard)
      console.log('[playground] Bones detected for ragdoll :')
      Object.entries(bones).forEach(([key, b]) => {
        console.log(`  ${key.padEnd(12)} : ${b ? b.name : '✗ NOT FOUND'}`)
      })

      // Évite qu'un bone soit utilisé pour 2 slots (peut arriver si naming non-standard)
      const seen = new Set()
      Object.entries(bones).forEach(([key, b]) => {
        if (b) {
          if (seen.has(b.uuid)) {
            console.warn(`[playground] Bone "${b.name}" matched for multiple slots — keeping first only`)
            bones[key] = null
          } else {
            seen.add(b.uuid)
          }
        }
      })

      // Si bones critiques manquants → fallback single-body
      if (!bones.hips || !bones.spine) {
        console.warn('[playground] Critical bones (hips/spine) missing — fallback to single-body. Detected bones :', bones)
        this.hint = 'Skeleton not recognized — single body mode (open console for bone names)'
        this._buildSingleBodyFallback()
        return
      }

      // Définition des segments : un body par segment (parent bone → child bone position)
      // `tip` peut être null (on prolongera avec fixedLength)
      const segments = [
        { name: 'pelvis',    bone: bones.hips,      tip: bones.spine || bones.head, radius: 0.10 },
        { name: 'torso',     bone: bones.spine,     tip: bones.head,                radius: 0.12, fixedLength: 0.30 },
        { name: 'head',      bone: bones.head,      tip: null,                      radius: 0.10, fixedLength: 0.18 },
        { name: 'lUpperArm', bone: bones.lUpperArm, tip: bones.lLowerArm,           radius: 0.05, fixedLength: 0.25 },
        { name: 'lLowerArm', bone: bones.lLowerArm, tip: null,                      radius: 0.045, fixedLength: 0.25 },
        { name: 'rUpperArm', bone: bones.rUpperArm, tip: bones.rLowerArm,           radius: 0.05, fixedLength: 0.25 },
        { name: 'rLowerArm', bone: bones.rLowerArm, tip: null,                      radius: 0.045, fixedLength: 0.25 },
        { name: 'lUpperLeg', bone: bones.lUpperLeg, tip: bones.lLowerLeg,           radius: 0.07, fixedLength: 0.40 },
        { name: 'lLowerLeg', bone: bones.lLowerLeg, tip: null,                      radius: 0.06, fixedLength: 0.40 },
        { name: 'rUpperLeg', bone: bones.rUpperLeg, tip: bones.rLowerLeg,           radius: 0.07, fixedLength: 0.40 },
        { name: 'rLowerLeg', bone: bones.rLowerLeg, tip: null,                      radius: 0.06, fixedLength: 0.40 }
      ]

      // Filtre les segments qui ont des bones invalides
      const valid = segments.filter(s => s.bone)
      this._ragdoll = { segments: [] }

      const tmpV = new THREE.Vector3()
      const tmpV2 = new THREE.Vector3()
      const tmpQ = new THREE.Quaternion()

      // Crée les rigid bodies
      for (const seg of valid) {
        const startPos = new THREE.Vector3()
        seg.bone.getWorldPosition(startPos)

        let endPos
        if (seg.tip) {
          endPos = new THREE.Vector3()
          seg.tip.getWorldPosition(endPos)
        } else {
          // Pas de tip : on prolonge dans la direction +Y locale du bone
          endPos = startPos.clone().add(new THREE.Vector3(0, seg.fixedLength || 0.2, 0))
        }

        const segVec = new THREE.Vector3().subVectors(endPos, startPos)
        const length = Math.max(0.05, segVec.length())
        const center = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5)

        // Capsule : halfHeight + radius, axe par défaut +Y
        const halfHeight = Math.max(0.02, (length - 2 * seg.radius) / 2)

        // Orientation : aligner +Y vers segVec
        const up = new THREE.Vector3(0, 1, 0)
        const quat = new THREE.Quaternion().setFromUnitVectors(up, segVec.clone().normalize())

        // Crée le body
        const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(center.x, center.y, center.z)
          .setRotation({ x: quat.x, y: quat.y, z: quat.z, w: quat.w })
          .setLinearDamping(0.3)
          .setAngularDamping(0.6)
          .setCcdEnabled(true)
        const body = this._world.createRigidBody(bodyDesc)

        const collDesc = RAPIER.ColliderDesc.capsule(halfHeight, seg.radius)
          .setFriction(0.8)
          .setRestitution(0.05)
          .setDensity(1.0)
        this._world.createCollider(collDesc, body)

        // Mémorise pour le sync
        this._ragdoll.segments.push({
          name: seg.name,
          bone: seg.bone,
          tip: seg.tip,
          body,
          halfHeight,
          radius: seg.radius,
          length,
          // initial state pour le reset
          initialPos: center.clone(),
          initialQuat: quat.clone(),
          // bone offset : on stocke la position de départ du bone relative au center du body
          // (pour pouvoir reconstruire la position du bone à partir du body)
          boneStartOffset: new THREE.Vector3().subVectors(startPos, center)
        })
      }

      // Index par nom pour faciliter les joints
      this._segByName = Object.fromEntries(this._ragdoll.segments.map(s => [s.name, s]))

      // Définition des joints (parent → child)
      const jointDefs = [
        ['pelvis',    'torso',     true],   // joint à la base de la torse (= top du pelvis)
        ['torso',     'head',      true],
        ['torso',     'lUpperArm', true],
        ['lUpperArm', 'lLowerArm', true],
        ['torso',     'rUpperArm', true],
        ['rUpperArm', 'rLowerArm', true],
        ['pelvis',    'lUpperLeg', true],
        ['lUpperLeg', 'lLowerLeg', true],
        ['pelvis',    'rUpperLeg', true],
        ['rUpperLeg', 'rLowerLeg', true]
      ]

      for (const [parentName, childName] of jointDefs) {
        const parent = this._segByName[parentName]
        const child = this._segByName[childName]
        if (!parent || !child) continue

        // Anchors : pour le parent, l'anchor est à l'extrémité "haute" (vers le child) en local
        // = (0, halfHeight + radius, 0) puisque +Y est l'axe du capsule.
        // Pour le child, à l'extrémité "basse" = (0, -halfHeight - radius, 0).
        const parentAnchor = { x: 0, y: parent.halfHeight + parent.radius * 0.5, z: 0 }
        const childAnchor  = { x: 0, y: -child.halfHeight - child.radius * 0.5, z: 0 }

        const jointData = RAPIER.JointData.spherical(parentAnchor, childAnchor)
        this._world.createImpulseJoint(jointData, parent.body, child.body, true)
      }
    },

    // ── Fallback : single body si pas de skeleton ───────────────────
    _buildSingleBodyFallback () {
      const RAPIER = this._RAPIER
      const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(0, 0.85, 0)
        .setLinearDamping(0.5)
        .setAngularDamping(0.8)
        .setCcdEnabled(true)
      const body = this._world.createRigidBody(bodyDesc)
      const collDesc = RAPIER.ColliderDesc.capsule(0.5, 0.35).setFriction(0.8)
      this._world.createCollider(collDesc, body)
      this._ragdoll = {
        segments: [{
          name: 'all', bone: null, body,
          halfHeight: 0.5, radius: 0.35, length: 1.7,
          initialPos: new this._THREE.Vector3(0, 0.85, 0),
          initialQuat: new this._THREE.Quaternion()
        }]
      }
      this._segByName = { all: this._ragdoll.segments[0] }
    },

    // ── Sync bones ← rigid bodies ───────────────────────────────────
    // Doit traiter dans l'ordre hiérarchique (root → feuilles).
    // L'ordre dans segments[] est déjà OK (pelvis, torso, head, bras, jambes)
    _syncRagdoll () {
      if (!this._ragdoll || !this._skeleton) {
        // Fallback : on déplace le model entier
        if (this._ragdoll && this._ragdoll.segments.length === 1 && this._character) {
          const seg = this._ragdoll.segments[0]
          const t = seg.body.translation()
          const r = seg.body.rotation()
          this._character.position.set(t.x, t.y - seg.halfHeight - seg.radius, t.z)
          this._character.quaternion.set(r.x, r.y, r.z, r.w)
        }
        return
      }

      const THREE = this._THREE
      const tmpMatrix = new THREE.Matrix4()
      const tmpParentInverse = new THREE.Matrix4()
      const tmpV = new THREE.Vector3()
      const tmpQ = new THREE.Quaternion()
      const tmpS = new THREE.Vector3(1, 1, 1)

      for (const seg of this._ragdoll.segments) {
        if (!seg.bone) continue
        const t = seg.body.translation()
        const r = seg.body.rotation()

        // Position du bone en world = center du body + offset initial transformé par
        // la rotation actuelle du body.
        // En gros : start position of segment (= bone position) = body.center + bodyRot * boneStartOffset
        const offset = seg.boneStartOffset.clone()
        const bodyQuat = new THREE.Quaternion(r.x, r.y, r.z, r.w)
        offset.applyQuaternion(bodyQuat)
        const bonePos = new THREE.Vector3(t.x + offset.x, t.y + offset.y, t.z + offset.z)

        // Build world matrix avec rotation = body rotation
        tmpMatrix.compose(bonePos, bodyQuat, tmpS)

        // Convertit en local relative au parent du bone
        const parent = seg.bone.parent
        if (parent) {
          parent.updateMatrixWorld()
          tmpParentInverse.copy(parent.matrixWorld).invert()
          tmpMatrix.premultiply(tmpParentInverse)
        }
        tmpMatrix.decompose(seg.bone.position, seg.bone.quaternion, tmpV)
        seg.bone.updateMatrixWorld(true)
      }
    },

    // ── Mouse picking ───────────────────────────────────────────────
    onMouseDown (event) {
      if (!this.ragdollReady) return
      const THREE = this._THREE
      this._updateMouseNDC(event)
      this._raycaster.setFromCamera(this._mouse, this._camera)

      // Raycast sur le mesh
      const hits = this._raycaster.intersectObject(this._character, true)
      if (!hits.length) return

      const hitPoint = hits[0].point

      // Trouve le body le plus proche du point d'impact
      let closest = null
      let minDist = Infinity
      for (const seg of this._ragdoll.segments) {
        const bp = seg.body.translation()
        const dist = hitPoint.distanceToSquared(new THREE.Vector3(bp.x, bp.y, bp.z))
        if (dist < minDist) {
          minDist = dist
          closest = seg
        }
      }
      if (!closest) return

      this._grabbed = closest
      this._isDragging = true
      closest.body.setBodyType(this._RAPIER.RigidBodyType.KinematicPositionBased, true)

      // Plan de drag = perpendiculaire caméra, passant par le body
      const camDir = new THREE.Vector3()
      this._camera.getWorldDirection(camDir)
      const bp = closest.body.translation()
      if (!this._dragPlane) this._dragPlane = new THREE.Plane()
      this._dragPlane.setFromNormalAndCoplanarPoint(
        camDir.negate(),
        new THREE.Vector3(bp.x, bp.y, bp.z)
      )

      this._dragHistory = []
      this.hint = `Holding · release to drop`
      this.$refs.canvas.style.cursor = 'grabbing'
      this._updateMouseWorldPos()
    },

    onMouseMove (event) {
      if (!this.ragdollReady) return
      this._updateMouseNDC(event)
      if (this._isDragging) {
        this._updateMouseWorldPos()
        this._dragHistory.push({ time: performance.now(), pos: { ...this._mouseWorldPos } })
        if (this._dragHistory.length > 5) this._dragHistory.shift()
      } else if (this._character) {
        this._raycaster.setFromCamera(this._mouse, this._camera)
        const hits = this._raycaster.intersectObject(this._character, true)
        this.$refs.canvas.style.cursor = hits.length ? 'grab' : 'default'
      }
    },

    onMouseUp () {
      if (!this._isDragging || !this._grabbed) return
      const seg = this._grabbed
      this._isDragging = false
      this.$refs.canvas.style.cursor = 'default'
      this.hint = 'Click & drag the character'

      let v = { x: 0, y: 0, z: 0 }
      if (this._dragHistory.length >= 2) {
        const recent = this._dragHistory[this._dragHistory.length - 1]
        const old = this._dragHistory[0]
        const dt = (recent.time - old.time) / 1000
        if (dt > 0) {
          v = {
            x: (recent.pos.x - old.pos.x) / dt * 0.7,
            y: (recent.pos.y - old.pos.y) / dt * 0.7,
            z: (recent.pos.z - old.pos.z) / dt * 0.7
          }
        }
      }
      seg.body.setBodyType(this._RAPIER.RigidBodyType.Dynamic, true)
      seg.body.setLinvel(v, true)
      seg.body.setAngvel({
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 4
      }, true)
      this._grabbed = null
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
        const m = (this._grabbed && this._grabbed.radius) || 0.1
        point.x = Math.max(-this.BOX.w / 2 + m, Math.min(this.BOX.w / 2 - m, point.x))
        point.y = Math.max(m, Math.min(this.BOX.h - m, point.y))
        point.z = Math.max(-this.BOX.d / 2 + m, Math.min(this.BOX.d / 2 - m, point.z))
        this._mouseWorldPos = { x: point.x, y: point.y, z: point.z }
      }
    },

    // ── Reset ───────────────────────────────────────────────────────
    resetCharacter () {
      if (!this._ragdoll) return
      for (const seg of this._ragdoll.segments) {
        seg.body.setBodyType(this._RAPIER.RigidBodyType.Dynamic, true)
        seg.body.setTranslation(
          { x: seg.initialPos.x, y: seg.initialPos.y, z: seg.initialPos.z },
          true
        )
        seg.body.setRotation(
          { x: seg.initialQuat.x, y: seg.initialQuat.y, z: seg.initialQuat.z, w: seg.initialQuat.w },
          true
        )
        seg.body.setLinvel({ x: 0, y: 0, z: 0 }, true)
        seg.body.setAngvel({ x: 0, y: 0, z: 0 }, true)
      }
    },

    // ── Décors visuels (box blanche) ────────────────────────────────
    _buildBox () {
      const THREE = this._THREE
      const scene = this._scene
      const BOX = this.BOX

      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(BOX.w, BOX.d),
        new THREE.MeshStandardMaterial({ color: 0xeeeeec, roughness: 0.9, metalness: 0 })
      )
      floor.rotation.x = -Math.PI / 2
      floor.receiveShadow = true
      scene.add(floor)

      const wallMat = new THREE.MeshStandardMaterial({
        color: 0xf5f5f3, roughness: 0.95, metalness: 0, side: THREE.DoubleSide
      })
      const makeWall = (w, h, pos, rot) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat)
        m.position.set(...pos)
        m.rotation.set(...rot)
        m.receiveShadow = true
        scene.add(m)
      }
      // Back, left, right (pas de plafond visible, pas de mur avant)
      makeWall(BOX.w, BOX.h, [0, BOX.h / 2, -BOX.d / 2], [0, 0, 0])
      makeWall(BOX.d, BOX.h, [-BOX.w / 2, BOX.h / 2, 0], [0, Math.PI / 2, 0])
      makeWall(BOX.d, BOX.h, [BOX.w / 2, BOX.h / 2, 0], [0, -Math.PI / 2, 0])
    },

    _buildLights () {
      const THREE = this._THREE
      const scene = this._scene

      const hemi = new THREE.HemisphereLight(0xffffff, 0xe8e8e6, 0.55)
      scene.add(hemi)

      const key = new THREE.DirectionalLight(0xfff6e8, 1.1)
      key.position.set(2, 4, 2.5)
      key.castShadow = true
      key.shadow.mapSize.set(2048, 2048)
      key.shadow.camera.near = 0.3
      key.shadow.camera.far = 12
      key.shadow.camera.left = -3
      key.shadow.camera.right = 3
      key.shadow.camera.top = 3.5
      key.shadow.camera.bottom = -0.5
      key.shadow.bias = -0.0005
      key.shadow.normalBias = 0.02
      key.shadow.radius = 4
      scene.add(key)

      const fill = new THREE.DirectionalLight(0xf0f4ff, 0.25)
      fill.position.set(-2.5, 2, 1.5)
      scene.add(fill)
    },

    _destroyThree () {
      cancelAnimationFrame(this._raf)
      window.removeEventListener('resize', this._onResize)
      if (this._scene) {
        this._scene.traverse((obj) => {
          if (obj.isMesh || obj.isSkinnedMesh || obj.isPoints) {
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
      this._skeleton = null
      this._world = null
      this._ragdoll = null
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
