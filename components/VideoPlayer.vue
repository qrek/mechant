<template>
  <div
    class="Video"
    @mouseenter="handleMouseEnter"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <div class="Video_content" @click="playVideo" id="showreelButton">
      <div class="Video_content_wrapper" :class="{displayPlayer: init}">
        <div class="Video_content_wrapper_poster">
          <img :src="poster" alt="video" />
        </div>
        <div class="Video_player" ref="videoIframe"></div>

        <div class="Video_play" :class="{ hover: isMouseHover }" ref="icon" v-if="!init">
          <span class="icon-play"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideoPlayer',
  data () {
    return {
      isMouseHover: false,
      mouseX: 0,
      mouseY: 0,
      init: false
    }
  },
  props: {
    id: {
      type: String,
      default: ''
    },
    poster: {
      type: String,
      default: ''
    }
  },
  mounted() {
    this.player = new Vimeo.Player(this.$refs.videoIframe, {
      id: `https://player.vimeo.com/video/${this.id}?h=036b684498`,
      playsinline: false
    })
  },
  methods: {
    handleMouseEnter() {
      this.$emit('mouseenter')
      this.isMouseHover = true
    },
    handleMouseMove(e) {
      if(this.init)
        return

      this.mouseX = e.clientX
      this.mouseY = e.clientY

      this.$refs.icon.style.setProperty('--mouse-x', `${this.mouseX - (this.$el.offsetLeft - window.scrollX)}px`);
      this.$refs.icon.style.setProperty('--mouse-y', `${this.mouseY - (this.$el.offsetTop - window.scrollY)}px`);
    },
    handleMouseLeave() {
      this.$emit('mouseleave')
      this.isMouseHover = false
    },
    playVideo() {
      this.init = true
      this.player.play()
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
    background: gray
    border-radius: 10px
    overflow: hidden
    box-shadow: textShadow($typoPres, $typoDepth, $black)
    cursor: none
    background: $white
    box-sizing: borer-box

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

        &:hover
          img
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

    z-index: 2

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
    pointer-events: none
    overflow: hidden
    margin: 10px
    border-radius: 10px

    ::v-deep iframe
      width: 100%
      height: 100%
      object-fit: cover

  &_content_wrapper.displayPlayer
    .Video_content_wrapper_poster
      display: none

    .Video_player
      pointer-events: auto

</style>
