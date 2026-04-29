<template>
  <div class="ProjectPopin" :class="{ 'is-active': isActive, 'is-ready': isDisplayed }">
    <div class="ProjectPopin_player" @mousemove="onMouseMove" @click="onPlayerClick">

      <!-- Conteneur iframe Vimeo -->
      <div class="ProjectPopin_iframe" ref="iframe"></div>

      <!-- Loader -->
      <transition name="fade">
        <div v-if="isActive && !isVideoReady" class="ProjectPopin_loader">
          <div class="loader-ring"></div>
        </div>
      </transition>

      <!-- Bouton fermer -->
      <button class="ProjectPopin_close" @click.stop="close" aria-label="Fermer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="20" height="20">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <!-- Contrôles -->
      <div class="ProjectPopin_controls" :class="{ 'is-visible': controlsVisible }" @click.stop @mousemove.stop>
        <button class="ctrl-btn" @click="togglePlay">
          <svg v-if="isPaused" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><polygon points="5,3 19,12 5,21"/></svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <rect x="5" y="3" width="4" height="18" rx="1"/>
            <rect x="15" y="3" width="4" height="18" rx="1"/>
          </svg>
        </button>
        <button class="ctrl-btn" @click="toggleMute">
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
        <button class="ctrl-btn" @click="goFullscreen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="18" height="18">
            <polyline points="15,3 21,3 21,9"/>
            <polyline points="9,21 3,21 3,15"/>
            <line x1="21" y1="3" x2="14" y2="10"/>
            <line x1="3" y1="21" x2="10" y2="14"/>
          </svg>
        </button>
      </div>

      <!-- Barre de progression -->
      <div class="ProjectPopin_progress" :class="{ 'is-visible': controlsVisible }" @click.stop="seek">
        <div class="ProjectPopin_progress_track">
          <div class="ProjectPopin_progress_fill" :style="{ width: progress + '%' }"></div>
        </div>
      </div>

      <!-- Infos projet -->
      <div class="ProjectPopin_info" :class="{ 'is-open': infoVisible }" @click.stop>
        <div class="ProjectPopin_info_panel">
          <div class="Info_client">{{ project && project.client }}</div>
          <div class="Info_title">{{ project && project.title }}</div>
          <div v-if="project && project.description" class="Info_desc" v-html="linkifyDescription(project.description)"></div>
          <ul v-if="project && project.categories && project.categories.length" class="Info_tags">
            <li v-for="catId in project.categories" :key="catId">
              {{ categoriesData && categoriesData[catId] && categoriesData[catId].title }}
            </li>
          </ul>
        </div>
        <button class="ProjectPopin_info_btn" @click.stop="infoVisible = !infoVisible" :class="{ 'is-active': infoVisible }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="8" stroke-width="3"/>
            <line x1="12" y1="12" x2="12" y2="16"/>
          </svg>
        </button>
      </div>

    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import gsap from '@/vendor/gsap'

