<template>
  <div class="ProjectHome" :class="{ isMobile: isMobile }">
    <div
      class="ProjectHome_item"
      v-for="(project, index) in projects"
      :key="index"
      :class="[`${(index + 1) % 2 === 0 ? 'even' : 'odd'}`, getDisplay(index)]"
      ref="items"
    >
      <div class="ProjectHome_item_wrapper">
        <Project
          :data-display="getDisplay(index)"
          ref="projects"
          :key="index"
          :data="project"
          @mouseenter="(e) => handleMouseEnter(e, index)"
          @mouseleave="(e) => handleMouseLeave(e, index)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import Observer from '@/vendor/gsap/Observer'

import Project from '@/components/Project'
import webgl from '@/mixins/webgl'

export default {
  name: 'ProjectHome',
  components: {
    Project
  },
  mixins: [webgl],
  props: {
    projects: {
      type: Array,
      default: _ => []
    }
  },
  data() {
    return {
      desktopOnly: true
    }
  },
  computed: {
    ...mapGetters({
      isMobile: 'layout/isMobile'
    })
  },
  methods: {
    onSoftInit() {
      window.addEventListener('scroll', this.handleScroll)
      this.handleScroll()
    },
    onSoftDestroy() {
      window.removeEventListener('scroll', this.handleScroll)
    },
    onInit() {
      this.scene.initWorks({ works: this.$refs.projects })
      this._observer = Observer.create({
        target: window,
        types: 'wheel',
        onDrag: (e) => this.scene.works.onDrag(e),
        onChangeY: (e) => this.scene.works.onWheel(e)
      })
    },
    onDestroy() {
      this._observer.kill()
      this.scene.destroyWorks()
    },
    handleMouseEnter(event, index) {
      this?.scene?.works?.onMouseEnter(event, index)
    },
    handleMouseLeave(event, index) {
      this?.scene?.works?.onMouseLeave(event, index)
    },
    handleScroll() {
      const { items } = this.$refs

      let active = null

      for (let i = 0; i < items.length; i++) {
        const item = items[i]

        const bound = item.getBoundingClientRect()
        const props = {
          el: item,
          center: bound.y + (bound.height / 2),
          distance: window.innerHeight - (bound.y + (bound.height / 2)),
        }

        if (
          props.center >= window.innerHeight * .2 &&
          props.center <= window.innerHeight * .8
        ) {
          if (active) {
            if (active.distance > props.distance)
              active = props
          } else {
            active = props
          }
        }

        if (bound.y <= (window.innerHeight)) {
          item.classList.add('active')
        }
      }

      if (active) {
        if (!active.el.classList.contains('center')) {
          if (this.$el.querySelector('.center'))
            this.$el.querySelector('.center').classList.remove('center')
          active.el.classList.add('center')
        }
      }
    },
    getDisplay(index) {
      const formattedIndex = index % 5

      switch (formattedIndex) {
        case 0:
          return 'work_alpha_mask_vertical'
        case 1:
          return 'work_alpha_mask_square'
        case 2:
          return 'work_alpha_mask_tv'
        case 3:
          return 'work_alpha_mask_vertical'
        case 4:
          return 'work_alpha_mask_horizontal'
        default:
          return 'work_alpha_mask'
      }
    }
  }
}
</script>

<style lang="sass" scoped>
  .ProjectHome
    display: flex
    flex-direction: column
    overflow: hidden

    &.isMobile
      overflow: initial

      .ProjectHome_item
        width: 100%

        .Project
          position: relative

          &::before
            content: ''
            position: absolute
            top: 50%
            left: 50%
            transform: translate(-50%, -50%)
            width: 100%
            height: 100%
            background: $white
            z-index: 1
            border-radius: 10px
            transition: width 0.3s ease, height 0.3s ease

          ::v-deep .Project_background
            z-index: 1

          ::v-deep .Project_infos
            z-index: 2

          ::v-deep .word
            transition-delay: 0s
            transition-timing-function: ease-out
            transform: translateY(calc(100% + 2rem))
        &.center
          .Project
            &::before
              width: calc(100% + 12px)
              height: calc(100% + 12px)

            ::v-deep .word
              transform: translateY(0)

      .Project
        > ::v-deep .Project_background
          opacity: 1
          visibility: initial

    &_item
      display: flex
      align-items: center
      justify-content: center
      width: 40%

      &_wrapper
        width: 100%
        display: flex
        align-items: center
        justify-content: center
        opacity: 0
        transform: translateY(20vh)
        pointer-events: none
        transition: all ease-out .5s .2s

      &.active
        .ProjectHome_item_wrapper
          opacity: 1
          transform: translateY(0)
          pointer-events: auto

      &:nth-child(5n+1)
        justify-self: flex-start
        .Project
          padding: 5rem 4.3rem
          transform: rotate(-3deg)
          aspect-ratio: 9/14
          +breakpoint(mobile)
            padding: 2.5rem

      &:nth-child(5n+2)
        align-self: flex-end
        .Project
          transform: rotate(6deg)
          aspect-ratio: 1
          +breakpoint(mobile)
            padding: 2.5rem

        +breakpoint(mobile)
          margin: 10vh 0

      &:nth-child(5n+3)
        align-self: flex-start
        width: 70%
        .Project
          transform: rotate(7deg)
          aspect-ratio: 16/9
          +breakpoint(mobile)
            aspect-ratio: 4/2.5
            padding: 2.5rem

        +breakpoint(mobile)
          width: 85%
          margin-bottom: 5rem
          .Project
            transform: rotate(-7deg)

      &:nth-child(5n+4)
        align-self: flex-end
        //transform: translateY(-2vw) rotate(2deg)
        margin-top: -2vw
        .Project
          padding: 5rem 4.3rem
          transform: rotate(2deg)
          aspect-ratio: 9/14
          +breakpoint(mobile)
            padding: 2.5rem

        +breakpoint(mobile)
          margin: 2vh 0 5vh

      &:nth-child(5n+5)
        align-self: flex-start
        //transform: translate(20%, 5vw) rotate(-6deg)
        margin-top: 20%
        margin-left: 5vw
        width: 55%
        margin-bottom: 12vw
        .Project
          transform: rotate(-6deg)
          aspect-ratio: 14/9
          +breakpoint(mobile)
            padding: 2.5rem

        +breakpoint(mobile)
          width: 90%
          margin-left: 0

      .Project
        transform-origin: center
        width: 100%
        padding: 5rem

        +breakpoint(mobile)
          width: 85%

        &:hover
          outline: none
          cursor: pointer

        > ::v-deep .Project_background
          opacity: 0
          visibility: hidden

</style>
