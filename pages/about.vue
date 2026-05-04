<template>
  <section class="AboutPage" ref="root">

    <!-- Fond animé via ScrollTrigger (couleur change au scroll) -->
    <div class="AboutPage_bg" ref="bg" />

    <!-- ── HERO : catchphrase ───────────────────────────────────────────── -->
    <section class="AboutPage_hero" ref="hero">
      <div class="AboutPage_hero_eyebrow" ref="eyebrow">
        <span>Paris</span>
        <span class="dot">●</span>
        <span>Est. 2019</span>
      </div>

      <h1 class="AboutPage_hero_title" ref="heroTitle">
        <span class="line line--italic">Once upon</span>
        <span class="line line--italic">a frame,</span>
        <span class="line line--bold">MÉCHANT</span>
        <span class="line line--bold">was born.</span>
      </h1>

      <div class="AboutPage_hero_scroll" ref="scrollHint">
        <span>Scroll</span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <polyline points="5,12 12,19 19,12"/>
        </svg>
      </div>
    </section>

    <!-- ── INTRO : qui on est ─────────────────────────────────────────── -->
    <section class="AboutPage_intro" ref="intro">
      <p class="AboutPage_intro_kicker" ref="introKicker">— The studio</p>

      <h2 class="AboutPage_intro_text" ref="introText">
        We are a creative <em>post-production studio</em> based in Paris,
        founded in <em>2019</em> by <em>Théo Bacholier</em> and <em>Ronan Fourreau</em>.
      </h2>

      <p class="AboutPage_intro_sub" ref="introSub">
        We dedicate our craft and technical obsession to <em>commercials</em>
        and <em>music videos</em> — bringing an aesthetic vision that's a little
        rough around the edges. Méchant, on purpose.
      </p>
    </section>

    <!-- ── MANIFESTO : grande phrase qui se révèle mot par mot ────────── -->
    <section class="AboutPage_manifesto" ref="manifesto">
      <h2 class="AboutPage_manifesto_text" ref="manifestoText">
        Pretty pictures.<br/>
        Bad influence.<br/>
        Clean cuts.<br/>
        Dirty habits.
      </h2>
    </section>

    <!-- ── SERVICES ────────────────────────────────────────────────────── -->
    <section class="AboutPage_services" ref="services">
      <div class="AboutPage_services_head">
        <p class="AboutPage_services_kicker">— What we do</p>
        <p class="AboutPage_services_count">
          <span ref="serviceCounter">05</span><span class="total">/05</span>
        </p>
      </div>

      <ul class="AboutPage_services_list" ref="servicesList">
        <li v-for="(s, i) in serviceList" :key="s.label" class="AboutPage_services_item">
          <span class="num">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="label">{{ s.label }}</span>
          <span class="desc">{{ s.desc }}</span>
        </li>
      </ul>
    </section>

    <!-- ── AWARDS ──────────────────────────────────────────────────────── -->
    <section class="AboutPage_awards" ref="awards">
      <div class="AboutPage_awards_head">
        <p class="AboutPage_awards_kicker">— Awards</p>
        <p class="AboutPage_awards_total">
          <span>{{ awards.length }}</span> selected
        </p>
      </div>

      <ul class="AboutPage_awards_list" ref="awardsList">
        <li
          v-for="(award, i) in awards"
          :key="i"
          class="AboutPage_awards_item"
        >
          <span class="year">{{ award.year }}</span>
          <span class="name">{{ award.name }}</span>
          <span class="tag">{{ award.tag }}</span>
        </li>
      </ul>
    </section>

    <!-- ── VISIT US (slot pour scan 3D) ────────────────────────────────── -->
    <section class="AboutPage_visit" ref="visit">
      <p class="AboutPage_visit_kicker">— Come say hi</p>

      <h2 class="AboutPage_visit_title">
        <span>The studio</span>
        <span class="italic">is open.</span>
      </h2>

      <!--
        Slot 3D scan : remplacer ce placeholder par un canvas Three.js
        avec GLTFLoader quand le scan sera prêt (export GLB optimisé).
        Référence d'intégration : voir SimpleFooter / Three.js.
      -->
      <div class="AboutPage_visit_canvas" ref="visitCanvas">
        <div class="AboutPage_visit_placeholder">
          <span class="placeholderLine">3D studio scan</span>
          <span class="placeholderSub">Coming soon</span>
        </div>
      </div>

      <div class="AboutPage_visit_address">
        <a
          href="https://www.google.fr/maps/place/27+Rue+des+Cascades,+75020+Paris"
          target="_blank"
          rel="noopener"
        >
          27 rue des Cascades — 75020 Paris
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="7" y1="17" x2="17" y2="7"/>
            <polyline points="7,7 17,7 17,17"/>
          </svg>
        </a>
      </div>
    </section>

    <SimpleFooter />
  </section>
