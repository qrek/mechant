<template>
  <section class="HomePage">

    <!-- Fond vidéo / image full-screen -->
    <div class="HomePage_bg">
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

      <div class="HomePage_bg_gradient" />

      <!-- Zone cliquable sur toute la vidéo -->
      <div class="HomePage_clickZone" @mouseenter="preloadProject" @click="openProject" />
    </div>

    <!-- Tagline -->
    <p class="HomePage_tagline">Paris-based post-production studio specializing in visual effects and editing for commercials, feature films and music videos.</p>

    <!-- Logo coupé en bas -->
    <div class="HomePage_logo" aria-hidden="true">
      <img src="~assets/images/MECHANT_TRANSPARENT.png" alt="" />
    </div>


  </section>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

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
  },

  beforeDestroy() {
    this._stopAutoPlay()
  },

  methods: {
    ...mapActions({
      setActive: 'project/setActive',
      setId: 'project/setId'
    }),

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
    right: 6rem
    top: 50%
    transform: translateY(-50%)
    max-width: 22rem
    font-family: $apfel
    font-weight: 400
    font-size: 0.85rem
    line-height: 1.6
    color: $white
    z-index: 2
    pointer-events: none

    +breakpoint(mobile)
      display: none

  // ---------- Logo coupé ----------
  &_logo
    position: absolute
    bottom: -14vw
    left: 48%
    transform: translateX(-50%)
    width: 104vw
    pointer-events: none
    z-index: 3
    user-select: none
    opacity: 0.9

    img
      display: block
      width: 100%
      height: auto
</style>
