<template>
  <div class="app">
    <WebGLApplication />

    <Header v-if="isLoadingCompleted" />
    <Nuxt v-if="isLoadingCompleted" />

    <ProjectPopin />

    <div class="noiseBackground" :class="{show: !activeProject}"></div>

    <TransitionPage />
    <Preloader />
    <!-- <CustomCursor /> -->
  </div>
</template>

<script>

import Header from "@/components/Header"
import ProjectPopin from "@/components/ProjectPopin"
import WebGLApplication from "@/components/WebGLApplication"
import Preloader from "@/components/Preloader"
import TransitionPage from "@/components/TransitionPage"

import { mapActions, mapGetters } from 'vuex'
import TransitionManager from "~/utils/TransitionManager";

export default {
  components: {
    Header,
    WebGLApplication,
    ProjectPopin,
    Preloader,
    TransitionPage
  },
  watch: {
    $route (to, from) {
      this.setPrevious(from)
      this.setCurrent(to)
      this.setPageView()
    },
    transitionStatus (newVal, oldVal) {
      if (newVal !== oldVal) {
        const transitionManager = new TransitionManager()

        if (transitionManager.has(newVal))
          transitionManager.exec(newVal)
      }
    },
    hasOverlay(newVal) {
      if (newVal)
        document.documentElement.classList.add('lock_scroll')
      else
        document.documentElement.classList.remove('lock_scroll')
    }
  },
  mounted() {
    this.setCurrent(this.$route)
  },
  computed: {
    ...mapGetters({
      pageView: 'router/pageView',
      transitionStatus: 'router/transitionStatus',
      isLoadingCompleted: 'preloader/isLoadingCompleted',
      isMenuOpen: 'layout/isMenuOpen',
      isPopinProjectOpen: 'project/isActive',
      isErrorPage: 'layout/isErrorPage',
      activeProject: 'project/isActive'
    }),
    hasOverlay() {
      return this.isMenuOpen || this.isPopinProjectOpen
    },
    pageViewNumber() {
      return this.pageView
    },
    isHomePage() {
      return this.$route.name === 'index' || this.$route.path === '/'
    }
  },
  methods: {
    ...mapActions({
      setPrevious: 'router/setPrevious',
      setCurrent: 'router/setCurrent',
      setPageView: 'router/setPageView'
    })
  }
}
</script>

<style lang="sass" scoped>
.noiseBackground
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  width: 100%
  height: 100%
  overflow: hidden
  z-index: 100
  pointer-events: none
  opacity: 0
  transition: opacity 0.5s ease

  &.show
    opacity: 1

  &::after
    content: ''
    position: absolute
    animation: grain 8s steps(10) infinite
    background-image: url("./assets/images/noise.png")
    height: 300%
    left: -50%
    opacity: 0.8
    top: -100%
    width: 300%

@keyframes grain
  0%, 100%
    transform: translate(0, 0)
  10%
    transform: translate(-5%, -10%)
  20%
    transform: translate(-15%, 5%)
  30%
    transform: translate(7%, -25%)
  40%
    transform: translate(-5%, 25%)
  50%
    transform: translate(-15%, 10%)
  60%
    transform: translate(15%, 0%)
  70%
    transform: translate(0%, 15%)
  80%
    transform: translate(3%, 35%)
  90%
    transform: translate(-10%, 10%)
</style>
