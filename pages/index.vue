<template>
  <section class="homePage">
    <Hero :data="heroProjects" />
    <div class="homePage_intro">
      <img src="~assets/images/wave_orange.svg" alt="wave" class="wave">
      <img src="~assets/images/wave_orange.svg" alt="wave" class="wave reverse">

      <KinesisContainer>
        <DynamicText ref="introText" :html="homePageData?.about_us_text[0]?.text" />

        <kinesis-element :strength="!isMobile ? 10 : 0">
          <div class="aboutUsButtonWrapper" ref="aboutButtonWrapper">
            <Button
              text="About us"
              background="pink"
              color="white"
              customClass="aboutUsButton"
              icon="icon-arrow-right"
              to="/about"
            />
          </div>
        </kinesis-element>

        <div class="homePage_intro_star star1" ref="star1">
          <kinesis-element :strength="!isMobile ? 15 : 0">
            <span class="icon-star2"></span>
          </kinesis-element>
        </div>
        <div class="homePage_intro_star star2" ref="star2">
          <kinesis-element :strength="!isMobile ? -12 : 0">
            <span class="icon-star"></span>
          </kinesis-element>
        </div>
        <div class="homePage_intro_star star3" ref="star3">
          <kinesis-element :strength="!isMobile ? 14 : 0">
            <span class="icon-star2"></span>
          </kinesis-element>
        </div>
        <div  class="homePage_intro_star star4" ref="star4">
          <kinesis-element :strength="!isMobile ? -10 : 0">
            <span class="icon-star3"></span>
          </kinesis-element>
        </div>

        <div class="homePage_intro_sticker" ref="introSticker">
          <kinesis-element :strength="!isMobile ? -17 : 0">
            <img src="~assets/images/sticker_chauve.png" alt="mechant" />
          </kinesis-element>
        </div>
      </KinesisContainer>
    </div>

    <div class="homePage_gallery">
      <!-- webgl gallery -->
      <ProjectHome :projects="lastProjects" />

      <Button
        text="More films"
        background="orange"
        color="white"
        customClass="loadMoreBtn"
        icon="icon-arrow-right"
        to="/works"
      />
    </div>
  </section>
</template>

<script>
import Hero from "@/components/Hero"
import Button from "@/components/Button"
import ProjectHome from "@/components/ProjectHome"
import DynamicText from "@/components/DynamicText";

import { gsap } from '@/vendor/gsap'

import { ScrollTrigger } from "@/vendor/gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger)

import customPageTransitions from '@/mixins/customPageTransitions'
import { mapGetters } from 'vuex'
import { KinesisContainer, KinesisElement} from 'vue-kinesis'
import TransitionManager from "~/utils/TransitionManager";
import {TRANSITION_ENTER_END, TRANSITION_LEAVE_END} from "~/store/router";

export default {
  name: 'IndexPage',
  components: {
    Hero,
    Button,
    ProjectHome,
    DynamicText,
    KinesisContainer,
    KinesisElement
  },
  mixins: [customPageTransitions],
  head() {
    return {
      title: this.homePageData.meta_title,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.homePageData.meta_description
        }
      ]
    }
  },
  data () {
    return {
      tween: {
        textScrollEvent: null,
        introScrollEvent2: null,
      },
    }
  },
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        this.setAnimations()
      }, 500)
    })

    this.transitionManager = new TransitionManager()

    this.transitionManager.addEventListener(TRANSITION_LEAVE_END, () => {
      this.$nextTick(() => {
        setTimeout(() => {
          this.setAnimations()
        }, 500)
      })
    })
  },
  beforeDestroy() {
    if (this.tween.textScrollEvent)
      this.tween.textScrollEvent.kill()

    if (this.tween.introScrollEvent2)
      this.tween.introScrollEvent2.kill()
  },
  computed: {
    ...mapGetters({
      data: 'data/getData',
      mobile: 'layout/isMobile'
    }),
    isMobile() {
      return this.mobile
    },
    homePageData() {
      return this.data.homepage
    },
    projectsData() {
      return this.data.projects
    },
    heroProjects() {
      return Object.values(this.data.heroProjects)
    },
    lastProjects() {
      return Object.values(this.projectsData).slice(-5)
    }
  },
  methods: {
    setAnimations () {
      if (this?.tween?.textScrollEvent)
        this?.tween?.textScrollEvent.kill()

      if (this?.tween?.introScrollEvent2)
        this?.tween?.introScrollEvent2.kill()

      if (!this.$refs?.introText?.$el)
        return

      this.tween.textScrollEvent = gsap.to(this.$refs.introText.$el.querySelectorAll('div:not(.Tag)'), {
        scrollTrigger: {
          trigger: this.$refs.introText.$el,
          start: 'top 70%'
        },
        duration: 1,
        stagger: 0.09,
        y: 0,
        scale: 1,
        opacity: 1,
        ease: "power4.out",
        onComplete: _ => {
          if (this.tween.textScrollEvent)
            this.tween.textScrollEvent.kill()
        }
      })

      this.tween.introScrollEvent2 = gsap.to([this.$refs.star1, this.$refs.star3, this.$refs.introSticker, this.$refs.star2, this.$refs.star4, this.$refs.aboutButtonWrapper], {
        scrollTrigger: {
          trigger: this.$refs.introText.$el,
          start: 'top 70%'
        },
        duration: 2,
        stagger: 0.1,
        scale: 1,
        ease: "elastic.out",
        onComplete: _ => {
          if (this.$refs.introSticker)
            this.$refs.introSticker.classList.add('animated')

          if (this.tween.introScrollEvent2)
            this.tween.introScrollEvent2.kill()
        }
      })
    }
  }
}
</script>

