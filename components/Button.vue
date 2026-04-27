<template>
  <div class="Button cursorPointer" :class="`${customClass} ${text === '' ? 'noText' : ''}`" >
    <NuxtLink :to="to" class="Button_content" :class="`bg_${background} ${color}`" :style="`font-size: ${size}rem;`"  @click.native="onClick" v-if="to">
      {{text}}
      <div class="Button_iconWrapper" v-if="icon">
        <span :class="`${icon} Button_icon_border`"></span>
        <span :class="`${icon} Button_icon`"></span>
      </div>
    </NuxtLink>
    <div class="Button_content" :class="`bg_${background} ${color}`" :style="`font-size: ${size}rem;`" @click="onClick" v-else>
      {{text}}
      <div class="Button_iconWrapper" v-if="icon">
        <span :class="`${icon} Button_icon_border`"></span>
        <span :class="`${icon} Button_icon`"></span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Button',
  data () {
    return {

    }
  },
  props: {
    background: {
      type: String,
      default: 'pink'
    },
    color: {
      type: String,
      default: 'white'
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
    },
    onClick: {
      type: Function,
      default: _ => {}
    },
    icon: {
      type: String,
      default: ''
    },
    to: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="sass" scoped>
.Button
  display: inline-block
  position: relative
  transition: transform 0.3s ease, opacity 0.3s ease

  &:before
    content: ''
    position: absolute
    top: 50%
    left: 50%
    transform: translate(-50%, -50%) scale(101%, 107%)
    width: 100%
    height: 100%
    border-radius: 8px
    background: $black
    transform-origin: center
    box-shadow: textShadow($typoPres, $typoDepth, $black)
    transition: box-shadow 0.3s ease, transform 0.3s ease, background 0.12s ease

  &:active:before
    box-shadow: none
    transform: translate(-48.5%, -40%) scale(101%, 1.07)

  &:hover:not(.isActive):not(.showProjectHeroButton)
    transform: scale(1.1) !important

  &.isActive, &.showProjectHeroButton:hover
    transform: scale(1) rotate(-10deg) !important

  &_content
    position: relative
    bakground: $pink
    color: $pink
    padding: 1rem 1rem 0.6rem
    box-sizing: border-box
    font-size: 2.5rem
    display: inline-block
    border-radius: 8px
    text-transform: uppercase
    font-family: $kobeBold
    line-height: 1
    box-shadow: textShadow($typoPres, $typoDepth, $white)
    border: 3px solid $white
    cursor: pointer
    z-index: 2
    display: flex
    align-items: center
    justify-content: center
    transition: box-shadow 0.3s ease, transform 0.3s ease

    +breakpoint(mobile)
      font-size: 2rem !important
      text-align: center

    &:after
      content: ''
      position: absolute
      top: 50%
      left: 50%
      transform: translate(-50%, -50%)
      width: 100%
      height: 100%
      border-radius: 8px
      border: 1px solid $black

    &:active
      box-shadow: none
      transform: translate(0.4rem, 0.4rem)

    &.bg_white
      background: $white

    &.bg_pink
      background: $pink

    &.bg_orange
      background: $orange

    &.bg_black
      background: $black

    &.white
      color: $white

    &.orange
      color: $orange

    &.pink
      color: $pink

  &_iconWrapper
    position: relative
    margin-left: 1rem

  &.noText &_iconWrapper
    margin: 0
    padding: 0.2rem 0.4rem 0.3rem 0.7rem

  &_icon
    position: relative
    z-index: 2
    text-shadow: textShadow($typoPres, calc($typoDepth/2), $black)
    font-size: 2rem

    &_border
      position: absolute
      transform: scale(1.1)
      color: $black
      font-size: 2rem

  &.noText .Button_icon
    text-shadow: none

</style>
