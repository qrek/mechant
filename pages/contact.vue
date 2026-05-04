<template>
  <section class="ContactPage">

    <!-- Logo -->
    <div class="ContactPage_hero" ref="hero">
      <img src="~assets/images/MECHANT_TRANSPARENT.png" alt="Méchant" class="ContactPage_hero_logo" />
    </div>

    <!-- Carte formulaire -->
    <div class="ContactPage_card" ref="card">
      <p class="ContactPage_card_eyebrow">Reach us</p>

      <transition name="fade" mode="out-in">

        <!-- Formulaire -->
        <form v-if="!sent" class="ContactPage_form" @submit.prevent="send">
          <div class="ContactPage_form_left">
            <div class="ContactPage_field">
              <input
                v-model="form.prenom"
                type="text"
                placeholder="First Name"
                required
                class="ContactPage_input"
              />
            </div>
            <div class="ContactPage_field">
              <input
                v-model="form.nom"
                type="text"
                placeholder="Last Name"
                required
                class="ContactPage_input"
              />
            </div>
            <div class="ContactPage_field">
              <input
                v-model="form.email"
                type="email"
                placeholder="Email"
                required
                class="ContactPage_input"
              />
            </div>
            <div class="ContactPage_field ContactPage_field--inline">
              <input
                v-model="form.consent"
                type="checkbox"
                id="consent"
                required
                class="ContactPage_checkbox"
              />
              <label for="consent" class="ContactPage_label">
                I give Méchant permission to contact me at this email address.
              </label>
            </div>
          </div>

          <div class="ContactPage_form_right">
            <div class="ContactPage_field ContactPage_field--full">
              <textarea
                v-model="form.message"
                placeholder="Type your message here"
                required
                class="ContactPage_textarea"
              />
            </div>
            <div class="ContactPage_form_footer">
              <button type="submit" class="ContactPage_submit" :disabled="sending">
                <span>{{ sending ? 'Sending…' : 'Send' }}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12,5 19,12 12,19"/>
                </svg>
              </button>
            </div>
          </div>
        </form>

        <!-- Confirmation -->
        <div v-else class="ContactPage_confirm">
          <p class="ContactPage_confirm_title">Message sent.</p>
          <p class="ContactPage_confirm_sub">We'll get back to you shortly.</p>
        </div>

      </transition>
    </div>

    <SimpleFooter />
  </section>
</template>

<script>
import { gsap } from '@/vendor/gsap'
import SimpleFooter from '@/components/SimpleFooter'

export default {
  name: 'ContactPage',
  components: { SimpleFooter },

  head() {
    return {
      title: 'Contact — Méchant',
      meta: [{ hid: 'description', name: 'description', content: 'Get in touch with Méchant post-production studio.' }]
    }
  },

  data() {
    return {
      sent: false,
      sending: false,
      form: {
        prenom: '',
        nom: '',
        email: '',
        message: '',
        consent: false
      }
    }
  },

  mounted() {
    this._animateIn()
  },

  methods: {
    _animateIn() {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from(this.$refs.hero, { opacity: 0, duration: 0.8 })
      tl.from(this.$refs.card, { opacity: 0, y: 40, duration: 0.7 }, '-=0.4')
    },

    async send() {
      this.sending = true
      const subject = encodeURIComponent(`Contact — ${this.form.prenom} ${this.form.nom}`)
      const body = encodeURIComponent(
        `Prénom : ${this.form.prenom}\nNom : ${this.form.nom}\nEmail : ${this.form.email}\n\n${this.form.message}`
      )
      window.location.href = `mailto:contact@mechant.tv?subject=${subject}&body=${body}`

      // Affiche la confirmation après un court délai
      setTimeout(() => {
        this.sending = false
        this.sent = true
      }, 800)
    }
  }
}
</script>

