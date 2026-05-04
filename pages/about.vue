<template>
  <section class="AboutPage" ref="root">

    <!-- Fond animé via ScrollTrigger (couleur change au scroll) -->
    <div class="AboutPage_bg" ref="bg" />

    <!-- ── HERO : catchphrase ───────────────────────────────────────────── -->
    <section class="AboutPage_hero" ref="hero">
      <div class="AboutPage_hero_eyebrow" ref="eyebrow">
        <template v-for="(part, i) in content.hero.eyebrow">
          <span :key="`eb-${i}`">{{ part }}</span>
          <span v-if="i < content.hero.eyebrow.length - 1" :key="`dot-${i}`" class="dot">●</span>
        </template>
      </div>

      <h1 class="AboutPage_hero_title" ref="heroTitle">
        <span
          v-for="(line, i) in content.hero.lines"
          :key="i"
          class="line"
          :class="`line--${line.variant}`"
        >{{ line.text }}</span>
      </h1>

      <div class="AboutPage_hero_scroll" ref="scrollHint">
        <span>{{ content.hero.scrollLabel }}</span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <polyline points="5,12 12,19 19,12"/>
        </svg>
      </div>
    </section>

    <!-- ── INTRO : "We are creative" + sub ─────────────────────────────── -->
    <section class="AboutPage_intro" ref="intro">
      <div class="AboutPage_intro_meta" ref="introKicker">
        <span class="kicker">{{ content.intro.kicker }}</span>
        <span class="meta">{{ content.intro.meta }}</span>
      </div>

      <h2 class="AboutPage_intro_text" ref="introText">
        <span
          v-for="(line, li) in content.intro.lines"
          :key="li"
          class="line"
          :class="{ 'line--small': li > 0, 'line--lead': li === 0 }"
        >
          <span
            v-for="(w, wi) in line"
            :key="wi"
            class="word"
            :class="w.variant ? `word--${w.variant}` : ''"
          >{{ w.text }}</span>
        </span>
      </h2>

      <div class="AboutPage_intro_divider" ref="introDivider"></div>

      <p class="AboutPage_intro_sub" ref="introSub" v-html="content.intro.sub"></p>
    </section>

    <!-- ── MANIFESTO : sweep horizontal au scroll ──────────────────────── -->
    <section class="AboutPage_manifesto" ref="manifesto">
      <div
        v-for="(line, i) in content.manifesto"
        :key="i"
        class="AboutPage_manifesto_line"
        :class="{ 'AboutPage_manifesto_line--right': i % 2 === 1 }"
        :ref="`manifestoLine${i}`"
      >
        <span class="text">
          <span v-for="n in 4" :key="n" class="text_unit">{{ line }}<span class="dot">●</span></span>
        </span>
      </div>
    </section>

    <!-- ── CAPABILITIES : Services + Awards en grille compacte 2 colonnes ─ -->
    <section class="AboutPage_capa" ref="capa">
      <div class="AboutPage_capa_grid">

        <!-- Colonne gauche : Services -->
        <div class="AboutPage_capa_col AboutPage_capa_col--services" ref="services">
          <header class="AboutPage_capa_head">
            <span class="num">01</span>
            <span class="title">{{ content.services.kicker.replace(/^—\s*/, '') }}</span>
            <span class="count" ref="serviceCounter">{{ String(content.services.list.length).padStart(2, '0') }}</span>
          </header>

          <ul class="AboutPage_capa_servicesList" ref="servicesList">
            <li
              v-for="(s, i) in content.services.list"
              :key="s.label"
              class="AboutPage_capa_serviceItem"
            >
              <span class="idx">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="label">{{ s.label }}</span>
              <span class="desc">{{ s.desc }}</span>
            </li>
          </ul>
        </div>

        <!-- Séparateur vertical -->
        <div class="AboutPage_capa_divider" aria-hidden="true"></div>

        <!-- Colonne droite : Awards -->
        <div class="AboutPage_capa_col AboutPage_capa_col--awards" ref="awards">
          <header class="AboutPage_capa_head">
            <span class="num">02</span>
            <span class="title">{{ content.awards.kicker.replace(/^—\s*/, '') }}</span>
            <span class="count">{{ String(content.awards.list.length).padStart(2, '0') }}</span>
          </header>

          <ul class="AboutPage_capa_awardsList" ref="awardsList">
            <li
              v-for="(award, i) in content.awards.list"
              :key="i"
              class="AboutPage_capa_awardItem"
            >
              <span class="year">{{ award.year }}</span>
              <span class="name">{{ award.name }}</span>
              <span class="tag">{{ award.tag }}</span>
            </li>
          </ul>
        </div>

      </div>
    </section>

    <!-- ── VISIT US (slot pour scan 3D) ────────────────────────────────── -->
    <section class="AboutPage_visit" ref="visit">
      <p class="AboutPage_visit_kicker">{{ content.visit.kicker }}</p>

      <h2 class="AboutPage_visit_title">
        <span
          v-for="(line, i) in content.visit.titleLines"
          :key="i"
          :class="{ italic: line.italic }"
        >{{ line.text }}</span>
      </h2>

      <!--
        Slot 3D scan : remplacer ce placeholder par un canvas Three.js
        avec GLTFLoader quand le scan sera prêt (export GLB optimisé).
      -->
      <div class="AboutPage_visit_canvas" ref="visitCanvas">
        <div class="AboutPage_visit_placeholder">
          <span class="placeholderLine">{{ content.visit.placeholderLine }}</span>
          <span class="placeholderSub">{{ content.visit.placeholderSub }}</span>
        </div>
      </div>

      <div class="AboutPage_visit_address">
        <a :href="content.visit.mapsUrl" target="_blank" rel="noopener">
          {{ content.visit.address }}
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
import aboutContent from '@/content/about'
import smoothScroll from '@/mixins/smoothScroll'