</template>

<script>
import { gsap } from '@/vendor/gsap'
import { ScrollTrigger } from '@/vendor/gsap/ScrollTrigger'
import { SplitText } from '@/vendor/gsap/SplitText'
import SimpleFooter from '@/components/SimpleFooter'

gsap.registerPlugin(ScrollTrigger)
gsap.registerPlugin(SplitText)

export default {
  name: 'About',

  components: { SimpleFooter },

  head () {
    return {
      title: 'About — MÉCHANT',
      meta: [{
        hid: 'description',
        name: 'description',
        content: 'Méchant is a creative post-production studio in Paris, founded in 2019 by Théo Bacholier and Ronan Fourreau.'
      }]
    }
  },

  data () {
    return {
      serviceList: [
        { label: 'Editing',        desc: 'Story-driven cuts.' },
        { label: 'VFX',            desc: 'Invisible to spectacular.' },
        { label: '3D / 2D Animation', desc: 'Frame by frame, pixel by pixel.' },
        { label: 'Motion Design',  desc: 'Make graphics move.' },
        { label: 'Art Direction',  desc: 'Set the visual rules.' }
      ],
      awards: [
        { year: '2024', name: 'Cannes Lions', tag: 'Shortlist' },
        { year: '2023', name: 'Ciclope Festival', tag: 'Bronze' },
        { year: '2023', name: 'Young Directors Award', tag: 'Selection' },
        { year: '2022', name: 'AICP Awards', tag: 'Honor' }
      ]
    }
  },

  mounted () {
    this._splits = []
    this._triggers = []
    this.$nextTick(() => this._initAnimations())
  },

  beforeDestroy () {
    ;(this._splits || []).forEach(s => s.revert && s.revert())
    ;(this._triggers || []).forEach(t => t.kill && t.kill())
    this._splits = []
    this._triggers = []
  },

  methods: {
    _initAnimations () {
      this._animateHero()
      this._animateBgColors()
      this._animateIntro()
      this._animateManifesto()
      this._animateServices()
      this._animateAwards()
      this._animateVisit()
    },

    _track (st) {
      if (st && st.scrollTrigger) this._triggers.push(st.scrollTrigger)
      else if (st) this._triggers.push(st)
      return st
    },

    // ── Hero : reveal mot par mot au load + parallaxe au scroll ─────────
    _animateHero () {
      const lines = this.$refs.heroTitle.querySelectorAll('.line')
      gsap.set(lines, { yPercent: 110, opacity: 0 })
      gsap.set([this.$refs.eyebrow, this.$refs.scrollHint], { opacity: 0, y: 20 })

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.to(this.$refs.eyebrow, { opacity: 1, y: 0, duration: 0.6 }, 0.1)
      tl.to(lines, {
        yPercent: 0,
        opacity: 1,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power4.out'
      }, 0.2)
      tl.to(this.$refs.scrollHint, { opacity: 1, y: 0, duration: 0.5 }, 0.9)

      // Parallax sortie hero
      this._track(gsap.to(this.$refs.heroTitle, {
        yPercent: -25,
        ease: 'none',
        scrollTrigger: {
          trigger: this.$refs.hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8
        }
      }))
    },

    // ── Background : transition de couleurs continue au scroll ─────────
    _animateBgColors () {
      const bg = this.$refs.bg

      // Hero → Intro : orange Méchant
      gsap.set(bg, { backgroundColor: '#ff8600' })

      // Manifesto → couleur plus chaude / coraille
      this._track(gsap.to(bg, {
        backgroundColor: '#ff5b14',
        ease: 'none',
        scrollTrigger: {
          trigger: this.$refs.manifesto,
          start: 'top bottom',
          end: 'top top',
          scrub: 1
        }
      }))

      // Manifesto → Services : pink
      this._track(gsap.to(bg, {
        backgroundColor: '#fe82ae',
        ease: 'none',
        scrollTrigger: {
          trigger: this.$refs.services,
          start: 'top bottom',
          end: 'top center',
          scrub: 1
        }
      }))

      // Services → Awards : noir
      this._track(gsap.to(bg, {
        backgroundColor: '#0a0a0a',
        ease: 'none',
        scrollTrigger: {
          trigger: this.$refs.awards,
          start: 'top bottom',
          end: 'top center',
          scrub: 1
        }
      }))

      // Awards → Visit : retour orange
      this._track(gsap.to(bg, {
        backgroundColor: '#ff8600',
        ease: 'none',
        scrollTrigger: {
          trigger: this.$refs.visit,
          start: 'top bottom',
          end: 'top center',
          scrub: 1
        }
      }))
    },

    // ── Intro : reveal mot par mot ─────────────────────────────────────
    _animateIntro () {
      const split1 = new SplitText(this.$refs.introText, { type: 'words,lines' })
      const split2 = new SplitText(this.$refs.introSub, { type: 'words,lines' })
      this._splits.push(split1, split2)

      gsap.set([split1.words, split2.words], { yPercent: 110, opacity: 0 })
      gsap.set(this.$refs.introKicker, { opacity: 0, x: -20 })

      this._track(gsap.to(this.$refs.introKicker, {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: this.$refs.intro, start: 'top 75%' }
      }))

      this._track(gsap.to(split1.words, {
        yPercent: 0,
        opacity: 1,
        stagger: 0.025,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: this.$refs.introText, start: 'top 80%' }
      }))

      this._track(gsap.to(split2.words, {
        yPercent: 0,
        opacity: 1,
        stagger: 0.015,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: { trigger: this.$refs.introSub, start: 'top 85%' }
      }))
    },

    // ── Manifesto : pinned, lignes apparaissent au scroll ──────────────
    _animateManifesto () {
      const split = new SplitText(this.$refs.manifestoText, { type: 'lines' })
      this._splits.push(split)

      gsap.set(split.lines, { yPercent: 100, opacity: 0 })

      this._track(gsap.to(split.lines, {
        yPercent: 0,
        opacity: 1,
        stagger: 0.18,
        duration: 0.8,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: this.$refs.manifesto,
          start: 'top 70%'
        }
      }))
    },

    // ── Services : items qui slident depuis la gauche ──────────────────
    _animateServices () {
      const items = this.$refs.servicesList.querySelectorAll('.AboutPage_services_item')
      gsap.set(items, { x: -60, opacity: 0 })
      gsap.set(this.$refs.services.querySelector('.AboutPage_services_head'), { opacity: 0, y: 20 })

      this._track(gsap.to(this.$refs.services.querySelector('.AboutPage_services_head'), {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: this.$refs.services, start: 'top 75%' }
      }))

      this._track(gsap.to(items, {
        x: 0,
        opacity: 1,
        stagger: 0.08,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: this.$refs.servicesList, start: 'top 80%' }
      }))

      // Counter qui décompte 00 → 05
      const counter = { val: 0 }
      this._track(gsap.to(counter, {
        val: this.serviceList.length,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: { trigger: this.$refs.services, start: 'top 75%' },
        onUpdate: () => {
          if (this.$refs.serviceCounter) {
            this.$refs.serviceCounter.textContent = String(Math.round(counter.val)).padStart(2, '0')
          }
        }
      }))
    },

    // ── Awards : reveal en cascade ─────────────────────────────────────
    _animateAwards () {
      const items = this.$refs.awardsList.querySelectorAll('.AboutPage_awards_item')
      gsap.set(items, { y: 30, opacity: 0 })
      gsap.set(this.$refs.awards.querySelector('.AboutPage_awards_head'), { opacity: 0 })

      this._track(gsap.to(this.$refs.awards.querySelector('.AboutPage_awards_head'), {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: this.$refs.awards, start: 'top 75%' }
      }))

      this._track(gsap.to(items, {
        y: 0,
        opacity: 1,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: { trigger: this.$refs.awardsList, start: 'top 85%' }
      }))
    },

    // ── Visit : reveal du titre + placeholder du scan 3D ───────────────
    _animateVisit () {
      const titleSpans = this.$refs.visit.querySelectorAll('.AboutPage_visit_title span')
      gsap.set(titleSpans, { yPercent: 100, opacity: 0 })
      gsap.set(this.$refs.visitCanvas, { scale: 0.85, opacity: 0 })
      gsap.set(this.$refs.visit.querySelector('.AboutPage_visit_address'), { opacity: 0, y: 20 })

      this._track(gsap.to(titleSpans, {
        yPercent: 0,
        opacity: 1,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power4.out',
        scrollTrigger: { trigger: this.$refs.visit, start: 'top 70%' }
      }))

      this._track(gsap.to(this.$refs.visitCanvas, {
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: this.$refs.visitCanvas, start: 'top 80%' }
      }))

      this._track(gsap.to(this.$refs.visit.querySelector('.AboutPage_visit_address'), {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: this.$refs.visit.querySelector('.AboutPage_visit_address'), start: 'top 90%' }
      }))
    }
  }
}
</script>

