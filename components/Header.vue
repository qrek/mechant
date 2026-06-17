<template>
  <header class="Header">
    <!-- Navigation étalée — identique sur toutes les pages -->
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
      const links = this.$refs.nav && this.$refs.nav.querySelectorAll('a')
      if (!links || !links.length) return
      gsap.fromTo(links,
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

  +breakpoint(mobile)
    padding: 2rem 5vw

  &_nav
    display: flex
    align-items: center
    justify-content: space-between
    width: 100%

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
      a, a:visited
        font-size: 0.82rem
</style>
