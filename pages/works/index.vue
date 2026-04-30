<template>
  <section class="WorksPage" @mousemove="onMouseMove">

    <div class="WorksPage_bg" ref="bg" />

    <div class="WorksPage_float" ref="float">
      <video ref="floatVideo" muted loop playsinline class="WorksPage_float_video" />
    </div>

    <div class="WorksPage_cloud" ref="cloud">
      <button
        v-for="project in featuredProjects"
        :key="project.id"
        class="WorksPage_item"
        @mouseenter="onHover(project)"
        @mouseleave="onLeave"
        @click="openProject(project)"
      >
        <span class="WorksPage_item_title">{{ project.client || getCategoryLabel(project) }}</span>
        <span class="WorksPage_item_label">{{ getWorkTypes(project) }}</span>
      </button>

      <NuxtLink to="/works/all" class="WorksPage_item WorksPage_item--allwork" @mouseleave.native="onLeave">
        <span class="WorksPage_item_title">All Work</span>
      </NuxtLink>
    </div>

  </section>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { gsap } from '@/vendor/gsap'
import { SplitText } from '@/vendor/gsap/SplitText'
import { supabase } from '@/utils/supabase'

export default {
  name: 'Works',

  head () {
    return {
      title: this.data?.projectsPage?.meta_title || 'Works — Méchant',
      meta: [{ hid: 'description', name: 'description', content: this.data?.projectsPage?.meta_description || '' }]
    }
  },

  data () {
    return {
      featuredProjects: []
    }
  },

  computed: {
    ...mapGetters({ data: 'data/getData' })
  },

  async mounted () {
    // Propriétés d'instance non-réactives (ne pas mettre dans data() avec _ préfixe)
    this._hideTimer = null
    this._currentSrc = null
    this._preloadCache = {}
    this._splits = []
    this._itemParallax = []
    this._floatQuickX = null
    this._floatQuickY = null

    const { bg } = this.$refs
    if (bg) gsap.set(bg, { xPercent: -100 })

    try {
      await this._fetchFeaturedProjects()
    } catch (_) {}

    await this.$nextTick()
    this._preloadVideos()
    this._setupParallax()
    this._animateIn()
  },

  beforeDestroy () {
    clearTimeout(this._hideTimer)
    const video = this.$refs.floatVideo
    if (video) { video.pause(); video.src = '' }
    Object.values(this._preloadCache || {}).forEach(v => { v.src = ''; v.load() })
    this._preloadCache = {}
    ;(this._splits || []).forEach(st => st.revert())
    this._splits = []
    const float = this.$refs.float
    if (float) gsap.killTweensOf(float)
    ;(this._itemParallax || []).forEach(({ el }) => gsap.killTweensOf(el))
    this._itemParallax = []
  },

  methods: {
    ...mapActions({
      setActive: 'project/setActive',
      setId: 'project/setId',
      setProjectData: 'project/setData'
    }),

    async _fetchFeaturedProjects () {
      const { data: featured, error } = await supabase
        .from('projects')
        .select('*')
        .eq('published', true)
        .eq('is_featured', true)
        .order('order_index', { ascending: false })

      if (!error && featured && featured.length) {
        this.featuredProjects = featured
        return
      }

      // Fallback : tous les projets publiés
      const { data: all } = await supabase
        .from('projects')
        .select('*')
        .eq('published', true)
        .order('order_index', { ascending: false })
        .limit(20)
      this.featuredProjects = all || []
    },

    getCategoryLabel (project) {
      const cats = project.categories
      if (!cats || !cats.length) return ''
      return this.data?.categories?.[cats[0]]?.title || ''
    },

    getWorkTypes (project) {
      const types = project.work_types
      if (!types || !types.length) return ''
      const excluded = ['Animation', 'Montage']
      return types.filter(t => !excluded.includes(t)).join('/')
    },

    _animateIn () {
      const { bg } = this.$refs
      if (!bg) return
      const items = [...this.$el.querySelectorAll('.WorksPage_item')]
      if (!items.length) return

      // 4 ordres d'apparition distincts par item
      const staggerFroms = ['start', 'end', 'center', 'random']

      const splitData = items.map((item, i) => {
        const titleEl = item.querySelector('.WorksPage_item_title')
        const labelEl = item.querySelector('.WorksPage_item_label')

        if (!titleEl) return { st: null, titleEl: null, labelEl }

        titleEl.style.overflow = 'hidden'

        const st = new SplitText(titleEl, { type: 'words' })
        this._splits.push(st)

        gsap.set(st.words, { y: 120 })
        // Rendre le container visible — les mots restent cachés par y:120 + overflow
        gsap.set(titleEl, { opacity: 1 })
        if (labelEl) gsap.set(labelEl, { y: 10 })

        return { st, titleEl, labelEl }
      })

      const tl = gsap.timeline()

      tl.to(bg, { xPercent: 0, duration: 0.55, ease: 'power3.out', clearProps: 'transform' })

      splitData.forEach(({ st, titleEl, labelEl }, i) => {
        if (!st) return
        const from = staggerFroms[i % staggerFroms.length]
        const t = 0.15 + i * 0.04

        tl.to(st.words, {
          y: 0,
          duration: 0.45,
          ease: 'power3.inOut',
          stagger: { each: 0.05, from },
          onComplete: () => { if (titleEl) titleEl.style.overflow = '' }
        }, t)

        if (labelEl) {
          tl.to(labelEl, {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: 'power2.out'
          }, t + 0.2)
        }
      })
    },

    _preloadVideos () {
      this.featuredProjects.forEach(project => {
        const url = project.preview_video || project.video_home
        if (!url || this._preloadCache[project.id]) return
        const v = document.createElement('video')
        v.src = url
        v.muted = true
        v.preload = 'metadata'
        v.load()
        this._preloadCache[project.id] = v
      })
    },

    _setupParallax () {
      // Float video — lag lent, suit le curseur en retard
      const float = this.$refs.float
      if (float) {
        this._floatQuickX = gsap.quickTo(float, 'x', { duration: 1.4, ease: 'power3.out' })
        this._floatQuickY = gsap.quickTo(float, 'y', { duration: 1.4, ease: 'power3.out' })
      }

      // Chaque item a un facteur de profondeur distinct
      const depths = [0.025, 0.01, 0.035, 0.015, 0.03, 0.012, 0.028]
      const items = [...this.$el.querySelectorAll('.WorksPage_item')]
      this._itemParallax = items.map((item, i) => {
        const factor = depths[i % depths.length]
        // Les items lointains (petit factor) répondent plus lentement
        const dur = 0.6 + (0.035 - factor) * 20
        return {
          el: item,
          quickX: gsap.quickTo(item, 'x', { duration: dur, ease: 'power2.out' }),
          quickY: gsap.quickTo(item, 'y', { duration: dur, ease: 'power2.out' }),
          factor
        }
      })
    },

    onMouseMove (e) {
      const float = this.$refs.float
      if (!float) return

      const w = float.offsetWidth
      const h = float.offsetHeight
      const x = Math.max(0, Math.min(e.clientX - w / 2, window.innerWidth - w))
      const y = Math.max(0, Math.min(e.clientY - h / 2, window.innerHeight - h))

      if (this._floatQuickX) {
        this._floatQuickX(x)
        this._floatQuickY(y)
      } else {
        float.style.transform = `translate(${x}px, ${y}px)`
      }

      if (this._itemParallax && this._itemParallax.length) {
        const cx = e.clientX - window.innerWidth / 2
        const cy = e.clientY - window.innerHeight / 2
        this._itemParallax.forEach(({ quickX, quickY, factor }) => {
          quickX(cx * factor)
          quickY(cy * factor)
        })
      }
    },

    onHover (project) {
      this.setId(project.id)
      const url = project.preview_video || project.video_home
      if (!url) return
      const video = this.$refs.floatVideo
      const float = this.$refs.float
      if (!video || !float) return
      clearTimeout(this._hideTimer)
      if (this._currentSrc !== url) {
        this._currentSrc = url
        video.src = url
      }
      video.currentTime = 0
      video.play().catch(() => {})
      float.classList.add('is-visible')
    },

    onLeave () {
      const float = this.$refs.float
      if (!float) return
      float.classList.remove('is-visible')
      this._hideTimer = setTimeout(() => {
        if (this.$refs.floatVideo) this.$refs.floatVideo.pause()
      }, 300)
    },

    openProject (project) {
      if (project.has_case_study && project.slug) {
        this.$router.push(`/works/${project.slug}`)
        return
      }
      this.setProjectData(project)
      this.setId(project.id)
      this.setActive(true)
    }
  }
}
</script>

