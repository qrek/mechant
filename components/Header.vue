<template>
  <header class="Header" :class="{navIsOpen: isMenuOpen}">

    <!-- Logo masqué sur la page Works -->
    <NuxtLink v-if="!isWorksPage" to="/" class="Header_logoLink" @click.native="closeMainNav">
      <img class="Header_logo" src="~assets/images/logo.png" alt="Mechant">
    </NuxtLink>

    <!-- Navigation minimale sur la homepage -->
    <nav class="Header_homeNav" v-if="isHomePage">
      <NuxtLink to="/works">Work</NuxtLink>
      <NuxtLink to="/about">About</NuxtLink>
      <a :href="`mailto:${footerData?.email_address}`">Contact</a>
    </nav>

    <div class="Header_mainNav" v-if="isMenuOpen" ref="mainNav">
      <div class="svgWrapper">
        <MenuBg ref="menuBg1" :index="1" />
        <MenuBg ref="menuBg2" :index="2" color="white" />
        <MenuBg ref="menuBg3" :index="3" />
        <MenuBg ref="menuBg4" :index="4" color="pink" />
      </div>

      <div class="Header_mainNav_star star1" ref="mainNavStar1">
        <span class="icon-star2"></span>
      </div>
      <div class="Header_mainNav_star star2" ref="mainNavStar2">
        <span class="icon-star2"></span>
      </div>
      <div class="Header_mainNav_star star3" ref="mainNavStar3">
        <span class="icon-star3"></span>
      </div>

      <div>
        <div class="Header_mainNav_columnWrapper">
          <div class="Header_mainNav_column">
            <ul class="Header_mainNav_links" ref="mainNavLinks">
              <li @click="toggleMainNav">
                <NuxtLink to="/about">About</NuxtLink>
              </li>
              <li @click="toggleMainNav">
                <NuxtLink to="works">Works</NuxtLink>
              </li>
              <li>
                <a :href="`mailto:${footerData?.email_address}`">Contact</a>
              </li>
            </ul>
            <div class="Header_mainNav_contactBloc" ref="mainNavContacts">
              <p>
                <a :href="`mailto:${footerData?.email_address}`" class="mailtoLink">{{ footerData?.email_address }}</a><br/>
                <a :href="`tel:${footerData?.phone_number}`">{{ footerData?.phone_number }}</a>
              </p>
              <p><a :href="footerData?.google_maps_link?.url" target="_blank" v-html="footerData?.address_footer"></a></p>
            </div>
          </div>
          <div class="Header_mainNav_column">
          </div>
        </div>
        <ul class="Header_mainNav_bottom" ref="mainNavBottom">
          <li @click="toggleMainNav">
            <NuxtLink to="/privacy_policy">Privacy policy</NuxtLink>
            <NuxtLink to="/cookies">Cookies Policy</NuxtLink>
          </li>
        </ul>
      </div>

      <div class="Header_mainNav_mascotteWrapper_overflow">
        <div class="Header_mainNav_mascotteWrapper" ref="mascotteWrapper">
          <svg version="1.1" id="Calque_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
