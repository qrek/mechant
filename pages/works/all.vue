<template>
  <section class="AllWork">

    <!-- Fond vidéo plein écran au hover -->
    <div class="AllWork_bg" :class="{ 'is-visible': hoveredId }">
      <video ref="bgVideo" muted loop playsinline preload="none" class="AllWork_bg_video" />
      <div class="AllWork_bg_overlay" />
    </div>

    <div class="AllWork_inner" ref="inner">

      <!-- En-tête colonnes -->
      <div class="AllWork_head">
        <span></span>
        <span>Projet</span>
        <span>Catégorie</span>
        <span>Type</span>
      </div>

      <!-- Lignes projets -->
      <div
        v-for="(project, i) in projects"
        :key="project.id"
        class="AllWork_row"
        :class="{ 'is-hovered': hoveredId === project.id }"
        @mouseenter="onHover(project)"
        @mouseleave="onLeave"
        @click="openProject(project)"
      >
        <span class="AllWork_row_num">{{ String(i + 1).padStart(2, '0') }}.</span>

        <div class="AllWork_row_info">
          <span class="AllWork_row_client">{{ project.client || getCategoryLabel(project) }}</span>
          <span class="AllWork_row_title">{{ project.title }}</span>
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
      projects: [],
      isLoading: false,
      hoveredId: null
    }
  },

  computed: {
    ...mapGetters({ data: 'data/getData' })
  },

  async mounted() {
    this.__page = 1
    this.__totalPages = 1
    this.__currentSrc = null
    this.__hideTimer = null

    await this._fetchProjects()
    await this.$nextTick()
    this._animateIn()
    window.addEventListener('scroll', this._onScroll)
  },

  beforeDestroy() {
    window.removeEventListener('scroll', this._onScroll)
    clearTimeout(this.__hideTimer)
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
      this.__totalPages = Math.ceil((count || 0) / 20)
      this.__page = 1
      this.isLoading = false
    },

    async _loadMore() {
      if (this.__page >= this.__totalPages || this.isLoading) return
      this.isLoading = true
      const from = this.__page * 20
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('published', true)
        .order('order_index', { ascending: false })
        .range(from, from + 19)
      if (data?.length) {
        this.projects = [...this.projects, ...data]
        this.__page++
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

    onHover(project) {
      this.hoveredId = project.id
      this.setId(project.id)
      clearTimeout(this.__hideTimer)

      const url = project.preview_video || project.video_home || null
      const video = this.$refs.bgVideo
      if (!video || !url) return

      if (this.__currentSrc !== url) {
        this.__currentSrc = url
        video.src = url
      }
      video.currentTime = 0
      video.play().catch(() => {})
    },

    onLeave() {
      this.hoveredId = null
      this.__hideTimer = setTimeout(() => {
        const video = this.$refs.bgVideo
        if (video) video.pause()
      }, 400)
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

    _onScroll() {
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

  // ── Fond vidéo ────────────────────────────────────────────────────────────
  &_bg
    position: fixed
    inset: 0
    z-index: 0
    opacity: 0
    transition: opacity 0.5s ease
    pointer-events: none

    &.is-visible
      opacity: 1

    &_video
      width: 100%
      height: 100%
      object-fit: cover
      display: block

    &_overlay
      position: absolute
      inset: 0
      background: rgba(0, 0, 0, 0.72)

  // ── Contenu ───────────────────────────────────────────────────────────────
  &_inner
    position: relative
    z-index: 1
    padding: 0 4vw

  // ── En-tête ───────────────────────────────────────────────────────────────
  &_head
    display: grid
    grid-template-columns: 3.5rem 1fr 18rem 12rem
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
  grid-template-columns: 3.5rem 1fr 18rem 12rem
  align-items: center
  padding: 1.4rem 0
  border-bottom: 1px solid rgba(255,255,255,0.06)
  cursor: pointer
  transition: border-color 0.25s ease

  +breakpoint(mobile)
    grid-template-columns: 2.5rem 1fr
    padding: 1.4rem 0

  &:hover,
  &.is-hovered
    border-color: rgba(255,255,255,0.15)

  &_num
    font-family: $apfel
    font-weight: 400
    font-size: 0.75rem
    letter-spacing: 0.05em
    color: rgba(255,255,255,0.2)
    align-self: flex-start
    padding-top: 0.4rem

  &_info
    display: flex
    flex-direction: column
    gap: 0.35rem
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
    letter-spacing: -0.01em
    transition: opacity 0.25s ease

  &_title
    font-family: $apfel
    font-weight: 400
    font-size: clamp(0.65rem, 0.75vw, 0.85rem)
    letter-spacing: 0.1em
    text-transform: uppercase
    color: rgba(255,255,255,0.3)

  &_cat
    font-family: $apfel
    font-weight: 400
    font-size: 0.72rem
    letter-spacing: 0.08em
    text-transform: uppercase
    color: rgba(255,255,255,0.3)
    transition: color 0.25s ease

    +breakpoint(mobile)
      display: none

  &_type
    font-family: $apfel
    font-weight: 400
    font-size: 0.72rem
    letter-spacing: 0.08em
    text-transform: uppercase
    color: rgba(255,255,255,0.3)
    text-align: right
    transition: color 0.25s ease

    +breakpoint(mobile)
      display: none

  &:hover &_cat,
  &.is-hovered &_cat,
  &:hover &_type,
  &.is-hovered &_type
    color: rgba(255,255,255,0.6)

@keyframes spin
  to
    transform: rotate(360deg)
</style>
