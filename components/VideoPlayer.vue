<template>
  <div
    class="Video"
    @mouseenter="handleMouseEnter"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <div class="Video_content" @click="handleClick" id="showreelButton">
      <div class="Video_content_wrapper" :class="{ displayPlayer: isPlaying }">

        <div class="Video_content_wrapper_poster">
          <img :src="poster" alt="video" />
        </div>

        <div class="Video_player" ref="videoIframe"></div>

        <!-- Bouton play (avant lancement) -->
        <div class="Video_play" :class="{ hover: isMouseHover }" ref="icon" v-if="!isPlaying">
          <span class="icon-play"></span>
        </div>

        <!-- Contrôles custom (pendant lecture) -->
        <div
          v-if="isPlaying"
          class="Video_controls"
          :class="{ visible: controlsVisible }"
          @click.stop
        >
          <button class="ctrl-btn" @click="togglePlay">
            <span :class="isPaused ? 'icon-play' : 'icon-pause'"></span>
          </button>

          <div class="ctrl-progress" @click="seek">
            <div class="ctrl-progress_bar">
              <div class="ctrl-progress_fill" :style="{ width: `${progress}%` }"></div>
            </div>
          </div>

          <button class="ctrl-btn" @click="toggleMute">
            <span :class="isMuted ? 'icon-mute' : 'icon-volume'"></span>
          </button>

          <button class="ctrl-btn" @click="requestFullscreen">
            <span class="icon-fullscreen"></span>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideoPlayer',
  props: {
    id: { type: String, default: '' },
    poster: { type: String, default: '' }
  },
  data() {
    return {
      isPlaying: false,
      isPaused: false,
      isMuted: false,
      isMouseHover: false,
      progress: 0,
      controlsVisible: true,
      _hideControlsTimer: null
    }
  },
  mounted() {
    if (typeof window.Vimeo === 'undefined') return

    this._player = new window.Vimeo.Player(this.$refs.videoIframe, {
      id: this.id,
      controls: false,
      playsinline: true,
      autopause: false
    })

    this._player.on('timeupdate', ({ percent }) => {
      this.progress = percent * 100
    })

    this._player.on('pause', () => { this.isPaused = true })
    this._player.on('play',  () => { this.isPaused = false })
    this._player.on('ended', () => {
      this.isPlaying = false
      this.progress = 0
    })
  },
  beforeDestroy() {
    if (this._player) this._player.destroy()
    clearTimeout(this._hideControlsTimer)
  },
  methods: {
    handleMouseEnter() {
      this.$emit('mouseenter')
      this.isMouseHover = true
    },
    handleMouseMove(e) {
      if (!this.isPlaying) {
        if (this.$refs.icon) {
          this.$refs.icon.style.setProperty('--mouse-x', `${e.clientX - (this.$el.offsetLeft - window.scrollX)}px`)
          this.$refs.icon.style.setProperty('--mouse-y', `${e.clientY - (this.$el.offsetTop - window.scrollY)}px`)
        }
      } else {
        this.showControls()
      }
    },
    handleMouseLeave() {
      this.$emit('mouseleave')
      this.isMouseHover = false
    },
    handleClick() {
      if (!this.isPlaying) {
        this.isPlaying = true
        this._player?.play()
        this.showControls()
      }
    },
    togglePlay() {
      if (this.isPaused) {
        this._player?.play()
      } else {
        this._player?.pause()
      }
    },
    toggleMute() {
      this.isMuted = !this.isMuted
      this._player?.setMuted(this.isMuted)
    },
    async seek(e) {
      const rect = e.currentTarget.getBoundingClientRect()
      const ratio = (e.clientX - rect.left) / rect.width
      const duration = await this._player?.getDuration()
      if (duration) this._player?.setCurrentTime(duration * ratio)
    },
    requestFullscreen() {
      this._player?.requestFullscreen()
    },
    showControls() {
      this.controlsVisible = true
      clearTimeout(this._hideControlsTimer)
      this._hideControlsTimer = setTimeout(() => {
        this.controlsVisible = false
      }, 3000)
    }
  }
}
</script>

<style lang="sass" scoped>
.Video
  position: relative

  &:before
    content: ''
    position: absolute
    top: 50%
    left: 50%
    transform: translate(-50%, -50%) scale(1.005, 1.01)
    width: 100%
    height: 100%
    border-radius: 10px
    background: $black
    transform-origin: center
    box-shadow: textShadow($typoPres, $typoDepth, $black)

  &_content
    position: relative
    aspect-ratio: 16/9.1
    border-radius: 10px
    overflow: hidden
    box-shadow: textShadow($typoPres, $typoDepth, $black)
    cursor: none
    background: $black
    box-sizing: border-box

    +breakpoint(mobile)
      aspect-ratio: 9/11

    &_wrapper
      width: 100%
      height: 100%
      position: relative
      border-radius: 10px
      overflow: hidden

      &_poster
        position: absolute
        top: 50%
        left: 50%
        transform: translate(-50%, -50%)
        z-index: 2
        width: calc(100% - 20px)
        height: calc(100% - 20px)
        border-radius: 10px
        overflow: hidden

        img
          width: 100%
          height: 100%
          object-fit: cover
          transition: transform 1s ease-out

        &:hover img
          transform: scale(1.07)
          transition: transform 3s ease-out

  &_play
    pointer-events: none
    position: absolute
    top: var(--mouse-y)
    left: var(--mouse-x)
    opacity: 0
    transform: translate(-50%, -50%)
    transition: opacity ease .2s
    z-index: 3

    +breakpoint(mobile)
      opacity: 1
      top: 50%
      left: 50%

    .icon-play
      font-size: 5rem
      color: $white

    &.hover
      opacity: 1

  &_player
    position: absolute
    background: $black
    width: calc(100% - 20px)
    height: calc(100% - 20px)
    overflow: hidden
    margin: 10px
    border-radius: 10px
    pointer-events: none

    ::v-deep iframe
      width: 100%
      height: 100%
      object-fit: cover

  &_controls
    position: absolute
    bottom: 0
    left: 0
    right: 0
    z-index: 4
    padding: 1.5rem 1rem 1rem
    background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)
    display: flex
    align-items: center
    gap: 0.75rem
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
    font-size: 1.4rem
    cursor: pointer
    padding: 0.2rem
    opacity: 0.9
    transition: opacity 0.2s, transform 0.2s
    flex-shrink: 0
    display: flex
    align-items: center
    justify-content: center

    &:hover
      opacity: 1
      transform: scale(1.15)

  .ctrl-progress
    flex: 1
    cursor: pointer
    padding: 0.6rem 0

    &_bar
      height: 3px
      background: rgba(255,255,255,0.3)
      border-radius: 3px
      overflow: hidden

    &_fill
      height: 100%
      background: $white
      border-radius: 3px
      transition: width 0.1s linear

  &_content_wrapper.displayPlayer
    .Video_content_wrapper_poster
      display: none
    .Video_player
      pointer-events: auto
</style>
