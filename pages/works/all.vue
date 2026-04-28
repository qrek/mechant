<template>
  <section class="WorksPage" @mousemove="onMouseMove">

    <!-- Cadre vidéo flottant -->
    <div class="WorksPage_float" ref="float">
      <video ref="floatVideo" muted loop playsinline class="WorksPage_float_video" />
    </div>

    <!-- Cloud typographique — tous les projets -->
    <div class="WorksPage_cloud" ref="list">
      <button
        v-for="project in projectsData"
        :key="project.id"
        class="WorksPage_item"
        @mouseenter="onHover(project)"
        @mouseleave="onLeave"
        @click="openProject(project)"
      >
        <span class="WorksPage_item_title">{{ project.client || getCategoryLabel(project) }}</span>
        <span class="WorksPage_item_label">{{ project.title }}</span>
      </button>
    </div>

  </section>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { supabase } from '@/utils/supabase'

export default {
  name: 'WorksAll',

  head() {
    return {
      title: 'All Work — Méchant',
      meta: [{ hid: 'description', name: 'description', content: '' }]
    }
  },

  data() {
    return {
      isLoading: false,
      _hideTimer: null,
      _currentSrc: null,
      _preloadCache: {}
    }
  },

  computed: {
    ...mapGetters({ data: 'data/getData' }),
    projectsData() {
      return this.data?.projects || []
    }
  },

  mounted() {
    window.addEventListener('scroll', this._onScroll)
    this._preloadVideos()
  },

  beforeDestroy() {
    window.removeEventListener('scroll', this._onScroll)
    clearTimeout(this._hideTimer)
    Object.values(this._preloadCache).forEach(v => { v.src = ''; v.load() })
    this._preloadCache = {}
  },

  methods: {
    ...mapActions({
      setData: 'data/setData',
      setActive: 'project/setActive',
      setId: 'project/setId'
    }),

    getCategoryLabel(project) {
      const cats = project.categories
      if (!cats || !cats.length) return ''
      return this.data?.categories?.[cats[0]]?.title || ''
    },

    _preloadVideos() {
      this.projectsData.forEach(project => {
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
      const vw = window.innerWidth
      const vh = window.innerHeight
      let x = e.clientX + 32
      let y = e.clientY - h / 2
      if (x + w > vw - 16) x = e.clientX - w - 32
      y = Math.max(16, Math.min(y, vh - h - 16))
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
    },

    async _onScroll() {
      const { list } = this.$refs
      if (!list) return
      const { bottom } = list.getBoundingClientRect()
      if (bottom < window.innerHeight * 1.3 && !this.isLoading) {
        await this._loadMore()
      }
    },

    async _loadMore() {
      const { page, total_pages } = this.data.pagination || {}
      if (!page || page >= total_pages) return
      this.isLoading = true
      const from = page * 20
      const { data: newProjects } = await supabase
        .from('projects').select('*').eq('published', true)
        .order('order_index', { ascending: false }).range(from, from + 19)
      if (newProjects?.length) {
        await this.setData({
          ...this.data,
          projects: [...this.data.projects, ...newProjects],
          pagination: { page: page + 1, total_pages }
        })
      }
      this.isLoading = false
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

  &_float
    position: fixed
    top: 0
    left: 0
    width: 30rem
    aspect-ratio: 16 / 9
    border-radius: 10px
    overflow: hidden
    pointer-events: none
    z-index: 3
    opacity: 0
    transition: opacity 0.25s ease
    will-change: transform
    box-shadow: 0 12px 50px rgba(0,0,0,0.45)

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
    z-index: 1
    display: flex
    flex-wrap: wrap
    align-items: flex-start
    justify-content: center

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

  &_title
    font-family: $apfel
    font-weight: 900
    font-size: clamp(2rem, 3.2vw, 4.5rem)
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
