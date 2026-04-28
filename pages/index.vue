<template>
  <section class="HomePage">

    <!-- Fond vidéo / image full-screen -->
    <div class="HomePage_bg">
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
          />
          <img
            v-else-if="currentImageUrl"
            :src="currentImageUrl"
            alt=""
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

    <!-- Logo coupé en bas -->
    <div class="HomePage_logo" aria-hidden="true">
      <img src="~assets/images/MECHANT_TRANSPARENT.png" alt="" />
    </div>


  </section>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { gsap } from '@/vendor/gsap'

export default {
  name: 'HomePage',

  head() {
    return {
      title: this.data?.homepage?.meta_title || 'Méchant',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.data?.homepage?.meta_description || ''
        }
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
      if (this.isMobile) return this.currentProject.video_home_mobile || null
      return this.currentProject.video_home || null
    },
    currentImageUrl() {
      if (!this.currentProject) return null
      return this.currentProject.poster || this.currentProject.thumbnail_url || null
    }
  },

  mounted() {
    this._startAutoPlay()
    this._animateIn()
  },

  beforeDestroy() {
    this._stopAutoPlay()
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
    opacity: 0.9

    img
      display: block
      width: 100%
      height: auto

// ---------- Transitions fond ----------
.bg-fade-enter-active,
.bg-fade-leave-active
  transition: opacity 1s ease

.bg-fade-enter,
.bg-fade-leave-to
  opacity: 0
</style>
