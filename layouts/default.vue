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
import aboutContent from '@/content/about'

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
    isLoadingCompleted (v) { if (v) this._prefetchAbout3D() },
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
    this._prefetchAbout3D()
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
    }),

    // Précharge (met en cache) les GLB des persos 3D de la page About en
    // arrière-plan, pour qu'ils soient déjà là quand on arrive sur /about.
    // Les fichiers R2 ont un Cache-Control immutable -> réutilisés direct.
    _prefetchAbout3D () {
      if (this._prefetched3D || typeof window === 'undefined') return
      if (!this.isLoadingCompleted) return // on attend la fin du préloader
      if (this.$route && this.$route.path && this.$route.path.indexOf('/about') === 0) return
      if (navigator.connection && navigator.connection.saveData) return
      this._prefetched3D = true

      // Uniquement les modèles JOUR (visibles à l'arrivée). Les modèles nuit
      // ne servent qu'au clic Night mode et se chargent en fond sur About.
      const chars = (aboutContent.hero && aboutContent.hero.characters) || []
      const urls = chars.map((c) => c.url).filter(Boolean)
      if (!urls.length) return

      const run = () => urls.forEach((u) => {
        try { fetch(u, { mode: 'cors', credentials: 'omit' }).catch(() => {}) } catch (_) {}
      })
      if (window.requestIdleCallback) window.requestIdleCallback(run, { timeout: 3000 })
      else setTimeout(run, 1500)
    }
  }
}
</script>

<style lang="sass" scoped>
</style>
