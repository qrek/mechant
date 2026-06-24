<template>
  <section class="HomePage">

    <!-- H1 caché visuellement mais lu par les bots/screen readers (SEO + a11y) -->
    <h1 class="HomePage_h1 sr-only">MÉCHANT — Post-production video studio in Paris, France</h1>

    <!-- Fond vidéo / image full-screen -->
    <div class="HomePage_bg" ref="bg">
      <transition name="bg-fade">
        <div class="HomePage_bg_media" :key="currentProject && currentProject.id">
          <video
            v-if="currentVideoUrl"
            :src="currentVideoUrl"
            :poster="currentImageUrl"
            autoplay
            muted
            loop
            playsinline
            class="HomePage_bg_video"
            :aria-label="currentProject ? `Showreel: ${currentProject.client || currentProject.title}` : 'Showreel'"
          />
          <img
            v-else-if="currentImageUrl"
            :src="currentImageUrl"
            :alt="currentProject ? `${currentProject.client || currentProject.title} — Méchant post-production` : 'Méchant showreel'"
            class="HomePage_bg_img"
          />
        </div>
      </transition>

      <div class="HomePage_bg_gradient" />

      <!-- Zone cliquable sur toute la vidéo -->
      <div class="HomePage_clickZone" @mouseenter="preloadProject" @click="openProject" />
    </div>

    <!-- Tagline mot par mot -->
    <p class="HomePage_tagline" ref="tagline">
      <span v-for="(word, i) in taglineWords" :key="i" class="HomePage_tagline_word">{{ word }}</span>
    </p>

    <!-- Logo coupé en bas (monte au scroll) -->
    <div class="HomePage_logo" ref="logo" aria-hidden="true">
      <img src="~assets/images/MECHANT_TRANSPARENT.png" alt="" />
    </div>

    <!-- Overlay orange qui se révèle au scroll → continuité avec la page Works -->
    <div class="HomePage_orange" ref="overlay" aria-hidden="true" />

    <!-- Indice de scroll vers Works -->
    <div class="HomePage_scrollHint" ref="hint">
      <span>Works</span>
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <polyline points="5,12 12,19 19,12"/>
      </svg>
    </div>

  </section>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { gsap } from '@/vendor/gsap'

export default {
  name: 'HomePage',

  head() {
    const title = 'MÉCHANT — Post-production video studio in Paris, France'
    const desc = 'Méchant is a creative post-production video studio in Paris. We craft VFX, editing, 3D & 2D animation and motion design for commercials and music videos.'
    return {
      title,
      meta: [
        { hid: 'description', name: 'description', content: desc },
        { hid: 'og:title', property: 'og:title', content: title },
        { hid: 'og:description', property: 'og:description', content: desc },
        { hid: 'og:url', property: 'og:url', content: 'https://mechant.tv/' },
        { hid: 'twitter:title', name: 'twitter:title', content: title },
        { hid: 'twitter:description', name: 'twitter:description', content: desc }
      ],
      link: [
        { hid: 'canonical', rel: 'canonical', href: 'https://mechant.tv/' }
      ]
    }
  },

  data() {
    return {
      currentIndex: 0,
      _autoPlayTimer: null,
    }
  },

  computed: {
    ...mapGetters({
      data: 'data/getData',
      isMobile: 'layout/isMobile'
    }),
    taglineWords() {
      return 'Paris-based post-production studio specializing in visual effects and editing for commercials, feature films and music videos.'.split(' ')
    },
    projects() {
      return Object.values(this.data?.heroProjects || {})
    },
    currentProject() {
      return this.projects[this.currentIndex] || null
    },
    currentVideoUrl() {
      if (!this.currentProject) return null
      if (this.isMobile) return this.currentProject.video_home_mobile || this.currentProject.preview_video || null
      return this.currentProject.video_home || this.currentProject.preview_video || null
    },
    currentImageUrl() {
      if (!this.currentProject) return null
      return this.currentProject.poster || this.currentProject.thumbnail_url || null
    }
  },

  mounted() {
    this._startAutoPlay()
    this._animateIn()
    this.$nextTick(() => this._initScrollToWorks())
  },

  beforeDestroy() {
    this._stopAutoPlay()
    this._destroyScrollToWorks()
  },

  methods: {
    ...mapActions({
      setActive: 'project/setActive',
      setId: 'project/setId'
    }),

    _animateIn() {
      const words = this.$refs.tagline && this.$refs.tagline.querySelectorAll('.HomePage_tagline_word')
      if (!words || !words.length) return
      gsap.from(words, {
        opacity: 0,
        y: 18,
        duration: 0.55,
        stagger: 0.045,
        ease: 'power3.out',
        delay: 0.4,
        clearProps: 'all'
      })
    },

    preloadProject() {
      if (this.currentProject) this.setId(this.currentProject.id)
    },

    openProject() {
      if (!this.currentProject) return
      if (this.currentProject.has_case_study && this.currentProject.slug) {
        this.$router.push(`/works/${this.currentProject.slug}`)
        return
      }
      this.setId(this.currentProject.id)
      this.setActive(true)
    },

    _startAutoPlay() {
      if (this.projects.length <= 1) return
      this._autoPlayTimer = setTimeout(() => {
        this.currentIndex = (this.currentIndex + 1) % this.projects.length
        this._startAutoPlay()
      }, 8000)
    },

    _stopAutoPlay() {
      if (this._autoPlayTimer) {
        clearTimeout(this._autoPlayTimer)
        this._autoPlayTimer = null
      }
    },

    // ── Scroll → animation → page Works ──────────────────────────────────
    // La home est fixe (pas de scroll natif). On capte molette/tactile, on
    // accumule un "progress" 0→1 qui scrube une timeline (logo qui monte,
    // fond qui bascule vers l'orange Works), et à 1 on navigue vers /works.
    _initScrollToWorks() {
      const { logo, bg, tagline, overlay, hint } = this.$refs
      if (!logo || !bg || !overlay) return

      this._progress = 0
      this._navigating = false

      const tl = gsap.timeline({ paused: true })
      tl.to(bg, { scale: 1.14, ease: 'none' }, 0)
      tl.to(overlay, { autoAlpha: 1, ease: 'none' }, 0)
      tl.fromTo(logo, { yPercent: 0, scale: 1 }, { yPercent: -34, scale: 0.5, ease: 'none' }, 0)
      if (tagline) tl.to(tagline, { autoAlpha: 0, y: -24, ease: 'none' }, 0)
      if (hint) tl.to(hint, { autoAlpha: 0, ease: 'none' }, 0)
      this._scrollTl = tl

      this._onWheel = (e) => {
        if (e.deltaY === 0) return
        e.preventDefault()
        this._addProgress(e.deltaY * 0.0011)
      }
      this._onTouchStart = (e) => { this._touchY = e.touches[0].clientY }
      this._onTouchMove = (e) => {
        const y = e.touches[0].clientY
        const d = (this._touchY - y) * 0.004
        this._touchY = y
        if (d > 0 || this._progress > 0) { e.preventDefault(); this._addProgress(d) }
      }
      const el = this.$el
      el.addEventListener('wheel', this._onWheel, { passive: false })
      el.addEventListener('touchstart', this._onTouchStart, { passive: false })
      el.addEventListener('touchmove', this._onTouchMove, { passive: false })
    },

    _addProgress(d) {
      if (this._navigating) return
      this._progress = Math.min(1, Math.max(0, this._progress + d))
      gsap.to(this._scrollTl, { progress: this._progress, duration: 0.5, ease: 'power2.out', overwrite: true })
      if (this._progress >= 0.999) this._goToWorks()
    },

    _goToWorks() {
      if (this._navigating) return
      this._navigating = true
      // Laisse l'orange finir de couvrir avant de naviguer (continuité couleur)
      gsap.to(this._scrollTl, {
        progress: 1, duration: 0.35, ease: 'power2.inOut',
        onComplete: () => this.$router.push('/works')
      })
    },

    _destroyScrollToWorks() {
      const el = this.$el
      if (this._onWheel) el.removeEventListener('wheel', this._onWheel)
      if (this._onTouchStart) el.removeEventListener('touchstart', this._onTouchStart)
      if (this._onTouchMove) el.removeEventListener('touchmove', this._onTouchMove)
      if (this._scrollTl) this._scrollTl.kill()
    }
  }
}
</script>