gsap.registerPlugin(ScrollTrigger)
gsap.registerPlugin(SplitText)

export default {
  name: 'About',

  components: { SimpleFooter },
  mixins: [smoothScroll],

  head () {
    return {
      title: this.content.meta.title,
      meta: [{
        hid: 'description',
        name: 'description',
        content: this.content.meta.description
      }]
    }
  },

  data () {
    return {
      content: aboutContent
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
    // Lenis cleanup est géré par le mixin smoothScroll
  },

  methods: {
    _initAnimations () {
      this._animateHero()
      this._animateBgColors()
      this._animateIntro()
      this._animateManifesto()
      this._animateCapa()
      this._animateVisit()
    },

    _track (st) {
      if (st && st.scrollTrigger) this._triggers.push(st.scrollTrigger)
      else if (st) this._triggers.push(st)
      return st
    },

    // ── Hero : reveal au load + parallaxe à la sortie ──────────────────
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

    // ── Background : transition douce à l'entrée de chaque section ────
    // Chaque section déclenche un fade vers sa couleur (durée 0.8s).
    // Pas de scrub : pas de saut, pas de chevauchement, pas de trou.
    _animateBgColors () {
      const bg = this.$refs.bg
      const c = this.content.bgColors
      gsap.set(bg, { backgroundColor: c.hero })

      // Liste ordonnée des transitions : section déclencheur + couleur cible
      // + couleur de retour si on remonte au-dessus
      const stops = [
        { trigger: this.$refs.intro,     enter: c.intro,     back: c.hero      },
        { trigger: this.$refs.manifesto, enter: c.manifesto, back: c.intro     },
        { trigger: this.$refs.capa,      enter: c.capa,      back: c.manifesto },
        { trigger: this.$refs.visit,     enter: c.visit,     back: c.capa      }
      ]

      stops.forEach(({ trigger, enter, back }) => {
        if (!trigger || !enter) return
        const st = ScrollTrigger.create({
          trigger,
          start: 'top 60%',           // déclenche quand la section atteint 60% du viewport
          onEnter: () => gsap.to(bg, {
            backgroundColor: enter,
            duration: 0.9,
            ease: 'power2.inOut',
            overwrite: true
          }),
          onLeaveBack: () => gsap.to(bg, {
            backgroundColor: back,
            duration: 0.9,
            ease: 'power2.inOut',
            overwrite: true
          })
        })
        this._triggers.push(st)
      })
    },

    // ── Intro : kicker + mots + divider + sub ──────────────────────────
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

    // ── Manifesto : sweep horizontal — chaque ligne traverse l'écran ───
    _animateManifesto () {
      const lines = this.content.manifesto.map((_, i) => this.$refs[`manifestoLine${i}`])
        .map(ref => Array.isArray(ref) ? ref[0] : ref)
        .filter(Boolean)

      lines.forEach((line, i) => {
        const text = line.querySelector('.text')
        if (!text) return

        // Direction alternée : ligne 0 = vers la gauche, ligne 1 = vers la droite, etc.
        const goesLeft = i % 2 === 0
        const fromX = goesLeft ? '15%' : '-65%'
        const toX   = goesLeft ? '-65%' : '15%'

        gsap.set(text, { x: fromX })

        this._track(gsap.to(text, {
          x: toX,
          ease: 'none',
          scrollTrigger: {
            trigger: this.$refs.manifesto,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2
          }
        }))
      })
    },

    // ── Capabilities : Services + Awards combinés ──────────────────────
    _animateCapa () {
      const capa = this.$refs.capa
      const heads = capa.querySelectorAll('.AboutPage_capa_head')
      const divider = capa.querySelector('.AboutPage_capa_divider')
      const serviceItems = this.$refs.servicesList.querySelectorAll('.AboutPage_capa_serviceItem')
      const awardItems = this.$refs.awardsList.querySelectorAll('.AboutPage_capa_awardItem')

      gsap.set(heads, { opacity: 0, y: 15 })
      gsap.set(divider, { scaleY: 0, transformOrigin: 'top' })
      gsap.set(serviceItems, { x: -30, opacity: 0 })
      gsap.set(awardItems, { x: 30, opacity: 0 })

      this._track(gsap.to(heads, {
        opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: capa, start: 'top 80%' }
      }))

      this._track(gsap.to(divider, {
        scaleY: 1, duration: 0.9, ease: 'power3.inOut',
        scrollTrigger: { trigger: capa, start: 'top 80%' }
      }))

      this._track(gsap.to(serviceItems, {
        x: 0, opacity: 1, stagger: 0.06, duration: 0.55, ease: 'power3.out',
        scrollTrigger: { trigger: this.$refs.servicesList, start: 'top 85%' }
      }))

      this._track(gsap.to(awardItems, {
        x: 0, opacity: 1, stagger: 0.06, duration: 0.55, ease: 'power3.out',
        scrollTrigger: { trigger: this.$refs.awardsList, start: 'top 85%' }
      }))

      // Counter 00 → length
      const counter = { val: 0 }
      this._track(gsap.to(counter, {
        val: this.content.services.list.length,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: { trigger: capa, start: 'top 80%' },
        onUpdate: () => {
          if (this.$refs.serviceCounter) {
            this.$refs.serviceCounter.textContent = String(Math.round(counter.val)).padStart(2, '0')
          }
        }
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
    padding: 12vh 6vw 12vh
    max-width: 1500px

    +breakpoint(mobile)
      padding: 8vh 5vw

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

        &--lead
          white-space: nowrap
          line-height: 1.05

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
          font-size: clamp(2.8rem, 8vw, 9rem)
          font-weight: 900
          text-transform: uppercase

        &--accent
          font-size: clamp(2.8rem, 8vw, 9rem)
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
          white-space: nowrap

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
    position: relative
    min-height: 80vh
    padding: 10vh 0
    display: flex
    flex-direction: column
    justify-content: center
    overflow: hidden

    +breakpoint(mobile)
      min-height: 80vh
      padding: 10vh 0

    &_line
      width: 100%
      overflow: hidden
      pointer-events: none
      margin: 1vh 0
      mix-blend-mode: difference

      .text
        display: inline-flex
        align-items: center
        white-space: nowrap
        font-family: $apfel
        font-weight: 900
        font-size: clamp(7rem, 18vw, 22rem)
        line-height: 0.9
        letter-spacing: -0.03em
        text-transform: uppercase
        color: $white
        will-change: transform

        +breakpoint(mobile)
          font-size: clamp(4rem, 14vw, 8rem)

      .text_unit
        display: inline-flex
        align-items: center
        margin-right: 0.4em

      .dot
        display: inline-block
        width: 0.3em
        height: 0.3em
        border-radius: 50%
        background: $white
        margin: 0 0.4em 0 0.4em

  // ── CAPABILITIES (Services + Awards en grille compacte) ─────────────
  &_capa
    padding: 12vh 5vw
    max-width: 1500px
    margin: 0 auto

    +breakpoint(mobile)
      padding: 10vh 5vw

    &_grid
      display: grid
      grid-template-columns: 1fr 1px 1fr
      gap: 4rem
      align-items: start

      +breakpoint(mobile)
        grid-template-columns: 1fr
        gap: 4rem

    &_divider
      background: rgba(255, 255, 255, 0.15)
      width: 1px
      align-self: stretch
      min-height: 100%

      +breakpoint(mobile)
        height: 1px
        width: 100%
        min-height: 0

    &_col
      width: 100%

    &_head
      display: flex
      align-items: baseline
      gap: 1rem
      margin-bottom: 2.5rem
      padding-bottom: 1rem
      border-bottom: 1px solid rgba(255, 255, 255, 0.2)

      .num
        font-family: $apfel
        font-weight: 900
        font-size: 0.75rem
        letter-spacing: 0.15em
        color: #ff8600

      .title
        flex: 1
        font-family: $apfel
        font-weight: 700
        font-size: 0.85rem
        letter-spacing: 0.2em
        text-transform: uppercase
        color: $white

      .count
        font-family: $apfel
        font-weight: 900
        font-size: 0.85rem
        color: rgba(255, 255, 255, 0.4)

    &_servicesList,
    &_awardsList
      list-style: none
      padding: 0
      margin: 0

    // Services : ligne dense avec numéro · label · desc inline
    &_serviceItem
      display: grid
      grid-template-columns: 2.2rem 1fr
      align-items: baseline
      gap: 0.8rem
      padding: 0.9rem 0
      border-bottom: 1px solid rgba(255, 255, 255, 0.08)
      transition: color 0.3s ease

      &:hover .label
        color: #ff8600

      .idx
        font-family: $apfel
        font-weight: 400
        font-size: 0.7rem
        letter-spacing: 0.1em
        color: rgba(255, 255, 255, 0.35)

      .label
        font-family: $apfel
        font-weight: 700
        font-size: clamp(1.1rem, 1.4vw, 1.35rem)
        text-transform: uppercase
        color: $white
        letter-spacing: 0.01em
        line-height: 1.2
        transition: color 0.3s ease

      .desc
        grid-column: 2
        font-family: $apfel
        font-weight: 400
        font-size: 0.85rem
        font-style: italic
        color: rgba(255, 255, 255, 0.5)
        line-height: 1.3
        margin-top: 0.2rem

    // Awards : ligne tabulée year · name · tag
    &_awardItem
      display: grid
      grid-template-columns: 3rem 1fr auto
      align-items: baseline
      gap: 1rem
      padding: 0.9rem 0
      border-bottom: 1px solid rgba(255, 255, 255, 0.08)
      transition: color 0.3s ease

      &:hover
        .name
          color: #ff8600

      .year
        font-family: $apfel
        font-weight: 400
        font-size: 0.8rem
        color: rgba(255, 255, 255, 0.45)
        letter-spacing: 0.05em

      .name
        font-family: $apfel
        font-weight: 700
        font-size: clamp(1.05rem, 1.3vw, 1.25rem)
        text-transform: uppercase
        color: $white
        letter-spacing: 0.01em
        line-height: 1.2
        transition: color 0.3s ease

      .tag
        font-family: $apfel
        font-weight: 700
        font-size: 0.7rem
        letter-spacing: 0.15em
        text-transform: uppercase
        color: #ff8600
        white-space: nowrap

  // ── VISIT (slot 3D) ──────────────────────────────────────────────────
  &_visit
    padding: 12vh 5vw 10vh
    max-width: 1600px
    margin: 0 auto
    text-align: center

    +breakpoint(mobile)
      padding: 8vh 5vw

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
