<template>
  <div class="Hero">
    <div
      ref="wrapper"
      class="Hero_wrapper"
    />
    <div class="Hero_content" ref="content">
      <div class="Hero_content_item" v-for="(item, i) in data" ref="items" :class="{ active: i === index && !isMoving, loading: isLoadingDefer }" :key="i" >
        <Tag
          :text="item.client"
          :size="2.2"
        />
        <div class="Hero_title" v-html="item.sliderTitle"></div>
        <div class="Hero_subtitle" v-html="item?.subtitle || item?.description || ''"></div>
        <Button
          :class="{'isActive': isActive}"
          background="pink"
          color="white"
          customClass="showProjectHeroButton"
          icon="icon-play"
          :size="1"
          :onClick="_ => openProjectPopin(item)"
        />
      </div>
    </div>

    <div class="Hero_navigation">
      <span class="Hero_navigation_prev cursorPointer icon-arrow-left" @click="handlePrev"></span>
      <span class="Hero_navigation_next cursorPointer icon-arrow-right" @click="handleNext"></span>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import gsap from "@/vendor/gsap"
import { SplitText } from '@/vendor/gsap/SplitText'
import Observer from '@/vendor/gsap/Observer'
import Button from "@/components/Button"
import webgl from "@/mixins/webgl"
import Tag from "@/components/Tag"


gsap.registerPlugin(SplitText)

export default {
  name: 'Hero',
  mixins: [webgl],
  components: {
    Tag,
    Button
  },
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      index: 0,
      isMoving: false,
      isLoadingDefer: true,
      tween: null,
      desktopOnly: false
    }
  },
  computed: {
    ...mapGetters({
      isActive: 'project/isActive'
    })
  },
  methods: {
    ...mapActions({
      setActive: 'project/setActive',
      setId: 'project/setId'
    }),
    onDestroy() {
      this._observer.kill()
      this.scene.destroyHero()
    },
    onInit() {
      this.scene.initHero({ el: this.$refs.wrapper, images: this.$props.data, onUpdateCbk: this.onUpdate.bind(this) })

      for (let i = 0; i < this.$refs.items.length; i++) {
        const item = this.$refs.items[i]
        const title = item.querySelector('.Hero_title')
        const st = new SplitText(title, {
          type: 'lines,words,chars',
          wordsClass: 'word',
          charsClass: 'char',
          linesClass: 'line'
        })

        const subtitle = item.querySelector('.Hero_subtitle')
        const st2 = new SplitText(subtitle, {
          type: 'lines,words,chars',
          wordsClass: 'word',
          charsClass: 'char',
          linesClass: 'line'
        })

        st.words.forEach((w, index) => {
          w.style.setProperty('--split-word', index);
        })

        st2.words.forEach((w, index) => {
          w.style.setProperty('--split-word', index);
        })
      }

      this.$nextTick(() => {
        setTimeout(() => {
          if (this?.isLoadingDefer)
            this.isLoadingDefer = false
        }, 200)
      })

      this._observer = Observer.create({
        target: this.$refs.wrapper,
        onPress: (e) => this.scene.hero.onDragStart(e),
        onDragEnd: (e) => this.scene.hero.onDragEnd(e),
        onRelease: (e) => this.scene.hero.onDragEnd(e),
        onHoverEnd: (e) => this.scene.hero.onDragEnd(e),
        onChangeX: (e) => this.scene.hero.onDragMove(e)
      })
    },
    handlePrev() {
      this.scene.hero.goToPrev()
    },
    handleNext() {
      this.scene.hero.goToNext()
    },
    onUpdate({ isMoving, realIndex }) {
      this.index = realIndex
      this.isMoving = isMoving
    },
    openProjectPopin(item) {
      if (item && item.has_case_study && item.slug) {
        this.$router.push(`/works/${item.slug}`)
        return
      }
      this.setActive(true)
      this.setId(item && item.id)
    }
  }
}
</script>

<style lang="sass" scoped>
.Hero
  height: 100vh
  width: 100vw
  display: flex
  align-items: center
  user-select: none

  &_wrapper
    width: 100vw
    height: 100%
    padding: 8%

    ::v-deep video
      width: 100%
      height: 100%
      pointer-events: none
      position: fixed
      top: 0
      left: 0

  &_content
    pointer-events: none
    width: 84%
    position: absolute
    top: 50%
    left: 8%
    transform: translateY(-50%)

    &_item
      display: flex
      align-items: flex-start
      justify-content: flex-start
      flex-direction: column
      position: absolute
      left: 0
      top: 50%
      transform: translateY(-50%)
      margin-top: -2rem

      .showProjectHeroButton
        transform: rotate(-5deg) scale(0)
        transition: transform 0.3s ease

      &_video
        display: none

      &.active:not(.loading)
        .Hero_title
          ::v-deep .char
            transition: all $easeOutQuad .3s calc((var(--split-word) * .1s) + .3s)
            transform: translateY(0)

        .Hero_subtitle
          ::v-deep .char
            transform: translateY(0)

        .Tag_wrapper
          opacity: 1
          transition: all $easeOutQuad .3s .3s

        .showProjectHeroButton
          transform: rotate(-5deg) scale(0.8)
          pointer-events: auto

      .Hero_title
        transition: all $easeOutQuad .3s

        ::v-deep .line
          overflow: hidden
          padding: 2.7rem 2.7rem 1.5rem
          margin: -3rem

        ::v-deep .char
          transition: all $easeOutQuad .2s calc(var(--split-word) * .03s)
          transform: translateY(calc(100% + 5rem))

      .Hero_subtitle
        transition: all $easeOutQuad .3s

        ::v-deep .line
          overflow: hidden
          padding: .5rem
          margin: -.5rem

        ::v-deep .char
          transition: all $easeOutQuad .2s calc(var(--split-word) * .05s)
          transform: translateY(calc(100% + 2rem))

      .Tag_wrapper
        opacity: 0
        transition: all $easeOutQuad .3s

    .Tag_wrapper
      margin-bottom: 4rem
      transform: rotate(-3deg)

  &_title
    font-family: $briceBoldCondensed
    color: $white
    text-shadow: textShadow($typoPres, $typoDepth*2, $black, true)
    font-size: 10rem
    text-transform: uppercase
    line-height: 0.85

    +breakpoint(mobile)
      font-size: 8rem

    ::v-deep em
      color: $orange

  &_subtitle
    font-family: $kobe
    color: $white
    font-size: 2rem
    margin: 4rem 0 1.2rem

  &_navigation
    position: absolute
    bottom: 15%
    left: 8%

    +breakpoint(mobile)
      bottom: 10%

    > span
      display: inline-block
      color: $white
      font-size: 1.5rem
      text-shadow: textShadow($typoPres, $typoDepth, $black)
      cursor: pointer
      transition: transform 0.3s ease

      &:hover
        transform: scale(1.5)

    &_prev
      margin-right: 1rem
      padding: 1rem  1em  1em 0

    &_next
      padding: 1rem  1em  1em 0


</style>