<style lang="sass" scoped>
.HomePage
  position: fixed
  inset: 0
  width: 100%
  height: 100%
  overflow: hidden

  // ---------- Fond vidéo ----------
  &_bg
    position: absolute
    inset: 0

    &_media
      position: absolute
      inset: 0

    &_video,
    &_img
      position: absolute
      inset: 0
      width: 100%
      height: 100%
      object-fit: cover

    &_gradient
      position: absolute
      inset: 0
      background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 40%, transparent 70%)
      pointer-events: none

  &_clickZone
    position: absolute
    inset: 0
    z-index: 1
    cursor: pointer

  // ---------- Tagline ----------
  &_tagline
    position: absolute
    right: 8rem
    top: 57%
    transform: translateY(-50%)
    max-width: 39rem
    font-family: $apfel
    font-weight: 400
    font-size: 1.4rem
    line-height: 1.3
    color: $white
    z-index: 2
    pointer-events: none

    +breakpoint(mobile)
      display: none

    &_word
      display: inline-block
      margin-right: 0.3em

  // ---------- Logo coupé ----------
  &_logo
    position: absolute
    bottom: -14vw
    left: 48%
    transform: translateX(-50%)
    width: 99vw
    pointer-events: none
    z-index: 3
    user-select: none
    opacity: 0.8

    img
      display: block
      width: 100%
      height: auto

  // ---------- Overlay orange (révélé au scroll → continuité Works) ----------
  &_orange
    position: absolute
    inset: 0
    background: #ff4500
    z-index: 2
    opacity: 0
    pointer-events: none

  // ---------- Indice de scroll vers Works ----------
  &_scrollHint
    position: absolute
    bottom: 1.6rem
    left: 50%
    transform: translateX(-50%)
    z-index: 4
    display: flex
    flex-direction: column
    align-items: center
    gap: 0.4rem
    font-family: $apfel
    font-size: 0.7rem
    letter-spacing: 0.22em
    text-transform: uppercase
    color: rgba(255, 255, 255, 0.85)
    pointer-events: none
    text-shadow: 0 1px 10px rgba(0, 0, 0, 0.35)

    svg
      animation: homeScrollBounce 2s ease-in-out infinite

@keyframes homeScrollBounce
  0%, 100%
    transform: translateY(0)
  50%
    transform: translateY(4px)

// ---------- Transitions fond ----------
.bg-fade-enter-active,
.bg-fade-leave-active
  transition: opacity 1s ease

.bg-fade-enter,
.bg-fade-leave-to
  opacity: 0
</style>
