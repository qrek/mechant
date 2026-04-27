<template>
  <div class="errorPage" ref="page">
    <img src="~assets/images/wave_pink_black.svg" alt="wave" class="wave reverse" />

    <div class="errorPage_star star1" ref="star1">
      <span class="icon-star2"></span>
    </div>
    <div class="errorPage_star star2" ref="star2">
      <span class="icon-star3"></span>
    </div>
    <div class="errorPage_star star3" ref="star3">
      <span class="icon-star2"></span>
    </div>
    <div class="errorPage_star star4" ref="star4">
      <span class="icon-star"></span>
    </div>

    <div>
      <div ref="oopsTag">
        <Tag
          text="Oops!!"
          background="orange"
          color="white"
          customClass="oopsTag"
          :size="3"
        />
      </div>

      <h2 class="errorPage_title" ref="title">Error 404</h2>

      <div class="homeButtonWrapper" ref="homeButtonWrapper">
        <Button
          text="Back to home"
          background="pink"
          color="white"
          customClass="backToHomeButton"
          to="/"
        />
      </div>
    </div>

    <img src="@/assets/images/sticker_bronzage.gif" alt="sticker" class="errorPage_sticker" ref="sticker">
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import Tag from "@/components/Tag"
import Button from "@/components/Button"

import { gsap } from '@/vendor/gsap'
import { SplitText } from '@/vendor/gsap/SplitText'
gsap.registerPlugin(SplitText)

export default {
  props: ['error'],
  components: {
    Tag,
    Button
  },
  beforeMount() {
    this.setErrorPage(true)
  },
  mounted() {
    const words = new SplitText(this.$refs.title, { type: "chars" })

    setTimeout(_ => {
      this.setAnimations()
    }, 0)
  },
  methods: {
    ...mapActions({
      setErrorPage: 'layout/setErrorPage'
    }),
    setAnimations() {
      this.$refs.page.classList.add('animated')
      gsap.to(this.$refs.title.querySelectorAll('div:not(.Tag)'), {
        duration: 1,
        stagger: 0.09,
        y: 0,
        scale: 1,
        opacity: 1,
        ease: "power4.out"
      })

      gsap.to([this.$refs.star4, this.$refs.oopsTag, this.$refs.star2, this.$refs.star1, this.$refs.homeButtonWrapper, this.$refs.star3, this.$refs.sticker], {
        duration: 2,
        stagger: 0.3,
        scale: 1,
        ease: "elastic.out",
      })
    }
  },
  beforeDestroy() {
    this.setErrorPage(false)
  }
}
</script>

<style lang="sass" scoped>
$heroBottomHeight: 45vh

.errorPage
  height: 100vh
  width: 100vw
  background: $orange
  display: flex
  justify-content: center
  align-items: center
  padding-top: 8vh
  overflow: hidden

  &::after
    content: ''
    position: fixed
    top: -10vh
    left: 50%
    height: $heroBottomHeight + 10vh
    width: 120%
    background-color: $pink
    transform: translateY(-100%) translateX(-50%) rotate(-185deg)
    transition: transform 0.7s ease

  .wave.reverse
    position: fixed
    top: $heroBottomHeight
    width: 100.1%
    z-index: 2
    transform: rotate(175deg) translateY($heroBottomHeight)
    transition: transform 1s ease

  &.animated
    &::after
      transform: translateY(0) translateX(-50%) rotate(-185deg)
    .wave.reverse
      transform: translateY(0) rotate(175deg)


  > div:not(.errorPage_star)
    position: relative
    z-index: 2
    display: flex
    justify-content: center
    align-items: center
    flex-direction: column

  &_title
    font-family: $briceBlackCondensed
    color: $white
    text-shadow: textShadow($typoPres, $typoDepth*2, $black, true)
    font-size: 16rem
    text-transform: uppercase
    line-height: 0.9
    margin: 2rem 0 5rem

    +breakpoint(mobile)
      font-size: 9rem
      line-height: 1

    > ::v-deep div, >  ::v-deep strong > div
      opacity: 0
      transform: translateY(1rem)

  .backToHomeButton
    transform: rotate(-4deg)

  ::v-deep .oopsTag
    transform: rotate(-5deg)

  &_sticker
    width: 20vw
    height: auto
    position: fixed
    top: 42%
    right: 5%
    transform: rotate(10deg) scale(0.01)
    z-index: 2

    +breakpoint(mobile)
      top: 75%
      width: 30vw

  &_star
    position: absolute
    z-index: 2
    transform: scale(0)

    +breakpoint(mobile)
      display: none

    &.star1
      top: 22%
      left: 15%
      font-size: 5rem
      color: $black
      transform: scale(0) rotate(45deg)
      @include animateStar(6s, 0.3s)

    &.star2
      top: 70%
      left: 35%
      font-size: 2.5rem
      color: $black
      transform: scale(0)
      @include animateStar(5s, 0s)

    &.star3
      top: 25%
      right: 25%
      font-size: 4rem
      color: $white
      transform: scale(0)
      @include animateStar(3s, 0.4s)

    &.star4
      bottom: 12%
      left: 10%
      font-size: 5rem
      color: $white
      transform: scale(0)
      @include animateStar(3s, 0.4s)

  .homeButtonWrapper, .oopsTag
    transform: scale(0)
</style>