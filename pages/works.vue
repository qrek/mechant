<template>
  <section class="WorksPage">

    <!-- Vidéo de fond (partagée, change au hover) -->
    <div class="WorksPage_videoBg" ref="videoBg">
      <video
        ref="videoEl"
        autoplay
        muted
        loop
        playsinline
        class="WorksPage_videoBg_video"
      />
      <div class="WorksPage_videoBg_overlay" />
    </div>

    <!-- Liste typographique -->
    <div class="WorksPage_list" ref="list">
      <div
        v-for="(project, i) in projectsData"
        :key="project.id"
        class="WorksPage_item"
        @mouseenter="onHover(project)"
        @mouseleave="onLeave"
        @click="openProject(project)"
      >
        <span class="WorksPage_item_index">{{ pad(i + 1) }}</span>
        <h2 class="WorksPage_item_title">{{ project.title }}</h2>
        <span class="WorksPage_item_label">{{ project.client || getCategoryLabel(project) }}</span>
      </div>
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
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.data?.projectsPage?.meta_description || ''
        }
      ]
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
    ...mapGetters({
      data: 'data/getData'
    }),
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
    // libérer les éléments vidéo préchargés
    Object.values(this._preloadCache).forEach(v => {
      v.src = ''
      v.load()
    })
    this._preloadCache = {}
  },

  methods: {
    ...mapActions({
      setData: 'data/setData',
      setActive: 'project/setActive',
      setId: 'project/setId'
    }),

    pad(n) {
      return String(n).padStart(2, '0')
    },

    getCategoryLabel(project) {
      const cats = project.categories
      if (!cats || !cats.length) return ''
      const first = this.data?.categories?.[cats[0]]
      return first?.title || ''
    },

    // Précharge silencieusement les vidéos preview de chaque projet
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
      // Pré-chauffe le player Vimeo pendant que l'utilisateur survole
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
        const video = this.$refs.videoEl
        if (video) {
          video.pause()
        }
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
        .from('projects')
        .select('*')
        .eq('published', true)
        .order('order_index', { ascending: false })
        .range(from, from + 4)

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
  padding: 14rem 6rem 8rem

  +breakpoint(mobile)
    padding: 12rem 2.5rem 6rem

  // ---------- Vidéo de fond ----------
  &_videoBg
    position: fixed
    inset: 0
    z-index: 0
    opacity: 0
    transition: opacity 0.4s ease
    pointer-events: none

    &.is-visible
      opacity: 1

    &_video
      position: absolute
      inset: 0
      width: 100%
      height: 100%
      object-fit: cover

    &_overlay
      display: none

  // ---------- Liste ----------
  &_list
    position: relative
    z-index: 1

  &_item
    display: flex
    align-items: baseline
    gap: 2.4rem
    padding: 1.8rem 0
    border-top: 1px solid rgba(0,0,0,0.18)
    cursor: pointer
    transition: color 0.3s ease

    &:last-child
      border-bottom: 1px solid rgba(0,0,0,0.18)

    &:hover
      .WorksPage_item_title,
      .WorksPage_item_index,
      .WorksPage_item_label
        color: $white

    +breakpoint(mobile)
      gap: 1.2rem
      padding: 1.4rem 0
      flex-wrap: wrap

    &_index
      font-family: $apfel
      font-weight: 400
      font-size: 1.1rem
      color: rgba(0,0,0,0.45)
      letter-spacing: 0.05em
      flex-shrink: 0
      width: 2.4rem
      transition: color 0.3s ease

    &_title
      font-family: $apfel
      font-weight: 700
      font-size: clamp(3.2rem, 5.5vw, 7.5rem)
      line-height: 0.95
      text-transform: uppercase
      color: #000
      flex: 1
      min-width: 0
      transition: color 0.3s ease

      +breakpoint(mobile)
        font-size: clamp(2.8rem, 9vw, 5rem)
        width: 100%
        flex: none

    &_label
      font-family: $apfel
      font-weight: 400
      font-size: 1rem
      letter-spacing: 0.2em
      text-transform: uppercase
      color: rgba(0,0,0,0.5)
      flex-shrink: 0
      text-align: right
      transition: color 0.3s ease

      +breakpoint(mobile)
        font-size: 0.9rem
        width: 100%
        text-align: left
        padding-left: 3.6rem
</style>
