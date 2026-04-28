<template>
  <div class="ProjectPopin" :class="{ active: isActive }">
    <div
      ref="player"
      class="ProjectPopin_player"
      @mousemove="showControls"
      @click="handleVideoClick"
    >
      <div class="ProjectPopin_player_iframe" ref="videoIframe"></div>

      <!-- Loader pendant le buffering -->
      <div class="ProjectPopin_player_loader" v-if="!isVideoReady">
        <div class="loader-ring"></div>
      </div>

      <!-- Barre de progression centrée -->
      <div
        class="ProjectPopin_progress"
        :class="{ visible: controlsVisible }"
        @click.stop="seek"
      >
        <div class="ProjectPopin_progress_bar">
          <div class="ProjectPopin_progress_fill" :style="{ width: `${progress}%` }"></div>
        </div>
      </div>

      <!-- Close au hover -->
      <button class="ProjectPopin_close" @click.stop="handleClose" aria-label="Fermer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="20" height="20">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <!-- Panneau d'infos -->
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

      <!-- Contrôles bas (play/pause, mute, fullscreen) -->
      <div
        class="ProjectPopin_controls"
        :class="{ visible: controlsVisible }"
        @click.stop
        @mousemove.stop
      >
        <button class="ctrl-btn" @click="togglePlay" :title="isPaused ? 'Play' : 'Pause'">
          <svg v-if="isPaused" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <rect x="5" y="3" width="4" height="18" rx="1"/>
            <rect x="15" y="3" width="4" height="18" rx="1"/>
          </svg>
        </button>

        <button class="ctrl-btn" @click="toggleMute" :title="isMuted ? 'Son' : 'Muet'">
          <svg v-if="isMuted" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/>
            <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/>
            <path d="M15.5,8.5 a5,5 0 0 1 0,7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
            <path d="M19,5 a10,10 0 0 1 0,14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
          </svg>
        </button>

        <button class="ctrl-btn" @click="requestFullscreen" title="Plein écran">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="18" height="18">
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
import { mapActions, mapGetters } from 'vuex'
import gsap from '@/vendor/gsap'
import Tag from '@/components/Tag'