export default {
  name: 'ProjectPopin',

  data() {
    return {
      // player state
      player: null,
      loadedVimeoId: null,
      isDisplayed: false,
      isVideoReady: false,
      // playback UI
      isPaused: false,
      isMuted: false,
      progress: 0,
      // controls visibility
      controlsVisible: false,
      _hideTimer: null,
      // info panel
      infoVisible: false
    }
  },

  computed: {
    ...mapGetters({
      isActive: 'project/isActive',
      projectId: 'project/id',
      projectStoreData: 'project/data',
      data: 'data/getData',
      currentRoute: 'router/current'
    }),
    project() {
      if (!this.projectId) return null
      const fromStore = (this.data?.projects || []).find(p => p.id === this.projectId)
        || (this.data?.heroProjects && this.data.heroProjects[this.projectId])
        || null
      // Fallback sur les données passées par la page Works via setData
      if (fromStore) return fromStore
      if (this.projectStoreData && this.projectStoreData.id === this.projectId) return this.projectStoreData
      return null
    },
    categoriesData() {
      return this.data && this.data.categories
    }
  },

  watch: {
    // Quand isActive passe à true : ouvrir. À false : fermer.
    isActive(val) {
      if (val) this._open()
      else this._close()
    },
    // Pré-chauffe la vidéo au hover (avant le clic)
    projectId(newId) {
      if (!newId || this.isActive) return
      this._preWarm(newId)
    },
    // Ferme si changement de route
    currentRoute(to, from) {
      if (to !== from && this.isActive) this.close()
    }
  },

  beforeDestroy() {
    clearTimeout(this._hideTimer)
    this._destroyPlayer()
  },

  methods: {
    ...mapActions({ setActive: 'project/setActive' }),

    close() {
      this.setActive(false)
    },

    linkifyDescription(text) {
      return text.replace(/@(\w+)/g, '<a href="https://instagram.com/$1" target="_blank" rel="noopener noreferrer">@$1</a>')
    },

    // ─── SDK ──────────────────────────────────────────────────────────────────

    _waitForSDK() {
      return new Promise((resolve, reject) => {
        if (window.Vimeo && window.Vimeo.Player) return resolve(window.Vimeo.Player)
        let attempts = 0
        const poll = setInterval(() => {
          attempts++
          if (window.Vimeo && window.Vimeo.Player) {
            clearInterval(poll)
            resolve(window.Vimeo.Player)
          } else if (attempts > 100) {
            clearInterval(poll)
            reject(new Error('Vimeo SDK non disponible'))
          }
        }, 50)
      })
    },

    // ─── Player lifecycle ─────────────────────────────────────────────────────

    async _initPlayer(vimeoId, muted = false) {
      this._initVersion = (this._initVersion || 0) + 1
      const myVersion = this._initVersion

      if (this.player) this._destroyPlayer()

      let VimeoPlayer
      try { VimeoPlayer = await this._waitForSDK() }
      catch (e) { console.error(e.message); return }

      if (myVersion !== this._initVersion) return
      if (!this.$refs.iframe) return

      this.player = new VimeoPlayer(this.$refs.iframe, {
        id: vimeoId,
        controls: false,
        playsinline: true,
        autopause: false,
        dnt: true,
        texttrack: false
      })
      this.loadedVimeoId = vimeoId
      this.isVideoReady = false

      this.player.on('loaded',      ()              => { this.isVideoReady = true })
      this.player.on('timeupdate',  ({ percent })   => { this.progress = percent * 100; this.isVideoReady = true })
      this.player.on('play',        ()              => { this.isPaused = false })
      this.player.on('pause',       ()              => { this.isPaused = true;  this._showControls() })
      this.player.on('ended',       ()              => { this.isPaused = true;  this.progress = 0; this._showControls() })
      this.player.on('error',       ({ message })   => { console.warn('Vimeo:', message); this.isVideoReady = true })

      // Fire-and-forget — ne pas await : setMuted peut bloquer plusieurs secondes
      // si l'iframe n'est pas encore chargée, ce qui ferait crasher _open si le
      // player est détruit entre-temps.
      this.player.setMuted(muted).catch(() => {})
      this.player.play().catch(() => {})
    },

    _destroyPlayer() {
      if (!this.player) return
      try { this.player.destroy() } catch (_) {}
      this.player = null
      this.loadedVimeoId = null
      this.isVideoReady = false
      if (this.$refs.iframe) this.$refs.iframe.innerHTML = ''
    },

    // ─── Pre-warm (hover) ─────────────────────────────────────────────────────

    _preWarm(vimeoId) {
      if (!vimeoId) return
      const video = this._projectById(this.projectId)
      const id = video && video.vimeo_id
      if (!id) return
      // Déjà chargé
      if (this.loadedVimeoId === id && this.player) return
      this._initPlayer(id, true) // muted
    },

    _projectById(projectId) {
      if (!this.data || !projectId) return null
      return (this.data.projects || []).find(p => p.id === projectId)
        || (this.data.heroProjects && this.data.heroProjects[projectId])
        || null
    },

    // ─── Open / Close ─────────────────────────────────────────────────────────

    async _open() {
      const vimeoId = this.project && this.project.vimeo_id
      if (!vimeoId) return

      // Annuler toute animation de fermeture en cours
      gsap.killTweensOf(this.$el)

      this.isPaused = false
      this.isMuted = false
      this.infoVisible = false
      this.progress = 0

      if (this.loadedVimeoId === vimeoId && this.player) {
        // Pre-warm prêt : démuter et jouer (fire-and-forget)
        this.player.setMuted(false).catch(() => {})
        this.player.play().catch(() => {})
      } else {
        // Chargement direct
        await this._initPlayer(vimeoId, false)
        // L'utilisateur a peut-être fermé pendant le chargement
        if (!this.isActive) return
      }

      this.isDisplayed = true
      gsap.fromTo(this.$el,
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: 'power2.out', onComplete: () => this._showControls() }
      )
    },

    _close() {
      clearTimeout(this._hideTimer)
      this.controlsVisible = false
      this.infoVisible = false

      gsap.to(this.$el, {
        opacity: 0,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => {
          // Si un nouveau projet a été ouvert pendant l'animation, ne pas détruire
          if (this.isActive) return
          this.isDisplayed = false
          this._destroyPlayer()
          this.isPaused = false
          this.isMuted = false
          this.progress = 0
        }
      })
    },

    // ─── Controls ─────────────────────────────────────────────────────────────

    _showControls() {
      if (!this.isDisplayed) return
      this.controlsVisible = true
      clearTimeout(this._hideTimer)
      this._hideTimer = setTimeout(() => {
        if (!this.isPaused && !this.infoVisible) this.controlsVisible = false
      }, 3000)
    },

    onMouseMove() {
      this._showControls()
    },

    onPlayerClick() {
      if (!this.isDisplayed) return
      if (this.infoVisible) { this.infoVisible = false; return }
      this.togglePlay()
    },

    togglePlay() {
      if (!this.player) return
      if (this.isPaused) this.player.play()
      else this.player.pause()
    },

    toggleMute() {
      if (!this.player) return
      this.isMuted = !this.isMuted
      this.player.setMuted(this.isMuted)
    },

    goFullscreen() {
      this.player && this.player.requestFullscreen()
    },

    async seek(e) {
      if (!this.player) return
      const rect = e.currentTarget.getBoundingClientRect()
      const ratio = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1))
      const duration = await this.player.getDuration()
      if (duration) this.player.setCurrentTime(duration * ratio)
    }
  }
}
</script>

