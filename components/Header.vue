<template>
  <header class="Header" :class="{ 'Header--hasBack': !!backLink }">

    <!-- Gauche : wordmark (→ home) OU bouton retour contextuel -->
    <div class="Header_left">
      <NuxtLink
        v-if="backLink"
        :to="backLink.to"
        class="Header_back"
        ref="back"
      >
        <span class="Header_back_arrow" aria-hidden="true">←</span>
        <span class="Header_back_label">{{ backLink.label }}</span>
      </NuxtLink>

      <NuxtLink v-else to="/" class="Header_wordmark" ref="wordmark">MÉCHANT</NuxtLink>
    </div>

    <!-- Droite : navigation principale (identique sur toutes les pages) -->
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
    // Re-anime à chaque changement de page (les liens reviennent en fade)
    $route () {
      this.$nextTick(() => this._animateIn())
    }
  },

  computed: {
    backLink () {
      const path = this.$route.path || ''
      // Pages racines : pas de retour, on montre le wordmark
      if (path === '/' || path === '/works' || path === '/works/') return null
      if (path.startsWith('/admin')) return null
      // Sous-pages de works (case studies) → retour à Works
      if (path.startsWith('/works/')) return { to: '/works', label: 'Works' }
      // Toute autre page interne (about, contact, playground, legal…) → home
      return { to: '/', label: 'Back' }
    }
  },

  methods: {
    _animateIn () {
      const targets = []
      if (this.$refs.nav) targets.push(...this.$refs.nav.querySelectorAll('a'))
      const left = this.$refs.back?.$el || this.$refs.wordmark?.$el
      if (left) targets.unshift(left)
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
  // mix-blend difference : le texte blanc s'inverse selon le fond
  // → toujours lisible, sur fond clair (about) comme sombre (works/contact)
  mix-blend-mode: difference
  pointer-events: none

  +breakpoint(mobile)
    padding: 2rem 5vw

  // Tous les éléments interactifs reçoivent les events (le header global non)
  a
    pointer-events: auto

  &_left
    display: flex
    align-items: center

  &_wordmark
    font-family: $apfel
    font-weight: 900
    font-size: 1.15rem
    letter-spacing: 0.02em
    text-transform: uppercase
    color: $white
    text-decoration: none
    transition: opacity 0.25s ease

    &:hover
      opacity: 0.6

    +breakpoint(mobile)
      font-size: 1rem

  &_back
    display: inline-flex
    align-items: center
    gap: 0.5rem
    font-family: $apfel
    font-weight: 700
    font-size: 0.8rem
    letter-spacing: 0.15em
    text-transform: uppercase
    color: $white
    text-decoration: none
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
      font-size: 0.75rem

  &_nav
    display: flex
    align-items: center
    gap: 2.5rem

    +breakpoint(mobile)
      gap: 1.4rem

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

      &:hover
        opacity: 0.6

      // Souligné animé sur la page active
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
