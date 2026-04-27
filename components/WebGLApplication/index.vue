<template>
  <div class="canvas-webgl" />
</template>

<script>
import WebGL from '@/webgl'
import {mapGetters, mapActions} from 'vuex'

export default {
  computed: {
    ...mapGetters({
      isLoadingCompleted: 'preloader/isLoadingCompleted'
    })
  },
  watch: {
    isLoadingCompleted (isCompleted) {
      if (isCompleted) this.$root.webglApp.setup(null, () => this.setCompleted())
    }
  },
  mounted () {
    this.setupWebGL()
  },
  beforeDestroy () {
    this.$root.webglApp?.destroy()
    this.$root.webglApp = null
  },
  methods: {
    ...mapActions({
      setCompleted: 'preloader/setCompleted'
    }),
    setupWebGL () {
      this.$root.webglApp = new WebGL({
        el: this.$el,
        nuxtRoot: this.$root
      })

      if (this.isLoadingCompleted) this.$root.webglApp.setup(null, () => this.setCompleted())
    }
  }
}
</script>

<style src="./style.sass" lang="sass" scoped></style>