<style lang="sass" scoped>
.WorksPage
  position: relative
  min-height: 100vh
  background: #000
  display: flex
  align-items: center
  justify-content: center
  padding: 12rem 5vw 8rem

  +breakpoint(mobile)
    padding: 11rem 5vw 6rem
    align-items: flex-start

  &_bg
    position: fixed
    inset: 0
    background: #f2492c
    z-index: 0
    will-change: transform

  &_float
    position: fixed
    top: 0
    left: 0
    width: 30rem
    aspect-ratio: 16 / 9
    overflow: hidden
    pointer-events: none
    z-index: 1
    opacity: 0
    transition: opacity 0.25s ease
    will-change: transform

    +breakpoint(mobile)
      display: none

    &.is-visible
      opacity: 1

    &_video
      width: 100%
      height: 100%
      object-fit: cover

  &_cloud
    position: relative
    z-index: 2
    display: flex
    flex-wrap: wrap
    align-items: flex-start
    justify-content: center
    row-gap: 1.8rem

    +breakpoint(mobile)
      row-gap: 1rem

.WorksPage_item
  display: inline-flex
  align-items: baseline
  gap: 0.4em
  cursor: pointer
  background: none
  border: none
  padding: 0
  padding-right: 0.3em
  line-height: 1
  text-decoration: none

  &:hover
    .WorksPage_item_title
      color: $white
    .WorksPage_item_label
      color: rgba(255,255,255,0.6)

  &--allwork
    .WorksPage_item_title
      color: rgba(0,0,0,0.3)
      font-style: italic
    &:hover .WorksPage_item_title
      color: $white

  &_title
    font-family: $apfel
    font-weight: 900
    font-size: clamp(3rem, 5vw, 7rem)
    line-height: 0.9
    text-transform: uppercase
    color: #000
    transition: color 0.25s ease
    display: block
    opacity: 0

  &_label
    font-family: $apfel
    font-weight: 700
    font-size: clamp(1rem, 0.6vw, 1.3rem)
    letter-spacing: 0.08em
    text-transform: uppercase
    color: rgba(0,0,0,0.45)
    transition: color 0.25s ease
    display: block
    line-height: 1.2
    opacity: 0
</style>
