<template>
  <header class="Header">
    <!-- Étoile Méchant → accueil. Présente sur toutes les pages (layout
         identique partout) et permet de revenir à l'accueil à tout moment. -->
    <NuxtLink to="/" class="Header_home" aria-label="Back to home" ref="home">
      <span class="icon-star" aria-hidden="true"></span>
    </NuxtLink>

    <!-- Navigation — identique sur toutes les pages -->
    <nav class="Header_nav" ref="nav">
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

  methods: {
    _animateIn () {
      const targets = []
      if (this.$refs.home?.$el) targets.push(this.$refs.home.$el)
      if (this.$refs.nav) targets.push(...this.$refs.nav.querySelectorAll('a'))
      if (!targets.length) return
      gsap.fromTo(targets,
        { opacity: 0, y: -10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power3.out',
          delay: 0.15,
          clearProps: 'all'
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
  z-index: 20
  padding: 2.5rem 4vw
  box-sizing: border-box
  pointer-events: none
  display: flex
  align-items: center
  justify-content: space-between

  +breakpoint(mobile)
    padding: 2rem 5vw

  // Étoile accueil
  &_home
    pointer-events: auto
    display: inline-flex
    align-items: center
    justify-content: center
    color: $white
    font-size: 1.5rem
    line-height: 1
    text-decoration: none
    opacity: 0.85
    text-shadow: 0 1px 10px rgba(0, 0, 0, 0.25)
    transition: opacity 0.25s ease, transform 0.4s $easeOutBack

    .icon-star
      display: inline-block

    &:hover
      opacity: 1
      transform: rotate(90deg) scale(1.1)

    +breakpoint(mobile)
      font-size: 1.3rem

  &_nav
    display: flex
    align-items: center
    gap: 2.5rem

    a, a:visited
      pointer-events: auto
      font-family: $apfel
      font-weight: 500
      font-size: 0.9rem
      letter-spacing: 0.12em
      text-transform: uppercase
      color: $white
      text-decoration: none
      opacity: 0.85
      text-shadow: 0 1px 10px rgba(0, 0, 0, 0.25)
      transition: opacity 0.25s ease

      &:hover
        opacity: 0.5

      &.nuxt-link-exact-active
        opacity: 0.5

    +breakpoint(mobile)
      gap: 1.5rem

      a, a:visited
        font-size: 0.82rem
</style>
