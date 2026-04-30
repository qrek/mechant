<template>
  <section class="WorksPage" @mousemove="onMouseMove">

    <!-- Fond orange qui scale in -->
    <div class="WorksPage_bg" ref="bg" />

    <!-- Cadre vidéo flottant (cursor-follower, derrière le texte) -->
    <div class="WorksPage_float" ref="float">
      <video ref="floatVideo" muted loop playsinline class="WorksPage_float_video" />
    </div>

    <!-- Cloud typographique -->
    <div class="WorksPage_cloud" ref="list">
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
import { supabase } from '@/utils/supabase'

export default {
  name: 'Works',

  head() {
    return {
      title: this.data?.projectsPage?.meta_title || 'Works — Méchant',
      meta: [{ hid: 'description', name: 'description', content: this.data?.projectsPage?.meta_description || '' }]
    }
  },

  data() {
    return {
      featuredProjects: [],
      _hideTimer: null,
      _currentSrc: null,
      _preloadCache: {}
    }
  },

  computed: {
    ...mapGetters({ data: 'data/getData' })
  },

  async mounted () {
    // Masquer "All Work" et le bg dès le départ
    const allWorkLink = this.$el.querySelector('.WorksPage_item--allwork')
    if (allWorkLink) gsap.set(allWorkLink, { opacity: 0 })
    const { bg } = this.$refs
    if (bg) gsap.set(bg, { xPercent: -100 })

    // Attendre la data, puis animer
    await this._fetchFeaturedProjects()
    await this.$nextTick()
    this._preloadVideos()
    this._animateItems()
  },

  beforeDestroy() {
    clearTimeout(this._hideTimer)
    Object.values(this._preloadCache).forEach(v => { v.src = ''; v.load() })
    this._preloadCache = {}
  },

  methods: {
    ...mapActions({
      setActive: 'project/setActive',
      setId: 'project/setId',
      setProjectData: 'project/setData'
    }),

    async _fetchFeaturedProjects() {
      // Fetch direct Supabase — pas de cache store
      let { data: featured } = await supabase
        .from('projects')
        .select('*')
        .eq('published', true)
        .eq('is_featured', true)
        .order('order_index', { ascending: false })

      if (!featured || !featured.length) {
        // Fallback : tous les projets publiés
        const { data: all } = await supabase
          .from('projects')
          .select('*')
          .eq('published', true)
          .order('order_index', { ascending: false })
          .limit(20)
        featured = all || []
      }

      this.featuredProjects = featured
    },

    getCategoryLabel(project) {
      const cats = project.categories
      if (!cats || !cats.length) return ''
      return this.data?.categories?.[cats[0]]?.title || ''
    },

    getWorkTypes(project) {
      const types = project.work_types
      if (!types || !types.length) return ''
      return types.join('/')
    },

    _animateItems () {
      const { bg } = this.$refs
      const items = [...this.$el.querySelectorAll('.WorksPage_item')]
      if (!items.length) return

      // États initiaux : tous les items cachés
      items.forEach((item, i) => {
        switch (i % 4) {
          case 0: gsap.set(item, { opacity: 0, clipPath: 'inset(0% 100% 0% 0%)' }); break
          case 1: gsap.set(item, { y: 65, opacity: 0 }); break
          case 2: gsap.set(item, { opacity: 0, clipPath: 'inset(0% 0% 0% 100%)' }); break
          case 3: gsap.set(item, { scale: 0.72, opacity: 0 }); break
        }
      })

      const tl = gsap.timeline()

      // 1. Fond orange slide depuis la gauche
      if (bg) {
        tl.to(bg, { xPercent: 0, duration: 1.1, ease: 'power3.out', clearProps: 'transform' })
      }

      // 2. Items en cascade avec 4 animations distinctes
      items.forEach((item, i) => {
        let toVars
        switch (i % 4) {
          case 0:
            toVars = { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power3.out', clearProps: 'all' }
            break
          case 1:
            toVars = { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out', clearProps: 'all' }
            break
          case 2:
            toVars = { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power3.out', clearProps: 'all' }
            break
          case 3:
            toVars = { scale: 1, opacity: 1, duration: 0.85, ease: 'back.out(1.4)', clearProps: 'all' }
            break
        }
        tl.to(item, toVars, i === 0 ? '>-0.4' : '>-0.3')
      })
    },

    _preloadVideos() {
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

    onMouseMove(e) {
      const el = this.$refs.float
      if (!el) return
      const w = el.offsetWidth
      const h = el.offsetHeight
      const x = Math.max(0, Math.min(e.clientX - w / 2, window.innerWidth - w))
      const y = Math.max(0, Math.min(e.clientY - h / 2, window.innerHeight - h))
      el.style.transform = `translate(${x}px, ${y}px)`
    },

    onHover(project) {
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

    onLeave() {
      const float = this.$refs.float
      if (!float) return
      float.classList.remove('is-visible')
      this._hideTimer = setTimeout(() => {
        if (this.$refs.floatVideo) this.$refs.floatVideo.pause()
      }, 300)
    },

    openProject(project) {
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

  // ---------- Fond orange animé ----------
  &_bg
    position: fixed
    inset: 0
    background: #f2492c
    z-index: 0
    transform-origin: center
    will-change: transform

  // ---------- Cadre vidéo flottant (derrière le texte) ----------
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

  // ---------- Cloud typographique (au-dessus de la vidéo) ----------
  &_cloud
    position: relative
    z-index: 2
    display: flex
    flex-wrap: wrap
    align-items: flex-start
    justify-content: center
    row-gap: 1rem

    +breakpoint(mobile)
      row-gap: 0.6rem

// Chaque projet
.WorksPage_item
  display: inline-flex
  align-items: flex-end
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

  &_label
    font-family: $apfel
    font-weight: 700
    font-size: clamp(1rem, 0.6vw, 1.3rem)
    letter-spacing: 0.08em
    text-transform: uppercase
    color: rgba(0,0,0,0.45)
    transition: color 0.25s ease
    display: block
    padding-bottom: 0.2em
    line-height: 1.2
</style>