<style lang="sass" scoped>
.AboutPage
  position: relative
  width: 100%
  color: $white
  overflow-x: hidden

  &_bg
    position: fixed
    inset: 0
    background: #ff8600
    z-index: 0
    pointer-events: none

  > section
    position: relative
    z-index: 1

  // ── HERO ─────────────────────────────────────────────────────────────
  &_hero
    position: relative
    min-height: 100vh
    padding: 9rem 5vw 4rem
    display: flex
    flex-direction: column
    justify-content: space-between

    &_eyebrow
      display: flex
      align-items: center
      gap: 0.8rem
      font-family: $apfel
      font-size: 0.75rem
      letter-spacing: 0.18em
      text-transform: uppercase
      color: rgba(0, 0, 0, 0.5)

      .dot
        font-size: 0.5rem
        opacity: 0.5

    &_title
      font-family: $apfel
      font-weight: 900
      font-size: clamp(4rem, 12vw, 17rem)
      line-height: 0.9
      letter-spacing: -0.02em
      text-transform: uppercase
      color: $black
      margin: 0

      .line
        display: block
        overflow: hidden
        position: relative
        will-change: transform

        &--italic
          font-style: italic
          font-weight: 400
          font-size: clamp(2.5rem, 7vw, 9rem)
          letter-spacing: -0.01em
          color: rgba(0, 0, 0, 0.85)
          text-transform: none

        &--bold
          font-weight: 900

      +breakpoint(mobile)
        font-size: clamp(3rem, 14vw, 6rem)

    &_scroll
      align-self: flex-end
      display: flex
      align-items: center
      gap: 0.6rem
      font-family: $apfel
      font-size: 0.75rem
      letter-spacing: 0.2em
      text-transform: uppercase
      color: rgba(0, 0, 0, 0.6)

      svg
        animation: bounce 2s ease-in-out infinite

  // ── INTRO ────────────────────────────────────────────────────────────
  &_intro
    padding: 18vh 8vw 18vh
    max-width: 1400px

    +breakpoint(mobile)
      padding: 12vh 5vw

    &_kicker
      font-family: $apfel
      font-size: 0.8rem
      letter-spacing: 0.2em
      text-transform: uppercase
      color: rgba(0, 0, 0, 0.5)
      margin-bottom: 4rem

    &_text
      font-family: $apfel
      font-weight: 900
      font-size: clamp(2.2rem, 4.5vw, 5.5rem)
      line-height: 1.05
      letter-spacing: -0.015em
      color: $black
      margin: 0 0 4rem

      em
        font-style: italic
        font-weight: 400
        color: rgba(0, 0, 0, 0.7)

      ::v-deep .word
        display: inline-block

      +breakpoint(mobile)
        margin-bottom: 3rem

    &_sub
      font-family: $apfel
      font-weight: 400
      font-size: clamp(1.1rem, 1.5vw, 1.5rem)
      line-height: 1.5
      color: rgba(0, 0, 0, 0.75)
      max-width: 60ch
      margin: 0

      em
        font-weight: 700
        font-style: normal
        color: $black

      ::v-deep .word
        display: inline-block

  // ── MANIFESTO ────────────────────────────────────────────────────────
  &_manifesto
    min-height: 80vh
    padding: 14vh 6vw
    display: flex
    align-items: center
    justify-content: center
    text-align: center

    &_text
      font-family: $apfel
      font-weight: 900
      font-size: clamp(3rem, 8vw, 11rem)
      line-height: 1
      letter-spacing: -0.02em
      text-transform: uppercase
      color: $white
      margin: 0
      mix-blend-mode: difference

      ::v-deep .line
        overflow: hidden

  // ── SERVICES ─────────────────────────────────────────────────────────
  &_services
    padding: 18vh 5vw
    max-width: 1600px
    margin: 0 auto

    +breakpoint(mobile)
      padding: 12vh 5vw

    &_head
      display: flex
      justify-content: space-between
      align-items: baseline
      margin-bottom: 6rem
      padding-bottom: 1.2rem
      border-bottom: 1px solid rgba(0, 0, 0, 0.15)

    &_kicker
      font-family: $apfel
      font-size: 0.8rem
      letter-spacing: 0.2em
      text-transform: uppercase
      color: rgba(0, 0, 0, 0.6)
      margin: 0

    &_count
      font-family: $apfel
      font-weight: 700
      font-size: 0.8rem
      letter-spacing: 0.1em
      color: rgba(0, 0, 0, 0.6)
      margin: 0

      .total
        opacity: 0.4

    &_list
      list-style: none
      padding: 0
      margin: 0

    &_item
      display: grid
      grid-template-columns: 6rem 1fr 2fr
      align-items: baseline
      gap: 2rem
      padding: 2rem 0
      border-bottom: 1px solid rgba(0, 0, 0, 0.12)
      cursor: default
      transition: padding-left 0.4s $easeOutQuart

      &:hover
        padding-left: 1.5rem

        .label
          color: $white

      +breakpoint(mobile)
        grid-template-columns: 3rem 1fr
        gap: 1rem

        .desc
          grid-column: 2
          padding-top: 0.5rem

      .num
        font-family: $apfel
        font-weight: 400
        font-size: 0.85rem
        letter-spacing: 0.1em
        color: rgba(0, 0, 0, 0.4)

      .label
        font-family: $apfel
        font-weight: 900
        font-size: clamp(2rem, 4vw, 4.5rem)
        line-height: 1
        text-transform: uppercase
        color: $black
        letter-spacing: -0.02em
        transition: color 0.4s $easeOutQuart

      .desc
        font-family: $apfel
        font-weight: 400
        font-size: clamp(0.9rem, 1vw, 1.1rem)
        color: rgba(0, 0, 0, 0.6)
        font-style: italic

  // ── AWARDS ───────────────────────────────────────────────────────────
  &_awards
    padding: 18vh 5vw
    max-width: 1600px
    margin: 0 auto

    +breakpoint(mobile)
      padding: 12vh 5vw

    &_head
      display: flex
      justify-content: space-between
      align-items: baseline
      margin-bottom: 4rem
      padding-bottom: 1.2rem
      border-bottom: 1px solid rgba(255, 255, 255, 0.15)

    &_kicker
      font-family: $apfel
      font-size: 0.8rem
      letter-spacing: 0.2em
      text-transform: uppercase
      color: rgba(255, 255, 255, 0.5)
      margin: 0

    &_total
      font-family: $apfel
      font-weight: 400
      font-size: 0.8rem
      letter-spacing: 0.1em
      color: rgba(255, 255, 255, 0.5)
      margin: 0

      span
        color: #ff8600
        font-weight: 700

    &_list
      list-style: none
      padding: 0
      margin: 0

    &_item
      display: grid
      grid-template-columns: 6rem 1fr 12rem
      align-items: center
      gap: 2rem
      padding: 1.6rem 0
      border-bottom: 1px solid rgba(255, 255, 255, 0.08)

      +breakpoint(mobile)
        grid-template-columns: 4rem 1fr
        gap: 1rem

        .tag
          grid-column: 2
          padding-top: 0.3rem

      .year
        font-family: $apfel
        font-weight: 400
        font-size: 0.8rem
        letter-spacing: 0.1em
        color: rgba(255, 255, 255, 0.4)

      .name
        font-family: $apfel
        font-weight: 900
        font-size: clamp(1.4rem, 2.4vw, 2.6rem)
        text-transform: uppercase
        line-height: 1
        color: $white
        letter-spacing: -0.01em

      .tag
        font-family: $apfel
        font-weight: 400
        font-size: 0.75rem
        letter-spacing: 0.15em
        text-transform: uppercase
        color: #ff8600
        text-align: right

        +breakpoint(mobile)
          text-align: left

  // ── VISIT (slot 3D) ──────────────────────────────────────────────────
  &_visit
    padding: 16vh 5vw 12vh
    max-width: 1600px
    margin: 0 auto
    text-align: center

    +breakpoint(mobile)
      padding: 12vh 5vw

    &_kicker
      font-family: $apfel
      font-size: 0.8rem
      letter-spacing: 0.2em
      text-transform: uppercase
      color: rgba(0, 0, 0, 0.5)
      margin: 0 0 3rem

    &_title
      font-family: $apfel
      font-weight: 900
      font-size: clamp(3rem, 8vw, 9rem)
      line-height: 0.95
      text-transform: uppercase
      color: $black
      letter-spacing: -0.02em
      margin: 0 0 6rem

      span
        display: block
        overflow: hidden

        &.italic
          font-weight: 400
          font-style: italic

    &_canvas
      position: relative
      width: 100%
      max-width: 1100px
      margin: 0 auto 4rem
      aspect-ratio: 16 / 10
      background: rgba(0, 0, 0, 0.85)
      border-radius: 6px
      overflow: hidden
      display: flex
      align-items: center
      justify-content: center

      +breakpoint(mobile)
        aspect-ratio: 4 / 3

    &_placeholder
      display: flex
      flex-direction: column
      align-items: center
      gap: 0.8rem
      color: rgba(255, 255, 255, 0.4)

      .placeholderLine
        font-family: $apfel
        font-weight: 900
        font-size: clamp(1.5rem, 3vw, 2.5rem)
        text-transform: uppercase
        letter-spacing: -0.01em

      .placeholderSub
        font-family: $apfel
        font-weight: 400
        font-size: 0.75rem
        letter-spacing: 0.2em
        text-transform: uppercase
        color: rgba(255, 255, 255, 0.25)

    &_address
      a
        display: inline-flex
        align-items: center
        gap: 0.6rem
        font-family: $apfel
        font-weight: 700
        font-size: clamp(1rem, 1.4vw, 1.4rem)
        color: $black
        text-decoration: none
        border-bottom: 1px solid rgba(0, 0, 0, 0.3)
        padding-bottom: 0.3rem
        transition: color 0.25s ease, border-color 0.25s ease

        &:hover
          color: $white
          border-color: $white

@keyframes bounce
  0%, 100%
    transform: translateY(0)
  50%
    transform: translateY(4px)
</style>