<style lang="sass" scoped>
.ProjectPopin
  position: fixed
  inset: 0
  z-index: 11
  background: $black
  display: flex
  align-items: center
  justify-content: center
  opacity: 0
  pointer-events: none

  &.is-active
    pointer-events: auto

  &_player
    position: relative
    width: 100%
    height: 100%
    cursor: default

    // Close visible au hover
    &:hover .ProjectPopin_close
      opacity: 1

  // ── Iframe ───────────────────────────────────────────────────────────────
  &_iframe
    width: 100%
    height: 100%
    background: $black
    pointer-events: none

    ::v-deep iframe
      width: 100%
      height: 100%
      object-fit: cover
      display: block
      opacity: 0
      transition: opacity 0.4s ease

  &.is-ready &_iframe ::v-deep iframe
    opacity: 1

  // ── Loader ───────────────────────────────────────────────────────────────
  &_loader
    position: absolute
    top: 50%
    left: 50%
    transform: translate(-50%, -50%)
    z-index: 3
    pointer-events: none

    .loader-ring
      width: 3.5rem
      height: 3.5rem
      border: 2px solid rgba(255,255,255,0.2)
      border-top-color: $white
      border-radius: 50%
      animation: spin 0.8s linear infinite

  // ── Close ─────────────────────────────────────────────────────────────────
  &_close
    position: absolute
    top: 2rem
    right: 2rem
    width: 3.5rem
    height: 3.5rem
    display: flex
    align-items: center
    justify-content: center
    background: rgba(255,255,255,0.08)
    border: 1px solid rgba(255,255,255,0.2)
    border-radius: 50%
    color: $white
    cursor: pointer
    z-index: 6
    opacity: 0
    transition: opacity 0.2s ease, background 0.2s ease, transform 0.2s ease

    &:hover
      background: $white
      color: $black
      transform: scale(1.08)

  // ── Progress ─────────────────────────────────────────────────────────────
  &_progress
    position: absolute
    bottom: 5rem
    left: 50%
    transform: translateX(-50%)
    width: 60vw
    padding: 1.2rem 0
    z-index: 4
    cursor: pointer
    opacity: 0
    pointer-events: none
    transition: opacity 0.3s ease

    &.is-visible
      opacity: 1
      pointer-events: auto

    &_track
      height: 2px
      background: rgba(255,255,255,0.2)
      border-radius: 2px
      overflow: hidden

    &_fill
      height: 100%
      background: $white
      border-radius: 2px
      transition: width 0.15s linear

  // ── Controls ─────────────────────────────────────────────────────────────
  &_controls
    position: absolute
    bottom: 0
    left: 0
    right: 0
    z-index: 4
    padding: 4rem 2rem 2rem
    background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)
    display: flex
    align-items: center
    justify-content: center
    gap: 2rem
    opacity: 0
    pointer-events: none
    transition: opacity 0.3s ease

    &.is-visible
      opacity: 1
      pointer-events: auto

  // ── Info ─────────────────────────────────────────────────────────────────
  &_info
    position: absolute
    bottom: 5rem
    right: 2rem
    z-index: 5
    display: flex
    align-items: flex-end
    flex-direction: column
    gap: 0.75rem

    &_panel
      background: rgba(0,0,0,0.85)
      backdrop-filter: blur(12px)
      border: 1px solid rgba(255,255,255,0.1)
      border-radius: 12px
      padding: 2rem 2.5rem
      opacity: 0
      transform: translateY(8px)
      pointer-events: none
      transition: opacity 0.25s ease, transform 0.25s ease
      max-width: 520px

    &.is-open &_panel
      opacity: 1
      transform: translateY(0)
      pointer-events: auto

    &_btn
      width: 3rem
      height: 3rem
      border-radius: 50%
      border: 1px solid rgba(255,255,255,0.25)
      background: rgba(255,255,255,0.08)
      color: $white
      display: flex
      align-items: center
      justify-content: center
      cursor: pointer
      transition: all 0.2s ease
      flex-shrink: 0

      &:hover, &.is-active
        background: $white
        color: $black
        border-color: $white

