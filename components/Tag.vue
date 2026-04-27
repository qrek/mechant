<template>
  <div class="Tag_wrapper">
    <div class="Tag" :class="`bg_${background} ${color} ${customClass}`" :style="`font-size: ${size}rem;`">{{ text }}</div>
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
    background: {
      type: String,
      default: 'white'
    },
    color: {
      type: String,
      default: 'pink'
    },
    size: {
      type: Number,
      default: 2.5
    },
    text: {
      type: String,
      default: ''
    },
    customClass: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="sass" scoped>
.Tag
  bakground: $white
  color: $pink
  padding: 0.1rem 0.5rem 0.2rem
  box-sizing: border-box
  font-size: 2rem
  display: inline-block
  border-radius: 8px
  text-transform: uppercase
  font-family: $briceBlackCondensed
  line-height: 1
  box-shadow: textShadow($typoPres, calc($typoDepth/2), $black)
  border: 1px solid $black

  &_wrapper
    display: inline-block

  &.bg_white
    background: $white

  &.bg_pink
    background: $pink

  &.bg_orange
    background: $orange

  &.white
    color: $white

  &.orange
    color: $orange

  &.pink
    color: $pink

</style>
