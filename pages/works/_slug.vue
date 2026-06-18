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
          :alt="`${project.client || project.title} — Méchant post-production`"
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

      <!-- Paragraphes — texte normal, seuls les @pseudo en gras + lien Insta -->
      <div class="CaseStudy_text" v-if="project.case_study_intro || project.case_study_body">
        <p v-if="project.case_study_intro" class="CaseStudy_text_intro" v-html="linkifyMentions(project.case_study_intro)"></p>
        <p v-if="project.case_study_body" class="CaseStudy_text_body" v-html="linkifyMentions(project.case_study_body)"></p>
      </div>

      <!-- Vidéos supplémentaires — grille adaptative + play à la demande -->
      <div
        v-if="extraVideos.length"
        class="CaseStudy_extras"
        :class="`is-count-${extraVideos.length}`"
        ref="extras"
      >
        <div
          v-for="(video, i) in extraVideos"
          :key="`${i}-${video.vimeo_id}`"
          class="CaseStudy_extras_item"
        >
          <div class="CaseStudy_extras_frame" :data-idx="i">
            <!-- Mode background Vimeo : autoplay, muet, boucle, aucun contrôle.
                 Chargé en avance via IntersectionObserver (rootMargin) → déjà
                 en lecture quand la vidéo arrive à l'écran, pas de pause. -->
            <iframe
              v-if="loaded[i]"
              :src="`https://player.vimeo.com/video/${video.vimeo_id}?background=1&autoplay=1&loop=1&muted=1&dnt=1`"
              frameborder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowfullscreen
            ></iframe>
            <div
              v-else
              class="CaseStudy_extras_holder"
              :style="video.thumbnail_url ? { backgroundImage: `url(${video.thumbnail_url})` } : null"
            ></div>
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
import { trackCaseStudyView, trackCaseStudyVideoPlay } from '@/utils/track'

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
      loaded: {},   // { [index]: true } : vidéos extra dont l'iframe est montée
      _player: null
    }
  },

  head() {
    const p = this.project
    if (!p) return { title: 'Méchant — Post-production Paris' }
    const clientPart = p.client ? `${p.client} — ` : ''
    const title = `${clientPart}${p.title} — Méchant post-production Paris`
    const desc = p.description || `${p.title}, case study by Méchant, post-production video studio in Paris.`
    const url = `https://mechant.tv/works/${p.slug || ''}`
    const og = p.thumbnail_url || p.poster || 'https://mechant.tv/mechantshare.png'
    // JSON-LD CreativeWork pour rich results sur Google
    const ldjson = {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: p.title,
      headline: title,
      description: desc,
      image: og,
      url,
      author: { '@type': 'Organization', name: 'MÉCHANT', url: 'https://mechant.tv' },
      creator: { '@type': 'Organization', name: 'MÉCHANT', url: 'https://mechant.tv' },
      producer: p.client ? { '@type': 'Organization', name: p.client } : undefined
    }
    return {
      title,
      meta: [
        { hid: 'description', name: 'description', content: desc },
        { hid: 'og:title', property: 'og:title', content: title },
        { hid: 'og:description', property: 'og:description', content: desc },
        { hid: 'og:url', property: 'og:url', content: url },
        { hid: 'og:image', property: 'og:image', content: og },
        { hid: 'og:type', property: 'og:type', content: 'article' },
        { hid: 'twitter:title', name: 'twitter:title', content: title },
        { hid: 'twitter:description', name: 'twitter:description', content: desc },
        { hid: 'twitter:image', name: 'twitter:image', content: og }
      ],
      link: [{ hid: 'canonical', rel: 'canonical', href: url }],
      script: [{
        hid: 'ldjson-project',
        type: 'application/ld+json',
        innerHTML: JSON.stringify(ldjson)
      }],
      __dangerouslyDisableSanitizersByTagID: {
        'ldjson-project': ['innerHTML']
      }
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
    trackCaseStudyView(this.project)
    this._initMainPlayer()
    this.$nextTick(() => this._initLazyVideos())
  },

  beforeDestroy() {
    if (this._player) {
      try { this._player.destroy() } catch (_) {}
      this._player = null
    }
    if (this._io) {
      this._io.disconnect()
      this._io = null
    }
  },

  methods: {
    // Transforme les @pseudo en liens Instagram en gras (même logique que
    // la bulle info des vidéos plein écran). Le reste du texte reste normal.
    linkifyMentions (text) {
      if (!text) return ''
      // Échappe le HTML pour éviter toute injection, puis linkifie les @pseudo
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      return escaped.replace(
        /@(\w+)/g,
        '<a class="mention" href="https://instagram.com/$1" target="_blank" rel="noopener noreferrer">@$1</a>'
      )
    },

    // Charge chaque vidéo extra EN AVANCE (rootMargin 600px) → elle a le
    // temps de buffer avant d'être visible, donc aucune pause perçue.
    _initLazyVideos() {
      if (!this.extraVideos.length || typeof window === 'undefined') return
      const root = this.$refs.extras
      if (!root) return

      // Fallback : pas d'IntersectionObserver → on charge tout direct
      if (!('IntersectionObserver' in window)) {
        this.extraVideos.forEach((_, i) => this.$set(this.loaded, i, true))
        return
      }

      this._io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.dataset.idx, 10)
            this.$set(this.loaded, idx, true)
            this._io.unobserve(entry.target)
          }
        })
      }, {
        root: null,
        rootMargin: '600px 0px',  // déclenche ~1 écran avant l'entrée en vue
        threshold: 0
      })

      root.querySelectorAll('.CaseStudy_extras_frame').forEach((el) => {
        this._io.observe(el)
      })
    },

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

      // Track video play (une fois par session de view)
      let played = false
      this._player.on('play', () => {
        if (played) return
        played = true
        trackCaseStudyVideoPlay(this.project, this.project.vimeo_id)
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
    max-width: 1840px
    margin: 0 auto
    padding: 0 2.5vw
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
      font-weight: 400          // les deux paragraphes en normal
      font-size: clamp(1rem, 1.25vw, 1.35rem)
      line-height: 1.55
      color: rgba(255,255,255,0.78)
      margin: 0
      white-space: pre-line

      // Seuls les @pseudo sont en gras + lien Instagram
      ::v-deep .mention
        font-weight: 700
        color: $white
        text-decoration: none
        transition: opacity 0.2s ease

        &:hover
          opacity: 0.6

  // ── Vidéos supplémentaires : grille adaptative ───────────────────────
  &_extras
    display: grid
    gap: 2rem
    // Défaut : 1 colonne (1 vidéo, ou fallback)
    grid-template-columns: 1fr

    // 2 vidéos → 2 colonnes (1 ligne)
    &.is-count-2
      grid-template-columns: repeat(2, 1fr)

    // 3 vidéos → 3 colonnes (1 ligne)
    &.is-count-3
      grid-template-columns: repeat(3, 1fr)

    // 4 vidéos → 2 colonnes (2 lignes)
    &.is-count-4
      grid-template-columns: repeat(2, 1fr)

    // 5+ vidéos → 3 colonnes, bien ordonnées
    &.is-count-5,
    &.is-count-6,
    &.is-count-7,
    &.is-count-8
      grid-template-columns: repeat(3, 1fr)

    // Tablette : max 2 colonnes (3 vidéos côte à côte = trop petit)
    +breakpoint(tabletDown)
      grid-template-columns: repeat(2, 1fr) !important
      gap: 1.5rem

    // Mobile : tout en 1 colonne, ordonné verticalement
    +breakpoint(mobile)
      grid-template-columns: 1fr !important
      gap: 1.5rem

    &_item
      display: flex
      flex-direction: column
      gap: 0.8rem

    &_frame
      position: relative
      width: 100%
      aspect-ratio: 4 / 3   // vidéos 1440×1080
      border-radius: 10px
      overflow: hidden
      background: #050505
      box-shadow: 0 20px 60px rgba(0,0,0,0.4)

      iframe
        position: absolute
        inset: 0
        width: 100%
        height: 100%
        border: 0

    // Placeholder avant chargement (poster ou fond sombre) — pas de flash
    &_holder
      position: absolute
      inset: 0
      width: 100%
      height: 100%
      background-color: #050505
      background-size: cover
      background-position: center

    &_title
      font-family: $apfel
      font-size: 0.8rem
      letter-spacing: 0.08em
      text-transform: uppercase
      color: rgba(255,255,255,0.5)
      margin: 0
</style>
