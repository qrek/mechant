<template>
  <section class="aboutPage">
    <div class="aboutPage_hero" ref="hero">
      <VideoPlayer :id="aboutPageData?.video_id[0]?.text" :poster="aboutPageData?.video_poster?.url"/>

      <div class="aboutPage_hero_star star1" ref="star1">
        <span class="icon-star2"></span>
      </div>
      <div class="aboutPage_hero_star star2" ref="star2">
        <span class="icon-star3"></span>
      </div>
      <div class="aboutPage_hero_star star3" ref="star3">
        <span class="icon-star2"></span>
      </div>
      <img src="~assets/images/wave_pink_black.svg" alt="wave" class="wave reverse">
    </div>

    <div class="aboutPage_columns">
      <div ref="aboutTextWrapper">
        <h2 class="aboutPage_title" ref="aboutTitle" v-html="aboutPageData?.title[0]?.text"></h2>
        <span class="icon-star aboutPage_title_star"></span>

        <DynamicText class="aboutPage_text" ref="aboutText" :html="aboutPageData?.text[0]?.text" />
        <p class="aboutPage_text2" ref="aboutText2">
          <img src="~assets/images/cap.png" alt="mascotte"/>
          {{ aboutPageData?.services }}
        </p>

        <img class="mascotte_ordi showOnMobile" src="~assets/images/about_mascotte.gif" alt="mascotte">
      </div>
      <div class="aboutPage_columns_right">
        <img class="mascotte_ordi hideOnMobile" src="~assets/images/about_mascotte.gif" alt="mascotte">
        <span class="icon-star aboutPage_columns_right_star"></span>
      </div>
    </div>
    <div class="aboutPage_tagsWrappers">

      <div class="awardsTagWrapper">
        <Tag
          text="Awards"
          background="pink"
          color="white"
          customClass="awardsTag"
          :size="5"
          ref="awardsTag"
        />
      </div>

      <ul class="aboutPage_awardsList" ref="awardsList">
        <li class="aboutPage_awardsList_item" v-for="(award, index) in aboutPageData?.awards" :key="index">
          <div class="aboutPage_awardsList_item_date">{{ award?.year }}</div>
          <p class="aboutPage_awardsList_item_name">{{ award?.award_title }}</p>
          <Tag
            :text="award?.tag"
            background="white"
            color="pink"
            customClass="awardsItemTag"
            :size="2"
          />
          <p class="aboutPage_awardsList_item_details">{{ award?.details[0]?.text }}</p>
        </li>
      </ul>

      <div class="lastWorksButtonWrapper" ref="lastWorksButtonWrapper">
        <Button
          text="Latest works"
          background="pink"
          color="white"
          customClass="lastWorksButton"
          icon="icon-arrow-right"
          to="/works"
        />
      </div>
    </div>
  </section>
</template>

<script>
import { ref } from 'vue'
import { mapGetters } from 'vuex'
import Tag from "@/components/Tag"
import Button from "@/components/Button"
import VideoPlayer from '@/components/VideoPlayer'
import DynamicText from "@/components/DynamicText";

import { gsap } from '@/vendor/gsap'
import { ScrollTrigger } from "@/vendor/gsap/ScrollTrigger";
import { SplitText } from '@/vendor/gsap/SplitText'
gsap.registerPlugin(SplitText)
gsap.registerPlugin(ScrollTrigger)

import customPageTransitions from '@/mixins/customPageTransitions'

