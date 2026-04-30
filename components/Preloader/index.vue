<template>
  <div class="Preloader" :class="{ 'is-hidden': hideLoader }">
    <div class="Preloader_panel" ref="panel" />
    <div class="Preloader_center" ref="centerEl">
      <img src="~assets/images/logo.png" alt="Méchant" class="Preloader_logo" />
    </div>
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
    })
  },
  async mounted () {
    this._mountTime = Date.now()
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

        if (project.preview_video && ids.indexOf(project.id) < 0 && !this.isMobile) {
          sources.push({
            name: `${project.id}_preview_video`,
            type: 'video',
            path: project.preview_video
          })
        }

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
    },
    removeEventListeners () {
      this.resourceLoader.removeEventListener('complete', this.loadResourcesCompleteHandler)
    },
    loadResourcesCompleteHandler () {
      this.setLoadingCompleted()
      // Sur la page works (et ses sous-pages), le preloader cède la place à l'animation
      // d'entrée custom — pas de délai min, pas d'animation de panneau
      const skipAnimation = this._shouldSkipAnimation()
      if (skipAnimation) {
        this._dismissImmediate()
        return
      }
      const elapsed   = Date.now() - this._mountTime
      const remaining = Math.max(0, 3000 - elapsed)
      setTimeout(() => this._animateOut(), remaining)
    },

    _shouldSkipAnimation() {
      const path = (this.$route && this.$route.path) || ''
      return path === '/works' || path.startsWith('/works/')
    },

    _dismissImmediate () {
      const { panel, centerEl } = this.$refs
      if (panel) gsap.set(panel, { yPercent: -100, opacity: 0 })
      if (centerEl) gsap.set(centerEl, { opacity: 0 })
      this.hideLoader = true
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

  &_logo
    display: block
    width: 22rem
    height: auto

    +breakpoint(mobile)
      width: 14rem
</style>
