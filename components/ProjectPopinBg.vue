<template>
  <div class="ProjectPopinBg" :class="`index_${index}`">
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
         viewBox="0 0 1858 1028" xml:space="preserve" preserveAspectRatio="none" ref="svg" :class="`${color}`" :style="`z-index: ${index};`">
      <path id="svgOpen" d="M164.9,84.4c32-6.5,329.1-64.5,765.7-63.7c224.3,0.4,485.4,16.4,766.3,62.8c1.8,0.3,3.3,1.8,3.5,3.6l2,15.6
        l2,15.6c0.3,2.8-2.1,5.1-4.9,4.7c-43.5-7.2-338.2-53.4-768.9-52.1c-224.8,0.7-486.6,14.3-769,53.2c-2.8,0.4-5.2-2-4.7-4.8l2.4-16.3
        l2.3-15.2C161.8,86.2,163.1,84.8,164.9,84.4z" />

      <path id="svgMiddle" d="M90.1,88.1c84.6-12.6,446.1-61.7,905.6-58.3c239.9,1.8,506.5,18,774.2,61.2c10.6,1.7,18.4,10.7,18.6,21.4
        l17.7,369.5l-4.4,433.4c0.2,13.4-11.5,20.9-24.8,22.3c-90.7,9.3-394.6,25.7-827.7,25.3c-251.6-0.2-548,0-857-25.4
        c-13.3-1.1-25-8.5-25-21.9c0,0-9-86.7-9-413.3c0-353.5,13-392.5,13-392.5C71.3,99,79.3,89.7,90.1,88.1z" />

      <path id="svgFinal" d="M935,1028H0V499.1V0h929h929v535.3V1028H935z"/>
    </svg>
  </div>
</template>

<script>
import { gsap } from '@/vendor/gsap'
import { MorphSVGPlugin } from '@/vendor/gsap/MorphSVGPlugin'
gsap.registerPlugin(MorphSVGPlugin)

export default {
  name: 'ProjectPopinBg',
  props: {
    color: {
      type: String,
      default: 'black'
    },
    index: {
      type: Number,
      default: 1
    }
  },
  mounted() {
    const svgOpen = this.$refs.svg.querySelector('#svgOpen')
    const svgMiddle = this.$refs.svg.querySelector('#svgMiddle')
    const svgFinal = this.$refs.svg.querySelector('#svgFinal')

    this.tl = gsap.timeline({
      paused: true,
      defaults: {
        ease: 'none'
      },
      onComplete: () => {
        this.$emit('onPathChange', {
          path: svgOpen.getAttribute('d'),
          viewbox: { x: 1858, y: 1028 }
        })
      }
    })

    this.tl.to(svgOpen,
      {
        morphSVG: svgMiddle,
        duration: 0.4,
        ease: "expo.in",
        onUpdate: () => {
          this.$emit('onPathChange', {
            path: svgOpen.getAttribute('d'),
            viewbox: { x: 1858, y: 1028 }
          })
        }
      })
    this.tl.to(svgOpen,
      {
        morphSVG: svgFinal,
        duration: 1.4,
        ease: "expo.out",
        onUpdate: () => {
          this.$emit('onPathChange', {
            path: svgOpen.getAttribute('d'),
            viewbox: { x: 1858, y: 1028 }
          })
        }
      })
  },
  methods: {
    animation() {
      return this.tl
    },
    animate() {
      this.tl.play()
    },
    reverse(callback) {
      this.tl.timeScale(3).reverse(0, true)
    }
  }
}
</script>

<style lang="sass" scoped>
.ProjectPopinBg
  position: absolute
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  width: 100%
  height: 100%

  $bgWidth: 100%

  &.index_1
    width: $bgWidth
    height: $bgWidth

  &.index_2
    width: calc($bgWidth - 4px)
    height: calc($bgWidth - 4px)

  &.index_3
    width: calc($bgWidth - 14px)
    height: calc($bgWidth - 14px)

  &.index_4
    width: calc($bgWidth - 18px)
    height: calc($bgWidth - 18px)


svg
  width: 100%
  height: 100%

  &.black path
    fill: $black

  &.white path
    fill: $white

  &.pink path
    fill: $pink

#svgMiddle, #svgFinal
  visibility: hidden
</style>