export default {
  name: 'About',
  components: {
    Tag,
    Button,
    VideoPlayer,
    DynamicText
  },
  mixins: [customPageTransitions],
  head() {
    return {
      title: this.aboutPageData.meta_title,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.aboutPageData.meta_description
        }
      ]
    }
  },
  data () {
    return {
    }
  },
  mounted () {
    this._tween = {}
  },
  computed: {
    ...mapGetters({
      data: 'data/getData',
    }),
    aboutPageData() {
      return this.data.aboutpage
    }
  },
  methods: {
    transitionIn() {
      this.aboutTextRef = ref('aboutText')
      this.setAnimations()
    },
    setAnimations () {
      setTimeout(_ => {
        this.$refs.hero.classList.add('animated')

        this._tween.heroAnimation = gsap.to([this.$refs.star3, this.$refs.star2, this.$refs.star1], {
          scrollTrigger: {
            trigger: this.$refs.hero,
            start: 'top 50%'
          },
          duration: 2,
          stagger: 0.3,
          scale: 1,
          ease: "elastic.out",
        })
      }, 0)

      const title = new SplitText(this.$refs.aboutTitle, { type: "words" })
      const text = new SplitText(this.$refs.aboutText.$el, { type: "words" })
      const text2 = new SplitText(this.$refs.aboutText2, { type: "words" })

      this._tween.textAnimation = gsap.to(this.$refs.aboutTitle.querySelectorAll('div:not(.Tag)'), {
        scrollTrigger: {
          trigger: this.$refs.aboutTextWrapper,
          start: 'top 70%'
        },
        duration: 1,
        stagger: 0.09,
        y: 0,
        opacity: 1,
        ease: "power4.out"
      })

      this._tween.textAnimation2 = gsap.to([this.$refs.aboutText.$el.querySelectorAll('div:not(.Tag)'), this.$refs.aboutText2.querySelectorAll('div:not(.Tag)')], {
        scrollTrigger: {
          trigger: this.$refs.aboutTextWrapper,
          start: 'top 70%'
        },
        duration: 1,
        stagger: 0.015,
        y: 0,
        opacity: 1,
        ease: "power4.out"
      })

      this._tween.awardqAnimation = gsap.to(['.awardsTag', this.$refs.awardsList.querySelectorAll('li')], {
        scrollTrigger: {
          trigger: this.$refs.awardsList,
          start: 'top 70%'
        },
        duration: 1,
        stagger: 0.2,
        y: 0,
        opacity: 1,
        ease: "power4.out"
      })

      this._tween.awardqAnimation = gsap.to(this.$refs.lastWorksButtonWrapper, {
        scrollTrigger: {
          trigger: this.$refs.awardsList,
          start: 'top 70%'
        },
        duration: 2,
        scale: 1,
        ease: "elastic.out",
      })
    }
  }
}
</script>

