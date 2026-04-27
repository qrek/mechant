<template>
  <footer class="Footer">
    <div class="Footer_contact" ref="footerContact">
      <img src="~assets/images/wave_pink.svg" alt="wave" class="wave">
      <img src="~assets/images/wave_pink.svg" alt="wave" class="wave reverse">

      <KinesisContainer>
        <p ref="footerText" v-html="footerData?.text[0]?.text"></p>
        <div class="Footer_contact_buttons">
          <div class="contactButtonWrapper" ref="contactButtonWrapper">
            <a :href="`mailto:${footerData?.email_address}`" class="mailtoLink">
              <Button
                :text="footerData?.email_address"
                background="black"
                color="white"
                customClass="contactButton"
              />
            </a>
          </div>
          <div class="addressButtonWrapper" ref="addressButtonWrapper">
            <Button
              :text="footerData?.address"
              background="orange"
              color="white"
              customClass="addressButton"
            />
          </div>
        </div>

        <div class="Footer_contact_sticker" ref="sticker">
          <kinesis-element :strength="!isMobile ? 15 : 0">
            <img src="~assets/images/sticker_jump.png" alt="mechant" />
          </kinesis-element>
        </div>

        <div class="Footer_contact_star star1" ref="star1">
          <kinesis-element :strength="!isMobile ? -12 : 0">
            <span class="icon-star"></span>
          </kinesis-element>
        </div>
        <div class="Footer_contact_star star2" ref="star2">
          <kinesis-element :strength="!isMobile ? -14 : 0">
            <span class="icon-star3"></span>
          </kinesis-element>
        </div>
        <div class="Footer_contact_star star3" ref="star3">
          <kinesis-element :strength="!isMobile ? -13 : 0">
            <span class="icon-star2"></span>
          </kinesis-element>
        </div>
        <div class="Footer_contact_star star4" ref="star4">
          <kinesis-element :strength="!isMobile ? 16 : 0">
            <span class="icon-star2"></span>
          </kinesis-element>
        </div>
      </KinesisContainer>
    </div>
    <div class="Footer_bottom" ref="footerBottom">
      <div class="Footer_bottom_line Footer_bottom_socials" ref="footerSocials">
        <a :href="footerData?.instagram_url?.url" target="_blank" class="instagramButton">
          <img src="~assets/images/instagram.svg" alt="instagram">
        </a>
      </div>
      <div class="Footer_bottom_line">
        <div class="Footer_bottom_address" ref="footerAddress">
          <a :href="footerData?.google_maps_link?.url" target="_blank">{{ footerData?.address }}</a>
        </div>
        <nav class="Footer_bottom_nav" ref="footerNav">
          <ul>
            <li><NuxtLink to="/">Mechant</NuxtLink></li>
            <li><NuxtLink to="/about">About</NuxtLink></li>
            <li><NuxtLink to="/works">Works</NuxtLink></li>
            <li><a href="mailto:contact@mechant.tv">Contact</a></li>
          </ul>
        </nav>
        <nav class="Footer_bottom_secondaryNav" ref="footerSecondaryNav">
          <ul>
            <li><NuxtLink to="/privacy_policy">Privacy policy</NuxtLink></li>
          </ul>
        </nav>
      </div>
    </div>
  </footer>
</template>

<script>
import { mapGetters } from 'vuex'
import Button from '@/components/Button'
import { KinesisContainer, KinesisElement} from 'vue-kinesis'
import TransitionManager from '@/utils/TransitionManager'
import { TRANSITION_ENTER_END } from '@/store/router'

import { gsap } from '@/vendor/gsap'
import { ScrollTrigger } from '@/vendor/gsap/ScrollTrigger'
import { SplitText } from '@/vendor/gsap/SplitText'
gsap.registerPlugin(SplitText)
gsap.registerPlugin(ScrollTrigger)

export default {
  name: 'Footer',
  components: {
    Button,
    KinesisContainer,
    KinesisElement
  },
  data() {
    return {
      transitionManager: null,
      isAnimated: false,
      tween: {
        textScrollEvent: null,
        footerScrollEVent2: null,
        footerScrollEVent3: null
      }
    }
  },
  mounted () {
    this.setAnimations()
    this.transitionManager = new TransitionManager()

    this.transitionManager.addEventListener(TRANSITION_ENTER_END, () => {
      this.setAnimations()
    })
  },
  computed: {
    ...mapGetters({
      data: 'data/getData',
      mobile: 'layout/isMobile',
      filter: 'data/getFilter',
    }),
    isMobile() {
      return this.mobile
    },
    footerData() {
      return this.data.footer
    }
  },
  watch: {
    filter () {
      this.setAnimations()
    },
  },
  methods: {
    checkTween(key) {
      if (this.tween[key]) {
        this.tween[key].kill()
        this.tween[key] = null
      }
    },
    setAnimations () {
      if (this.isAnimated)
        return

      this.checkTween('textScrollEvent')
      this.checkTween('footerScrollEVent2')
      this.checkTween('footerScrollEVent3')

      // intro
      const words = new SplitText(this.$refs.footerText, { type: "words" })
      this.tween.textScrollEvent = gsap.to(this.$refs.footerText.querySelectorAll('div:not(.Tag)'), {
        scrollTrigger: {
          trigger: this.$refs.footerContact,
          start: 'top 70%'
        },
        duration: 1,
        stagger: 0.09,
        y: 0,
        scale: 1,
        opacity: 1,
        ease: "power4.out",
        onComplete: _ => {
          this.tween.textScrollEvent.kill()
        }
      })

      this.tween.footerScrollEVent2 = gsap.to([this.$refs.star1, this.$refs.star3, this.$refs.sticker, this.$refs.star2, this.$refs.star4, this.$refs.addressButtonWrapper, this.$refs.contactButtonWrapper], {
        scrollTrigger: {
          trigger: this.$refs.footerContact,
          start: 'top 70%'
        },
        duration: 2,
        stagger: 0.1,
        scale: 1,
        ease: "elastic.out",
        onComplete: _ => {
          this.tween.footerScrollEVent2.kill()
        }
      })

      this.tween.footerScrollEVent3 = gsap.to([this.$refs.footerSocials.querySelectorAll('a'), this.$refs.footerAddress, this.$refs.footerNav.querySelectorAll('li'), this.$refs.footerSecondaryNav.querySelectorAll('li')], {
        scrollTrigger: {
          trigger: this.$refs.footerContact,
          start: 'top 30%'
        },
        duration: 1,
        stagger: 0.1,
        y: 0,
        opacity: 1,
        ease: "power4.out",
        onComplete: _ => {
          this.tween.footerScrollEVent3.kill()
        }
      })
    }
  }
}
</script>

