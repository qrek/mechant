<template>
  <section class="WorksPage" @mousemove="onMouseMove">

    <!-- Fond orange : deux moitiés qui se rejoignent au centre -->
    <div class="WorksPage_bg">
      <div class="WorksPage_bg_half WorksPage_bg_half--left" ref="bgLeft" />
      <div class="WorksPage_bg_half WorksPage_bg_half--right" ref="bgRight" />
    </div>

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
        ref="items"
        @mouseenter="onHover(project)"
        @mouseleave="onLeave"
        @click="openProject(project)"
      >
        <span class="WorksPage_item_title">{{ project.client || getCategoryLabel(project) }}</span>
        <span class="WorksPage_item_label">{{ getWorkTypes(project) }}</span>
      </button>

      <NuxtLink to="/works/all" class="WorksPage_item WorksPage_item--allwork" ref="allWork" @mouseleave.native="onLeave">
        <span class="WorksPage_item_title">All Work</span>
      </NuxtLink>
    </div>

  </section>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { gsap } from '@/vendor/gsap'
import { SplitText } from '@/vendor/gsap/SplitText'
import { supabase } from '@/utils/supabase'

gsap.registerPlugin(SplitText)

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
      featuredProjects: [],
      _hideTimer: null,
      _currentSrc: null,
      _preloadCache: {}
    }
  },

  computed: {
    ...mapGetters({ data: 'data/getData' })
  },

  async mounted() {
    // Cache les items dès le mount pour éviter le flash avant SplitText
    this._setItemsHidden()
    // Lance le rideau orange + le fetch en parallèle
    await Promise.all([
      this._curtainArrive(),
      this._fetchFeaturedProjects()
    ])
    await this.$nextTick()
    this._preloadVideos()
    this._animateIn()
  },

  beforeDestroy() {
    clearTimeout(this._hideTimer)
    Object.values(this._preloadCache).forEach(v => { v.src = ''; v.load() })
    this._preloadCache = {}
    if (this._splits) {
      this._splits.forEach(s => { try { s.revert() } catch (_) {} })
    }
  },

  methods: {
    ...mapActions({
      setActive: 'project/setActive',
      setId: 'project/setId',
      setProjectData: 'project/setData'
    }),

    async _fetchFeaturedProjects() {
      // Fetch direct Supabase — pas de cache store
      let { data: featured } = await supabase
        .from('projects')
        .select('*')
        .eq('published', true)
        .eq('is_featured', true)
        .order('order_index', { ascending: false })

      if (!featured || !featured.length) {
        // Fallback : tous les projets publiés
        const { data: all } = await supabase
          .from('projects')
          .select('*')
          .eq('published', true)
          .order('order_index', { ascending: false })
          .limit(20)
        featured = all || []
      }

      this.featuredProjects = featured
    },

    getCategoryLabel(project) {
      const cats = project.categories
      if (!cats || !cats.length) return ''
      return this.data?.categories?.[cats[0]]?.title || ''
    },

    getWorkTypes(project) {
      const types = project.work_types
      if (!types || !types.length) return ''
      return types.join('/')
    },

    _setItemsHidden() {
      // Cache l'ensemble des items via une classe avant que SplitText ne tourne
      const cloud = this.$refs.list
      if (cloud) cloud.classList.add('is-pre-reveal')
    },

    _curtainArrive() {
      return new Promise(resolve => {
        const left = this.$refs.bgLeft
        const right = this.$refs.bgRight
        if (!left || !right) return resolve()
        gsap.set(left, { xPercent: -100 })
        gsap.set(right, { xPercent: 100 })
        gsap.to([left, right], {
          xPercent: 0,
          duration: 0.8,
          ease: 'power3.inOut',
          onComplete: resolve
        })
      })
    },

    _animateIn() {
      const itemEls = this._getAllItemEls()
      if (!itemEls.length) return

      // SplitText sur le titre de chaque item
      this._splits = []
      itemEls.forEach(item => {
        const title = item.querySelector('.WorksPage_item_title')
        if (!title) return
        try {
          const split = new SplitText(title, {
            type: 'chars,words',
            charsClass: 'WorksPage_char',
            wordsClass: 'WorksPage_word'
          })
          this._splits.push(split)
        } catch (_) {}
      })

      // État initial : chars en bas + invisibles, labels invisibles
      const allChars = this._splits.flatMap(s => s.chars || [])
      const labels = itemEls.map(el => el.querySelector('.WorksPage_item_label')).filter(Boolean)
      if (allChars.length) gsap.set(allChars, { yPercent: 110, opacity: 0, rotate: 4 })
      if (labels.length) gsap.set(labels, { opacity: 0, y: 12 })

      // Retire la classe is-pre-reveal pour que les items soient visibles
      const cloud = this.$refs.list
      if (cloud) cloud.classList.remove('is-pre-reveal')

      // Timeline d'entrée
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      itemEls.forEach((item, idx) => {
        const split = this._splits[idx]
        const chars = split && split.chars
        const label = item.querySelector('.WorksPage_item_label')
        const itemDelay = idx * 0.18

        if (chars && chars.length) {
          tl.to(chars, {
            yPercent: 0,
            opacity: 1,
            rotate: 0,
            duration: 0.6,
            stagger: 0.022,
            ease: 'power3.out'
          }, itemDelay)
        }

        if (label) {
          tl.to(label, {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out'
          }, itemDelay + 0.15)
        }
      })
    },

    _getAllItemEls() {
      const items = (this.$refs.items || []).slice()
      const allWork = this.$refs.allWork && this.$refs.allWork.$el
      if (allWork) items.push(allWork)
      return items
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
      if (project.has_case_study && project.slug) {
        this.$router.push(`/works/${project.slug}`)
        return
      }
      this.setProjectData(project)
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
  background: #000
  display: flex
  align-items: center
  justify-content: center
  padding: 12rem 5vw 8rem

  +breakpoint(mobile)
    padding: 11rem 5vw 6rem
    align-items: flex-start

  // ---------- Fond orange : deux moitiés qui se rejoignent ----------
  &_bg
    position: fixed
    inset: 0
    z-index: 0
    pointer-events: none

    &_half
      position: absolute
      top: 0
      bottom: 0
      width: 50.5vw
      background: #f2492c
      will-change: transform

      &--left
        left: 0
        transform: translate3d(-100%, 0, 0)

      &--right
        right: 0
        transform: translate3d(100%, 0, 0)

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

    // Cache les items le temps que SplitText soit appliqué
    &.is-pre-reveal
      visibility: hidden

// Chaque projet
.WorksPage_item
  display: inline-flex
  align-items: flex-end
  gap: 0.4em
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
      color: rgba(255,255,255,0.6)

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
    font-weight: 700
    font-size: clamp(1rem, 0.6vw, 1.3rem)
    letter-spacing: 0.08em
    text-transform: uppercase
    color: rgba(0,0,0,0.45)
    transition: color 0.25s ease
    display: block
    padding-bottom: 0.2em
    line-height: 1.2

// Wrappers SplitText : chars qui montent depuis le bas (clippés au mot)
.WorksPage_word
  display: inline-block
  overflow: hidden
  vertical-align: bottom

.WorksPage_char
  display: inline-block
  will-change: transform, opacity
</style>
