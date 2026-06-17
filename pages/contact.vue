<template>
  <section class="Contact" ref="root">

    <h1 class="sr-only">Contact Méchant — Post-production studio Paris</h1>

    <div class="Contact_grid">

      <!-- ── Colonne gauche : accroche + infos ──────────────────────── -->
      <div class="Contact_left">
        <p class="Contact_eyebrow" ref="eyebrow">— Reach us</p>

        <h2 class="Contact_headline" ref="headline">
          <span class="line">Let's make</span>
          <span class="line">something</span>
          <span class="line italic">méchant.</span>
        </h2>

        <p class="Contact_intro" ref="intro">
          A project in mind, a film to finish, an idea to push further?
          Tell us about it — we reply fast.
        </p>

        <div class="Contact_info" ref="info">
          <div class="Contact_info_block">
            <span class="label">Email</span>
            <a :href="`mailto:${email}`" class="value">{{ email }}</a>
          </div>
          <div class="Contact_info_block">
            <span class="label">Studio</span>
            <a :href="mapsUrl" target="_blank" rel="noopener" class="value">
              27 rue des Cascades<br/>75020 Paris — Ménilmontant
            </a>
          </div>
          <div class="Contact_info_block">
            <span class="label">Follow</span>
            <a :href="instagramUrl" target="_blank" rel="noopener" class="value">Instagram ↗</a>
          </div>
        </div>
      </div>

      <!-- ── Colonne droite : formulaire ─────────────────────────────── -->
      <div class="Contact_right" ref="formCol">
        <transition name="fade" mode="out-in">

          <form v-if="!sent" class="Contact_form" @submit.prevent="send" key="form">
            <div class="Contact_field">
              <input v-model="form.prenom" type="text" id="f-prenom" required placeholder=" " />
              <label for="f-prenom">First name</label>
            </div>

            <div class="Contact_field">
              <input v-model="form.nom" type="text" id="f-nom" required placeholder=" " />
              <label for="f-nom">Last name</label>
            </div>

            <div class="Contact_field">
              <input v-model="form.email" type="email" id="f-email" required placeholder=" " />
              <label for="f-email">Email</label>
            </div>

            <div class="Contact_field">
              <textarea v-model="form.message" id="f-message" rows="4" required placeholder=" "></textarea>
              <label for="f-message">Your project</label>
            </div>

            <label class="Contact_consent">
              <input v-model="form.consent" type="checkbox" required />
              <span>I agree that Méchant may contact me back at this email.</span>
            </label>

            <button type="submit" class="Contact_submit" :disabled="sending">
              <span>{{ sending ? 'Sending…' : 'Send message' }}</span>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>

            <p v-if="error" class="Contact_error">{{ error }}</p>
          </form>

          <div v-else class="Contact_confirm" key="confirm">
            <div class="Contact_confirm_check">
              <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p class="Contact_confirm_title">Message sent.</p>
            <p class="Contact_confirm_sub">We'll get back to you shortly.</p>
          </div>

        </transition>
      </div>

    </div>

    <SimpleFooter />
  </section>
</template>

<script>
import { gsap } from '@/vendor/gsap'
import SimpleFooter from '@/components/SimpleFooter'
import { trackContactSubmit } from '@/utils/track'