// ── Info content ─────────────────────────────────────────────────────────
.Info
  &_client
    font-family: $apfel
    font-weight: 900
    font-size: 2rem
    text-transform: uppercase
    color: $white
    line-height: 1
    margin-bottom: 0.4rem

  &_title
    font-family: $apfel
    font-weight: 400
    font-size: 0.85rem
    text-transform: uppercase
    letter-spacing: 0.1em
    color: rgba(255,255,255,0.5)
    margin-bottom: 1rem

  &_desc
    font-family: $apfel
    font-size: 0.85rem
    color: rgba(255,255,255,0.6)
    line-height: 1.5
    margin-bottom: 1rem

    ::v-deep a
      color: $white
      text-decoration: underline
      text-underline-offset: 2px
      transition: opacity 0.15s ease

      &:hover
        opacity: 0.7

  &_tags
    display: flex
    flex-wrap: wrap
    gap: 0.4rem

    li
      font-family: $apfel
      font-size: 0.7rem
      text-transform: uppercase
      letter-spacing: 0.08em
      color: rgba(255,255,255,0.4)
      border: 1px solid rgba(255,255,255,0.15)
      border-radius: 4px
      padding: 0.2rem 0.5rem

// ── Boutons contrôle ─────────────────────────────────────────────────────
.ctrl-btn
  background: none
  border: none
  color: $white
  cursor: pointer
  padding: 0.5rem
  opacity: 0.75
  transition: opacity 0.2s ease, transform 0.2s ease
  display: flex
  align-items: center
  justify-content: center
  flex-shrink: 0

  &:hover
    opacity: 1
    transform: scale(1.2)

// ── Transitions ──────────────────────────────────────────────────────────
.fade-enter-active, .fade-leave-active
  transition: opacity 0.3s ease

.fade-enter, .fade-leave-to
  opacity: 0

@keyframes spin
  to
    transform: rotate(360deg)
</style>
