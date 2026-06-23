<template>
  <section class="AboutPage" :class="{ 'is-night': nightMode }" ref="root">

    <!-- Fond animé via ScrollTrigger (couleur change au scroll) -->
    <div class="AboutPage_bg" ref="bg" />

    <!-- ── HERO : catchphrase ───────────────────────────────────────────── -->
    <section class="AboutPage_hero" ref="hero">
      <div class="AboutPage_hero_eyebrow" ref="eyebrow">
        <template v-for="(part, i) in content.hero.eyebrow">
          <span :key="`eb-${i}`">{{ part }}</span>
          <span v-if="i < content.hero.eyebrow.length - 1" :key="`dot-${i}`" class="dot">●</span>
        </template>
      </div>

      <div class="AboutPage_hero_main">
        <h1 class="AboutPage_hero_title" ref="heroTitle">
          <span
            v-for="(line, i) in content.hero.lines"
            :key="i"
            class="line"
            :class="`line--${line.variant}`"
          >{{ line.text }}</span>
        </h1>

        <!-- Duo fondateurs façon PS1 (scans Meshy rigués Mixamo, hébergés R2),
             posés au sol côte à côte avec ombres de contact. -->
        <div class="AboutPage_hero_char">
          <Ps1Character :characters="content.hero.characters" v-bind="content.hero.characterPreset" :disco="nightMode" />
        </div>
      </div>

      <div class="AboutPage_hero_scroll" ref="scrollHint">
        <span>{{ content.hero.scrollLabel }}</span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <polyline points="5,12 12,19 19,12"/>
        </svg>
      </div>

      <!-- Bouton discret : bascule le hero en mode "boîte de nuit" -->
      <button class="AboutPage_night" type="button" :aria-pressed="nightMode" @click="nightMode = !nightMode">
        <span class="dot" />
        {{ nightMode ? 'Lights on' : 'Night mode' }}
      </button>
    </section>

    <!-- ── INTRO : "We are creative" + sub ─────────────────────────────── -->
    <section class="AboutPage_intro" ref="intro">
      <div class="AboutPage_intro_meta" ref="introKicker">
        <span class="kicker">{{ content.intro.kicker }}</span>
        <span class="meta">{{ content.intro.meta }}</span>
      </div>

      <h2 class="AboutPage_intro_text" ref="introText">
        <span
          v-for="(line, li) in content.intro.lines"
          :key="li"
          class="line"
          :class="{ 'line--small': li > 0, 'line--lead': li === 0 }"
        >
          <span
            v-for="(w, wi) in line"
            :key="wi"
            class="word"
            :class="w.variant ? `word--${w.variant}` : ''"
          >{{ w.text }}</span>
        </span>
      </h2>

      <div class="AboutPage_intro_divider" ref="introDivider"></div>

      <p class="AboutPage_intro_sub" ref="introSub" v-html="content.intro.sub"></p>
    </section>

    <!-- ── EXPERTISE : disciplines développées (montage/VFX/3D/IA) ─────── -->
    <section class="AboutPage_expertise" ref="expertise">
      <div class="AboutPage_expertise_head" ref="expertiseHead">
        <p class="AboutPage_expertise_kicker">{{ content.expertise.kicker }}</p>
        <p class="AboutPage_expertise_intro" v-html="content.expertise.intro"></p>
      </div>

      <ul class="AboutPage_expertise_list" ref="expertiseList">
        <li
          v-for="item in content.expertise.list"
          :key="item.index"
          class="AboutPage_expertise_item"
        >
          <span class="idx">{{ item.index }}</span>
          <h3 class="title">{{ item.title }}</h3>
          <p class="body">{{ item.body }}</p>
          <span class="arrow" aria-hidden="true">↗</span>
        </li>
      </ul>
    </section>

    <!-- ── MANIFESTO : sweep horizontal au scroll ──────────────────────── -->
    <section class="AboutPage_manifesto" ref="manifesto">
      <div
        v-for="(line, i) in content.manifesto"
        :key="i"
        class="AboutPage_manifesto_line"
        :class="{ 'AboutPage_manifesto_line--right': i % 2 === 1 }"
        :ref="`manifestoLine${i}`"
      >
        <span class="text">
          <span v-for="n in 4" :key="n" class="text_unit">{{ line }}<span class="dot">●</span></span>
        </span>
      </div>
    </section>

    <!-- ── DISTINCTIONS : grille de cartes (trophy case) ───────────────── -->
    <section class="AboutPage_awards" ref="awards">
      <div class="AboutPage_awards_head" ref="awardsHead">
        <p class="AboutPage_awards_kicker">{{ content.awards.kicker }}</p>
        <h2 class="AboutPage_awards_title">
          <span
            v-for="(line, i) in content.awards.titleLines"
            :key="i"
            class="line"
            :class="{ italic: line.italic }"
          >{{ line.text }}</span>
        </h2>
        <span class="AboutPage_awards_total">{{ content.awards.totalLabel }}</span>
      </div>

      <ul class="AboutPage_awards_grid" ref="awardsList">
        <li
          v-for="(award, i) in awardsList"
          :key="i"
          class="AboutPage_awards_card"
        >
          <span class="year">{{ award.year }}</span>
          <span class="mid">
            <span class="name">{{ award.name }}</span>
            <span v-if="award.project" class="project">{{ award.project }}</span>
            <span v-if="award.director" class="director">dir. {{ award.director }}</span>
          </span>
          <span class="tag"><span class="dot"></span>{{ award.tag }}</span>
        </li>
      </ul>
    </section>

    <!-- ── VISIT US : accroche puis scan studio (fond noir) ────────────── -->
    <section class="AboutPage_visit" ref="visit">

      <!-- Accroche au-dessus du scan -->
      <h2 class="AboutPage_visit_title">
        <span
          v-for="(line, i) in content.visit.titleLines"
          :key="i"
          :class="{ italic: line.italic }"
        >{{ line.text }}</span>
      </h2>

      <!--
        Scan studio en Gaussian Splatting (PlayCanvas, autonome).
        Cliquer pour explorer en vol libre, Échap pour ressortir.
        Le wrapper garde ref="visitCanvas" pour les animations d'entrée.
      -->
      <div class="AboutPage_visit_canvas" ref="visitCanvas">
        <StudioSplat
          :desktop-url="content.visit.splatUrl"
          :mobile-url="content.visit.splatMobileUrl"
          @enter="onSplatEnter"
          @exit="onSplatExit"
        />
      </div>

      <!-- Adresse + CTA -->
      <a class="AboutPage_visit_address" :href="content.visit.mapsUrl" target="_blank" rel="noopener">
        <span class="label">Come say hi</span>
        <span class="value">{{ content.visit.address }}</span>
        <span class="map">
          Open in maps
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="7" y1="17" x2="17" y2="7"/>
            <polyline points="7,7 17,7 17,17"/>
          </svg>
        </span>
      </a>

      <NuxtLink class="AboutPage_visit_cta" :to="content.visit.ctaTo">
        {{ content.visit.ctaLabel }}
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </NuxtLink>
    </section>

    <SimpleFooter />
  </section>
