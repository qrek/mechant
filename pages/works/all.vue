<template>
  <section class="AllWork">
    <div class="AllWork_grid" ref="grid">
      <div
        v-for="project in projectsData"
        :key="project.id"
        class="AllWork_card"
        @mouseenter="(e) => onCardEnter(e, project)"
        @mouseleave="onCardLeave"
        @click="openProject(project)"
      >
        <div class="AllWork_card_media">
          <img
            v-if="project.thumbnail_url || project.poster"
            :src="project.thumbnail_url || project.poster"
            :alt="project.title"
            class="AllWork_card_thumb"
          />
          <div v-else class="AllWork_card_placeholder" />
          <video
            v-if="project.preview_video || project.video_home"
            :data-src="project.preview_video || project.video_home"
            muted
            loop
            playsinline
            preload="none"
            class="AllWork_card_video"
          />
        </div>
        <div class="AllWork_card_info">
          <p class="AllWork_card_client">{{ project.client || getCategoryLabel(project) }}</p>
          <h3 class="AllWork_card_title">{{ project.title }}</h3>
        </div>
      </div>
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
      isLoading: false
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
  },

  beforeDestroy() {
    window.removeEventListener('scroll', this._onScroll)
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

    onCardEnter(e, project) {
      this.setId(project.id)
      const video = e.currentTarget.querySelector('.AllWork_card_video')
      if (!video) return
      if (!video.src && video.dataset.src) video.src = video.dataset.src
      video.play().catch(() => {})
      video.classList.add('is-playing')
    },

    onCardLeave(e) {
      const video = e.currentTarget.querySelector('.AllWork_card_video')
      if (!video) return
      video.pause()
      video.classList.remove('is-playing')
    },

    openProject(project) {
      this.setId(project.id)
      this.setActive(true)
    },

    async _onScroll() {
      const { grid } = this.$refs
      if (!grid) return
      const { bottom } = grid.getBoundingClientRect()
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
.AllWork
  min-height: 100vh
  background: #0d0d0d
  padding: 12rem 5vw 10rem

  +breakpoint(mobile)
    padding: 11rem 4vw 8rem

  &_grid
    display: grid
    grid-template-columns: repeat(2, 1fr)
    gap: 5rem 3rem

    +breakpoint(mobile)
      grid-template-columns: 1fr
      gap: 4rem

.AllWork_card
  cursor: pointer

  &:hover
    .AllWork_card_media
      .AllWork_card_thumb
        opacity: 0.15

  &_media
    position: relative
    aspect-ratio: 16 / 9
    overflow: hidden
    background: #111

  &_thumb
    position: absolute
    inset: 0
    width: 100%
    height: 100%
    object-fit: cover
    display: block
    transition: opacity 0.35s ease

  &_placeholder
    position: absolute
    inset: 0
    background: #1a1a1a

  &_video
    position: absolute
    inset: 0
    width: 100%
    height: 100%
    object-fit: cover
    opacity: 0
    transition: opacity 0.35s ease

    &.is-playing
      opacity: 1

  &_info
    padding: 1.4rem 0 0
    border-top: 1px solid rgba(255,255,255,0.08)
    margin-top: 1.2rem

  &_client
    font-family: $apfel
    font-weight: 900
    font-size: clamp(1.8rem, 2.5vw, 3.2rem)
    line-height: 0.92
    text-transform: uppercase
    color: $white
    margin: 0

    +breakpoint(mobile)
      font-size: clamp(2rem, 6vw, 3rem)

  &_title
    font-family: $apfel
    font-weight: 400
    font-size: clamp(0.7rem, 0.85vw, 1rem)
    letter-spacing: 0.1em
    text-transform: uppercase
    color: rgba(255,255,255,0.4)
    margin: 0.6rem 0 0
</style>
