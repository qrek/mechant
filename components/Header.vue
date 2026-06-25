<template>
  <header class="Header">
    <!-- Nav étalée — desktop (identique sur toutes les pages) -->
    <nav class="Header_nav" ref="nav">
      <NuxtLink to="/about">About</NuxtLink>
      <NuxtLink to="/works">Works</NuxtLink>
      <NuxtLink to="/contact">Contact</NuxtLink>
    </nav>

    <!-- Burger — mobile uniquement -->
    <button
      class="Header_burger"
      :class="{ 'is-open': open }"
      type="button"
      :aria-expanded="open ? 'true' : 'false'"
      aria-label="Menu"
      @click="open = !open"
    >
      <span /><span />
    </button>

    <!-- Overlay plein écran — mobile -->
    <transition name="menu">
      <div v-if="open" class="Header_overlay">
        <nav class="Header_overlay_nav">
          <NuxtLink to="/about" @click.native="open = false">About</NuxtLink>
          <NuxtLink to="/works" @click.native="open = false">Works</NuxtLink>
          <NuxtLink to="/contact" @click.native="open = false">Contact</NuxtLink>
        </nav>
      </div>
    </transition>
  </header>
</template>

<script>
import { gsap } from '@/vendor/gsap'

export default {
  name: 'Header',

  data () {
    return { open: false }
  },

  watch: {
    // Ferme le menu à chaque changement de page (sécurité)
    $route () { this.open = false }
  },

  mounted () {
    // Animation d'entrée jouée UNE seule fois — le Header est persistant
    // (monté dans le layout), donc pas de ré-animation au changement de page.
    this.$nextTick(() => this._animateIn())
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

  // ── Nav étalée (desktop) ────────────────────────────────────────────
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
      display: none

  // ── Burger (mobile) ─────────────────────────────────────────────────
  &_burger
    display: none

    +breakpoint(mobile)
      display: flex
      flex-direction: column
      justify-content: center
      gap: 0.45rem
      position: absolute
      top: 1.7rem
      right: 5vw
      width: 2.4rem
      height: 2.4rem
      padding: 0
      appearance: none
      border: none
      background: transparent
      cursor: pointer
      pointer-events: auto
      z-index: 22

      span
        display: block
        width: 1.7rem
        height: 2px
        margin-left: auto
        background: $white
        border-radius: 2px
        box-shadow: 0 1px 6px rgba(0, 0, 0, 0.3)
        transition: transform 0.3s ease, width 0.3s ease, background 0.3s ease

      // Croix quand ouvert
      &.is-open span
        width: 1.7rem
        background: #ff4500
        &:first-child
          transform: translateY(0.28rem) rotate(45deg)
        &:last-child
          transform: translateY(-0.28rem) rotate(-45deg)

  // ── Overlay plein écran (mobile) ────────────────────────────────────
  &_overlay
    position: fixed
    inset: 0
    z-index: 21
    background: #0a0a0a
    display: flex
    align-items: center
    justify-content: center
    pointer-events: auto

    &_nav
      display: flex
      flex-direction: column
      align-items: center
      gap: 2.2rem

      a, a:visited
        font-family: $apfel
        font-weight: 900
        font-size: clamp(2.6rem, 12vw, 4rem)
        letter-spacing: -0.01em
        text-transform: uppercase
        color: $white
        text-decoration: none
        transition: color 0.25s ease

        &.nuxt-link-exact-active
          color: #ff4500

// Transition de l'overlay (fondu doux)
.menu-enter-active,
.menu-leave-active
  transition: opacity 0.3s ease

.menu-enter,
.menu-leave-to
  opacity: 0
</style>
