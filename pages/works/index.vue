<template>
  <section class="WorksPage" @mousemove="onMouseMove">

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
      _hideTimer: null,
      _currentSrc: null,
      _preloadCache: {}
    }
  },

  computed: {
    ...mapGetters({ data: 'data/getData' }),
    projectsData() {
      return this.data?.projects || []
    },
    featuredProjects() {
      const featured = this.projectsData.filter(p => p.is_featured)
      return featured.length ? featured : this.projectsData
    }
  },

  mounted() {
    this._preloadVideos()
  },

  beforeDestroy() {
    clearTimeout(this._hideTimer)
    Object.values(this._preloadCache).forEach(v => { v.src = ''; v.load() })
    this._preloadCache = {}
  },

  methods: {
    ...mapActions({
      setActive: 'project/setActive',
      setId: 'project/setId'
    }),

    getCategoryLabel(project) {
      const cats = project.categories
      if (!cats || !cats.length) return ''
      return this.data?.categories?.[cats[0]]?.title || ''
    },

    getWorkTypes(project) {
      const cats = project.categories
      if (!cats || !cats.length) return ''
      return cats
        .map(id => this.data?.categories?.[id]?.title || '')
        .filter(Boolean)
        .join(' · ')
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
  background: #f2492c
  display: flex
  align-items: center
  justify-content: center
  padding: 12rem 5vw 8rem

  +breakpoint(mobile)
    padding: 11rem 5vw 6rem
    align-items: flex-start

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

// Chaque projet
.WorksPage_item
  display: inline-flex
  align-items: flex-start
  gap: 0.5em
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
      color: rgba(255,255,255,0.7)

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
    font-weight: 400
    font-size: clamp(0.55rem, 0.65vw, 0.75rem)
    letter-spacing: 0.1em
    text-transform: uppercase
    color: rgba(0,0,0,0.5)
    transition: color 0.25s ease
    display: block
    margin-top: 0.45em
    line-height: 1.3
</style>
