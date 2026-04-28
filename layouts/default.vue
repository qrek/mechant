<template>
  <div class="app">
    <WebGLApplication />

    <Header v-if="isLoadingCompleted" />
    <Nuxt v-if="isLoadingCompleted" />

    <ProjectPopin />

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
      isErrorPage: 'layout/isErrorPage'
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
</style>
