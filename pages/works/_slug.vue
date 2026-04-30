<template>
  <section class="CaseStudy" v-if="project">

    <div class="CaseStudy_inner">

      <!-- Titre -->
      <h1 class="CaseStudy_title">{{ project.title }}</h1>
      <p v-if="project.client" class="CaseStudy_subtitle">{{ project.client }}</p>

      <!-- Player principal -->
      <div class="CaseStudy_player">
        <div class="CaseStudy_player_frame" ref="mainFrame"></div>
        <img
          v-if="!mainPlayerReady && project.thumbnail_url"
          :src="project.thumbnail_url"
          alt=""
          class="CaseStudy_player_poster"
        />
      </div>

      <!-- Méta : Client / Catégories / Types -->
      <div class="CaseStudy_meta">
        <div class="CaseStudy_meta_col">
          <span class="CaseStudy_meta_label">Client</span>
          <span class="CaseStudy_meta_value">{{ project.client || '—' }}</span>
        </div>
        <div v-if="project.year" class="CaseStudy_meta_col">
          <span class="CaseStudy_meta_label">Year</span>
          <span class="CaseStudy_meta_value">{{ project.year }}</span>
        </div>
        <div v-if="categoriesLabel" class="CaseStudy_meta_col">
          <span class="CaseStudy_meta_label">Categories</span>
          <span class="CaseStudy_meta_value">{{ categoriesLabel }}</span>
        </div>
        <div v-if="workTypesLabel" class="CaseStudy_meta_col">
          <span class="CaseStudy_meta_label">Work types</span>
          <span class="CaseStudy_meta_value">{{ workTypesLabel }}</span>
        </div>
      </div>

      <!-- Paragraphes -->
      <div class="CaseStudy_text" v-if="project.case_study_intro || project.case_study_body">
        <p v-if="project.case_study_intro" class="CaseStudy_text_intro">{{ project.case_study_intro }}</p>
        <p v-if="project.case_study_body" class="CaseStudy_text_body">{{ project.case_study_body }}</p>
      </div>

      <!-- Vidéos supplémentaires -->
      <div class="CaseStudy_extras" v-if="extraVideos.length">
        <div
          v-for="(video, i) in extraVideos"
          :key="`${i}-${video.vimeo_id}`"
          class="CaseStudy_extras_item"
        >
          <div class="CaseStudy_extras_frame">
            <iframe
              :src="`https://player.vimeo.com/video/${video.vimeo_id}?title=0&byline=0&portrait=0&dnt=1`"
              frameborder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
          <p v-if="video.title" class="CaseStudy_extras_title">{{ video.title }}</p>
        </div>
      </div>

    </div>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import { supabase } from '@/utils/supabase'

export default {
  name: 'CaseStudy',

  async asyncData({ params, error }) {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', params.slug)
      .eq('published', true)
      .eq('has_case_study', true)
      .limit(1)

    const project = data && data[0]
    if (!project) {
      return error({ statusCode: 404, message: 'Projet introuvable' })
    }

    return { project }
  },

  data() {
    return {
      project: null,
      mainPlayerReady: false,
      _player: null
    }
  },

  head() {
    return {
      title: this.project ? `${this.project.title} — Méchant` : 'Méchant',
      meta: [
        { hid: 'description', name: 'description', content: this.project?.description || '' }
      ]
    }
  },

  computed: {
    ...mapGetters({ data: 'data/getData' }),

    extraVideos() {
      const list = this.project?.extra_videos
      return Array.isArray(list) ? list : []
    },

    categoriesLabel() {
      const ids = this.project?.categories || []
      if (!ids.length) return ''
      const dict = this.data?.categories || {}
      return ids.map(id => dict[id]?.title).filter(Boolean).join(' / ')
    },

    workTypesLabel() {
      const types = this.project?.work_types || []
      return types.join(' / ')
    }
  },

  mounted() {
    this._initMainPlayer()
  },

  beforeDestroy() {
    if (this._player) {
      try { this._player.destroy() } catch (_) {}
      this._player = null
    }
  },

  methods: {
    _initMainPlayer() {
      if (!this.project?.vimeo_id || typeof window === 'undefined' || !window.Vimeo) return
      const frame = this.$refs.mainFrame
      if (!frame) return

      this._player = new window.Vimeo.Player(frame, {
        id: this.project.vimeo_id,
        responsive: true,
        controls: true,
        playsinline: true,
        dnt: true,
        title: false,
        byline: false,
        portrait: false
      })

      this._player.ready().then(() => {
        this.mainPlayerReady = true
      })
    }
  }
}
</script>

