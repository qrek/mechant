<template>
  <section class="AllWork">

    <!-- Fond vidéo plein écran au hover -->
    <div class="AllWork_bg" :class="{ 'is-visible': hoveredId }">
      <video ref="bgVideo" muted loop playsinline preload="none" class="AllWork_bg_video" />
      <div class="AllWork_bg_overlay" />
    </div>

    <div class="AllWork_inner" :class="{ 'has-hover': hoveredId }" ref="inner">

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
        v-for="(project, i) in displayProjects"
        :key="`${i}-${project.id}`"
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

    <SimpleFooter />
  </section>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { gsap } from '@/vendor/gsap'
import { supabase } from '@/utils/supabase'
import SimpleFooter from '@/components/SimpleFooter'

export default {
  name: 'WorksAll',
  components: { SimpleFooter },

  head() {
    return {
      title: 'All Work — Méchant',
      meta: [{ hid: 'description', name: 'description', content: '' }]
    }
  },

  data() {
    return {
      projects: [],
      displayProjects: [],
      isLoading: false,
      hoveredId: null
    }
  },

  computed: {
    ...mapGetters({ data: 'data/getData' })
  },

  async mounted() {
    this.__currentVideo = null
    this.__bgSrc = null
    this.__bgTimer = null

    await this._fetchProjects()
    await this.$nextTick()
    this._animateIn()
  },

  beforeDestroy() {
    clearTimeout(this.__bgTimer)
  },

  methods: {
    ...mapActions({
      setActive: 'project/setActive',
      setId: 'project/setId',
      setProjectData: 'project/setData'
    }),

    async _fetchProjects() {
      this.isLoading = true
      // Charge tous les projets d'un coup (pas de pagination)
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('published', true)
        .order('order_index', { ascending: false })
      this.projects = data || []
      this.displayProjects = [...this.projects]
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
      clearTimeout(this.__bgTimer)

      // Vidéo par ligne
      const rowVideo = e.currentTarget.querySelector('.AllWork_row_video')
      if (rowVideo) {
        const src = rowVideo.dataset.src
        if (src) {
          if (this.__currentVideo && this.__currentVideo !== rowVideo) {
            this.__currentVideo.pause()
            this.__currentVideo.classList.remove('is-active')
          }
          if (!rowVideo.src) rowVideo.src = src
          rowVideo.currentTime = 0
          rowVideo.play().catch(() => {})
          rowVideo.classList.add('is-active')
          this.__currentVideo = rowVideo
        }
      }

      // Vidéo fond plein écran
      const url = project.preview_video || project.video_home || null
      const bgVideo = this.$refs.bgVideo
      if (bgVideo && url) {
        if (this.__bgSrc !== url) {
          this.__bgSrc = url
          bgVideo.src = url
        }
        bgVideo.currentTime = 0
        bgVideo.play().catch(() => {})
      }
    },

    onLeave(e) {
      this.hoveredId = null
      const rowVideo = e.currentTarget.querySelector('.AllWork_row_video')
      if (rowVideo) {
        rowVideo.pause()
        rowVideo.classList.remove('is-active')
      }
      this.__currentVideo = null
      this.__bgTimer = setTimeout(() => {
        if (this.$refs.bgVideo) this.$refs.bgVideo.pause()
      }, 400)
    },

    openProject(project) {
      if (project.has_case_study && project.slug) {
        this.$router.push(`/works/${project.slug}`)
        return
      }
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
      background: rgba(0, 0, 0, 0.55)

  &_inner
    position: relative
    z-index: 1
    padding: 0 4vw

  // ── En-tête ───────────────────────────────────────────────────────────────
  &_head
    display: grid
    grid-template-columns: 3.5rem 1fr 18rem 18rem 12rem
    align-items: center
    gap: 0 2rem
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
  grid-template-columns: 3.5rem 1fr 18rem 18rem 12rem
  align-items: center
  gap: 0 2rem
  padding: 1.2rem 0
  border-bottom: 1px solid rgba(255,255,255,0.06)
  cursor: pointer
  transition: opacity 0.3s ease

  +breakpoint(mobile)
    grid-template-columns: 2.5rem 1fr 8rem
    gap: 0 1rem
    padding: 1.2rem 0

  // Effet spotlight : les lignes non-survolées s'estompent
  .AllWork_inner.has-hover &:not(.is-hovered)
    opacity: 0.25

  &_num
    font-family: $apfel
    font-weight: 400
    font-size: 0.75rem
    letter-spacing: 0.05em
    color: rgba(255,255,255,0.25)
    align-self: flex-start
    padding-top: 0.4rem

  &_info
    display: flex
    flex-direction: column
    gap: 0.35rem

  &_client
    font-family: $apfel
    font-weight: 900
    font-size: clamp(1.8rem, 3.2vw, 4.2rem)
    line-height: 0.88
    text-transform: uppercase
    color: $white
    letter-spacing: -0.01em

  &_title
    font-family: $apfel
    font-weight: 400
    font-size: clamp(0.65rem, 0.75vw, 0.85rem)
    letter-spacing: 0.1em
    text-transform: uppercase
    color: rgba(255,255,255,0.3)

  // ── Média ──────────────────────────────────────────────────────────────
  &_media
    position: relative
    width: 100%
    aspect-ratio: 16 / 9
    overflow: hidden
    background: #111
    border-radius: 3px

    +breakpoint(mobile)
      border-radius: 2px

  &_thumb
    position: absolute
    inset: 0
    width: 100%
    height: 100%
    object-fit: cover
    display: block
    transition: opacity 0.35s ease

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

  .AllWork_row.is-hovered &_thumb
    opacity: 0

  &_cat
    font-family: $apfel
    font-weight: 400
    font-size: 0.72rem
    letter-spacing: 0.08em
    text-transform: uppercase
    color: rgba(255,255,255,0.35)

    +breakpoint(mobile)
      display: none

  &_type
    font-family: $apfel
    font-weight: 400
    font-size: 0.72rem
    letter-spacing: 0.08em
    text-transform: uppercase
    color: rgba(255,255,255,0.35)

    +breakpoint(mobile)
      display: none

@keyframes spin
  to
    transform: rotate(360deg)
</style>