export default {
  name: 'ContactPage',
  components: { SimpleFooter },

  head () {
    const title = 'Contact — Méchant post-production studio Paris'
    const desc = 'Get in touch with Méchant — post-production video studio in Ménilmontant, Paris. Email contact@mechant.tv or visit 27 rue des Cascades, 75020 Paris.'
    return {
      title,
      meta: [
        { hid: 'description', name: 'description', content: desc },
        { hid: 'og:title', property: 'og:title', content: title },
        { hid: 'og:description', property: 'og:description', content: desc },
        { hid: 'og:url', property: 'og:url', content: 'https://mechant.tv/contact' },
        { hid: 'twitter:title', name: 'twitter:title', content: title },
        { hid: 'twitter:description', name: 'twitter:description', content: desc }
      ],
      link: [{ hid: 'canonical', rel: 'canonical', href: 'https://mechant.tv/contact' }]
    }
  },

  data () {
    return {
      sent: false,
      sending: false,
      error: null,
      // Clé publique Web3Forms (conçue pour être exposée côté client)
      web3formsKey: '039a84a9-bfae-4d72-a3f7-d5d6a97184da',
      email: 'contact@mechant.tv',
      mapsUrl: 'https://www.google.fr/maps/place/27+Rue+des+Cascades,+75020+Paris',
      instagramUrl: 'https://www.instagram.com/mechant.tv/',
      form: { prenom: '', nom: '', email: '', message: '', consent: false }
    }
  },

  mounted () {
    this.$nextTick(() => this._animateIn())
  },

  beforeDestroy () {
    if (this._split) this._split.revert && this._split.revert()
  },

  methods: {
    async _animateIn () {
      const { SplitText } = await import('@/vendor/gsap/SplitText')
      const lines = this.$refs.headline.querySelectorAll('.line')
      gsap.set(lines, { yPercent: 110, opacity: 0 })
      gsap.set([this.$refs.eyebrow, this.$refs.intro], { opacity: 0, y: 20 })
      gsap.set(this.$refs.info, { opacity: 0, y: 30 })
      gsap.set(this.$refs.formCol, { opacity: 0, y: 40 })

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.to(this.$refs.eyebrow, { opacity: 1, y: 0, duration: 0.5 }, 0.1)
      tl.to(lines, { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: 'power4.out' }, 0.15)
      tl.to(this.$refs.intro, { opacity: 1, y: 0, duration: 0.6 }, 0.5)
      tl.to(this.$refs.info, { opacity: 1, y: 0, duration: 0.6 }, 0.6)
      tl.to(this.$refs.formCol, { opacity: 1, y: 0, duration: 0.7 }, 0.4)
    },

    async send () {
      if (this.sending) return
      this.sending = true
      this.error = null

      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            access_key: this.web3formsKey,
            subject: `Contact — ${this.form.prenom} ${this.form.nom}`,
            from_name: `${this.form.prenom} ${this.form.nom}`,
            // l'email du visiteur en reply-to → tu réponds direct depuis ta boîte
            email: this.form.email,
            replyto: this.form.email,
            // contenu du message
            'First name': this.form.prenom,
            'Last name': this.form.nom,
            Email: this.form.email,
            Message: this.form.message,
            // anti-spam honeypot natif Web3Forms
            botcheck: ''
          })
        })

        const data = await res.json()
        if (data.success) {
          trackContactSubmit()
          this.sent = true
        } else {
          this.error = data.message || 'Something went wrong. Please email us directly.'
        }
      } catch (err) {
        this.error = 'Network error. Please email us at contact@mechant.tv.'
      } finally {
        this.sending = false
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.Contact
  min-height: 100vh
  background: #0a0a0a
  color: $white

  &_grid
    display: grid
    grid-template-columns: 1fr 1fr
    gap: 6vw
    align-items: start
    padding: 16vh 4vw 12vh
    max-width: 1500px
    margin: 0 auto

    +breakpoint(mobile)
      grid-template-columns: 1fr
      gap: 4rem
      padding: 13vh 6vw 8vh

  // ── Colonne gauche ──────────────────────────────────────────────────
  &_left
    position: sticky
    top: 16vh

    +breakpoint(mobile)
      position: static
      top: auto

  &_eyebrow
    font-family: $apfel
    font-size: 0.8rem
    letter-spacing: 0.2em
    text-transform: uppercase
    color: rgba(255, 255, 255, 0.5)
    margin: 0 0 2.5rem

  &_headline
    font-family: $apfel
    font-weight: 900
    font-size: clamp(2.8rem, 5.5vw, 6rem)
    line-height: 0.95
    letter-spacing: -0.02em
    text-transform: uppercase
    margin: 0 0 2.5rem

    .line
      display: block
      overflow: hidden

      &.italic
        font-weight: 400
        font-style: italic
        color: #ff4500

  &_intro
    font-family: $apfel
    font-weight: 400
    font-size: clamp(1rem, 1.3vw, 1.25rem)
    line-height: 1.5
    color: rgba(255, 255, 255, 0.6)
    max-width: 38ch
    margin: 0 0 4rem

  &_info
    display: flex
    flex-direction: column
    gap: 2rem

    &_block
      display: flex
      flex-direction: column
      gap: 0.5rem

      .label
        font-family: $apfel
        font-size: 0.7rem
        letter-spacing: 0.18em
        text-transform: uppercase
        color: rgba(255, 255, 255, 0.35)

      .value
        font-family: $apfel
        font-weight: 700
        font-size: 1.05rem
        line-height: 1.4
        color: $white
        text-decoration: none
        transition: color 0.25s ease
        width: fit-content

        &:hover
          color: #ff4500

  // ── Colonne droite : formulaire ─────────────────────────────────────
  &_right
    +breakpoint(mobile)
      width: 100%

  &_form
    display: flex
    flex-direction: column
    gap: 2.2rem

  // Champ avec label flottant
  &_field
    position: relative

    input, textarea
      width: 100%
      background: none
      border: none
      border-bottom: 1px solid rgba(255, 255, 255, 0.2)
      outline: none
      font-family: $apfel
      font-weight: 400
      font-size: 1.1rem
      color: $white
      caret-color: #ff4500
      padding: 1.5rem 0 0.8rem
      transition: border-color 0.3s ease
      resize: none

      &:focus
        border-color: #ff4500

    label
      position: absolute
      left: 0
      top: 1.5rem
      font-family: $apfel
      font-size: 1.1rem
      color: rgba(255, 255, 255, 0.4)
      pointer-events: none
      transition: top 0.25s ease, font-size 0.25s ease, color 0.25s ease

    // Label remonte quand le champ est focus ou rempli
    input:focus + label,
    input:not(:placeholder-shown) + label,
    textarea:focus + label,
    textarea:not(:placeholder-shown) + label
      top: 0
      font-size: 0.7rem
      letter-spacing: 0.15em
      text-transform: uppercase
      color: rgba(255, 255, 255, 0.5)

  &_consent
    display: flex
    align-items: flex-start
    gap: 0.8rem
    cursor: pointer

    input
      appearance: none
      -webkit-appearance: none
      width: 1.1rem
      height: 1.1rem
      min-width: 1.1rem
      margin-top: 0.15rem
      border: 1px solid rgba(255, 255, 255, 0.3)
      border-radius: 3px
      cursor: pointer
      transition: background 0.2s ease, border-color 0.2s ease
      position: relative

      &:checked
        background: #ff4500
        border-color: #ff4500

        &::after
          content: '✓'
          position: absolute
          inset: 0
          display: flex
          align-items: center
          justify-content: center
          font-size: 0.75rem
          color: $white

    span
      font-family: $apfel
      font-size: 0.85rem
      line-height: 1.5
      color: rgba(255, 255, 255, 0.5)

  &_submit
    align-self: flex-start
    display: inline-flex
    align-items: center
    gap: 0.7rem
    background: $white
    color: #0a0a0a
    border: none
    border-radius: 100px
    padding: 1rem 2rem
    font-family: $apfel
    font-weight: 700
    font-size: 0.95rem
    letter-spacing: 0.02em
    cursor: pointer
    transition: transform 0.25s ease, background 0.25s ease, color 0.25s ease
    margin-top: 0.5rem

    svg
      transition: transform 0.25s ease

    &:hover:not(:disabled)
      background: #ff4500
      color: $white
      transform: translateY(-2px)

      svg
        transform: translateX(4px)

    &:disabled
      opacity: 0.5
      cursor: default

  &_error
    font-family: $apfel
    font-size: 0.85rem
    color: #ff6b4a
    margin: 0.5rem 0 0

  // ── Confirmation ────────────────────────────────────────────────────
  &_confirm
    display: flex
    flex-direction: column
    align-items: flex-start
    gap: 1rem
    padding: 2rem 0

    &_check
      width: 4rem
      height: 4rem
      border-radius: 50%
      background: #ff4500
      display: flex
      align-items: center
      justify-content: center
      color: $white
      margin-bottom: 1rem

    &_title
      font-family: $apfel
      font-weight: 900
      font-size: clamp(2rem, 4vw, 3.5rem)
      text-transform: uppercase
      line-height: 1
      margin: 0

    &_sub
      font-family: $apfel
      font-size: 1rem
      color: rgba(255, 255, 255, 0.5)
      margin: 0

.fade-enter-active, .fade-leave-active
  transition: opacity 0.4s ease

.fade-enter, .fade-leave-to
  opacity: 0
</style>
