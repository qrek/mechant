<template>
  <div class="ProjectList" :class="{ isMobile: isMobile }">
    <div
      v-for="(project, index) in projects"
      :key="index" class="ProjectList_item"
      :class="[`${(index + 1) % 2 === 0 ? 'even' : 'odd'}`, { hidden: !(filter === 'all' || !project.categories.indexOf(filter)), isFiltering }]"
    >
      <Project
        ref="projects"
        :data="project"
        @mouseenter="(e) => handleMouseEnter(e, index)"
        @mouseleave="(e) => handleMouseLeave(e, index)"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import gsap from '@/vendor/gsap'
import Observer from '@/vendor/gsap/Observer'

import Project from '@/components/Project'
import webgl from '@/mixins/webgl'

export default {
  name: 'ProjectList',
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
      desktopOnly: true,
      isFiltering: false
    }
  },
  computed: {
    ...mapGetters({
      isMobile: 'layout/isMobile',
      filter: 'data/getFilter',
      data: 'data/getData'
    }),
    categories () {
      return this.data.categories
    }
  },
  watch: {
    filter () {
      this.onUpdate()
    },
  },
  methods: {
    onSoftInit() {
      window.addEventListener('scroll', this.handleScroll.bind(this))
      this.handleScrollInit()
    },
    onSoftDestroy() {
      window.removeEventListener('scroll', this.handleScroll.bind(this))
    },
    onInit() {
      this.scene.initWorks({ works: this.$refs.projects })
      this._observer = Observer.create({
        target: window,
        types: 'wheel',
        onDrag: (e) => this.scene.works.onDrag(e),
        onWheel: (e) => this.scene.works.onWheel(e)
      })
    },
    onUpdate() {
      this.isFiltering = true

      const items = this.$el.querySelectorAll('.ProjectList_item')
      for (let i = 0; i < items.length; i++) {
        delete items[i].dataset['active']
      }

      this.$nextTick(() => {
        this?.scene?.works?.filterByCategory(this.filter)

        this.handleScroll()

        if (this.isMobile)
          setTimeout(() => {
            this.handleScroll()
          }, 300)
        this.isFiltering = false
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
    handleScrollInit () {
      const items = this.$el.querySelectorAll('.ProjectList_item')

      let active = null

      for (let i = 0; i < items.length; i++) {
        const item = items[i]

        const bound = item.getBoundingClientRect()
        const props = {
          el: item,
          center: bound.y + (bound.height / 2),
          distance: (window.innerHeight * .6) - (bound.y + (bound.height / 2)),
        }

        if (
          props.center >= 0 &&
          props.center <= window.innerHeight * .6
        ) {
          if (active) {
            if (active.distance > props.distance)
              active = props
          } else {
            active = props
          }
        }

        if (!item.dataset['active']) {
          if (bound.y <= (window.innerHeight * .90)) {
            setTimeout(() => {
              item.dataset['active'] = 'active'
            }, ((i - 1) * 50) + 200)
          }
        }
      }

      if (active) {
        if (!active.el.classList.contains('center')) {
          if (this.$el.querySelector('[data-center="center"]'))
            delete this.$el.querySelector('[data-center="center"]').dataset['center']
          active.el.dataset['center'] = 'center'
        }
      }
    },
    handleScroll() {
      const items = this.$el.querySelectorAll('.ProjectList_item')

      let active = null

      for (let i = 0; i < items.length; i++) {
        const item = items[i]

        const bound = item.getBoundingClientRect()
        const props = {
          el: item,
          center: bound.y + (bound.height / 2),
          distance: (window.innerHeight * .6) - (bound.y + (bound.height / 2)),
        }

        if (
          props.center >= 0 &&
          props.center <= window.innerHeight * .6
        ) {
          if (active) {
            if (active.distance > props.distance)
              active = props
          } else {
            active = props
          }
        }

        if (!item.dataset['active']) {
          if (bound.y <= (window.innerHeight * .90)) {
            item.dataset['active'] = 'active'
          }
        }
      }

      if (active) {
        if (!active.el.classList.contains('center')) {
          if (this.$el.querySelector('[data-center="center"]'))
            delete this.$el.querySelector('[data-center="center"]').dataset['center']
          active.el.dataset['center'] = 'center'
        }
      }
    },
    handleLoadMore(projects) {
      this.$nextTick(() => {
        this?.scene?.works?.updateWorks(projects, this.$refs.projects)

        this.$nextTick(() => {
          this.handleScroll()
        })
      })
    }
  }
}
</script>

<style lang="sass" scoped>
.ProjectList
  padding: 5rem 0 30rem
  width: 80%
  display: flex
  align-items: flex-start
  justify-content: flex-start
  flex-wrap: wrap
  gap: 8rem 10rem

  &.isMobile
    gap: 4rem
    flex-direction: column

    .ProjectList_item
      .Project
        position: relative
        margin-bottom: 0

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
          transition-delay: .2s
          transition-timing-function: ease-out
          transform: translateY(calc(100% + 2rem))

      &[data-center]
        .Project
          &::before
            width: calc(100% + 12px)
            height: calc(100% + 12px)

          ::v-deep .word
            transform: translateY(0)

      &.odd
        .Project
          transition: all $easeOutQuad .7s

      &.even
        .Project
          transition: all $easeOutQuad .7s

    .Project
      width: 100%
      height: 18rem
      aspect-ratio: initial
      margin-bottom: 4rem
      transition: all $easeOutQuad .7s

      > ::v-deep .Project_background
        opacity: 1
        visibility: initial


  +breakpoint(mobile)
    padding: 5rem 0 15rem

  &_item
    display: flex
    align-items: center
    justify-content: center
    width: calc(50% - 5rem)

    +breakpoint(mobile)
      height: 19rem
      transition: all $easeOutQuad .5s

    &.hidden
      height: 0
      opacity: 0
      display: none
      padding: 0
      margin-bottom: 0
      overflow: hidden

      +breakpoint(mobile)
        display: flex

    .Project
      transform: translateY(calc(100vh + 100%))
      opacity: 0
      pointer-events: none
      .Project
        transform: translateY(100%)


    &.odd
      .Project
        transition: all $easeOutQuad .7s

    &.even
      .Project
        transition: all $easeOutQuad .7s .2s

    &[data-active]
        +breakpoint(mobile)
          .Project
            pointer-events: auto
            opacity: 1
            transform: translateY(0)

        .Project[data-loaded]
          pointer-events: auto
          opacity: 1
          transform: translateY(0)

    &.isFiltering
      .Project
        pointer-events: auto
        opacity: 1
        transform: translateY(0)
        transition: none

    +breakpoint(mobile)
      width: 100%

  .Project
    width: 100%
    aspect-ratio: 758/442

    &.hidden
      display: none

    &:hover
      outline: none
      cursor: pointer

    > ::v-deep .Project_background
      opacity: 0
      visibility: hidden

</style>
