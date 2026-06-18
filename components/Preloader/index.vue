<template>
  <div class="Preloader" :class="{ 'is-hidden': hideLoader }">
    <template v-if="!isWorksPage">
      <div class="Preloader_panel" ref="panel" />
      <div class="Preloader_center" ref="centerEl">
        <div class="Preloader_logoWrap">
          <!-- Logo en fond, très légère opacité -->
          <img src="~assets/images/logo.png" alt="" aria-hidden="true" class="Preloader_logo Preloader_logo--ghost" />
          <!-- Vrai logo révélé de gauche à droite (remplissage du chargement) -->
          <div class="Preloader_fillClip" ref="fillClip">
            <img src="~assets/images/logo.png" alt="Méchant" class="Preloader_logo Preloader_logo--fill" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import ResourceLoader from '@/webgl/vendor/resource-loader/ResourceLoader'
import ThreeTextureLoader from '@/webgl/vendor/loaders/three-texture-loader'
import ThreeVideoLoader from '@/webgl/vendor/loaders/three-video-loader'

import resources from '@/config/resources'
import { supabase } from '@/utils/supabase'
import * as siteContent from '@/content/site'
import { gsap } from '@/vendor/gsap'

export default {
  name: 'Preloader',
  data () {
    return {
      hideLoader: false
    }
  },
  computed: {
    ...mapGetters({
      isLoadingCompleted: 'preloader/isLoadingCompleted',
      data: 'data/getData',
      isMobile: 'layout/isMobile'
    }),
    isWorksPage () {
      const path = this.$route?.path || ''
      return path === '/works' || path === '/works/'
    }
  },
  async mounted () {
    this._mountTime = Date.now()
    this._initFill()
    await this.loadData()
    this.registerLoaders()
    this.setupResourceLoader()
    this.setupEventListeners()
    this.loadResources()
  },
  beforeDestroy () {
    this.removeEventListeners()
  },
  methods: {
    ...mapActions({
      setData: 'data/setData',
      setLoadingCompleted: 'preloader/setLoadingCompleted',
      setCompleted: 'preloader/setCompleted'
    }),
    async loadData() {
      const [
        { data: projectsData, count },
        { data: heroProjectsData },
        { data: categoriesData }
      ] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact' }).eq('published', true).order('order_index', { ascending: false }).limit(20),
        supabase.from('projects').select('*').eq('is_hero', true).eq('published', true).order('hero_order', { ascending: true }),
        supabase.from('categories').select('*').order('order_index', { ascending: true })
      ])

      const categories = (categoriesData || []).reduce((acc, c) => ({ ...acc, [c.id]: c }), {})
      const heroProjects = (heroProjectsData || []).reduce((acc, p) => ({ ...acc, [p.id]: { ...p, sliderTitle: p.hero_title || p.title } }), {})
      const totalPages = Math.ceil((count || 0) / 20)

      await this.setData({
        homepage: siteContent.homepage,
        heroProjects,
        projects: projectsData || [],
        pagination: { page: 1, total_pages: totalPages },
        categories,
        footer: siteContent.footer,
        aboutpage: siteContent.aboutpage,
        legalsPage: siteContent.legalsPage,
        cookiesPage: siteContent.cookiesPage,
        projectsPage: siteContent.projectsPage
      })
    },
    registerLoaders () {
      ResourceLoader.registerLoader(ThreeTextureLoader, 'texture')
      ResourceLoader.registerLoader(ThreeVideoLoader, 'video')
    },
    setupResourceLoader () {
      this.resourceLoader = new ResourceLoader()

      const allResources = [...resources, ...this.getResources()]

      this.resourceLoader.add({
        resources: allResources,
        preload: true
      })
    },
    getResources() {
      const { projects, heroProjects} = this.data

      const sources = []
      const mixProjects = { ...(Array.isArray(projects) ? { ...projects } : projects), ...heroProjects }
      const ids = []

      Object.keys(mixProjects).forEach(p => {
        const project = mixProjects[p]

        // NOTE : on ne précharge PLUS les preview_video ici. Elles ne servent
        // qu'au survol des pages works (qui les chargent à la demande avec
        // preload="none"). Les précharger toutes au boot tirait ~10 Mo × N
        // projets avant même d'afficher le site.

        if (project.video_home && ids.indexOf(project.id) < 0 && !this.isMobile) {
          sources.push({
            name: `${project.id}_hero`,
            type: 'video',
            path: `${project.video_home}?id=${p}`
          })
        }

        if (ids.indexOf(project.id) < 0) {
          if (project.video_home_mobile && this.isMobile) {
            sources.push({
              name: `${project.id}_hero_mobile`,
              type: 'video',
              path: `${project.video_home_mobile}?id=${p}`
            })
          } else if (!project.video_home) {
            const imgUrl = project.poster || project.thumbnail_url
            if (imgUrl) {
              sources.push({ name: `${project.id}_hero`, type: 'texture', path: imgUrl })
              sources.push({ name: `${project.id}_hero_mobile`, type: 'texture', path: imgUrl })
            }
          }
        }

        ids.push(project.id)
      })

      return sources
    },
    loadResources () {
      this.resourceLoader.preload()
    },
    setupEventListeners () {
      this.resourceLoader.addEventListener('complete', this.loadResourcesCompleteHandler)
      this.resourceLoader.addEventListener('progress', this.loadResourcesProgressHandler)
    },
    removeEventListeners () {
      this.resourceLoader.removeEventListener('complete', this.loadResourcesCompleteHandler)
      this.resourceLoader.removeEventListener('progress', this.loadResourcesProgressHandler)
    },

    // ── Remplissage du logo gauche → droite ──────────────────────────────
    _initFill () {
      this._fillTarget = 0   // 0 → 1
      // Avance "douce" de base (au cas où il y a peu de ressources) pour que
      // le remplissage démarre tout de suite, puis se cale sur le vrai %.
      if (this.$refs.fillClip) {
        gsap.set(this.$refs.fillClip, { width: '0%' })
        // petite avance initiale pour amorcer visuellement
        this._setFill(0.08)
      }
    },
    _setFill (value) {
      this._fillTarget = Math.max(this._fillTarget || 0, Math.min(1, value))
      if (!this.$refs.fillClip) return
      gsap.to(this.$refs.fillClip, {
        width: (this._fillTarget * 100) + '%',
        duration: 0.6,
        ease: 'power2.out',
        overwrite: true
      })
    },
    loadResourcesProgressHandler (progress) {
      // progress = 0 → 1 (réel). On ne dépasse pas 0.9 avant le complete
      // pour garder une marge de remplissage final propre.
      this._setFill(0.08 + (progress || 0) * 0.82)
    },
    loadResourcesCompleteHandler () {
      this.setLoadingCompleted()
      // Remplissage final jusqu'à 100% (gauche → droite)
      if (this.$refs.fillClip) {
        this._fillTarget = 1
        gsap.to(this.$refs.fillClip, { width: '100%', duration: 0.5, ease: 'power2.inOut', overwrite: true })
      }
      if (this.isWorksPage) {
        this.hideLoader = true
        return
      }
      const elapsed   = Date.now() - this._mountTime
      const remaining = Math.max(0, 3000 - elapsed)
      setTimeout(() => this._animateOut(), remaining)
    },

    _animateOut () {
      const { panel, centerEl } = this.$refs
      if (!panel || !centerEl) return

      gsap.to(centerEl, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.out'
      })

      gsap.to(panel, {
        yPercent: -100,
        duration: 0.7,
        ease: 'power3.inOut',
        delay: 0.15,
        onComplete: () => {
          this.hideLoader = true
        }
      })
    }
  }
}
</script>

<style lang="sass" scoped>
.Preloader
  position: fixed
  inset: 0
  z-index: 9998
  pointer-events: none

  &.is-hidden
    opacity: 0
    visibility: hidden

  &_panel
    position: absolute
    inset: 0
    background: #000000

  &_center
    position: absolute
    top: 50%
    left: 50%
    transform: translate(-50%, -50%)
    z-index: 2
    pointer-events: none

  // Wrapper : superpose le logo fantôme + le logo de remplissage
  &_logoWrap
    position: relative
    display: inline-block
    width: 22rem

    +breakpoint(mobile)
      width: 14rem

  &_logo
    display: block
    width: 22rem
    height: auto

    +breakpoint(mobile)
      width: 14rem

    // Fond très léger (le logo "vide")
    &--ghost
      opacity: 0.15

    // Logo plein (révélé par le clip)
    &--fill
      position: absolute
      top: 0
      left: 0

  // Conteneur qui révèle le logo plein de gauche à droite (width animée)
  &_fillClip
    position: absolute
    top: 0
    left: 0
    height: 100%
    width: 0
    overflow: hidden
</style>
