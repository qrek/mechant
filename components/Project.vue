<template>
  <div
    class="Project"
    :id="`project_${data.id}`"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <div class="Project_background" :style="{ backgroundImage: `url('${data?.poster || data?.thumbnail_url}')` }" />
    <div class="Project_play" :class="{ hover: isMouseHover }" ref="icon">
      <i class="Project_play_icon icon-play"></i>
    </div>
    <div class="Project_infos">
      <div class="Project_infos_client" ref="client">{{ data?.client }}</div>
      <h3 class="Project_infos_title" ref="title">{{ data?.title }}</h3>
      <ul class="Project_infos_tags" ref="tags">
        <li v-for="(tag, index) in data?.categories" :key="index" v-if="categoriesData[tag]">{{ categoriesData[tag].title }}</li>
      </ul>
    </div>
  </div>
</template>

<script>

import {mapActions} from "vuex";
import { gsap } from '@/vendor/gsap'
import { SplitText } from '@/vendor/gsap/SplitText'
import { mapGetters } from 'vuex'

import webgl from '@/mixins/webgl'

gsap.registerPlugin(SplitText)

export default {
  name: 'Project',
  data () {
    return {
      isMouseHover: false,
      mouseX: 0,
      mouseY: 0
    }
  },
  mixins: [webgl],
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapGetters({
      allData: 'data/getData',
    }),
    categoriesData() {
      return this.allData.categories
    },
  },
  methods: {
    ...mapActions({
      setActive: 'project/setActive',
      setId: 'project/setId'
    }),
    getId () {
      return this.data.id
    },
    getPreviewVideo () {
      return this.data.preview_video
    },
    onSoftInit () {
      setTimeout(() => {
        const {
          client,
          title,
          tags
        } = this.$refs

        const splitOptns = {
          type: 'lines,words,chars',
          wordsClass: 'word',
          charsClass: 'char',
          linesClass: 'line'
        }

        const splitClient = new SplitText(client, splitOptns)
        const splitTitle = new SplitText(title, splitOptns)
        const splitTags = new SplitText(tags, splitOptns)

        const words = [...splitClient.words, ...splitTitle.words, ...splitTags.words]
        const lines = [...splitClient.lines, ...splitTitle.lines, ...splitTags.lines]

        words.forEach((w, index) => {
          w.style.setProperty('--split-word', index);
        })

        lines.forEach((l, index) => {
          l.style.setProperty('--split-line', index);
        })
      }, 100)
    },
    handleClick() {
      this.setActive(true)
      this.setId(this.data.id)
    },
    handleMouseEnter() {
      this.$emit('mouseenter')
      this.isMouseHover = true
    },
    handleMouseMove(e) {
      this.mouseX = e.clientX
      this.mouseY = e.clientY

      const calcX = this.mouseX - ((this.$el.offsetLeft ? this.$el.offsetLeft : this.$el.offsetParent.offsetLeft ) - window.scrollX)
      const calcY = this.mouseY - ((this.$el.offsetTop ? this.$el.offsetTop : this.$el.offsetParent.offsetTop ) - window.scrollY)

      this.$refs.icon.style.setProperty('--mouse-x', `${calcX}px`);
      this.$refs.icon.style.setProperty('--mouse-y', `${calcY}px`);

      function calculateDistance(elem, mouseX, mouseY) {
        const bodyRect = document.body.getBoundingClientRect()
        const elRect = elem.getBoundingClientRect()
        const offsetLeft = elRect.left - bodyRect.left
        const offsetTop = elRect.top

        return {
          x: mouseX - (offsetLeft + (elRect.width/2)),
          y: mouseY - (offsetTop + (elRect.height/2)),
        }
      }

      const distance = calculateDistance(this.$refs.icon, this.mouseX, this.mouseY)

      this.$refs.icon.style.setProperty('--mouse-x', `${calcX + distance.x}px`);
      this.$refs.icon.style.setProperty('--mouse-y', `${calcY + distance.y}px`);
    },
    handleMouseLeave() {
      this.$emit('mouseleave')
      this.isMouseHover = false
    }
  }
}
</script>

<style lang="sass" scoped>
.Project
  position: relative
  display: flex
  align-items: flex-end
  padding: 4rem
  border-radius: 10px
  transition: outline 0.3s ease
  outline:  0 solid $white
  z-index: 1
  // overflow: hidden
  cursor: none !important

  +breakpoint(mobile)
    padding: 1.5rem

  &:hover
    outline: 0.8rem solid $white

    .Project_infos_client
      ::v-deep
        .word
          transition: transform $easeOutQuad .3s
          transform: translateY(0%)

    .Project_infos_title
      ::v-deep
        .word
          transition: transform $easeOutQuad .3s .1s
          transform: translateY(0%)

    .Project_infos_tags
      ::v-deep
        .line
          transition: border-color $easeOutQuad .3s .6s
          border-color: $white

        .word
          transition: transform $easeOutQuad .3s calc((var(--split-line) * .1s))
          transform: translateY(0%)

  &_background
    position: absolute
    top: 0
    left: 0
    width: 100%
    height: 100%
    border-radius: 10px
    background-position: center
    background-size: cover
    background-repeat: no-repeat
    z-index: -1

  &_play
    pointer-events: none
    position: absolute
    top: var(--mouse-y)
    left: var(--mouse-x)
    opacity: 0
    transform: translate(-50%, -50%)
    transition: opacity ease .2s

    &.hover
      opacity: 1

    &_icon
      font-size: 5rem
      color: $white
      text-shadow: textShadow($typoPres, calc($typoDepth/2), $black)

  &_infos
    color: $white

    &_client
      font-family: $briceBlackCondensed
      font-size: 2.8rem
      text-transform: uppercase
      margin: .7rem 0 .5rem
      display: block
      ::v-deep .line
        overflow: hidden

      ::v-deep
        .word
          transition: transform ease-in-out .3s
          transform: translateY(calc(100% + 2rem))
          +breakpoint(mobile)
            transform: translateY(0)

    &_title
      font-family: $kobeBold
      font-size: 1.3rem
      text-transform: uppercase
      ::v-deep .line
        overflow: hidden
      ::v-deep
        .word
          transition: transform ease-in-out .3s
          transform: translateY(calc(100% + 1rem))
          +breakpoint(mobile)
            transform: translateY(0)

    &_tags
      display: flex
      align-items: center
      ::v-deep .line
        overflow: hidden

      ::v-deep .line:not(:first-child)
        transition: border-color ease-in-out .3s
        border-left: 1px solid transparent
        padding-left: .5rem
        margin: 0 .5rem
        +breakpoint(mobile)
          border-color: $white

      ::v-deep
        .word
          transition: transform ease-in-out .3s
          transform: translateY(100%)
          +breakpoint(mobile)
            transform: translateY(0)

      li
        font-family: $kobeBold
        font-size: 1.2rem
        text-transform: uppercase

        &:not(:first-child)
          margin: 0 0.5rem

        +breakpoint(mobile)
          font-size: 1.2rem


</style>