<style lang="sass" scoped>
.homePage
  overflow-x: hidden

  &_intro
    position: relative
    background: $orange
    font-size: 2.8rem
    color: $white
    font-family: $kobe
    text-align: center
    margin: 0 0 $waveMargin
    line-height: 1.2

    > div
      width: 100%
      height: 100%
      padding: 10rem
      display: flex
      align-items: center
      justify-content: center
      flex-direction: column

      +breakpoint(mobile)
        padding: 10rem 3rem

      > ::v-deep p
        width: 50%

        +breakpoint(mobile)
          width: 100%


    +breakpoint(mobile)
      font-size: 2.4rem
      line-height: 1.2

    ::v-deep strong
      font-family: $kobeBlack

      +breakpoint(mobile)
        display: block

    ::v-deep .visualEffectTag
      transform: rotate(-2deg)

    ::v-deep .editingTag
      transform: rotate(1.8deg)
      margin-right: .5rem

    .aboutUsButtonWrapper
      transform: scale(0)
      margin-top: 3rem

      .aboutUsButton:active:before
        transform: translate(-48%, -40%) scale(101%, 1.07)

    .aboutUsButton
      transform: rotate(-4deg)

    &_star
      position: absolute
      transform: scale(0)

      span
        display: block

      &.star1
        font-size: 7rem
        color: $black
        top: 12%
        left: 15%
        transform: scale(0) rotate(30deg)

        +breakpoint(mobile)
          font-size: 2.5rem
          top: 8%
          left: 10%

        span
          @include animateStar(5s, 0.8s)

      &.star2
        font-size: 7rem
        color: $white
        bottom: 10%
        left: 25%

        +breakpoint(mobile)
          font-size: 4rem
          bottom: 20%
          left: 10%

        span
          @include animateStar(4s, 0.5s)

      &.star3
        font-size: 4rem
        color: $white
        top: 16%
        right: 15%

        +breakpoint(mobile)
          font-size: 2rem
          top: 25%
          right: 5%

        span
          @include animateStar(6s, 0.2s)

      &.star4
        font-size: 3.6rem
        color: $black
        bottom: 25%
        right: 25%

        +breakpoint(mobile)
          font-size: 2rem
          bottom: 10%
          right: 20%

        span
          @include animateStar(4.5s, 0.6s)

    &_sticker
      position: absolute
      top: 15%
      right: 20%
      transform: scale(0.01)

      +breakpoint(mobile)
        right: 5%
        top: 4%

      img
        width: 11rem
        height: auto

        +breakpoint(mobile)
          width: 7rem

    p
      > ::v-deep div, >  ::v-deep strong > div
        opacity: 0
        transform: translateY(1rem)

  &_gallery
    display: flex
    // align-items: center
    // justify-content: center
    flex-direction: column
    padding: 8rem 10% calc(10rem + $waveMargin)

  .loadMoreBtn
    display: inline-block
    margin: 10rem auto 2rem
    transform: rotate(-5deg)
    +breakpoint(mobile)
      margin: 3rem auto 1rem
</style>
