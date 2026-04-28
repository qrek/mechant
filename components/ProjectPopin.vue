<template>
  <div class="ProjectPopin" :class="{ active: isActive }">
    <ProjectPopinBg ref="projectPopinBg1" :index="1" @onPathChange="handlePathChange" />

    <svg class="mask">
      <defs>
        <clipPath id="mask" :transform="`scale(${scale.x}, ${scale.y})`">
          <path fill="red" :d="path" />
        </clipPath>
	    </defs>
    </svg>

    <div
      ref="player"
      class="ProjectPopin_player"
      :class="{ path: path && path.length }"
      :style="{ '--path': `'${path}'` }"
      @mousemove="showControls"
      @click="handleVideoClick"
    >
      <div class="ProjectPopin_player_iframe" ref="videoIframe"></div>

      <!-- Loader pendant le buffering -->
      <div class="ProjectPopin_player_loader" v-if="!isVideoReady">
        <div class="loader-ring"></div>
      </div>

      <div class="ProjectPopin_player_close" @click.stop="handleClose">
        <i class="ProjectPopin_player_close_icon icon-close"></i>
      </div>

      <!-- Panneau d'infos (expandable) -->
      <div class="ProjectPopin_player_info" :class="{ active: isInfosVisible }" @click.stop>
        <div class="Infos">
          <div class="Infos_client">{{ project?.client }}</div>
          <div class="Infos_title">{{ project?.title }}</div>
          <ul class="Infos_tags">
            <li v-for="(tag, index) in project?.categories" :key="index" v-if="categoriesData && categoriesData[tag]">{{ categoriesData[tag].title }}</li>
          </ul>
          <div class="Infos_text">{{ project?.description }}</div>
          <div class="Infos_tag">
            <Tag
              v-for="(tag, index) in project?.badges" :key="index"
              :text="tag"
            />
          </div>
        </div>
        <div class="ProjectPopin_player_info_icon" id="projectInfoButton" @click.stop="handleClickInfo">
          <i class="icon-info"></i>
        </div>
      </div>

      <!-- Barre de contrôles vidéo -->
      <div
        class="ProjectPopin_controls"
        :class="{ visible: controlsVisible }"
        @click.stop
        @mousemove.stop
      >
        <!-- Play / Pause -->
        <button class="ctrl-btn" @click="togglePlay" :title="isPaused ? 'Play' : 'Pause'">
          <svg v-if="isPaused" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <rect x="5" y="3" width="4" height="18" rx="1"/>
            <rect x="15" y="3" width="4" height="18" rx="1"/>
          </svg>
        </button>

        <!-- Barre de progression -->
        <div class="ctrl-progress" @click.stop="seek">
          <div class="ctrl-progress_bar">
            <div class="ctrl-progress_fill" :style="{ width: `${progress}%` }"></div>
          </div>
        </div>

        <!-- Mute / Volume -->
        <button class="ctrl-btn" @click="toggleMute" :title="isMuted ? 'Activer le son' : 'Couper le son'">
          <svg v-if="isMuted" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/>
            <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/>
            <path d="M15.5,8.5 a5,5 0 0 1 0,7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
            <path d="M19,5 a10,10 0 0 1 0,14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
          </svg>
        </button>

        <!-- Plein écran -->
        <button class="ctrl-btn" @click="requestFullscreen" title="Plein écran">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="20" height="20">
            <polyline points="15,3 21,3 21,9"/>
            <polyline points="9,21 3,21 3,15"/>
            <line x1="21" y1="3" x2="14" y2="10"/>
            <line x1="3" y1="21" x2="10" y2="14"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'
import gsap from '@/vendor/gsap'
import Tag from '@/components/Tag'
import ProjectPopinBg from '@/components/ProjectPopinBg'

