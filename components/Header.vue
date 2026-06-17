<template>
  <header class="Header" :class="{ 'Header--hasBack': !!backLink }">

    <!-- Lien retour contextuel (sous-pages), à gauche -->
    <NuxtLink
      v-if="backLink"
      :to="backLink.to"
      class="Header_back"
      ref="back"
    >
      <span class="Header_back_arrow" aria-hidden="true">←</span>
      <span class="Header_back_label">{{ backLink.label }}</span>
    </NuxtLink>

    <!-- Navigation principale étalée — identique sur toutes les pages -->
    <nav class="Header_nav" :class="{ 'is-spread': !backLink }" ref="nav">
      <NuxtLink to="/about">About</NuxtLink>
      <NuxtLink to="/works">Works</NuxtLink>
      <NuxtLink to="/contact">Contact</NuxtLink>
    </nav>

  </header>
</template>

<script>
import { gsap } from '@/vendor/gsap'

export default {
  name: 'Header',

  mounted () {
    this.$nextTick(() => this._animateIn())
  },

  watch: {
    $route () {
      this.$nextTick(() => this._animateIn())
    }
  },

  computed: {
    backLink () {
      const path = this.$route.path || ''
      if (path === '/' || path === '/works' || path === '/works/') return null
      if (path.startsWith('/admin')) return null
      if (path.startsWith('/works/')) return { to: '/works', label: 'Works' }
      return { to: '/', label: 'Back' }
    }
  },

  methods: {
    _animateIn () {
      const targets = []
      const back = this.$refs.back?.$el
      if (back) targets.push(back)
      if (this.$refs.nav) targets.push(...this.$refs.nav.querySelectorAll('a'))
      if (!targets.length) return

      gsap.fromTo(targets,
        { opacity: 0, y: -10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power3.out',
          delay: 0.15,
          clearProps: 'transform'
        }
      )
    }
  }
}
</script>

<style lang="sass" scoped>
.Header
  position: fixed
  top: 0
  left: 0
  width: 100%
  display: flex
  align-items: center
  justify-content: space-between
  z-index: 20
  padding: 2.5rem 4vw
  box-sizing: border-box
  pointer-events: none

  +breakpoint(mobile)
    padding: 2rem 5vw

  a
    pointer-events: auto

  &_back
    display: inline-flex
    align-items: center
    gap: 0.5rem
    flex-shrink: 0
    margin-right: 3rem
    font-family: $apfel
    font-weight: 700
    font-size: 0.85rem
    letter-spacing: 0.12em
    text-transform: uppercase
    color: $white
    text-decoration: none
    // Ombre légère pour rester lisible sur les fonds clairs
    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.25)
    transition: opacity 0.25s ease

    &:hover
      opacity: 0.6

      .Header_back_arrow
        transform: translateX(-4px)

    &_arrow
      display: inline-block
      font-size: 1rem
      transition: transform 0.3s ease

    +breakpoint(mobile)
      font-size: 0.78rem
      margin-right: 1.5rem

  &_nav
    display: flex
    align-items: center
    gap: 2.5rem
    margin-left: auto

    // Sur les pages racines (pas de back), la nav s'étale sur toute la largeur
    &.is-spread
      width: 100%
      margin-left: 0
      justify-content: space-between

    +breakpoint(mobile)
      gap: 1.5rem

    a, a:visited
      font-family: $apfel
      font-weight: 700
      font-size: 0.85rem
      letter-spacing: 0.12em
      text-transform: uppercase
      color: $white
      text-decoration: none
      transition: opacity 0.25s ease
      position: relative
      // Toujours blanc → ombre légère pour la lisibilité sur fonds clairs
      text-shadow: 0 1px 8px rgba(0, 0, 0, 0.25)

      &:hover
        opacity: 0.6

      &.nuxt-link-active::after
        content: ''
        position: absolute
        left: 0
        right: 0
        bottom: -0.4rem
        height: 1.5px
        background: currentColor

      +breakpoint(mobile)
        font-size: 0.78rem
</style>