</template>

<script>
import { gsap } from '@/vendor/gsap'
import { ScrollTrigger } from '@/vendor/gsap/ScrollTrigger'
import { SplitText } from '@/vendor/gsap/SplitText'
import SimpleFooter from '@/components/SimpleFooter'
import StudioSplat from '@/components/StudioSplat'
import Ps1Character from '@/components/Ps1Character'
import aboutContent from '@/content/about'
import smoothScroll from '@/mixins/smoothScroll'

gsap.registerPlugin(ScrollTrigger)
gsap.registerPlugin(SplitText)

export default {
  name: 'About',

  components: { SimpleFooter, StudioSplat, Ps1Character },
  mixins: [smoothScroll],

  head () {
    const title = this.content.meta.title
    const desc = this.content.meta.description
    return {
      title,
      meta: [
        { hid: 'description', name: 'description', content: desc },
        { hid: 'og:title', property: 'og:title', content: title },
        { hid: 'og:description', property: 'og:description', content: desc },
        { hid: 'og:url', property: 'og:url', content: 'https://mechant.tv/about' },
        { hid: 'twitter:title', name: 'twitter:title', content: title },
        { hid: 'twitter:description', name: 'twitter:description', content: desc }
      ],
      link: [{ hid: 'canonical', rel: 'canonical', href: 'https://mechant.tv/about' }]
    }
  },

  data () {
    return {
      content: aboutContent,
      // Récompenses : défaut = statique, écrasé par Supabase si dispo
      awardsList: aboutContent.awards.list,
      // Mode "boîte de nuit" sur le hero (fond noir, texte orange, persos disco)
      nightMode: false
    }
  },

  async mounted () {
    this._splits = []
    this._triggers = []

    // Awards en arrière-plan : ne pas bloquer les animations derrière la
    // requête réseau (sinon le hero peut "flasher" si elle est lente).
    // On rafraîchit ScrollTrigger une fois les cartes rendues.
    this._fetchAwards().then(() => {
      this.$nextTick(() => ScrollTrigger.refresh())
    })

    // Attendre le chargement des polices AVANT d'initialiser les animations :
    // SplitText mesure les coupures de ligne, et si la police n'est pas encore
    // prête le texte se recalcule à son arrivée -> lignes qui sautent / se
    // chevauchent (le bug d'animation intermittent observé au chargement).
    try {
      if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
        await document.fonts.ready
      }
    } catch (_) { /* garde-fou : on initialise quand même */ }

    this.$nextTick(() => {
      this._initAnimations()
    })
  },

  beforeDestroy () {
    ;(this._splits || []).forEach(s => s.revert && s.revert())
    ;(this._triggers || []).forEach(t => t.kill && t.kill())
    this._splits = []
    this._triggers = []
    // Lenis cleanup est géré par le mixin smoothScroll
    // (le scan studio est désormais le composant StudioSplat, auto-nettoyé)
  },

  methods: {
    // Récupère les récompenses depuis Supabase (éditables via /admin/awards).
    // Fallback silencieux sur la liste statique si table vide / erreur.
    async _fetchAwards () {
      try {
        const { supabase } = await import('@/utils/supabase')
        const { data, error } = await supabase
          .from('awards')
          .select('year, name, project, director, tag')
          .eq('published', true)
          .order('order_index', { ascending: false })
        if (!error && data && data.length) {
          this.awardsList = data
        }
      } catch (_) {
        // garde le fallback statique
      }
    },

    // ── Scan splat : gèle le scroll lerpé pendant l'exploration en vol libre
    //    (sinon la molette/le drag scrollent la page au lieu de piloter).
    onSplatEnter () {
      if (this._lenis) this._lenis.stop()
    },
    onSplatExit () {
      if (this._lenis) this._lenis.start()
    },

    // ── Scan studio 3D : chargé en avance (dès le montage) pour qu'il soit
    //    déjà prêt quand l'utilisateur arrive en bas de page.
    _initStudioScan () {
      if (typeof window === 'undefined') return
      this._loadStudioScan()
    },

    async _loadStudioScan () {
      const canvas = this.$refs.visitCanvas
      if (!canvas) return

      const THREE = await import('three')
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
      this._scanTHREE = THREE

      const width = canvas.clientWidth
      const height = canvas.clientHeight

      const scene = new THREE.Scene()
      scene.background = null // transparent → s'intègre au fond noir de la section
      this._scanScene = scene

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000)
      camera.position.set(3, 2, 4)
      this._scanCamera = camera

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.outputEncoding = THREE.sRGBEncoding
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.0
      canvas.appendChild(renderer.domElement)
      this._scanRenderer = renderer

      // Lumières douces
      scene.add(new THREE.HemisphereLight(0xffffff, 0x404040, 0.9))
      const key = new THREE.DirectionalLight(0xffffff, 1.1)
      key.position.set(5, 8, 4)
      scene.add(key)

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.08
      controls.enablePan = false
      controls.enableZoom = false    // rotation seule, pas de zoom
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.6
      this._scanControls = controls

      const loader = new GLTFLoader()
      loader.load(this.content.visit.scanUrl, (gltf) => {
        const model = gltf.scene
        scene.add(model)
        // Auto-frame : centre + cadre la caméra sur la bounding box.
        // Facteur 0.43 (= 1.3 / 3) → le modèle apparaît ~3× plus gros.
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())
        model.position.sub(center)
        const maxDim = Math.max(size.x, size.y, size.z)
        const dist = (maxDim / 2) / Math.tan((camera.fov * Math.PI / 180) / 2) * 0.43
        camera.position.set(dist, dist * 0.6, dist)
        camera.near = Math.max(0.001, dist / 100)
        camera.far = dist * 100
        camera.updateProjectionMatrix()
        controls.target.set(0, 0, 0)
        controls.update()
        // Cache le placeholder
        const ph = canvas.querySelector('.AboutPage_visit_placeholder')
        if (ph) ph.style.display = 'none'
      }, undefined, (err) => {
        console.warn('[about] studio scan load error', err)
      })

      // Resize
      this._scanResize = () => {
        const w = canvas.clientWidth
        const h = canvas.clientHeight
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }
      window.addEventListener('resize', this._scanResize)

      // Loop
      this._scanTick = () => {
        controls.update()
        renderer.render(scene, camera)
        this._scanRaf = requestAnimationFrame(this._scanTick)
      }
      this._scanTick()
    },

    _destroyStudioScan () {
      if (this._scanIO) { this._scanIO.disconnect(); this._scanIO = null }
      if (this._scanRaf) cancelAnimationFrame(this._scanRaf)
      if (this._scanResize) window.removeEventListener('resize', this._scanResize)
      if (this._scanControls) this._scanControls.dispose()
      if (this._scanScene && this._scanTHREE) {
        this._scanScene.traverse((obj) => {
          if (obj.isMesh) {
            if (obj.geometry) obj.geometry.dispose()
            if (obj.material) {
              const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
              mats.forEach((m) => {
                Object.keys(m).forEach((k) => { if (m[k] && m[k].isTexture) m[k].dispose() })
                m.dispose()
              })
            }
          }
        })
      }
      if (this._scanRenderer) {
        this._scanRenderer.dispose()
        this._scanRenderer.forceContextLoss && this._scanRenderer.forceContextLoss()
        if (this._scanRenderer.domElement && this._scanRenderer.domElement.parentNode) {
          this._scanRenderer.domElement.parentNode.removeChild(this._scanRenderer.domElement)
        }
      }
      this._scanScene = null
      this._scanRenderer = null
      this._scanCamera = null
      this._scanControls = null
      this._scanTHREE = null
    },

    _initAnimations () {
      this._animateHero()
      this._animateBgColors()
      this._animateIntro()
      this._animateExpertise()
      this._animateManifesto()
      this._animateAwards()
      this._animateVisit()
    },

    _track (st) {
      if (st && st.scrollTrigger) this._triggers.push(st.scrollTrigger)
      else if (st) this._triggers.push(st)
      return st
    },

    // ── Hero : reveal au load + parallaxe à la sortie ──────────────────
    _animateHero () {
      const lines = this.$refs.heroTitle.querySelectorAll('.line')
      gsap.set(lines, { yPercent: 110, opacity: 0 })
      gsap.set([this.$refs.eyebrow, this.$refs.scrollHint], { opacity: 0, y: 20 })

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.to(this.$refs.eyebrow, { opacity: 1, y: 0, duration: 0.6 }, 0.1)
      tl.to(lines, {
        yPercent: 0,
        opacity: 1,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power4.out'
      }, 0.2)
      tl.to(this.$refs.scrollHint, { opacity: 1, y: 0, duration: 0.5 }, 0.9)

      // Parallax sortie hero
      this._track(gsap.to(this.$refs.heroTitle, {
        yPercent: -25,
        ease: 'none',
        scrollTrigger: {
          trigger: this.$refs.hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8
        }
      }))
    },

    // ── Background : transition douce à l'entrée de chaque section ────
    // Chaque section déclenche un fade vers sa couleur (durée 0.8s).
    // Pas de scrub : pas de saut, pas de chevauchement, pas de trou.
    _animateBgColors () {
      const bg = this.$refs.bg
      const c = this.content.bgColors
      gsap.set(bg, { backgroundColor: c.hero })

      // Liste ordonnée des transitions : section déclencheur + couleur cible
      // + couleur de retour si on remonte au-dessus
      const stops = [
        { trigger: this.$refs.intro,     enter: c.intro,     back: c.hero      },
        { trigger: this.$refs.expertise, enter: c.expertise, back: c.intro     },
        { trigger: this.$refs.manifesto, enter: c.manifesto, back: c.expertise },
        { trigger: this.$refs.awards,    enter: c.awards,    back: c.manifesto },
        { trigger: this.$refs.visit,     enter: c.visit,     back: c.awards    }
      ]

      stops.forEach(({ trigger, enter, back }) => {
        if (!trigger || !enter) return
        const st = ScrollTrigger.create({
          trigger,
          start: 'top 60%',           // déclenche quand la section atteint 60% du viewport
          onEnter: () => gsap.to(bg, {
            backgroundColor: enter,
            duration: 0.9,
            ease: 'power2.inOut',
            overwrite: true
          }),
          onLeaveBack: () => gsap.to(bg, {
            backgroundColor: back,
            duration: 0.9,
            ease: 'power2.inOut',
            overwrite: true
          })
        })
        this._triggers.push(st)
      })
    },

    // ── Intro : kicker + mots + divider + sub ──────────────────────────
    _animateIntro () {
      const introWords = this.$refs.introText.querySelectorAll('.word')
      const subSplit = new SplitText(this.$refs.introSub, { type: 'words,lines' })
      this._splits.push(subSplit)

      gsap.set(introWords, { yPercent: 110, opacity: 0, rotate: 4 })
      gsap.set(subSplit.words, { yPercent: 110, opacity: 0 })
      gsap.set(this.$refs.introKicker, { opacity: 0, x: -20 })
      gsap.set(this.$refs.introDivider, { scaleX: 0, transformOrigin: 'left' })

      this._track(gsap.to(this.$refs.introKicker, {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: this.$refs.intro, start: 'top 75%' }
      }))

      this._track(gsap.to(introWords, {
        yPercent: 0,
        opacity: 1,
        rotate: 0,
        stagger: 0.05,
        duration: 0.9,
        ease: 'power4.out',
        scrollTrigger: { trigger: this.$refs.introText, start: 'top 80%' }
      }))

      this._track(gsap.to(this.$refs.introDivider, {
        scaleX: 1,
        duration: 0.9,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: this.$refs.introDivider, start: 'top 90%' }
      }))

      this._track(gsap.to(subSplit.words, {
        yPercent: 0,
        opacity: 1,
        stagger: 0.015,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: { trigger: this.$refs.introSub, start: 'top 85%' }
      }))
    },

    // ── Expertise : intro + items qui se révèlent en cascade ───────────
    _animateExpertise () {
      const head = this.$refs.expertiseHead
      const kicker = head.querySelector('.AboutPage_expertise_kicker')
      const introEl = head.querySelector('.AboutPage_expertise_intro')
      const items = this.$refs.expertiseList.querySelectorAll('.AboutPage_expertise_item')

      const introSplit = new SplitText(introEl, { type: 'words,lines' })
      this._splits.push(introSplit)

      gsap.set(kicker, { opacity: 0, x: -20 })
      gsap.set(introSplit.words, { yPercent: 110, opacity: 0 })
      gsap.set(items, { opacity: 0, y: 50 })

      this._track(gsap.to(kicker, {
        opacity: 1, x: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: this.$refs.expertise, start: 'top 75%' }
      }))

      this._track(gsap.to(introSplit.words, {
        yPercent: 0, opacity: 1, stagger: 0.02, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: introEl, start: 'top 80%' }
      }))

      // Chaque discipline se révèle une par une au scroll
      items.forEach((item) => {
        this._track(gsap.to(item, {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: item, start: 'top 85%' }
        }))
      })
    },

    // ── Manifesto : sweep horizontal — chaque ligne traverse l'écran ───
    _animateManifesto () {
      const lines = this.content.manifesto.map((_, i) => this.$refs[`manifestoLine${i}`])
        .map(ref => Array.isArray(ref) ? ref[0] : ref)
        .filter(Boolean)

      lines.forEach((line, i) => {
        const text = line.querySelector('.text')
        if (!text) return

        // Direction alternée : ligne 0 = vers la gauche, ligne 1 = vers la droite, etc.
        const goesLeft = i % 2 === 0
        const fromX = goesLeft ? '15%' : '-65%'
        const toX   = goesLeft ? '-65%' : '15%'

        gsap.set(text, { x: fromX })

        this._track(gsap.to(text, {
          x: toX,
          ease: 'none',
          scrollTrigger: {
            trigger: this.$refs.manifesto,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2
          }
        }))
      })
    },

    // ── Distinctions : titre showcase + cartes qui se révèlent ─────────
    _animateAwards () {
      const head = this.$refs.awardsHead
      const titleLines = head.querySelectorAll('.AboutPage_awards_title .line')
      const kicker = head.querySelector('.AboutPage_awards_kicker')
      const total = head.querySelector('.AboutPage_awards_total')
      const cards = this.$refs.awardsList.querySelectorAll('.AboutPage_awards_card')

      gsap.set(titleLines, { yPercent: 110, opacity: 0 })
      gsap.set([kicker, total], { opacity: 0, y: 20 })
      gsap.set(cards, { y: 40, opacity: 0, scale: 0.96 })

      this._track(gsap.to(kicker, {
        opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: this.$refs.awards, start: 'top 80%' }
      }))

      this._track(gsap.to(titleLines, {
        yPercent: 0, opacity: 1, stagger: 0.12, duration: 0.9, ease: 'power4.out',
        scrollTrigger: { trigger: head, start: 'top 82%' }
      }))

      this._track(gsap.to(total, {
        opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: head, start: 'top 80%' }
      }))

      this._track(gsap.to(cards, {
        y: 0, opacity: 1, scale: 1, stagger: 0.1, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: this.$refs.awardsList, start: 'top 82%' }
      }))
    },

    // ── Visit : reveal du titre + placeholder du scan 3D ───────────────
    _animateVisit () {
      const titleSpans = this.$refs.visit.querySelectorAll('.AboutPage_visit_title span')
      gsap.set(titleSpans, { yPercent: 100, opacity: 0 })
      gsap.set(this.$refs.visitCanvas, { scale: 0.85, opacity: 0 })
      gsap.set(this.$refs.visit.querySelector('.AboutPage_visit_address'), { opacity: 0, y: 20 })

      // Le titre est sous le scan → on déclenche sur le titre lui-même
      const titleEl = this.$refs.visit.querySelector('.AboutPage_visit_title')
      this._track(gsap.to(titleSpans, {
        yPercent: 0,
        opacity: 1,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power4.out',
        scrollTrigger: { trigger: titleEl, start: 'top 85%' }
      }))

      this._track(gsap.to(this.$refs.visitCanvas, {
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: this.$refs.visitCanvas, start: 'top 80%' }
      }))

      const addressEl = this.$refs.visit.querySelector('.AboutPage_visit_address')
      const ctaEl = this.$refs.visit.querySelector('.AboutPage_visit_cta')
      gsap.set([addressEl, ctaEl], { opacity: 0, y: 20 })

      this._track(gsap.to([addressEl, ctaEl], {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: { trigger: addressEl, start: 'top 90%' }
      }))
    }
  }
}
</script>

