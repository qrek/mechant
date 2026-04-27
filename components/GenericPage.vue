<template>
  <div class="GenericPage">
    <div class="GenericPage_left" v-html="text"></div>
    <div class="GenericPage_right">
      <div class="GenericPage_right_image">
        <img :src="image" alt="visual" v-if="image">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Tag',
  data () {
    return {

    }
  },
  props: {
    text: {
      type: String,
      defaut: ''
    },
    image: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="sass" scoped>
.GenericPage
  min-height: 100vh
  background: $orange
  display: flex
  padding-top: 20vh

  +breakpoint(mobile)
    flex-direction: column
    padding-top: 15vh

  &_left
    width: 60%
    padding: 0 5% ($waveMargin * 2) 10%

    +breakpoint(mobile)
      width: 100%
      padding: 0 10% ($waveMargin * 2)

  &_right
    position: relative
    width: 40%
    padding-bottom: 10rem

    +breakpoint(mobile)
      display: none

    &_image
      position: sticky
      top: 0
      right: 0
      overflow: hidden

    img
      width: 100%
      height: auto
      transform: rotate(10deg) translateX(15%)


  ::v-deep h1
    font-family: $briceBlackCondensed
    color: $white
    text-shadow: textShadow($typoPres, $typoDepth*2, $black, true)
    font-size: 13rem
    text-transform: uppercase
    line-height: 0.9
    margin-bottom: 4rem

    +breakpoint(mobile)
      font-size: 9rem

  ::v-deep h2
    text-transform: uppercase
    background: $white
    color: $pink
    padding: 0.1rem 0.5rem
    box-sizing: border-box
    font-size: 2rem
    display: inline-block
    border-radius: 8px
    text-transform: uppercase
    font-family: $briceBlackCondensed
    line-height: 1
    box-shadow: textShadow($typoPres, calc($typoDepth/2), $black)
    border: 1px solid $black
    margin-top: 2rem
    display: inline-block
    transform: rotate(-2.5deg)

    &:nth-child(3n+1)
      transform: rotate(2deg)

    &:nth-child(3n+2)
      transform: rotate(-3deg)

    &:nth-child(3n+3)
      transform: rotate(2.5deg)

  ::v-deep p
    font-family: $kobe
    font-size: 2rem
    line-height: 1.5
    margin: 2rem 0

    +breakpoint(mobile)
      font-size: 1.8rem

</style>