export default {
  name: 'ProjectPopin',
  components: {
    Tag,
    ProjectPopinBg
  },
  computed: {
    ...mapGetters({
      isActive: 'project/isActive',
      id: 'project/id',
      currentRoute: 'router/current',
      data: 'data/getData'
    }),
    project() {
      const project = this.data?.projects.find((p) => p.id === this.id)
      return project ? project : this.data?.heroProjects[this.id]
    },
    categoriesData() {
      return this.data?.categories
    }
  },
  watch: {
    currentRoute(newVal, oldVal) {
      if (newVal !== oldVal)
        this.handleClose()
    },
    isActive(newVal, oldVal) {
      if (newVal !== oldVal)
        this.handleActiveChange(newVal)
    }
  },
  data: function () {
    return {
      isInfosVisible: false,
      path: null,
      viewbox: { x: 0, y: 0 },
      scale: { x: 0, y: 0 },
      tween: {
        active: null
      },
      // États du player vidéo
      isPaused: false,
      isMuted: false,
      progress: 0,
      controlsVisible: false,
      isVideoReady: false,
      _hideControlsTimer: null
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    clearTimeout(this._hideControlsTimer)
    if (this.player) {
      this.player.destroy()
      this.player = null
    }
  },
  methods: {
    ...mapActions({
      setActive: 'project/setActive'
    }),
    handleResize() {
      const { player } = this.$refs
      this.scale.x = player.offsetWidth / this.viewbox.x
      this.scale.y = player.offsetHeight / this.viewbox.y
    },
    handlePathChange(e) {
      this.path = e.path
      this.viewbox = e.viewbox

      const { player } = this.$refs

      this.scale.x = player.offsetWidth / this.viewbox.x
      this.scale.y = player.offsetHeight / this.viewbox.y
    },
    checkTween(key) {
      if (this.tween[key]) {
        this.tween[key].kill()
        this.tween[key] = null
      }
    },
    handleClickInfo() {
      this.isInfosVisible = !this.isInfosVisible
      // Garder les contrôles visibles quand le panneau d'infos est ouvert
      if (this.isInfosVisible) {
        this.controlsVisible = true
        clearTimeout(this._hideControlsTimer)
      }
    },
    handleClose() {
      this.setActive(false)
    },
    handleActiveChange(status) {
      this.checkTween('active')

      if (status)
        this.handleEnter()
      else
        this.handleLeave()
    },

    // Clic sur la zone vidéo → toggle play/pause
    handleVideoClick() {
      if (!this.$el.classList.contains('displayPlayer')) return
      // Ferme le panneau infos si ouvert
      if (this.isInfosVisible) {
        this.isInfosVisible = false
        return
      }
      this.togglePlay()
      this.showControls()
    },

    // Contrôles
    togglePlay() {
      if (this.isPaused) {
        this.player?.play()
      } else {
        this.player?.pause()
      }
    },
    toggleMute() {
      this.isMuted = !this.isMuted
      this.player?.setMuted(this.isMuted)
    },
    async seek(e) {
      const rect = e.currentTarget.getBoundingClientRect()
      const ratio = (e.clientX - rect.left) / rect.width
      if (this.player) {
        const duration = await this.player.getDuration()
        if (duration) this.player.setCurrentTime(duration * ratio)
      }
    },
    requestFullscreen() {
      this.player?.requestFullscreen()
    },
    showControls() {
      if (!this.$el.classList.contains('displayPlayer')) return
      this.controlsVisible = true
      clearTimeout(this._hideControlsTimer)
      this._hideControlsTimer = setTimeout(() => {
        if (!this.isPaused && !this.isInfosVisible) {
          this.controlsVisible = false
        }
      }, 3000)
    },

    handleEnter() {
      const _el = this.$el
      const { projectPopinBg1 } = this.$refs

      if (typeof window.Vimeo === 'undefined') {
        console.error('Vimeo Player SDK not loaded')
        return
      }

      // Reset state
      this.isPaused = false
      this.isMuted = false
      this.progress = 0
      this.controlsVisible = false
      this.isVideoReady = false

      this.player = new window.Vimeo.Player(this.$refs.videoIframe, {
        id: this.project.vimeo_id,
        controls: false,
        playsinline: false
      })

      // Événements du player
      this.player.on('timeupdate', ({ percent }) => {
        this.progress = percent * 100
        if (!this.isVideoReady) {
          this.isVideoReady = true
        }
      })
      this.player.on('pause', () => {
        this.isPaused = true
        this.controlsVisible = true
      })
      this.player.on('play', () => {
        this.isPaused = false
      })
      this.player.on('ended', () => {
        this.isPaused = true
        this.progress = 0
        this.controlsVisible = true
      })
      this.player.on('loaded', () => {
        this.isVideoReady = true
      })
      this.player.on('error', ({ message }) => {
        console.warn('ProjectPopin: erreur Vimeo —', message)
        this.isVideoReady = true
        this.isPaused = true
      })

      // Lancer la lecture immédiatement (la vidéo charge pendant l'animation)
      this.player.play().catch(err => {
        console.warn('ProjectPopin: lecture bloquée ou échouée:', err?.message)
        this.isPaused = true
        this.isVideoReady = true
      })

      this.tween.active = gsap.timeline()
      this.tween.active.add('enter')
      this.tween.active.add(projectPopinBg1.animation().timeScale(1).play(), 'enter')
      this.tween.active.to(_el, {
        opacity: 1,
        top: 0,
        duration: 0.4,
        onComplete: _ => {
          _el.classList.add('displayPlayer')
          this.showControls()
        }
      }, 'enter')
    },

    handleLeave() {
      const _el = this.$el
      const { projectPopinBg1 } = this.$refs

      clearTimeout(this._hideControlsTimer)
      this.controlsVisible = false
      this.isInfosVisible = false

      this.tween.active = gsap.timeline()
      if (this.player) this.player.pause()
      _el.classList.remove('displayPlayer')

      this.tween.active.add('leave')
      this.tween.active.add(projectPopinBg1.animation().timeScale(2).reverse(0, true), 'leave')
      this.tween.active.to(_el, {
        opacity: 0,
        top: '-10vh',
        delay: .6,
        duration: 0.4,
        onComplete: _ => {
          if (this.player) {
            this.player.destroy()
            this.player = null
          }
          this.isPaused = false
          this.progress = 0
          this.isVideoReady = false
        }
      }, 'leave')
    }
  }
}
</script>

<style lang="sass" scoped>
.ProjectPopin
  z-index: 11
  width: 100%
  height: 100%
  position: fixed
  top: -10vh
  left: 0
  display: flex
  align-items: center
  justify-content: center
  opacity: 0
  pointer-events: none

  &.active
    pointer-events: initial
    transition: all ease .3s


  .mask
    position: absolute
    top: 50%
    left: 50%
    width: 100%
    height: 100%
    transform: translate(-50%, -50%)

    #mask
      width: 100%
      height: 100%

  &_player
    width: 100%
    height: 100%
    overflow: hidden
    position: relative
    cursor: none

    &.path
      clip-path: url(#mask)

    &_placeholder
      object-fit: cover
      width: 100%
      height: 100%

    &_iframe
      width: 100%
      height: 100%
      background: $pink
      transition: background 1s ease
      pointer-events: none

      ::v-deep iframe
        width: 100%
        height: 100%
        object-fit: cover
        opacity: 0
        transition: opacity 1s ease

    // Loading spinner
    &_loader
      position: absolute
      top: 50%
      left: 50%
      transform: translate(-50%, -50%)
      z-index: 2
      pointer-events: none

      .loader-ring
        width: 4rem
        height: 4rem
        border: 3px solid rgba(255, 255, 255, 0.25)
        border-top-color: $white
        border-radius: 50%
        animation: popinSpin 0.8s linear infinite

    &_info
      position: absolute
      bottom: 6.5rem
      right: 2.5rem
      width: auto
      height: auto
      display: flex
      align-items: center
      justify-content: center
      cursor: pointer
      z-index: 5

      &.active
        &:before
          transform: scale(1.005, 1.001)
        &:before, &:after
          width: 100%
          height: 100%
          transition: all ease-in-out .3s

        .Infos
          pointer-events: initial
          opacity: 1
          transition: all ease-in-out .3s .3s

      &:after, &:before
        transition: all ease-in-out .3s .3s

      &:after
        z-index: -1
        content: ''
        width: 3.4rem
        height: 3.4rem
        position: absolute
        border-radius: 10px
        background-color: $white
        bottom: 0
        right: 0

      &:before
        content: ''
        z-index: -1
        position: absolute
        bottom: 0
        right: 0
        transform: scale(1.075, 1.075)
        width: 3.4rem
        height: 3.4rem
        border-radius: 10px
        transform-origin: center
        background-color: $black
        box-shadow: textShadow($typoPres, $typoDepth, $black)

      &_icon
        position: absolute
        width: 3.4rem
        height: 3.4rem
        bottom: calc(3.4rem / 2)
        right: calc(3.4rem / 2)
        transform: translate(50%, 50%)
        display: flex
        align-items: center
        justify-content: center

        .icon-info
          font-size: 1.9rem

      .Infos
        pointer-events: none
        display: flex
        align-items: flex-start
        justify-content: flex-start
        flex-direction: column
        padding: 3.5rem 4rem 3.5rem 3.5rem
        gap: 1.2rem
        opacity: 0
        transition: all ease-in-out .3s

        &_client,
        &_title,
        &_tags,
        &_text
          text-transform: uppercase
          color: $black

        &_client
          font-family: $kobeBold
          margin-bottom: .8rem
          font-size: 1.8rem

        &_title
          font-family: $briceBlackCondensed
          font-size: 3.5rem

        &_tag
          ::v-deep .Tag_wrapper:not(:last-child)
            margin-right: 1rem

        &_tags
          font-family: $kobeBold
          display: flex
          align-items: center
          justify-content: center
          font-size: 1.6rem

          li
            position: relative
            padding-right: 1rem

            &:not(:first-child)
              padding-left: 1rem
              &:after
                position: absolute
                content: ''
                width: .1rem
                height: 100%
                background-color: $black
                top: 50%
                left: 0
                transform: translate(-50%, -70%)

        &_text
          font-family: $kobeBold
          font-size: 1.6rem

        .Tag_wrapper
          animation: 1.5s ease-in-out 0s infinite tag

    &_close
      position: absolute
      top: 2.5rem
      right: 2.5rem
      width: 3.4rem
      height: 3.4rem
      display: flex
      align-items: center
      justify-content: center
      cursor: pointer
      z-index: 6
      transition: transform 0.3s ease

      &:hover
        transform: scale(1.3) rotate(-5deg)

      &:after
        content: ''
        width: 100%
        height: 100%
        position: absolute
        border-radius: 10px
        background-color: $white

      &:before
        content: ''
        z-index: -1
        position: absolute
        top: 50%
        left: 50%
        transform: translate(-50%, -50%) scale(1.075, 1.075)
        width: 100%
        height: 100%
        border-radius: 10px
        transform-origin: center
        background-color: $black
        box-shadow: textShadow($typoPres, $typoDepth, $black)

      &_icon
        z-index: 1
        font-size: 1.2rem

  // Barre de contrôles vidéo
  &_controls
    position: absolute
    bottom: 0
    left: 0
    right: 0
    z-index: 4
    padding: 2rem 2.5rem 1.8rem
    background: linear-gradient(to top, rgba(0, 0, 0, 0.65) 0%, transparent 100%)
    display: flex
    align-items: center
    gap: 1rem
    opacity: 0
    transition: opacity 0.3s ease
    pointer-events: none

    &.visible
      opacity: 1
      pointer-events: auto

  .ctrl-btn
    background: none
    border: none
    color: $white
    font-size: 1.6rem
    cursor: pointer
    padding: 0.3rem
    opacity: 0.85
    transition: opacity 0.2s ease, transform 0.2s ease
    flex-shrink: 0
    display: flex
    align-items: center
    justify-content: center

    &:hover
      opacity: 1
      transform: scale(1.2)

  .ctrl-progress
    flex: 1
    cursor: pointer
    padding: 0.8rem 0

    &_bar
      height: 3px
      background: rgba(255, 255, 255, 0.25)
      border-radius: 3px
      overflow: hidden

    &_fill
      height: 100%
      background: $white
      border-radius: 3px
      transition: width 0.15s linear

  &.displayPlayer .ProjectPopin_player_iframe
    background: $black

    ::v-deep iframe
      opacity: 1

@keyframes tag
  0%
    transform: rotate(-3deg)
  50%
    transform: rotate(3deg)
  100%
    transform: rotate(-3deg)

@keyframes popinSpin
  to
    transform: rotate(360deg)

</style>
