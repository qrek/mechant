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

    <!-- Contenu bas de page -->
    <div class="HomePage_content">
      <div class="HomePage_content_inner">
        <transition name="text-fade" mode="out-in">
          <div :key="currentIndex" class="HomePage_content_text">
            <h1 class="HomePage_content_title">{{ currentProject && (currentProject.sliderTitle || currentProject.title) }}</h1>
            <p class="HomePage_content_client">{{ currentProject && currentProject.client }}</p>
          </div>
        </transition>
      </div>

      <!-- Navigation -->
      <div class="HomePage_nav">
        <span class="HomePage_nav_counter">
          <em>{{ pad(currentIndex + 1) }}</em> / {{ pad(projects.length) }}
        </span>
        <div class="HomePage_nav_arrows">
          <button class="HomePage_nav_arrow" @click.stop="prev" aria-label="Précédent">
            <span class="icon-arrow-left"></span>
          </button>
          <button class="HomePage_nav_arrow" @click.stop="next" aria-label="Suivant">
            <span class="icon-arrow-right"></span>
          </button>
        </div>
      </div>
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
      _autoPlayTimer: null
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

    pad(n) {
      return String(n).padStart(2, '0')
    },

    next() {
      this._stopAutoPlay()
      this.currentIndex = (this.currentIndex + 1) % this.projects.length
      this._startAutoPlay()
    },

    prev() {
      this._stopAutoPlay()
      this.currentIndex = (this.currentIndex - 1 + this.projects.length) % this.projects.length
      this._startAutoPlay()
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
$homeBg: #68dbf7

.HomePage
  position: fixed
  inset: 0
  width: 100%
  height: 100%
  overflow: hidden
  background: $homeBg
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  gap: 3rem

  +breakpoint(mobile)
    gap: 2rem
    justify-content: center

  // ---------- Rectangle vidéo centré ----------
  &_bg
    position: relative
    width: 65vw
    aspect-ratio: 16 / 9
    flex-shrink: 0
    cursor: pointer

    +breakpoint(mobile)
      width: 90vw

    &_media
      position: absolute
      inset: 0
      border-radius: 4px
      overflow: hidden

    &_video,
    &_img
      position: absolute
      inset: 0
      width: 100%
      height: 100%
      object-fit: cover

    &_gradient
      display: none

  &_clickZone
    position: absolute
    inset: 0
    z-index: 1
    cursor: pointer

  // ---------- Contenu ----------
  &_content
    width: 65vw
    display: flex
    align-items: flex-end
    justify-content: space-between
    gap: 2rem
    pointer-events: none

    +breakpoint(mobile)
      width: 90vw
      flex-direction: column
      align-items: flex-start
      gap: 1.5rem

    &_inner
      flex: 1
      min-width: 0

    &_text
      display: flex
      flex-direction: column
      gap: 0.5rem

    &_client
      font-family: $apfel
      font-weight: 400
      font-size: 1rem
      letter-spacing: 0.1em
      text-transform: uppercase
      color: rgba(0,0,0,0.5)

    &_title
      font-family: $apfel
      font-weight: 700
      font-size: clamp(2rem, 3.5vw, 5rem)
      line-height: 1
      color: $black
      text-transform: uppercase

      +breakpoint(mobile)
        font-size: clamp(2rem, 7vw, 3.5rem)

  // ---------- Navigation ----------
  &_nav
    display: flex
    flex-direction: row
    align-items: center
    gap: 1.5rem
    flex-shrink: 0
    pointer-events: all

    &_counter
      font-family: $apfel
      font-weight: 400
      font-size: 1.1rem
      color: rgba(0,0,0,0.4)
      letter-spacing: 0.1em

      em
        font-style: normal
        color: $black
        font-weight: 500
        font-size: 1.4rem

    &_arrows
      display: flex
      gap: 0.6rem

    &_arrow
      display: flex
      align-items: center
      justify-content: center
      width: 3.8rem
      height: 3.8rem
      border: 1px solid rgba(0,0,0,0.25)
      border-radius: 50%
      background: transparent
      color: $black
      font-size: 1.1rem
      cursor: pointer
      transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease

      &:hover
        background: $black
        border-color: $black
        color: $homeBg
        transform: scale(1.1)

// ---------- Transitions ----------
.bg-fade-enter-active,
.bg-fade-leave-active
  transition: opacity 0.8s ease

.bg-fade-enter,
.bg-fade-leave-to
  opacity: 0

.text-fade-enter-active
  transition: opacity 0.4s ease 0.15s, transform 0.4s ease 0.15s

.text-fade-leave-active
  transition: opacity 0.2s ease, transform 0.2s ease

.text-fade-enter
  opacity: 0
  transform: translateY(0.8rem)

.text-fade-leave-to
  opacity: 0
  transform: translateY(-0.4rem)
</style>
