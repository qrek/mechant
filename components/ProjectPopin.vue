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

    <div ref="player" class="ProjectPopin_player" :class="{ path: path && path.length }" :style="{ '--path': `'${path}'` }">
      <!-- <img class="ProjectPopin_player_placeholder" src="/textures/hero_1.png" alt="placeholder"> -->

      <div class="ProjectPopin_player_iframe" ref="videoIframe"></div>

      <div class="ProjectPopin_player_close" @click="handleClose">
        <i class="ProjectPopin_player_close_icon icon-close"></i>
      </div>
      <div class="ProjectPopin_player_info" :class="{ active: isInfosVisible }">
        <div class="Infos">
          <div class="Infos_client">{{  project?.client }}</div>
          <div class="Infos_title">{{ project?.title[0] }}</div>
          <ul class="Infos_tags">
            <li v-for="(tag, index) in project?.categories" :key="index">{{ categoriesData[tag].title }}</li>
          </ul>
          <div class="Infos_text">{{ project?.text[0] }}</div>
          <div class="Infos_tag">
            <Tag
              v-for="(tag, index) in project?.badges" :key="index"
              :text="tag"
            />
          </div>
        </div>
        <div class="ProjectPopin_player_info_icon" id="projectInfoButton" @click="handleClickInfo">
          <i class="icon-info"></i>
        </div>
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
  name: 'Project',
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
      }
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
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
    handleEnter() {
      const _el = this.$el
      const {
        projectPopinBg1,
      } = this.$refs

      this.player = new Vimeo.Player(this.$refs.videoIframe, {
        id: `https://player.vimeo.com/video/${this.project.vimeo_id}?h=036b684498`,
        playsinline: false
      })

      this.tween.active = gsap.timeline()
      this.tween.active.add('enter')
      this.tween.active.add(projectPopinBg1.animation().timeScale(1).play(), 'enter')
      this.tween.active.to(_el, {
        opacity: 1,
        top: 0,
        duration: 0.4,
        onComplete: _ => {
          this.player.play()
          _el.classList.add('displayPlayer')
        }
      }, 'enter')
    },
    handleLeave() {
      const _el = this.$el
      const {
        projectPopinBg1,
      } = this.$refs

      this.tween.active = gsap.timeline()
      this.player.pause()
      _el.classList.remove('displayPlayer')

      this.tween.active.add('leave')
      this.tween.active.add(projectPopinBg1.animation().timeScale(2).reverse(0, true), 'leave')
      this.tween.active.to(_el, {
        opacity: 0,
        top: '-10vh',
        delay: .6,
        duration: 0.4,
        onComplete: _ => {
          this.player.destroy()
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
    //opacity: 0
    width: 100%
    height: 100%
    //border-radius: 10px
    overflow: hidden
    position: relative

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

      ::v-deep iframe
        width: 100%
        height: 100%
        object-fit: cover
        opacity: 0
        transition: opacity 1s ease

    &_info
      position: absolute
      bottom: 2.5rem
      right: 2.5rem
      width: auto
      height: auto
      display: flex
      align-items: center
      justify-content: center
      cursor: pointer
      z-index: 1

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
      z-index: 1
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

</style>
