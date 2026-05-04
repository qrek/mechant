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
      <div class="AboutPage_intro_meta" ref="introKicker">
        <span class="kicker">— The studio</span>
        <span class="meta">Paris / FR</span>
      </div>

      <h2 class="AboutPage_intro_text" ref="introText">
        <span class="line">
          <span class="word word--lead">We&nbsp;are</span>
          <span class="word word--accent">creative.</span>
        </span>
        <span class="line line--small">
          <span class="word">A&nbsp;post-production</span>
          <span class="word word--italic">studio</span>
          <span class="word">based&nbsp;in&nbsp;Paris,</span>
        </span>
        <span class="line line--small">
          <span class="word">founded&nbsp;in</span>
          <span class="word word--circle">2019</span>
        </span>
        <span class="line line--small">
          <span class="word">by</span>
          <span class="word word--name">Théo&nbsp;Bacholier</span>
          <span class="word">&amp;</span>
          <span class="word word--name">Ronan&nbsp;Fourreau.</span>
        </span>
      </h2>

      <div class="AboutPage_intro_divider" ref="introDivider"></div>

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

      <div class="AboutPage_awards_intro" ref="awardsIntro">
        <p class="AboutPage_awards_kicker">— Distinctions</p>
        <h2 class="AboutPage_awards_title">
          <span class="line">Recognized</span>
          <span class="line italic">where it matters.</span>
        </h2>
        <p class="AboutPage_awards_total">
          <span class="num">{{ awards.length }}</span>
          <span class="sep">/</span>
          <span>Selected</span>
        </p>
      </div>

      <ul class="AboutPage_awards_list" ref="awardsList">
        <li
          v-for="(award, i) in awards"
          :key="i"
          class="AboutPage_awards_item"
        >
          <span class="index">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="year">{{ award.year }}</span>
          <span class="name">{{ award.name }}</span>
          <span class="tag">
            <span class="dot"></span>
            {{ award.tag }}
          </span>
          <svg class="arrow" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12,5 19,12 12,19"/>
          </svg>
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

    // ── Background : palette enrichie au scroll ────────────────────────
    _animateBgColors () {
      const bg = this.$refs.bg
      gsap.set(bg, { backgroundColor: '#ff8600' })

      // Hero → Intro : orange → orange clair
      this._track(gsap.to(bg, {
        backgroundColor: '#ffa83d',
        ease: 'none',
        scrollTrigger: {
          trigger: this.$refs.intro,
          start: 'top bottom',
          end: 'top top',
          scrub: 1
        }
      }))

      // Intro → Manifesto : coral chaud
      this._track(gsap.to(bg, {
        backgroundColor: '#ff4e2c',
        ease: 'none',
        scrollTrigger: {
          trigger: this.$refs.manifesto,
          start: 'top bottom',
          end: 'top center',
          scrub: 1
        }
      }))

      // Manifesto → milieu manifesto : magenta intense
      this._track(gsap.to(bg, {
        backgroundColor: '#d6266b',
        ease: 'none',
        scrollTrigger: {
          trigger: this.$refs.manifesto,
          start: 'top center',
          end: 'bottom top',
          scrub: 1
        }
      }))

      // Manifesto → Services : pink Méchant
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

      // Services milieu → Awards : violet/mauve
      this._track(gsap.to(bg, {
        backgroundColor: '#7c4dff',
        ease: 'none',
        scrollTrigger: {
          trigger: this.$refs.services,
          start: 'top center',
          end: 'bottom top',
          scrub: 1
        }
      }))

      // Awards : noir
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

      // Awards → Visit : retour orange Méchant
      this._track(gsap.to(bg, {
        backgroundColor: '#ff8600',
        ease: 'none',
        scrollTrigger: {
          trigger: this.$refs.visit,
          start: 'top bottom',
          end: 'top 30%',
          scrub: 1
        }
      }))
    },

    // ── Intro : reveal en cascade ──────────────────────────────────────
    _animateIntro () {
      const introWords = this.$refs.introText.querySelectorAll('.word')
      const subSplit = new SplitText(this.$refs.introSub, { type: 'words,lines' })
      this._splits.push(subSplit)

      gsap.set(introWords, { yPercent: 110, opacity: 0, rotate: 4 })
      gsap.set(subSplit.words, { yPercent: 110, opacity: 0 })
      gsap.set(this.$refs.introKicker, { opacity: 0, x: -20 })
      gsap.set(this.$refs.introDivider, { scaleX: 0, transformOrigin: 'left' })

      this._track(gsap.to(this.$refs.introKicker, {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: this.$refs.intro, start: 'top 75%' }
      }))

      this._track(gsap.to(introWords, {
        yPercent: 0,
        opacity: 1,
        rotate: 0,
        stagger: 0.05,
        duration: 0.9,
        ease: 'power4.out',
        scrollTrigger: { trigger: this.$refs.introText, start: 'top 80%' }
      }))

      this._track(gsap.to(this.$refs.introDivider, {
        scaleX: 1,
        duration: 0.9,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: this.$refs.introDivider, start: 'top 90%' }
      }))

      this._track(gsap.to(subSplit.words, {
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

    // ── Awards : titre qui slide + items en cascade ────────────────────
    _animateAwards () {
      const items = this.$refs.awardsList.querySelectorAll('.AboutPage_awards_item')
      const titleLines = this.$refs.awards.querySelectorAll('.AboutPage_awards_title .line')
      const kicker = this.$refs.awards.querySelector('.AboutPage_awards_kicker')
      const total = this.$refs.awards.querySelector('.AboutPage_awards_total')

      gsap.set(items, { y: 40, opacity: 0 })
      gsap.set(titleLines, { yPercent: 110, opacity: 0 })
      gsap.set([kicker, total], { opacity: 0, y: 20 })

      this._track(gsap.to(kicker, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: this.$refs.awards, start: 'top 75%' }
      }))

      this._track(gsap.to(titleLines, {
        yPercent: 0,
        opacity: 1,
        stagger: 0.12,
        duration: 0.9,
        ease: 'power4.out',
        scrollTrigger: { trigger: this.$refs.awardsIntro, start: 'top 80%' }
      }))

      this._track(gsap.to(total, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: this.$refs.awardsIntro, start: 'top 75%' }
      }))

      this._track(gsap.to(items, {
        y: 0,
        opacity: 1,
        stagger: 0.08,
        duration: 0.7,
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
    padding: 18vh 6vw 18vh
    max-width: 1500px

    +breakpoint(mobile)
      padding: 12vh 5vw

    &_meta
      display: flex
      justify-content: space-between
      align-items: center
      margin-bottom: 5rem
      padding-bottom: 1.2rem
      border-bottom: 1px solid rgba(0, 0, 0, 0.18)

      .kicker, .meta
        font-family: $apfel
        font-size: 0.8rem
        letter-spacing: 0.2em
        text-transform: uppercase
        color: rgba(0, 0, 0, 0.55)

      .meta
        font-weight: 700

    &_text
      font-family: $apfel
      font-weight: 900
      color: $black
      margin: 0 0 4rem
      line-height: 0.95
      letter-spacing: -0.02em

      .line
        display: block
        overflow: visible

        &--small
          font-weight: 400
          font-size: clamp(1.6rem, 3vw, 3.6rem)
          line-height: 1.15
          letter-spacing: -0.005em
          color: rgba(0, 0, 0, 0.75)
          margin-top: 0.4rem

      .word
        display: inline-block
        margin-right: 0.3em

        &--lead
          font-size: clamp(3.5rem, 9vw, 11rem)
          font-weight: 900
          text-transform: uppercase

        &--accent
          font-size: clamp(3.5rem, 9vw, 11rem)
          font-weight: 400
          font-style: italic
          color: $white
          text-transform: uppercase
          background: $black
          padding: 0 0.2em 0.05em
          border-radius: 4px
          margin-left: 0.15em
          line-height: 0.9

        &--italic
          font-style: italic
          font-weight: 400

        &--circle
          font-weight: 900
          color: $white
          background: $black
          padding: 0 0.4em
          border-radius: 999px
          line-height: 1.1
          display: inline-block

        &--name
          font-weight: 900
          color: $black
          font-style: normal

      +breakpoint(mobile)
        margin-bottom: 3rem

    &_divider
      height: 1px
      background: rgba(0, 0, 0, 0.25)
      margin: 4rem 0
      width: 100%

    &_sub
      font-family: $apfel
      font-weight: 400
      font-size: clamp(1.1rem, 1.5vw, 1.5rem)
      line-height: 1.5
      color: rgba(0, 0, 0, 0.78)
      max-width: 60ch
      margin: 0
      margin-left: auto

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
    padding: 22vh 5vw 18vh
    max-width: 1700px
    margin: 0 auto

    +breakpoint(mobile)
      padding: 14vh 5vw

    &_intro
      display: grid
      grid-template-columns: 1fr auto
      align-items: end
      gap: 2rem
      margin-bottom: 8rem
      padding-bottom: 2rem
      border-bottom: 2px solid rgba(255, 255, 255, 0.15)

      +breakpoint(mobile)
        grid-template-columns: 1fr
        margin-bottom: 5rem
        gap: 2rem

    &_kicker
      grid-column: 1
      grid-row: 1
      font-family: $apfel
      font-size: 0.8rem
      letter-spacing: 0.2em
      text-transform: uppercase
      color: rgba(255, 255, 255, 0.5)
      margin: 0 0 2rem

    &_title
      grid-column: 1
      grid-row: 2
      font-family: $apfel
      font-weight: 900
      font-size: clamp(2.8rem, 7vw, 7.5rem)
      line-height: 0.92
      text-transform: uppercase
      color: $white
      letter-spacing: -0.02em
      margin: 0

      .line
        display: block
        overflow: hidden
        padding-bottom: 0.05em

        &.italic
          font-weight: 400
          font-style: italic
          color: #ff8600

    &_total
      grid-column: 2
      grid-row: 2
      align-self: end
      font-family: $apfel
      font-size: 0.85rem
      letter-spacing: 0.18em
      text-transform: uppercase
      color: rgba(255, 255, 255, 0.4)
      margin: 0
      display: flex
      align-items: baseline
      gap: 0.5rem

      .num
        font-family: $apfel
        font-weight: 900
        font-size: clamp(2rem, 3vw, 3rem)
        color: #ff8600
        letter-spacing: -0.02em
        line-height: 1

      .sep
        font-size: 1.5rem
        color: rgba(255, 255, 255, 0.25)

      +breakpoint(mobile)
        grid-column: 1
        grid-row: 3

    &_list
      list-style: none
      padding: 0
      margin: 0

    &_item
      position: relative
      display: grid
      grid-template-columns: 4rem 6rem 1fr auto 2.5rem
      align-items: center
      gap: 2.5rem
      padding: 2.4rem 1.5rem
      border-bottom: 1px solid rgba(255, 255, 255, 0.08)
      transition: padding-left 0.5s $easeOutQuart, background 0.4s ease

      &::before
        content: ''
        position: absolute
        left: 0
        top: 0
        height: 100%
        width: 0
        background: #ff8600
        transition: width 0.5s $easeOutQuart
        z-index: -1

      &:hover
        padding-left: 3rem

        &::before
          width: 100%

        .index
          color: $black

        .year
          color: $black
          opacity: 0.7

        .name
          color: $black

        .tag
          color: $black

          .dot
            background: $black

        .arrow
          transform: translateX(6px)
          color: $black

      +breakpoint(mobile)
        grid-template-columns: 2.5rem 1fr auto
        gap: 1rem
        padding: 1.8rem 0.5rem

        .year
          grid-column: 2 / 3
          grid-row: 1

        .name
          grid-column: 2 / 4
          grid-row: 2
          margin-top: 0.3rem

        .tag
          grid-column: 2 / 4
          grid-row: 3
          margin-top: 0.5rem

        .arrow
          display: none

      .index
        font-family: $apfel
        font-weight: 400
        font-size: 0.75rem
        letter-spacing: 0.15em
        color: rgba(255, 255, 255, 0.3)
        transition: color 0.4s ease

      .year
        font-family: $apfel
        font-weight: 700
        font-size: 1rem
        letter-spacing: 0.05em
        color: rgba(255, 255, 255, 0.55)
        transition: color 0.4s ease

      .name
        font-family: $apfel
        font-weight: 900
        font-size: clamp(1.8rem, 3.8vw, 4.2rem)
        text-transform: uppercase
        line-height: 0.95
        color: $white
        letter-spacing: -0.015em
        transition: color 0.4s ease

      .tag
        display: inline-flex
        align-items: center
        gap: 0.6rem
        font-family: $apfel
        font-weight: 700
        font-size: 0.8rem
        letter-spacing: 0.18em
        text-transform: uppercase
        color: #ff8600
        white-space: nowrap
        transition: color 0.4s ease

        .dot
          width: 0.5rem
          height: 0.5rem
          border-radius: 50%
          background: #ff8600
          transition: background 0.4s ease

      .arrow
        color: rgba(255, 255, 255, 0.3)
        transition: transform 0.5s $easeOutQuart, color 0.4s ease

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