<style lang="sass" scoped>
.aboutPage
  $heroBottomHeight: 65vh
  $heroBottomHeightMobile: 55vh

  &_hero
    position: relative
    height: 100vh
    background: $orange
    display: flex
    justify-content: center
    align-items: center
    padding-top: 12vh
    overflow: hidden

    +breakpoint(mobile)
      height: calc($heroBottomHeightMobile + 20vh)
      overflow: initial

    &::after
      content: ''
      position: absolute
      top: 0
      left: 0
      height: $heroBottomHeight
      width: 100%
      background-color: $pink
      transform: translateY(-100%)
      transition: transform 1s ease

      +breakpoint(mobile)
        height: $heroBottomHeightMobile

    .wave.reverse
      top: $heroBottomHeight
      width: 100.1%
      z-index: 2
      transform: rotate(180deg) translateY(calc($heroBottomHeight + $waveMargin + 3vh))
      transition: transform 1s ease

      +breakpoint(mobile)
        top: $heroBottomHeightMobile
        transform: rotate(180deg) translateY($heroBottomHeightMobile)

    .Video
      position: relative
      width: 70%
      z-index: 3
      transform: translateY(100vh)
      opacity: 0
      transition: transform 1s ease, opacity 0.5s ease

      +breakpoint(mobile)
        width: 90%
        transform: translateY(20vh)

    &.animated
      &::after
        transform: translateY(0)
      .wave.reverse
        transform: translateY(0) rotate(180deg)

      .Video
        transform: translateY(0)
        opacity: 1

    &_star
      position: absolute
      z-index: 3
      transform: scale(0)

      > span
        display: block

      +breakpoint(mobile)
        display: none

      &.star1
        bottom: 35%
        left: 3%
        font-size: 6rem
        color: $black
        transform: scale(0) rotate(45deg)

        span
          @include animateStar(5s, 0s)

      &.star2
        top: 5%
        right: 15%
        font-size: 4rem
        color: $black
        transform: scale(0)

        span
          @include animateStar(6s, 0.2s)

      &.star3
        top: 60%
        right: 4%
        font-size: 5rem
        color: $white
        transform: scale(0)

        span
          @include animateStar(4s, 0.1s)

  &_columns
    position: relative
    display: flex
    padding: 10rem 10rem 0
    background: $orange

    +breakpoint(mobile)
      padding: 0rem 10% calc(7vh + $waveMargin)
      flex-direction: column

    > div
      position: relative
      width: 50%

      +breakpoint(mobile)
        width: 100%

    &_right_star
      position: absolute
      right: 0
      bottom: 0
      font-size: 6rem
      color: $white
      display: block
      @include animateStar(3s, 0.8s)

  &_tagsWrappers
    padding: 0 10rem calc(10rem + $waveMargin)
    background: $orange
    margin-top: -1px

    +breakpoint(mobile)
      padding: 0rem 10% calc(7vh + $waveMargin)
      flex-direction: column

  &_title
    font-family: $briceBoldCondensed
    color: $white
    text-shadow: textShadow($typoPres, $typoDepth*2.5, $black, true)
    font-size: 18rem
    text-transform: uppercase
    line-height: 0.9
    margin-top: 3rem

    +breakpoint(mobile)
      font-size: 9rem
      line-height: 1

    > ::v-deep span
      font-size: 12rem
      display: block

      +breakpoint(mobile)
        font-size: 6rem

    &_star
      font-size: 5rem
      color: $white
      position: absolute
      right: 5%
      top: 5vh
      @include animateStar(5s, 0.8s)

      +breakpoint(mobile)
        display: none

  &_text
    font-family: $kobe
    font-size: 2rem
    margin: 3rem 0
    line-height: 1.5

    ::v-deep .creativityTag
      transform: rotate(-2.5deg)

    ::v-deep .technicalTag
      transform: rotate(3deg)

  &_text2
    color: $white
    font-family: $kobe
    font-size: 2rem
    line-height: 1.5
    margin-bottom: 5rem

    +breakpoint(mobile)
      margin: 0

    > img
      width: 3.5rem
      height: auto
      margin-right: 1rem

      +breakpoint(mobile)
        display: block
        width: 5rem
        margin: 0 0 1rem 0

  &_title ::v-deep div, &_text ::v-deep > div:not(.Tag), &_text2 ::v-deep > div:not(.Tag), ::v-deep .awardsTag, &_awardsList_item
    opacity: 0
    transform: translateY(5rem)

  .awardsTagWrapper
    transform: rotate(-5deg)
    margin-bottom: 5rem
    margin-top: -5rem
    +breakpoint(mobile)
      margin-bottom: 4rem

  &_awardsList
    display: flex
    flex-wrap: wrap

    +breakpoint(mobile)
      flex-direction: column

    &_item
      margin: 4rem 0
      width: 50%

      +breakpoint(mobile)
        margin: 2rem 0
        width: 100%

      &_date
        font-family: $kobeBold
        font-size: 1.6rem
        color: $white

      &_name
        font-family: $briceBlackCondensed
        font-size: 3.3rem
        color: $white
        text-transform: uppercase
        margin: 1rem 0 0.2rem

        +breakpoint(mobile)
          font-size: 3rem


      &:nth-child(odd)
        .Tag_wrapper
          transform: rotate(-3deg)

      &:nth-child(even)
        .Tag_wrapper
          transform: rotate(2deg)

      &_details
        font-family: $kobeBold
        font-size: 1.4rem
        text-transform: uppercase
        color: $black
        margin-top: 1.5rem

  .lastWorksButton
    margin: 2rem 0
    transform: rotate(-4deg)

  .lastWorksButtonWrapper
    transform: scale(0)
    transform-origin: center
    display: inline-block

  .mascotte_ordi
    display: block
    width: 80%
    height: auto
    margin-left: 20%

    &.showOnMobile
      display: none

    +breakpoint(mobile)
      width: 100%
      margin: 0 0 4rem 0

      &.showOnMobile
        display: block

      &.hideOnMobile
        display: none

</style>