<style lang="sass" scoped>
.AboutPage
  position: relative
  width: 100%
  color: $white
  overflow-x: hidden

  &_bg
    position: fixed
    inset: 0
    background: #ff8600
    z-index: 0
    pointer-events: none

  > section
    position: relative
    z-index: 1

  // ── Bouton discret "mode nuit" ───────────────────────────────────────
  &_night
    position: absolute
    left: 5vw
    bottom: 2.2rem
    z-index: 5
    display: inline-flex
    align-items: center
    gap: 0.55rem
    appearance: none
    border: 1px solid rgba(0, 0, 0, 0.25)
    background: transparent
    color: rgba(0, 0, 0, 0.6)
    border-radius: 999px
    padding: 0.45rem 0.9rem
    font-family: $apfel
    font-size: 0.68rem
    letter-spacing: 0.14em
    text-transform: uppercase
    cursor: pointer
    transition: opacity 0.3s ease, color 0.3s ease, border-color 0.3s ease
    opacity: 0.55

    .dot
      width: 0.5rem
      height: 0.5rem
      border-radius: 50%
      background: currentColor

    &:hover
      opacity: 1

  // ── Mode nuit : hero en noir, texte orange, persos en disco ──────────
  &.is-night
    .AboutPage_hero
      background: #0a0a0a

    .AboutPage_hero_title,
    .AboutPage_hero_title .line--italic
      color: #ff4500

    .AboutPage_hero_eyebrow,
    .AboutPage_hero_eyebrow .dot,
    .AboutPage_hero_scroll
      color: rgba(255, 69, 0, 0.7)

    .AboutPage_night
      border-color: rgba(255, 69, 0, 0.4)
      color: #ff4500
      opacity: 0.8

  // ── HERO ─────────────────────────────────────────────────────────────
  &_hero
    position: relative
    min-height: 100vh
    padding: 9rem 5vw 4rem
    display: flex
    flex-direction: column
    justify-content: space-between

    // Mobile : on rapproche eyebrow + titre (gap court) au lieu de
    // répartir l'espace libre en grands vides, et le scroll reste en bas.
    +breakpoint(mobile)
      min-height: 88vh
      padding: 7rem 6vw 2.5rem
      justify-content: flex-start
      gap: 1.5rem

    &_eyebrow
      display: flex
      align-items: center
      gap: 0.8rem
      font-family: $apfel
      font-size: 0.75rem
      letter-spacing: 0.18em
      text-transform: uppercase
      color: rgba(0, 0, 0, 0.5)

      .dot
        font-size: 0.5rem
        opacity: 0.5

      +breakpoint(mobile)
        font-size: 0.85rem
        letter-spacing: 0.15em

    // Rangée titre (gauche) + perso PS1 (droite)
    &_main
      flex: 1
      display: flex
      align-items: center
      justify-content: space-between
      gap: 4vw
      width: 100%
      min-height: 0

      +breakpoint(tabletDown)
        flex-direction: column
        align-items: center
        justify-content: center
        gap: 2rem

    // Hauteur DÉFINIE (vh) obligatoire : le canvas est en height:100%, donc
    // sans hauteur de référence concrète on tombe dans une boucle de layout.
    &_char
      flex: 0 0 44%
      height: 76vh
      max-height: 760px
      pointer-events: none

      +breakpoint(tabletDown)
        flex: none
        width: 100%
        height: 48vh
        max-height: 440px

    &_title
      font-family: $apfel
      font-weight: 900
      font-size: clamp(3.7rem, 9.8vw, 13rem)
      line-height: 0.9
      letter-spacing: -0.02em
      text-transform: uppercase
      color: $black
      margin: 0

      .line
        display: block
        overflow: hidden
        position: relative
        will-change: transform

        &--italic
          font-style: italic
          font-weight: 400
          font-size: clamp(2.4rem, 6vw, 6.8rem)
          letter-spacing: -0.01em
          color: rgba(0, 0, 0, 0.85)
          text-transform: none

        &--bold
          font-weight: 900

      +breakpoint(mobile)
        font-size: clamp(2.4rem, 11vw, 4.5rem)

    &_scroll
      align-self: flex-end
      display: flex
      align-items: center
      gap: 0.6rem
      font-family: $apfel
      font-size: 0.75rem
      letter-spacing: 0.2em
      text-transform: uppercase
      color: rgba(0, 0, 0, 0.6)

      svg
        animation: bounce 2s ease-in-out infinite

      // Reste collé en bas malgré le justify-content: flex-start du hero
      +breakpoint(mobile)
        margin-top: auto

  // ── INTRO ────────────────────────────────────────────────────────────
  &_intro
    padding: 12vh 6vw 12vh
    max-width: 1500px
    margin: 0 auto   // aligne la colonne de contenu avec les autres sections

    +breakpoint(mobile)
      padding: 6vh 6vw

    &_meta
      display: flex
      justify-content: space-between
      align-items: center
      margin-bottom: 5rem
      padding-bottom: 1.2rem
      border-bottom: 1px solid rgba(0, 0, 0, 0.18)

      +breakpoint(mobile)
        margin-bottom: 2.5rem

      .kicker, .meta
        font-family: $apfel
        font-size: 0.8rem
        letter-spacing: 0.2em
        text-transform: uppercase
        color: rgba(0, 0, 0, 0.55)

      .meta
        font-weight: 700

    &_text
      font-family: $apfel
      font-weight: 900
      color: $black
      margin: 0 0 4rem
      line-height: 0.95
      letter-spacing: -0.02em

      .line
        display: block
        overflow: visible

        &--lead
          white-space: nowrap
          line-height: 1.05

          // Sur tablette/mobile : autorise le retour à la ligne (sinon clip)
          +breakpoint(tabletDown)
            white-space: normal

        &--small
          font-weight: 400
          font-size: clamp(1.6rem, 3vw, 3.6rem)
          line-height: 1.15
          letter-spacing: -0.005em
          color: rgba(0, 0, 0, 0.75)
          margin-top: 0.4rem

      .word
        display: inline-block
        margin-right: 0.3em

        &--lead
          font-size: clamp(2.8rem, 8vw, 9rem)
          font-weight: 900
          text-transform: uppercase

        &--accent
          font-size: clamp(2.8rem, 8vw, 9rem)
          font-weight: 400
          font-style: italic
          color: $white
          text-transform: uppercase
          background: $black
          padding: 0 0.2em 0.05em
          border-radius: 4px
          margin-left: -0.05em
          line-height: 0.9

        &--italic
          font-style: italic
          font-weight: 400

        &--circle
          font-weight: 900
          color: $white
          background: $black
          padding: 0 0.4em
          border-radius: 999px
          line-height: 1.1
          display: inline-block

        &--name
          font-weight: 900
          color: $black
          font-style: normal
          white-space: nowrap

      +breakpoint(mobile)
        margin-bottom: 3rem

    &_divider
      height: 1px
      background: rgba(0, 0, 0, 0.25)
      margin: 4rem 0
      width: 100%

    &_sub
      font-family: $apfel
      font-weight: 400
      font-size: clamp(1.1rem, 1.5vw, 1.5rem)
      line-height: 1.5
      color: rgba(0, 0, 0, 0.78)
      max-width: 60ch
      margin: 0   // aligné à gauche, bord commun avec le titre au-dessus

      em
        font-weight: 700
        font-style: normal
        color: $black

      ::v-deep .word
        display: inline-block

  // ── EXPERTISE (fond blanc, texte noir, disciplines développées) ──────
  &_expertise
    padding: 16vh 6vw
    max-width: 1500px
    margin: 0 auto
    color: $black

    +breakpoint(mobile)
      padding: 7vh 6vw

    &_kicker
      font-family: $apfel
      font-size: 0.8rem
      letter-spacing: 0.2em
      text-transform: uppercase
      color: rgba(0, 0, 0, 0.5)
      margin: 0 0 2.5rem

    &_intro
      font-family: $apfel
      font-weight: 900
      font-size: clamp(1.7rem, 3.2vw, 3.2rem)
      line-height: 1.15
      letter-spacing: -0.015em
      color: $black
      max-width: 34ch
      margin: 0 0 8rem

      ::v-deep em
        font-style: italic
        font-weight: 400
        color: #ff4500

      ::v-deep .word
        display: inline-block

      +breakpoint(mobile)
        margin-bottom: 2.5rem

    // Rangées interactives : numéro · TITRE · description · flèche.
    // Au survol, la rangée se remplit d'orange (cohérent avec les distinctions).
    &_list
      list-style: none
      padding: 0
      margin: 0

    &_item
      position: relative
      display: grid
      grid-template-columns: 3.5rem minmax(7rem, 0.9fr) 1.5fr 2rem
      align-items: center
      gap: 2rem 3vw
      padding: 3.2vh 1.5rem
      border-top: 1px solid rgba(0, 0, 0, 0.15)
      transition: padding-left 0.5s $easeOutQuart

      &:last-child
        border-bottom: 1px solid rgba(0, 0, 0, 0.15)

      // Remplissage orange au survol
      &::before
        content: ''
        position: absolute
        inset: 0
        width: 0
        background: #ff4500
        transition: width 0.5s $easeOutQuart
        z-index: 0

      > *
        position: relative
        z-index: 1

      &:hover
        padding-left: 3rem

        &::before
          width: 100%

        .idx, .title, .body, .arrow
          color: $white

        .arrow
          transform: translate(4px, -4px)

      .idx
        font-family: $apfel
        font-weight: 900
        font-size: 0.95rem
        letter-spacing: 0.05em
        color: #ff4500
        transition: color 0.4s ease

      .title
        font-family: $apfel
        font-weight: 900
        font-size: clamp(2rem, 3.8vw, 3.8rem)
        text-transform: uppercase
        letter-spacing: -0.02em
        color: $black
        line-height: 0.95
        margin: 0
        transition: color 0.4s ease

      .body
        font-family: $apfel
        font-weight: 400
        font-size: clamp(1rem, 1.25vw, 1.35rem)
        line-height: 1.45
        color: rgba(0, 0, 0, 0.6)
        margin: 0
        max-width: 42ch
        transition: color 0.4s ease

      .arrow
        font-size: 1.3rem
        color: rgba(0, 0, 0, 0.35)
        text-align: right
        transition: transform 0.5s $easeOutQuart, color 0.4s ease

      // Tablette + mobile : on empile (titre puis texte), pas de fill au tap
      +breakpoint(tabletDown)
        grid-template-columns: 2.5rem 1fr
        gap: 1rem
        padding: 4vh 0

        &:hover
          padding-left: 0
          &::before
            width: 0
          .title, .body, .idx
            color: inherit

        .title
          grid-column: 2
        .body
          grid-column: 1 / -1
          margin-top: 1rem
        .arrow
          display: none

  // ── MANIFESTO ────────────────────────────────────────────────────────
  &_manifesto
    position: relative
    min-height: 80vh
    padding: 10vh 0
    display: flex
    flex-direction: column
    justify-content: center
    overflow: hidden

    +breakpoint(mobile)
      min-height: 55vh
      padding: 5vh 0

    &_line
      width: 100%
      overflow: hidden
      pointer-events: none
      margin: 1vh 0
      mix-blend-mode: difference

      .text
        display: inline-flex
        align-items: center
        white-space: nowrap
        font-family: $apfel
        font-weight: 900
        font-size: clamp(7rem, 18vw, 22rem)
        line-height: 0.9
        letter-spacing: -0.03em
        text-transform: uppercase
        color: $white
        will-change: transform

        +breakpoint(mobile)
          font-size: clamp(4rem, 14vw, 8rem)

      .text_unit
        display: inline-flex
        align-items: center
        margin-right: 0.4em

      .dot
        display: inline-block
        width: 0.3em
        height: 0.3em
        border-radius: 50%
        background: $white
        margin: 0 0.4em 0 0.4em

  // ── DISTINCTIONS (trophy case : grille de cartes, fond noir) ─────────
  &_awards
    padding: 18vh 6vw
    max-width: 1500px
    margin: 0 auto
    color: $white

    +breakpoint(mobile)
      padding: 8vh 6vw

    &_head
      display: grid
      grid-template-columns: 1fr auto
      align-items: end
      gap: 1.5rem
      margin-bottom: 5rem
      padding-bottom: 2rem
      border-bottom: 2px solid rgba(255, 255, 255, 0.15)

      +breakpoint(mobile)
        grid-template-columns: 1fr
        margin-bottom: 3.5rem

    &_kicker
      grid-column: 1
      grid-row: 1
      font-family: $apfel
      font-size: 0.8rem
      letter-spacing: 0.2em
      text-transform: uppercase
      color: rgba(255, 255, 255, 0.5)
      margin: 0 0 2rem

    &_title
      grid-column: 1
      grid-row: 2
      font-family: $apfel
      font-weight: 900
      font-size: clamp(2.6rem, 6.5vw, 6.5rem)
      line-height: 0.92
      text-transform: uppercase
      letter-spacing: -0.02em
      margin: 0

      .line
        display: block
        overflow: hidden
        padding-bottom: 0.05em

        &.italic
          font-weight: 400
          font-style: italic
          color: #ff8600

    &_total
      grid-column: 2
      grid-row: 2
      align-self: end
      font-family: $apfel
      font-size: 0.8rem
      letter-spacing: 0.18em
      text-transform: uppercase
      color: rgba(255, 255, 255, 0.4)

      +breakpoint(mobile)
        grid-column: 1
        grid-row: 3

    // Grille de cartes asymétrique : la 1re carte est mise en avant (feature)
    &_grid
      list-style: none
      padding: 0
      margin: 0
      display: grid
      grid-template-columns: repeat(2, 1fr)
      gap: 1.5rem

      +breakpoint(mobile)
        grid-template-columns: 1fr

    // Toutes les cartes ont la même taille ; hover → fond orange
    &_card
      position: relative
      display: flex
      flex-direction: column
      justify-content: space-between
      gap: 2.5rem
      min-height: 16rem
      padding: 2rem 2.2rem
      border: 1px solid rgba(255, 255, 255, 0.15)
      border-radius: 6px
      transition: background 0.35s ease, border-color 0.35s ease, transform 0.35s ease

      &:hover
        background: #ff8600
        border-color: #ff8600
        transform: translateY(-4px)

        .year
          color: rgba(0, 0, 0, 0.6)
        .name
          color: $black
        .project
          color: rgba(0, 0, 0, 0.7)
        .director
          color: rgba(0, 0, 0, 0.55)
        .tag
          color: $black

          .dot
            background: $black

      .year
        font-family: $apfel
        font-weight: 400
        font-size: 0.9rem
        letter-spacing: 0.1em
        color: rgba(255, 255, 255, 0.5)
        transition: color 0.35s ease

      .mid
        display: flex
        flex-direction: column
        gap: 0.5rem

      .name
        font-family: $apfel
        font-weight: 900
        font-size: clamp(1.8rem, 2.8vw, 2.8rem)
        text-transform: uppercase
        line-height: 0.95
        letter-spacing: -0.015em
        color: $white
        transition: color 0.35s ease

      .project
        font-family: $apfel
        font-weight: 400
        font-style: italic
        font-size: clamp(0.95rem, 1.1vw, 1.15rem)
        color: rgba(255, 255, 255, 0.55)
        transition: color 0.35s ease

      .director
        font-family: $apfel
        font-weight: 400
        font-size: clamp(0.78rem, 0.9vw, 0.92rem)
        letter-spacing: 0.04em
        color: rgba(255, 255, 255, 0.4)
        transition: color 0.35s ease

      .tag
        display: inline-flex
        align-items: center
        gap: 0.6rem
        font-family: $apfel
        font-weight: 700
        font-size: 0.78rem
        letter-spacing: 0.15em
        text-transform: uppercase
        color: #ff8600
        white-space: nowrap
        transition: color 0.35s ease

        .dot
          width: 0.45rem
          height: 0.45rem
          border-radius: 50%
          background: #ff8600
          transition: background 0.35s ease

  // ── VISIT : fond noir, scan studio intégré puis accroche ─────────────
  &_visit
    padding: 14vh 6vw 12vh
    max-width: 1500px
    margin: 0 auto
    text-align: center
    color: $white

    +breakpoint(mobile)
      padding: 7vh 6vw 8vh

    &_kicker
      font-family: $apfel
      font-size: 0.8rem
      letter-spacing: 0.2em
      text-transform: uppercase
      color: rgba(255, 255, 255, 0.5)
      margin: 0 0 3rem

    // Scan : bord transparent (même noir que la section) → s'intègre direct
    &_canvas
      position: relative
      // Déborde le padding 6vw de la section → box pleine largeur
      width: calc(100% + 12vw)
      margin-left: -6vw
      margin-right: -6vw
      margin-bottom: 4rem
      aspect-ratio: 16 / 9
      background: transparent
      overflow: hidden
      display: flex
      align-items: center
      justify-content: center

      +breakpoint(mobile)
        width: calc(100% + 10vw)
        margin-left: -5vw
        margin-right: -5vw
        aspect-ratio: 1 / 1

      // Canvas Three.js injecté → remplit le bloc
      ::v-deep canvas
        position: absolute
        inset: 0
        width: 100% !important
        height: 100% !important
        display: block
        cursor: grab

        &:active
          cursor: grabbing

    &_placeholder
      display: flex
      flex-direction: column
      align-items: center
      gap: 0.8rem
      color: rgba(255, 255, 255, 0.35)
      border: 1px dashed rgba(255, 255, 255, 0.12)
      border-radius: 6px
      width: 100%
      height: 100%
      justify-content: center

      .placeholderLine
        font-family: $apfel
        font-weight: 900
        font-size: clamp(1.5rem, 3vw, 2.5rem)
        text-transform: uppercase
        letter-spacing: -0.01em

      .placeholderSub
        font-family: $apfel
        font-weight: 400
        font-size: 0.75rem
        letter-spacing: 0.2em
        text-transform: uppercase
        color: rgba(255, 255, 255, 0.25)

    // Accroche sous le scan
    &_title
      font-family: $apfel
      font-weight: 900
      font-size: clamp(3rem, 8vw, 9rem)
      line-height: 0.95
      text-transform: uppercase
      color: $white
      letter-spacing: -0.02em
      margin: 0 0 5rem

      span
        display: block
        overflow: hidden

        &.italic
          font-weight: 400
          font-style: italic
          color: #ff4500

    // Adresse : label + grosse adresse + lien maps
    &_address
      display: flex
      flex-direction: column
      align-items: center
      gap: 0.8rem
      text-decoration: none
      margin-bottom: 3rem

      .label
        font-family: $apfel
        font-size: 0.75rem
        letter-spacing: 0.2em
        text-transform: uppercase
        color: rgba(255, 255, 255, 0.5)

      .value
        font-family: $apfel
        font-weight: 900
        font-size: clamp(1.6rem, 3.5vw, 3rem)
        text-transform: uppercase
        letter-spacing: -0.01em
        color: $white
        line-height: 1.1
        transition: color 0.25s ease

      .map
        display: inline-flex
        align-items: center
        gap: 0.4rem
        font-family: $apfel
        font-weight: 700
        font-size: 0.8rem
        letter-spacing: 0.1em
        text-transform: uppercase
        color: rgba(255, 255, 255, 0.5)
        transition: color 0.25s ease

      &:hover
        .value
          color: #ff4500
        .map
          color: $white

    // CTA principal vers la page contact
    &_cta
      display: inline-flex
      align-items: center
      gap: 0.7rem
      background: $white
      color: $black
      border-radius: 100px
      padding: 1.1rem 2.4rem
      font-family: $apfel
      font-weight: 700
      font-size: clamp(1rem, 1.3vw, 1.3rem)
      letter-spacing: 0.02em
      text-transform: uppercase
      text-decoration: none
      transition: transform 0.25s ease, background 0.25s ease, color 0.25s ease

      svg
        transition: transform 0.25s ease

      &:hover
        transform: translateY(-2px)
        background: #ff4500
        color: $white

        svg
          transform: translateX(5px)

@keyframes bounce
  0%, 100%
    transform: translateY(0)
  50%
    transform: translateY(4px)
</style>