<style lang="sass" scoped>
.CaseStudy
  position: relative
  min-height: 100vh
  background: #0a0a0a
  color: $white
  padding-top: 8rem
  padding-bottom: 10rem

  +breakpoint(mobile)
    padding-top: 6rem
    padding-bottom: 6rem

  &_inner
    max-width: 1680px
    margin: 0 auto
    padding: 0 4vw
    display: flex
    flex-direction: column
    gap: 4.5rem

    +breakpoint(mobile)
      padding: 0 5vw
      gap: 3rem

  &_title
    font-family: $apfel
    font-weight: 900
    text-transform: uppercase
    font-size: clamp(4rem, 13vw, 14rem)
    line-height: 0.82
    letter-spacing: -0.025em
    color: $orange
    margin: 0

  &_subtitle
    font-family: $apfel
    font-weight: 500
    font-size: clamp(1rem, 1.6vw, 1.7rem)
    letter-spacing: 0.06em
    text-transform: uppercase
    color: rgba(255,255,255,0.55)
    margin: -2.5rem 0 0
    +breakpoint(mobile)
      margin-top: -1rem

  // ── Player principal ──────────────────────────────────────────────────
  &_player
    position: relative
    width: 100%
    aspect-ratio: 16 / 9
    border-radius: 12px
    overflow: hidden
    background: $black
    box-shadow: 0 30px 80px rgba(0,0,0,0.5)

    &_frame
      position: absolute
      inset: 0

      ::v-deep iframe
        width: 100%
        height: 100%

    &_poster
      position: absolute
      inset: 0
      width: 100%
      height: 100%
      object-fit: cover
      pointer-events: none

  // ── Méta ──────────────────────────────────────────────────────────────
  &_meta
    display: grid
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))
    gap: 2rem
    padding: 2rem 0
    border-top: 1px solid rgba(255,255,255,0.08)
    border-bottom: 1px solid rgba(255,255,255,0.08)

    &_col
      display: flex
      flex-direction: column
      gap: 0.5rem

    &_label
      font-family: $apfel
      font-weight: 500
      font-size: 0.75rem
      letter-spacing: 0.12em
      text-transform: uppercase
      color: $orange

    &_value
      font-family: $apfel
      font-size: 1rem
      color: rgba(255,255,255,0.85)
      line-height: 1.4

  // ── Paragraphes ───────────────────────────────────────────────────────
  &_text
    display: grid
    grid-template-columns: 1fr 1fr
    gap: 5rem

    +breakpoint(mobile)
      grid-template-columns: 1fr
      gap: 1.5rem

    p
      font-family: $apfel
      font-size: clamp(1rem, 1.25vw, 1.35rem)
      line-height: 1.55
      color: rgba(255,255,255,0.78)
      margin: 0
      white-space: pre-line

    &_intro
      font-weight: 500
      color: rgba(255,255,255,0.95) !important

  // ── Vidéos supplémentaires ────────────────────────────────────────────
  &_extras
    display: flex
    flex-direction: column
    gap: 3rem

    &_item
      display: flex
      flex-direction: column
      gap: 0.8rem

    &_frame
      position: relative
      width: 100%
      aspect-ratio: 16 / 9
      border-radius: 10px
      overflow: hidden
      background: $black
      box-shadow: 0 20px 60px rgba(0,0,0,0.4)

      iframe
        position: absolute
        inset: 0
        width: 100%
        height: 100%
        border: 0

    &_title
      font-family: $apfel
      font-size: 0.8rem
      letter-spacing: 0.08em
      text-transform: uppercase
      color: rgba(255,255,255,0.5)
      margin: 0
</style>
