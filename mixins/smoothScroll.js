// ─────────────────────────────────────────────────────────────────────────────
// Mixin smooth scroll via Lenis
// ─────────────────────────────────────────────────────────────────────────────
//
// Active un scroll lerpé sur une page Vue. Utilisation :
//
//   import smoothScroll from '@/mixins/smoothScroll'
//
//   export default {
//     mixins: [smoothScroll],
//     ...
//   }
//
// Le mixin gère le cycle de vie complet (init mounted, destroy beforeDestroy)
// et la synchronisation avec GSAP ScrollTrigger si le plugin est utilisé.
//
// Pour ajuster la sensation, override la propriété `lenisOptions` dans la page :
//   data () { return { lenisOptions: { duration: 0.8 } } }
//
// Note : le CSS global (assets/scss/global.scss) contient l'override nécessaire
// (html.lenis { height: auto !important }) pour permettre le scroll naturel
// quand Lenis est actif. Sans ça, les règles `height: 100% !important`
// bloqueraient le scroll.
// ─────────────────────────────────────────────────────────────────────────────

import { gsap } from '@/vendor/gsap'
import { ScrollTrigger } from '@/vendor/gsap/ScrollTrigger'

export default {
  data () {
    return {
      // Configuration Lenis par défaut — overridable via data() de la page
      lenisOptions: {
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
        smoothWheel: true,
        smoothTouch: false,    // mobile : scroll natif (plus naturel au doigt)
        wheelMultiplier: 1
      }
    }
  },

  mounted () {
    if (typeof window === 'undefined') return
    this.$nextTick(() => this._initLenis())
  },

  beforeDestroy () {
    this._destroyLenis()
  },

  methods: {
    async _initLenis () {
      const Lenis = (await import('lenis')).default

      this._lenis = new Lenis(this.lenisOptions)

      // Sync ScrollTrigger avec le scroll lerpé
      this._lenis.on('scroll', ScrollTrigger.update)

      // Drive Lenis depuis le ticker GSAP — un seul RAF pour tout le monde
      this._lenisRaf = (time) => this._lenis.raf(time * 1000)
      gsap.ticker.add(this._lenisRaf)
      gsap.ticker.lagSmoothing(0)
    },

    _destroyLenis () {
      if (!this._lenis) return
      gsap.ticker.remove(this._lenisRaf)
      this._lenis.destroy()
      this._lenis = null
      this._lenisRaf = null
    }
  }
}