<style lang="sass" scoped>
.Footer
  overflow: hidden
  padding-top: $waveMargin
  margin-top: -$waveMargin

  +breakpoint(mobile)
    padding-top: calc($waveMargin + 1vh)
    margin-top: -4vh

  &_contact
    position: relative
    display: flex
    flex-direction: column
    align-items: center
    background: $pink
    margin: 0 0 $waveMargin

    .wave.reverse
      background-color: $black
      z-index: 2

    > div
      width: 100%
      height: 100%
      padding: 10rem

      +breakpoint(mobile)
        padding: 10rem 3rem

    p
      font-family: $kobe
      font-size: 2.8rem
      color: $white
      text-align: center

      +breakpoint(mobile)
        padding: 0 2rem
        line-height: 1.2
        font-size: 2.4rem

      ::v-deep em
        font-family: $kobeBold

      > ::v-deep div, > strong > ::v-deep div
        opacity: 0
        transform: translateY(1rem)


    &_buttons
      display: flex
      flex-direction: column
      justify-content: center
      align-items: center
      margin-top: 4rem

      .contactButtonWrapper, .addressButtonWrapper
        transform: scale(0)

      .contactButton, .addressButton
        margin: 0.5rem auto

      .contactButtonWrapper
        z-index: 2

      .contactButton
        transform: rotate(-2.5deg)
        z-index: 2

      .addressButton
        transform: rotate(2deg)

        &:active:before
          transform: translate(-49%, -40%) scale(101%, 1.07)

    &_sticker
      position: absolute
      top: 7%
      left: 20%
      transform: scale(0.01)

      +breakpoint(mobile)
        top: 0
        left: 7%

      img
        width: 10rem
        height: auto

        +breakpoint(mobile)
          width: 6rem

    &_star
      position: absolute
      transform: scale(0)

      span
        display: block

      &.star1
        font-size: 7rem
        color: $white
        bottom: 15%
        left: 15%

        +breakpoint(mobile)
          bottom: 5%

        span
          @include animateStar(5s, 0.8s)

      &.star2
        font-size: 4rem
        color: $black
        top: 2%
        left: 38%

        +breakpoint(mobile)
          left: 80%

        span
          @include animateStar(4s, 0.5s)

      &.star3
        font-size: 4rem
        color: $white
        right: 25%
        top: 30%

        span
          @include animateStar(6s, 0.2s)

      &.star4
        font-size: 6rem
        color: $black
        bottom: 20%
        right: 7%
        transform: rotate(30deg) scale(0)

        +breakpoint(mobile)
          bottom: 10%

        span
          @include animateStar(4.5s, 0.6s)

  &_bottom
    background: $black
    padding: 3rem 4rem

    &_line
      display: flex
      align-items: center

      &:first-child
        justify-content: center
        padding: 3rem 0 5rem

        img
          display: inline-block
          width: 2.8rem
          height: auto
          transition: transform 0.3s ease

          &:hover
            transform: scale(1.3) rotate(-5deg)

      &:last-child
        justify-content: space-between

        +breakpoint(mobile)
          flex-direction: column

    &_address
      a, a:visited
        font-family: $briceBlackCondensed
        font-size: 1.4rem
        color: $white
        transition: color 0.3s ease

        &:hover
          color: $orange

      +breakpoint(mobile)
        order: 2
        margin: 4rem 0 2rem

    &_nav
      +breakpoint(mobile)
        order: 1

      ul
        display: flex

        li
          margin: 0 2rem

          +breakpoint(mobile)
            margin: 0 1rem

          a, a:visited
            color: $white
            text-decoration: none
            font-family: $briceBlackCondensed
            font-size: 3rem
            transition: color 0.3s ease

            &:hover
              color: $orange

            +breakpoint(mobile)
              font-size: 2.5rem

    &_secondaryNav
      +breakpoint(mobile)
        order: 3

      ul
        display: flex

        li
          margin: 0 1rem

          a, a:visited
            color: $white
            text-decoration: none
            font-family: $briceBlackCondensed
            font-size: 1.4rem
            transition: color 0.3s ease

            &:hover
              color: $orange

    &_address, li, &_socials a
      transform: translateY(2rem)
      opacity: 0

</style>
