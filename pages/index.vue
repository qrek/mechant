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

    <!-- Logo coupé en bas -->
    <div class="HomePage_logo" aria-hidden="true">
      <img src="~assets/images/MECHANT_TRANSPARENT.png" alt="" />
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
        <div class="HomePage_nav_dots">
          <button
            v-for="(p, i) in projects"
            :key="i"
            class="HomePage_nav_dot"
            :class="{ active: i === currentIndex }"
            @click.stop="goTo(i)"
            :aria-label="`Projet ${i + 1}`"
          >
            <span v-if="i === currentIndex" :key="currentIndex" class="HomePage_nav_dot_fill" />
          </button>
        </div>
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

    goTo(i) {
      this._stopAutoPlay()
      this.currentIndex = i
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

  // ---------- Logo coupé ----------
  &_logo
    position: absolute
    bottom: -2vw
    left: 50%
    transform: translateX(-50%)
    width: 104vw
    pointer-events: none
    z-index: 3
    user-select: none

    img
      display: block
      width: 100%
      height: auto

  // ---------- Contenu ----------
  &_content
    position: absolute
    bottom: 0
    left: 0
    right: 0
    padding: 5rem 6rem 5rem
    display: flex
    align-items: flex-end
    justify-content: space-between
    gap: 2rem
    z-index: 4
    pointer-events: none

    +breakpoint(mobile)
      padding: 3rem 2.5rem 4rem
      flex-direction: column
      align-items: flex-start
      gap: 2.5rem

    &_inner
      flex: 1
      min-width: 0

    &_text
      display: flex
      flex-direction: column
      gap: 1rem

    &_client
      font-family: $apfel
      font-weight: 700
      font-size: clamp(3.5rem, 6vw, 8rem)
      line-height: 1
      color: $white
      text-transform: uppercase
      max-width: 70vw

      +breakpoint(mobile)
        font-size: clamp(3rem, 9vw, 5rem)
        max-width: 100%

    &_title
      font-family: $apfel
      font-weight: 400
      font-size: 1.1rem
      letter-spacing: 0.1em
      text-transform: uppercase
      color: rgba(255,255,255,0.65)

  // ---------- Navigation ----------
  &_nav
    display: flex
    flex-direction: column
    align-items: flex-end
    gap: 1.5rem
    flex-shrink: 0
    pointer-events: all

    +breakpoint(mobile)
      flex-direction: row
      align-items: center
      justify-content: space-between
      width: 100%

    &_counter
      font-family: $apfel
      font-weight: 400
      font-size: 1.2rem
      color: rgba(255,255,255,0.5)
      letter-spacing: 0.1em

      em
        font-style: normal
        color: $white
        font-weight: 500
        font-size: 1.6rem

    &_dots
      display: flex
      gap: 0.5rem
      align-items: center

    &_dot
      width: 3rem
      height: 2px
      background: rgba(255,255,255,0.2)
      border: none
      cursor: pointer
      position: relative
      overflow: hidden
      border-radius: 2px
      padding: 0
      transition: width 0.3s ease, background 0.2s ease
      flex-shrink: 0

      &.active
        width: 4.5rem
        background: rgba(255,255,255,0.25)

      &_fill
        position: absolute
        inset: 0
        background: $white
        transform-origin: left center
        animation: dotProgress 8s linear forwards

    &_arrows
      display: flex
      gap: 0.8rem

    &_arrow
      display: flex
      align-items: center
      justify-content: center
      width: 4.4rem
      height: 4.4rem
      border: 1px solid rgba(255,255,255,0.3)
      border-radius: 50%
      background: transparent
      color: $white
      font-size: 1.2rem
      cursor: pointer
      transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease

      &:hover
        background: $white
        border-color: $white
        color: $black
        transform: scale(1.1)

// ---------- Dot progress animation ----------
@keyframes dotProgress
  from
    transform: scaleX(0)
  to
    transform: scaleX(1)

// ---------- Transitions ----------
.bg-fade-enter-active,
.bg-fade-leave-active
  transition: opacity 1s ease

.bg-fade-enter,
.bg-fade-leave-to
  opacity: 0

.text-fade-enter-active
  transition: opacity 0.4s ease 0.2s, transform 0.4s ease 0.2s

.text-fade-leave-active
  transition: opacity 0.25s ease, transform 0.25s ease

.text-fade-enter
  opacity: 0
  transform: translateY(1rem)

.text-fade-leave-to
  opacity: 0
  transform: translateY(-0.5rem)
</style>