viewBox="0 0 1182.3 882.5" style="enable-background:new 0 0 1182.3 882.5;" xml:space="preserve">
            <style type="text/css">
              .st0_mascotte{fill:#FF8600;}
              .st1_mascotte{fill:#FFFFFF;}
              .st2_mascotte{fill:none;stroke:#000000;stroke-width:13;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}
              .st3_mascotte{fill:none;stroke:#000000;stroke-width:13;stroke-miterlimit:10;}
              .st4_mascotte{fill:#FF81AE;}
            </style>
            <g id="ORANGE">
              <polygon class="st0_mascotte" points="64.6,751.2 11.5,78.4 144,71.3 314.1,107.4 392.5,202.8 632.9,214.1 665.4,178 763.7,107.4 897,111.3
                983,132.3 1041.1,865 1016.7,875.8 786.5,846.8 786.5,760.8 668.2,828.3 448.5,805.8 439.5,716.4 356,782.3 285.8,787.3
                65.5,761.8 	"/>
              <polygon class="st1_mascotte" points="356.8,288.6 346,311.3 366.1,375.6 415.6,405.5 454,405.5 488.5,371.8 526.3,405.2 601.8,401.8
                640.9,326.5 640.9,265.8 617.4,207.2 579.4,226.3 499.9,260.5 421.2,281.7 	"/>
              <polygon class="st1_mascotte" points="640.9,206.7 612.5,193.8 621.5,88.8 640.9,64.1 666.4,41.6 703.3,73.3 734.9,131.7 665.4,178 	"/>
              <polygon class="st1_mascotte" points="530.4,158.8 492.8,173.8 421.1,173.3 388.4,151 412.8,119.5 481.6,119.5 530.5,135.7 530.5,158.8 	"/>
            </g>
            <g id="ARRIERE-PLAN">
              <polygon points="738,119.4 844,80.3 1057,73.3 1123,84.3 1155,568.3 1173,806.3 1027,871.3 1022,668.3 983,299.3 978,136.3
                962.6,130.3 923,116.3 861.4,114.4 790.8,116.6 734.9,131.7 	"/>
              <polygon points="76,77.3 117,58.3 277.5,41.6 388.4,82.2 352,150.3 352,173.3 317.7,150 274.8,119.4 172.8,86.8 	"/>
            </g>
            <g id="PREMIER-PLAN">
              <path d="M446,731.8c-8.9-56.7-24.9-120.3-47.5-189.1l-1.8-5.3c-15.1-46.1-29.4-89.6-54-130.1c-8.9-14.7-19.8-28.3-32.5-40.5
                L297,356.1c-2-1.7-4.8-2-7.2-0.9c-2.5,1.2-4,4-3.7,6.7l49.4,428.5l12.9-1.5l-0.8-6.7l50.4-29l41.5-16.9l-0.8-3.5L446,731.8z"/>
              <path d="M560.6,409.7c-2.6-3.5-6.6-5.6-11-5.7c-26.6-0.8-43.6-20.4-51.3-32c-2.4-3.6-6.8-5.2-10.9-4.1c-4.2,1.2-7.1,4.8-7.3,9.1
                c-0.5,10,0.3,18.3,2.3,24.7c0.3,0.8,25.9,81.3,34.7,150.8l2,15.8c5.9,46.2,7.6,60.2,8.8,64.7c0.8,3,3.4,5,6.5,5
                c0.3,0,0.6,0,0.9-0.1c3.4-0.5,5.8-3.4,5.7-6.8c-0.4-11.9-2.9-118.4,21.9-209.3C564,417.6,563.2,413.2,560.6,409.7z"/>
              <path d="M791,770.3c-0.1-0.9-7.2-90.5-14.7-179.1c-4.4-52-8-93.6-10.8-123.4c-1.7-17.7-3-31.5-4.1-40.9c-0.6-5.1-1.1-9.1-1.4-11.8
                c-0.6-4.3-1.2-8-5.2-9.4l-4.1-1.4l-2.9,3.1c-56,60.8-63.8,110.2-73.8,172.7c-0.6,3.8-1.2,7.7-1.9,11.6
                c-11,67.7-13.3,229.6-13.4,236.5h2.5v0.1l0.2-0.1l10.2,0.1c0-0.1,0-0.9,0-2.2l16.8-3.4l89.1-56.4c0.1,1.6,0.3,3.3,0.4,4.9
                L791,770.3z"/>
            </g>
            <g id="SOURIRE">
              <g id="BOUCHE">
                <path class="st2_mascotte" d="M591,490.8c0,0,68.5-40,87.5-105"/>
                <path class="st2_mascotte" d="M674.5,356.8c0,0-1,21,5,28.4c5.2,6.4,13,13.6,21,16.6"/>
              </g>
            </g>
            <g id="CONTOUR-YEUX">
              <path class="st3_mascotte" d="M349.9,289.2c0,0-4.4,38.5,4.6,60.5s33,63,85,56c26.2-3.5,44.3-24.2,54-36"/>
              <path class="st3_mascotte" d="M486.5,260.5c0,0-10.9,37.2-7.9,65.2s14.3,49.8,14.3,49.8"/>
              <path class="st3_mascotte" d="M549.4,410.5c0,0,32.2,3.3,53.2-14.7s35.9-50,38-83c3-48-14-83-14-83"/>
            </g>
            <g id="YEUX_00000126300802077711608320000002696196521488980134_">
              <g id="YEUX">
                <path ref="eye1" d="M419.3,269.8c0,0-18,2-18,25c0,19,0,51,20,53c0,0,18,5,21-25S439.3,268.8,419.3,269.8z"/>
                <path ref="eye2" d="M551.9,265.8c0,0-16.5,4-16.6,27c0,24,3.8,51.9,23.9,52.8c0,0,19.2,3,19.6-27.1C579.2,285.8,569.2,263.8,551.9,265.8z"/>
              </g>
            </g>
            <g id="ROSE-CASQUETTE">
              <path class="st4_mascotte" d="M665.2,46.6l-30.5-28.8l-57.1-6.6H490l-64.3,35.4L374,90.3l-26.3,86.5l-1.7-0.9l-10.3,5.5l-99.1,32.7
                L214,250.3l18.2,25.5l72.2,17.4l100.5-9.7L554,237.3l28.1-23.2l-96.6,4.3l-26.8-4.3H567h15h41.5L610,119.4l24.7-56.8L665.2,46.6z
                M401.5,204.8l-25.4-13.3l55.8,18.2L401.5,204.8z M530.4,158.8l-37.6,15l-71.7-0.5L388.4,151l24.4-31.5h68.8l48.9,16.2L530.4,158.8
                L530.4,158.8z"/>
            </g>
            <g id="CONTOUR_GLOBAL">
              <path class="st3_mascotte" d="M727.5,122.8c0,0,81-41,174-46c99.2-5.3,219,3,219,3l55,721l-145,75l-239-33l-7-74l-108.2,58
                c-2.5,1.3-5.3,1.9-8.1,1.6l-219.7-22.6l-9-73L344,789.5c-0.3,0.2-0.7,0.3-1,0.2L65.5,761.8l-59-677c-0.3-3.1,1.9-5.9,5-6.5
                l240-36.5c4.7-0.7,9.3,0,14,1c25.1,5,110.1,36,119.1,44c0,0-30,32-31,91c0,0-27,3-86,26s-65,59-25,78s192,16,358-68c0,0,20,2,17-12
                s-9.7-82.1,4-113c12-27,31-48.5,55-37c23,11,53,77,53,77s-45,31-55,43c-5.7,6.8-38,32-47,58c0,0,1.9,6-1,0c-1.7-3.6-8.4-11.3-14-14
                c-11.8-5.5-41.7,0.2-52,0c0,0-76,5-124-6s-84-23-97-44c0,0-43-37-114-62C161.7,81.3,91,73,60.6,74.8c-34,2-44,3-44,3"/>
              <path class="st3_mascotte" d="M384.5,86.8c0,0,58-76,154-80c83-3.5,122,27,150,54"/>
              <path class="st3_mascotte" d="M688.5,158.8c0,0-48,54-106.5,55.3h50.8"/>
              <path class="st3_mascotte" d="M703.3,147.7c0,0,50.3-33.9,122.3-33.9s67-1,145,16.9c0,0,5.1,4.8,5.5,16.9l55.5,728.1"/>
              <path class="st3_mascotte" d="M415.8,171c-7.2-1.2-13.9-4.8-18.5-10.6c-3.8-4.7-6.5-11.1-3.8-18.7c6-17,32-22,41-22s58-3,79,9s20,25,10,34
                s-35,12.3-52,13C453.3,176.5,428,173,415.8,171z"/>
            </g>
            </svg>
        </div>
      </div>

    </div>
  </header>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import MenuText from '@/components/MenuText'
import CloseText from '@/components/CloseText'
import MenuBg from '@/components/MenuBg'
import { gsap } from '@/vendor/gsap'

export default {
  name: 'Header',
  components: {
    MenuText,
    CloseText,
    MenuBg
  },
  mounted() {
    this.tweens = {}
  },
  updated() {
    if(this.isMenuOpen) {
      this.setSvgAnimation()

      this.$refs.mainNav.addEventListener('mousemove', this.eyesAnimation.bind(this))
    }
  },
  computed: {
    ...mapGetters({
      data: 'data/getData',
      isMenuOpen: 'layout/isMenuOpen'
    }),
    footerData() {
      return this.data.footer
    },
    isHomePage() {
      return this.$route.name === 'index' || this.$route.path === '/'
    },
    isWorksPage() {
      return this.$route.path === '/works' || this.$route.name === 'works'
    }
  },
  methods: {
    ...mapActions({
      setMenuStatus: 'layout/setMenu'
    }),
    toggleMainNav () {
      if(this.$refs.mainNav)
        this.$refs.mainNav.removeEventListener('mousemove', this.eyesAnimation)

      if(this.isMenuOpen){
        this.setSvgAnimation(true)
        this.$refs.closeText.transitionOut()
        this.$refs.menuText.transitionIn()
      }
      else {
        this.setMenuStatus(!this.isMenuOpen)
        this.$refs.menuText.transitionOut()
        this.$refs.closeText.transitionIn()
      }
    },
    setAnimations(reverse) {
      if(reverse) {
        this.tweens.mainNavAnim1 = gsap.to([this.$refs.mainNavLinks.querySelectorAll('li a'), this.$refs.mainNavContacts.querySelectorAll('p'), this.$refs.mainNavBottom.querySelectorAll('li')], {
          duration: 0.4,
          y: '-5rem',
          opacity: 0,
          stagger: 0.05,
          ease: "power4.out"
        })

        this.tweens.mainNavAnim2 = gsap.to([this.$refs.mainNavStar2, this.$refs.mainNavStar3, this.$refs.mainNavStar1], {
          duration: 1,
          scale: 0,
          stagger: 0.3,
          ease: "elastic.out"
        })

        this.tweens.mainNavAnim3 = gsap.to(this.$refs.mascotteWrapper, {
          duration: 0.4,
          y: '80vh',
          ease: "power4.out"
        })
      }
      else {
        this.tweens.mainNavAnim1 = gsap.to([this.$refs.mainNavLinks.querySelectorAll('li a'), this.$refs.mainNavContacts.querySelectorAll('p'), this.$refs.mainNavBottom.querySelectorAll('li')], {
          duration: 0.6,
          y: 0,
          opacity: 1,
          stagger: 0.1,
          ease: "power4.out"
        })

        this.tweens.mainNavAnim2 = gsap.to([this.$refs.mainNavStar2, this.$refs.mainNavStar3, this.$refs.mainNavStar1], {
          duration: 2,
          scale: 1,
          stagger: 0.3,
          ease: "elastic.out"
        })

        this.tweens.mainNavAnim3 = gsap.to(this.$refs.mascotteWrapper, {
          duration: 0.4,
          delay: 0.35,
          y: 0,
          ease: "power4.out"
        })
      }
    },
    setSvgAnimation(reverse) {
      if(reverse) {
        this.setAnimations(true)
        this.$refs.menuBg1.reverse()
        this.$refs.menuBg2.reverse()
        this.$refs.menuBg3.reverse()
        this.$refs.menuBg4.reverse()
        gsap.to('.svgWrapper', { opacity: 0, y: '-15vh', delay: 0.3, onComplete: _ => {
          this.setMenuStatus(!this.isMenuOpen)
        }})
      }
      else {
        gsap.to('.svgWrapper', { opacity: 1, y: 0})
        this.$refs.menuBg1.animate()
        this.$refs.menuBg2.animate()
        this.$refs.menuBg3.animate()
        this.$refs.menuBg4.animate()
        setTimeout(this.setAnimations, 500)
      }
    },
    eyesAnimation(e) {
      const getRotation = (item) => {
        const offset = item.getBoundingClientRect()
        const yMultiple = 2
        let x = ((e.pageX - window.innerWidth) / (window.innerWidth - offset.left) * 100) + offset.width * yMultiple
        let y = (((e.pageY - window.scrollY) - window.innerHeight) / (window.innerHeight  - offset.top) * 100) + offset.height * yMultiple

        x = (x <= -offset.width) ? -offset.width : ((x => offset.width) ? offset.width : x)
        y = (y <= -(offset.height / 1.5)) ? -(offset.height / 1.5) : (y >= offset.height / 1.5 ? offset.height / 1.5 : y)
        
        return { x, y }
      }

      this.leftEyeRot = getRotation(this.$refs.eye1)
      this.rightEyeRot = getRotation(this.$refs.eye2)

      gsap.to(this.$refs.eye1, {x: this.leftEyeRot.x, y: this.leftEyeRot.y, duration: 0.5})
      gsap.to(this.$refs.eye2, {x: this.rightEyeRot.x, y: this.rightEyeRot.y, duration: 0.5})
    },
    closeMainNav() {
      if(this.isMenuOpen)
        this.setSvgAnimation(true)
    }
  },
  beforeDestroy() {
    if (this.tweens.mainNavAnim1)
      this.tweens.mainNavAnim1.kill()

    if (this.tweens.mainNavAnim2)
      this.tweens.mainNavAnim2.kill()

    if (this.tweens.mainNavAnim3)
      this.tweens.mainNavAnim3.kill()
  },
}
</script>

<style lang="sass" scoped>
.Header
  position: fixed
  top: 0
  left: 0
  width: 100%
  display: flex
  align-items: center
  justify-content: space-between
  z-index: 10
  padding: 3rem 6rem
  box-sizing: border-box

  +breakpoint(mobile)
    padding: 3.5rem 3rem

  // Navigation minimale homepage
  &_homeNav
    margin-left: auto
    display: flex
    align-items: center
    gap: 3.5rem

    a, a:visited
      font-family: $apfel
      font-weight: 500
      font-size: 1.3rem
      letter-spacing: 0.08em
      text-transform: uppercase
      color: $white
      transition: opacity 0.2s ease

      &:hover
        opacity: 0.5

      &.nuxt-link-exact-active
        opacity: 0.5

    +breakpoint(mobile)
      gap: 2rem

      a, a:visited
        font-size: 1.1rem

  &_navBtn
    position: relative
    cursor: pointer
    z-index: 2
    transition: transform 0.3s ease

    &:hover
      transform: rotate(-5deg) scale(1.05)

    &_mascotte
      position: absolute
      top: -0.5rem
      left: -2rem
      width: 3.5rem
      height: auto
      z-index: 2

      +breakpoint(mobile)
        width: 2.5rem
        top: -0.8rem
        left: -1.2rem

  &_logoLink
    display: flex
    align-items: center
    z-index: 2

  &_logo
    display: block
    width: 14rem
    height: auto
    z-index: 2

    +breakpoint(mobile)
      width: 12rem
      transform: translate(-50%, -70%)

  &_socials
    position: relative
    z-index: 2
    +breakpoint(mobile)
      transform: translateY(-10%)

    a, a:visited
      display: inline-block
      font-size: 2.4rem
      color: $black
      transition: transform 0.3s ease

      &:hover
        transform: scale(1.3) rotate(-5deg)

    img
      width: 2.4rem
      height: auto

  &_mainNav
    position: fixed
    top: 0
    left: 0
    width: 100%
    height: 100%
    display: flex
    align-items: center
    padding: 15% 15% 10%
    perspective: 500px

    +breakpoint(mobile)
      padding: 15% 10%

    > *
      z-index: 2

    > div:not(.Header_mainNav_star):not(.svgWrapper)
      display: flex
      flex-direction: column
      width: 100%

    .svgWrapper
      position: fixed
      top: 0
      left: 0
      width: 100%
      height: 100%
      opacity: 0
      transform: translateY(-20vh)

    &_links
      li
        display: inline-block
        margin: 0.9rem 0
        transition: transform 0.3s ease
        transform-origin: center
        backface-visibility: hidden

        a, a:visited
          display: inline-block
          font-family: $briceBoldCondensed
          color: $white
          text-shadow: textShadow($typoPres, $typoDepth*2, $black, true)
          font-size: 19vh
          text-transform: uppercase
          line-height: 0.9
          backface-visibility: hidden
          opacity: 0
          transform: translateY(5rem)

          +breakpoint(mobile)
            font-size: 10vh

          &.nuxt-link-exact-active, &:hover
            color: $orange

        &:hover
          transform: scale(1.1) rotate(-3deg)

        &:nth-child(even):hover
          transform: scale(1.1) rotate(4deg)


    &_contactBloc
      display: flex
      margin-top: 1rem
      font-family: $kobeBold
      font-size: 1.5rem
      color: $black
      line-height: 1.5

      a, a:visited
        color: $black
        transition: color 0.3s ease

        &:hover
          color: $white

      > p:first-child
        margin-right: 5rem

        +breakpoint(mobile)
          margin: 0 0 1rem 0

      > p
        opacity: 0
        transform: translateY(5rem)

      +breakpoint(mobile)
        flex-direction: column
        margin-top: 4rem
        

    &_columnWrapper
      display: flex

    &_column
      width: 50%

    &_star
      position: absolute
      transform: scale(0)

      > span
        display: inline-block

      &.star1
        color: $black
        top: 13%
        left: 7%
        font-size: 7rem

        +breakpoint(mobile)
          left: 70%

        > span
          @include animateStar(5s, 0.3s)

      &.star2
        color: $white
        position: absolute
        bottom: 20%
        left: 45%
        font-size: 5rem

        > span
          @include animateStar(3s, 0s)

      &.star3
        color: $black
        font-size: 4rem
        right: 10%
        bottom: 5%

        > span
          @include animateStar(4s, 0.5s)

    &_bottom
      position: absolute
      left: 50%
      bottom: 4vh
      transform: translateX(-50%)
      display: flex
      justify-content: center
      align-items: center
      width: 100%
      margin-top: 3rem
      padding-right: 7vw

      +breakpoint(mobile)
        flex-direction: column
        align-items: flex-start
        padding: 0 10%

      li
        margin: 0 1rem
        opacity: 0
        transform: translateY(2rem)

        +breakpoint(mobile)
          margin: 0.5rem 0

        a, a:visited
          font-family: $kobeBold
          font-size: 1.2rem
          transition: color 0.3s ease
          padding: 1rem 0.5rem

          &:hover
            color: $white

          +breakpoint(mobile)
            font-size: 1.5rem

    &_mascotteWrapper
      width: 55vw
      position: fixed
      right: -8vw
      bottom: -25vh
      transform: translateY(80vh)

      &_overflow
        position: fixed
        top: 50%
        left: 50%
        transform: translate(-50%, -50%)
        width: calc(99% - 18px) !important
        height: calc(99% - 18px)
        overflow: hidden
        border-radius: 1.6%
        pointer-events: none

      #mascotteEyesSvg
        width: 100%
        height: auto
</style>
