<template>
  <section class="AllWork">
    <div class="AllWork_inner" ref="inner">

      <!-- En-tête colonnes -->
      <div class="AllWork_head">
        <span></span>
        <span>Projet</span>
        <span></span>
        <span>Catégorie</span>
        <span>Type</span>
      </div>

      <!-- Lignes projets -->
      <div
        v-for="(project, i) in projects"
        :key="project.id"
        class="AllWork_row"
        :class="{ 'is-hovered': hoveredId === project.id }"
        @mouseenter="onHover(project, $event)"
        @mouseleave="onLeave($event)"
        @click="openProject(project)"
      >
        <span class="AllWork_row_num">{{ String(i + 1).padStart(2, '0') }}.</span>

        <div class="AllWork_row_info">
          <span class="AllWork_row_client">{{ project.client || getCategoryLabel(project) }}</span>
          <span class="AllWork_row_title">{{ project.title }}</span>
        </div>

        <div class="AllWork_row_media">
          <img
            v-if="project.thumbnail_url || project.poster"
            :src="project.thumbnail_url || project.poster"
            loading="lazy"
            alt=""
            class="AllWork_row_thumb"
          />
          <video
            :data-src="project.preview_video || project.video_home || ''"
            muted
            loop
            playsinline
            preload="none"
            class="AllWork_row_video"
          />
        </div>

        <span class="AllWork_row_cat">{{ getCategoryLabel(project) }}</span>
        <span class="AllWork_row_type">{{ getWorkTypes(project) }}</span>
      </div>

      <div v-if="isLoading" class="AllWork_loading">
        <span></span>
      </div>

    </div>
  </section>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { gsap } from '@/vendor/gsap'
import { ScrollToPlugin } from '@/vendor/gsap/ScrollToPlugin'
import { supabase } from '@/utils/supabase'

gsap.registerPlugin(ScrollToPlugin)

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
      projects: [],
      isLoading: false,
      hoveredId: null,
      _page: 1,
      _totalPages: 1,
      _targetY: 0,
      _currentVideo: null
    }
  },

  computed: {
    ...mapGetters({ data: 'data/getData' })
  },

  async mounted() {
    await this._fetchProjects()
    await this.$nextTick()
    this._animateIn()
    this._targetY = 0
    window.addEventListener('wheel', this._onWheel, { passive: false })
    window.addEventListener('scroll', this._onScroll)
  },

  beforeDestroy() {
    window.removeEventListener('wheel', this._onWheel)
    window.removeEventListener('scroll', this._onScroll)
    gsap.killTweensOf(window)
  },

  methods: {
    ...mapActions({
      setActive: 'project/setActive',
      setId: 'project/setId',
      setProjectData: 'project/setData'
    }),

    async _fetchProjects() {
      this.isLoading = true
      const { data, count } = await supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .eq('published', true)
        .order('order_index', { ascending: false })
        .range(0, 19)
      this.projects = data || []
      this._totalPages = Math.ceil((count || 0) / 20)
      this._page = 1
      this.isLoading = false
    },

    async _loadMore() {
      if (this._page >= this._totalPages || this.isLoading) return
      this.isLoading = true
      const from = this._page * 20
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('published', true)
        .order('order_index', { ascending: false })
        .range(from, from + 19)
      if (data?.length) {
        this.projects = [...this.projects, ...data]
        this._page++
      }
      this.isLoading = false
    },

    getCategoryLabel(project) {
      const cats = project.categories
      if (!cats || !cats.length) return ''
      return this.data?.categories?.[cats[0]]?.title || ''
    },

    getWorkTypes(project) {
      const types = project.work_types
      if (!types || !types.length) return ''
      return types.join(' / ')
    },

    onHover(project, e) {
      this.hoveredId = project.id
      this.setId(project.id)
      const video = e.currentTarget.querySelector('.AllWork_row_video')
      if (!video) return
      const src = video.dataset.src
      if (!src) return
      if (this._currentVideo && this._currentVideo !== video) {
        this._currentVideo.pause()
        this._currentVideo.classList.remove('is-active')
      }
      if (!video.src) video.src = src
      video.currentTime = 0
      video.play().catch(() => {})
      video.classList.add('is-active')
      this._currentVideo = video
    },

    onLeave(e) {
      this.hoveredId = null
      const video = e.currentTarget.querySelector('.AllWork_row_video')
      if (!video) return
      video.pause()
      video.classList.remove('is-active')
      this._currentVideo = null
    },

    openProject(project) {
      this.setProjectData(project)
      this.setId(project.id)
      this.setActive(true)
    },

    _animateIn() {
      const rows = this.$el.querySelectorAll('.AllWork_row')
      gsap.from(rows, {
        opacity: 0,
        y: 24,
        duration: 0.55,
        stagger: 0.04,
        ease: 'power2.out',
        clearProps: 'all'
      })
    },

    _onWheel(e) {
      e.preventDefault()
      const maxY = Math.max(0, document.body.scrollHeight - window.innerHeight)
      this._targetY = Math.max(0, Math.min(this._targetY + e.deltaY, maxY))
      gsap.to(window, {
        scrollTo: { y: this._targetY, autoKill: false },
        duration: 1,
        ease: 'power3.out',
        overwrite: 'auto'
      })
    },

    _onScroll() {
      // Sync target quand scroll vient du clavier ou touch
      if (Math.abs(window.scrollY - this._targetY) > 80) {
        this._targetY = window.scrollY
      }
      const inner = this.$refs.inner
      if (!inner) return
      const { bottom } = inner.getBoundingClientRect()
      if (bottom < window.innerHeight * 1.5) this._loadMore()
    }
  }
}
</script>

