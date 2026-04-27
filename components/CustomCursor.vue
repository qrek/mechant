<template>
  <div class="CustomCursor" :class="{pointer, hide}" ref="cursor">
  </div>
</template>

<script>
import { gsap } from '@/vendor/gsap'

export default {
  name: 'CustomCursor',
  data () {
    return {
      pointer: false,
      hide: false
    }
  },
  mounted() {
    document.addEventListener('mousemove', this.updateCursorPos)
  },
  methods: {
    updateCursorPos(e) {
      const itemsPointer = document.querySelectorAll('.cursorPointer, a, .Project, .Video, .worksPage_filters_item')
      let isHover = false,
          hide = false

      for(let i = 0; i < itemsPointer.length; i++) {
        if(itemsPointer[i].matches(':hover')) {
          isHover = true

          if(itemsPointer[i].className === 'Project' || itemsPointer[i].className === 'Video') 
            hide = true
        }
      }

      this.pointer = isHover
      this.hide = hide
      gsap.to(this.$refs.cursor, { duration: 0.2, x: e.clientX, y : e.clientY })
    }
  }
}
</script>

<style lang="sass" scoped>
.CustomCursor
  $cursorWidth: 5rem

  position: fixed
  top: -($cursorWidth / 2) - ($cursorWidth / 3)
  left: -($cursorWidth / 2)
  z-index: 10
  width: $cursorWidth
  height: $cursorWidth
  background-image: url('~/assets/images/cursor.gif')
  background-size: contain
  background-position: center
  pointer-events: none

  &.pointer
    background-image: url('~/assets/images/cursor_hover.png')

  &.hide
    opacity: 0

</style>
