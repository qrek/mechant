<template>
  <section class="WorksPage">

    <!-- Vidéo de fond -->
    <div class="WorksPage_videoBg" ref="videoBg">
      <video ref="videoEl" autoplay muted loop playsinline class="WorksPage_videoBg_video" />
    </div>

    <!-- Cloud typographique -->
    <div class="WorksPage_cloud" ref="list">
      <button
        v-for="project in projectsData"
        :key="project.id"
        class="WorksPage_item"
        @mouseenter="onHover(project)"
        @mouseleave="onLeave"
        @click="openProject(project)"
      >
        <span class="WorksPage_item_title">{{ project.title }}</span>
        <span class="WorksPage_item_label">{{ project.client || getCategoryLabel(project) }}</span>
      </button>
    </div>

  </section>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
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
        v.preload = 'auto'
        v.load()
        this._preloadCache[project.id] = v
      })
    },

    onHover(project) {
      this.setId(project.id)
      const url = project.preview_video || project.video_home
      if (!url) return
      const video = this.$refs.videoEl
      const bg = this.$refs.videoBg
      if (!video || !bg) return
      clearTimeout(this._hideTimer)
      if (this._currentSrc !== url) {
        this._currentSrc = url
        video.src = url
      }
      video.currentTime = 0
      video.play().catch(() => {})
      bg.classList.add('is-visible')
    },

    onLeave() {
      const bg = this.$refs.videoBg
      if (!bg) return
      bg.classList.remove('is-visible')
      this._hideTimer = setTimeout(() => {
        if (this.$refs.videoEl) this.$refs.videoEl.pause()
      }, 400)
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
      const from = page * 5
      const { data: newProjects } = await supabase
        .from('projects').select('*').eq('published', true)
        .order('order_index', { ascending: false }).range(from, from + 4)
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
  padding: 13rem 5vw 8rem

  +breakpoint(mobile)
    padding: 11rem 5vw 6rem

  // ---------- Vidéo de fond ----------
  &_videoBg
    position: fixed
    inset: 0
    z-index: 0
    opacity: 0
    transition: opacity 0.35s ease
    pointer-events: none

    &.is-visible
      opacity: 1

    &_video
      position: absolute
      inset: 0
      width: 100%
      height: 100%
      object-fit: cover

  // ---------- Cloud typographique ----------
  &_cloud
    position: relative
    z-index: 1
    display: flex
    flex-wrap: wrap
    align-items: flex-start

// Chaque projet : titre géant + petit label
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