<style lang="sass" scoped>
.AllWork
  min-height: 100vh
  background: #0a0a0a
  padding-top: 9rem
  padding-bottom: 12rem

  +breakpoint(mobile)
    padding-top: 8rem
    padding-bottom: 8rem

  &_inner
    padding: 0 4vw

  // ── En-tête colonnes ──────────────────────────────────────────────────────
  &_head
    display: grid
    grid-template-columns: 3.5rem 1fr 20rem 16rem 12rem
    align-items: center
    padding-bottom: 1.2rem
    border-bottom: 1px solid rgba(255,255,255,0.1)
    font-family: $apfel
    font-size: 0.7rem
    letter-spacing: 0.1em
    text-transform: uppercase
    color: rgba(255,255,255,0.2)

    +breakpoint(mobile)
      display: none

  // ── Loading ───────────────────────────────────────────────────────────────
  &_loading
    padding: 3rem 0
    display: flex
    justify-content: center

    span
      width: 1.5rem
      height: 1.5rem
      border: 1px solid rgba(255,255,255,0.15)
      border-top-color: rgba(255,255,255,0.5)
      border-radius: 50%
      animation: spin 0.8s linear infinite

// ── Ligne projet ──────────────────────────────────────────────────────────
.AllWork_row
  display: grid
  grid-template-columns: 3.5rem 1fr 20rem 16rem 12rem
  align-items: center
  padding: 1.6rem 0
  border-bottom: 1px solid rgba(255,255,255,0.06)
  cursor: pointer
  transition: background 0.25s ease

  +breakpoint(mobile)
    grid-template-columns: 2.5rem 1fr 10rem
    padding: 1.4rem 0

  &:hover,
  &.is-hovered
    background: rgba(255,255,255,0.03)

  // Numéro
  &_num
    font-family: $apfel
    font-weight: 400
    font-size: 0.75rem
    letter-spacing: 0.05em
    color: rgba(255,255,255,0.2)
    align-self: flex-start
    padding-top: 0.5rem

  // Info (client + titre)
  &_info
    display: flex
    flex-direction: column
    gap: 0.4rem
    padding-right: 3rem

    +breakpoint(mobile)
      padding-right: 1rem

  &_client
    font-family: $apfel
    font-weight: 900
    font-size: clamp(1.8rem, 3.2vw, 4.2rem)
    line-height: 0.88
    text-transform: uppercase
    color: $white
    transition: color 0.2s ease
    letter-spacing: -0.01em

  &_title
    font-family: $apfel
    font-weight: 400
    font-size: clamp(0.65rem, 0.75vw, 0.85rem)
    letter-spacing: 0.1em
    text-transform: uppercase
    color: rgba(255,255,255,0.3)

  // Média (thumbnail + vidéo)
  &_media
    position: relative
    width: 100%
    aspect-ratio: 16 / 9
    overflow: hidden
    background: #111
    border-radius: 2px

    +breakpoint(mobile)
      display: none

  &_thumb
    position: absolute
    inset: 0
    width: 100%
    height: 100%
    object-fit: cover
    display: block
    transition: opacity 0.35s ease

  .AllWork_row:hover &_thumb,
  .AllWork_row.is-hovered &_thumb
    opacity: 0.15

  &_video
    position: absolute
    inset: 0
    width: 100%
    height: 100%
    object-fit: cover
    opacity: 0
    transition: opacity 0.35s ease

    &.is-active
      opacity: 1

  // Catégorie
  &_cat
    font-family: $apfel
    font-weight: 400
    font-size: 0.72rem
    letter-spacing: 0.08em
    text-transform: uppercase
    color: rgba(255,255,255,0.3)
    padding-left: 2rem
    transition: color 0.2s ease

    +breakpoint(mobile)
      display: none

  .AllWork_row:hover &_cat
    color: rgba(255,255,255,0.55)

  // Type
  &_type
    font-family: $apfel
    font-weight: 400
    font-size: 0.72rem
    letter-spacing: 0.08em
    text-transform: uppercase
    color: rgba(255,255,255,0.3)
    text-align: right
    transition: color 0.2s ease

    +breakpoint(mobile)
      display: none

  .AllWork_row:hover &_type
    color: rgba(255,255,255,0.55)

@keyframes spin
  to
    transform: rotate(360deg)
</style>