<style lang="sass" scoped>
.ContactPage
  min-height: 100vh
  background: #0a0a0a
  padding-bottom: 8rem

  // ── Hero logo ─────────────────────────────────────────────────────────────
  &_hero
    position: relative
    padding-top: 6rem
    overflow: hidden
    pointer-events: none

    &_logo
      display: block
      width: 100vw
      height: auto
      opacity: 0.9
      margin-bottom: -10vw

  // ── Carte formulaire ──────────────────────────────────────────────────────
  &_card
    position: relative
    z-index: 2
    margin: 0 4vw
    background: #f2492c
    border-radius: 6px
    padding: 4rem 5vw 5rem

    +breakpoint(mobile)
      margin: 0 4vw
      padding: 3rem 5vw 4rem

  &_card_eyebrow
    font-family: $apfel
    font-weight: 400
    font-size: 0.7rem
    letter-spacing: 0.15em
    text-transform: uppercase
    color: rgba(255,255,255,0.35)
    margin-bottom: 3rem

  // ── Formulaire ────────────────────────────────────────────────────────────
  &_form
    display: grid
    grid-template-columns: 1fr 1fr
    gap: 3rem 6rem

    +breakpoint(mobile)
      grid-template-columns: 1fr
      gap: 0

    &_left,
    &_right
      display: flex
      flex-direction: column
      gap: 0

    &_footer
      display: flex
      justify-content: flex-end
      padding-top: 2rem

  // ── Champs ────────────────────────────────────────────────────────────────
  &_field
    border-bottom: 1px solid rgba(255,255,255,0.15)
    padding: 1.2rem 0
    transition: border-color 0.2s ease

    &:focus-within
      border-color: rgba(255,255,255,0.6)

    &--full
      flex: 1
      border-bottom: none

    &--inline
      display: flex
      align-items: flex-start
      gap: 1rem
      border-bottom: none
      padding-top: 2rem

  &_input
    width: 100%
    background: none
    border: none
    outline: none
    font-family: $apfel
    font-weight: 400
    font-size: 1rem
    color: $white
    caret-color: $white

    &::placeholder
      color: rgba(255,255,255,0.35)

  &_textarea
    width: 100%
    height: 100%
    min-height: 16rem
    background: none
    border: none
    border-bottom: 1px solid rgba(255,255,255,0.15)
    outline: none
    resize: none
    font-family: $apfel
    font-weight: 400
    font-size: 1rem
    color: $white
    caret-color: $white
    line-height: 1.6
    padding-bottom: 1rem
    transition: border-color 0.2s ease

    +breakpoint(mobile)
      min-height: 10rem

    &::placeholder
      color: rgba(255,255,255,0.35)

    &:focus
      border-color: rgba(255,255,255,0.6)

  &_checkbox
    appearance: none
    -webkit-appearance: none
    width: 1.1rem
    height: 1.1rem
    min-width: 1.1rem
    border: 1px solid rgba(255,255,255,0.35)
    border-radius: 2px
    cursor: pointer
    margin-top: 0.15rem
    transition: background 0.15s ease, border-color 0.15s ease

    &:checked
      background: $white
      border-color: $white

  &_label
    font-family: $apfel
    font-size: 0.8rem
    line-height: 1.5
    color: rgba(255,255,255,0.4)
    cursor: pointer

  // ── Bouton send ───────────────────────────────────────────────────────────
  &_submit
    display: inline-flex
    align-items: center
    gap: 0.6rem
    background: $white
    color: #0a0a0a
    border: none
    border-radius: 100px
    padding: 0.75rem 1.8rem
    font-family: $apfel
    font-weight: 600
    font-size: 0.9rem
    cursor: pointer
    transition: opacity 0.2s ease, transform 0.2s ease

    &:hover
      opacity: 0.85
      transform: translateX(4px)

    &:disabled
      opacity: 0.5
      cursor: default

  // ── Confirmation ──────────────────────────────────────────────────────────
  &_confirm
    padding: 4rem 0
    text-align: center

    &_title
      font-family: $apfel
      font-weight: 900
      font-size: clamp(2.5rem, 5vw, 5rem)
      text-transform: uppercase
      color: $white
      line-height: 1

    &_sub
      font-family: $apfel
      font-weight: 400
      font-size: 1rem
      color: rgba(255,255,255,0.4)
      margin-top: 1rem

// ── Transitions ──────────────────────────────────────────────────────────
.fade-enter-active,
.fade-leave-active
  transition: opacity 0.35s ease

.fade-enter,
.fade-leave-to
  opacity: 0
</style>