export default {
  name: 'ProjectPopin',
  components: { Tag },
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
      if (newVal !== oldVal) this.handleClose()
    },
    isActive(newVal, oldVal) {
      if (newVal !== oldVal) this.handleActiveChange(newVal)
    },
    // Pré-chauffe le player dès que l'id change (hover), avant le clic
    id(newVal, oldVal) {
      if (newVal && newVal !== oldVal && !this.isActive) {
        this._preWarm()
      }
    }
  },
  data() {
    return {
      isInfosVisible: false,
      tween: { active: null },
      isPaused: false,
      isMuted: false,
      progress: 0,
      controlsVisible: false,
      isVideoReady: false,
      _hideControlsTimer: null
    }
  },
  mounted() {},
  beforeDestroy() {
    clearTimeout(this._hideControlsTimer)
    this._destroyPlayer()
  },
  methods: {
    ...mapActions({
      setActive: 'project/setActive'
    }),

    checkTween(key) {
      if (this.tween[key]) {
        this.tween[key].kill()
        this.tween[key] = null
      }
    },

    handleClickInfo() {
      this.isInfosVisible = !this.isInfosVisible
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
      if (status) this.handleEnter()
      else this.handleLeave()
    },

    // Crée le player Vimeo en silence avant que l'utilisateur clique
    _preWarm() {
      if (typeof window.Vimeo === 'undefined' || !this.project?.vimeo_id) return
      // Ne pas pré-chauffer si le player est déjà ouvert
      if (this.isActive) return
      // Détruire le player précédent si c'est un projet différent
      if (this.player) {
        this.player.destroy()
        this.player = null
        this.isVideoReady = false
        this.progress = 0
      }
      this.player = new window.Vimeo.Player(this.$refs.videoIframe, {
        id: this.project.vimeo_id,
        controls: false,
        playsinline: true,
        autopause: false,
        dnt: true
      })
      this.player.setMuted(true)
      this.player.play().catch(() => {})
      this.player.on('loaded', () => { this.isVideoReady = true })
      this.player.on('timeupdate', ({ percent }) => {
        this.progress = percent * 100
        if (!this.isVideoReady) this.isVideoReady = true
      })
    },

    _createPlayer() {
      if (typeof window.Vimeo === 'undefined' || !this.project?.vimeo_id) return false
      this.isVideoReady = false
      this.progress = 0
      this.player = new window.Vimeo.Player(this.$refs.videoIframe, {
        id: this.project.vimeo_id,
        controls: false,
        playsinline: true,
        autopause: false,
        dnt: true
      })
      this.player.on('loaded', () => { this.isVideoReady = true })
      this.player.on('timeupdate', ({ percent }) => {
        this.progress = percent * 100
        if (!this.isVideoReady) this.isVideoReady = true
      })
      return true
    },

    _destroyPlayer() {
      if (!this.player) return
      this.player.off('pause')
      this.player.off('play')
      this.player.off('ended')
      this.player.off('error')
      this.player.off('loaded')
      this.player.off('timeupdate')
      this.player.destroy()
      this.player = null
    },

    handleVideoClick() {
      if (!this.$el.classList.contains('displayPlayer')) return
      if (this.isInfosVisible) {
        this.isInfosVisible = false
        return
      }
      this.togglePlay()
      this.showControls()
    },

    togglePlay() {
      if (this.isPaused) this.player?.play()
      else this.player?.pause()
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
        if (!this.isPaused && !this.isInfosVisible) this.controlsVisible = false
      }, 3000)
    },

    handleEnter() {
      const _el = this.$el
      this.isPaused = false
      this.isMuted = false
      this.controlsVisible = false

      // Créer le player s'il n'existe pas encore (démarrage froid)
      if (!this.player) {
        if (!this._createPlayer()) {
          console.error('Vimeo SDK non chargé')
          return
        }
      }

      // Nettoyer les listeners UI avant de les rebrancher (évite les doublons)
      this.player.off('pause')
      this.player.off('play')
      this.player.off('ended')
      this.player.off('error')

      this.player.on('pause', () => { this.isPaused = true; this.controlsVisible = true })
      this.player.on('play',  () => { this.isPaused = false })
      this.player.on('ended', () => { this.isPaused = true; this.progress = 0; this.controlsVisible = true })
      this.player.on('error', ({ message }) => {
        console.warn('Vimeo error:', message)
        this.isVideoReady = true
        this.isPaused = true
      })

      // Démute + lecture (safe si déjà en train de jouer depuis le pre-warm)
      this.player.setMuted(false)
      this.player.play().catch(err => {
        console.warn('Lecture bloquée:', err?.message)
        this.isPaused = true
        this.isVideoReady = true
      })

      // Affiche l'iframe immédiatement + fondu du fond noir en parallèle
      _el.classList.add('displayPlayer')
      gsap.fromTo(_el,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.35,
          ease: 'power2.out',
          onComplete: () => this.showControls()
        }
      )
    },

    handleLeave() {
      const _el = this.$el
      clearTimeout(this._hideControlsTimer)
      this.controlsVisible = false
      this.isInfosVisible = false
      _el.classList.remove('displayPlayer')
      if (this.player) this.player.pause()

      gsap.to(_el, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.inOut',
        onComplete: () => {
          this._destroyPlayer()
          this.isPaused = false
          this.progress = 0
          this.isVideoReady = false
        }
      })
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
  top: 0
  left: 0
  display: flex
  align-items: center
  justify-content: center
  opacity: 0
  pointer-events: none
  background: $black

  &.active
    pointer-events: initial

  &_player
    width: 100%
    height: 100%
    overflow: hidden
    position: relative
    cursor: default

    // Close visible au hover du player
    &:hover .ProjectPopin_close
      opacity: 1

    &_iframe
      width: 100%
      height: 100%
      background: $black
      pointer-events: none

      ::v-deep iframe
        width: 100%
        height: 100%
        object-fit: cover
        opacity: 0
        transition: opacity 0.4s ease

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
          font-family: $briceBlackCondensed
          margin-bottom: .8rem
          font-size: 3.5rem

        &_title
          font-family: $kobeBold
          font-size: 1.8rem

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

// ---------- Barre de progression centrée ----------
.ProjectPopin_progress
  position: absolute
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  width: 60vw
  z-index: 4
  cursor: pointer
  opacity: 0
  transition: opacity 0.3s ease
  pointer-events: none
  padding: 1.5rem 0

  &.visible
    opacity: 1
    pointer-events: auto

  &_bar
    height: 2px
    background: rgba(255, 255, 255, 0.25)
    border-radius: 2px
    overflow: hidden

  &_fill
    height: 100%
    background: $white
    border-radius: 2px
    transition: width 0.15s linear

// ---------- Close ----------
.ProjectPopin_close
  position: absolute
  top: 2.5rem
  right: 2.5rem
  width: 4rem
  height: 4rem
  display: flex
  align-items: center
  justify-content: center
  background: rgba(255, 255, 255, 0.1)
  border: 1px solid rgba(255, 255, 255, 0.3)
  border-radius: 50%
  color: $white
  cursor: pointer
  z-index: 6
  opacity: 0
  transition: opacity 0.25s ease, background 0.2s ease, transform 0.2s ease

  &:hover
    background: $white
    color: $black
    transform: scale(1.1)

// ---------- Contrôles bas ----------
.ProjectPopin_controls
  position: absolute
  bottom: 0
  left: 0
  right: 0
  z-index: 4
  padding: 3rem 2.5rem 2rem
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5) 0%, transparent 100%)
  display: flex
  align-items: center
  justify-content: center
  gap: 1.5rem
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
  cursor: pointer
  padding: 0.4rem
  opacity: 0.8
  transition: opacity 0.2s ease, transform 0.2s ease
  flex-shrink: 0
  display: flex
  align-items: center
  justify-content: center

  &:hover
    opacity: 1
    transform: scale(1.2)

.ProjectPopin.displayPlayer .ProjectPopin_player_iframe
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
