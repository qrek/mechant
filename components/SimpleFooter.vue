<template>
  <footer class="SimpleFooter">
    <div class="SimpleFooter_inner">
      <div class="SimpleFooter_col">
        <span class="SimpleFooter_label">Email</span>
        <a class="SimpleFooter_value" :href="`mailto:${email}`">{{ email }}</a>
      </div>

      <div class="SimpleFooter_col">
        <span class="SimpleFooter_label">Studio</span>
        <a
          class="SimpleFooter_value"
          :href="mapsUrl"
          target="_blank"
          rel="noopener"
        >
          27 rue des Cascades<br/>75020 Paris
        </a>
      </div>

      <div class="SimpleFooter_col SimpleFooter_col--right">
        <span class="SimpleFooter_label">© {{ year }}</span>
        <span class="SimpleFooter_value">MÉCHANT</span>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'SimpleFooter',
  data () {
    return {
      email: 'contact@mechant.tv',
      mapsUrl: 'https://www.google.fr/maps/place/27+Rue+des+Cascades,+75020+Paris'
    }
  },
  computed: {
    year () {
      return new Date().getFullYear()
    }
  }
}
</script>

<style lang="sass" scoped>
.SimpleFooter
  position: relative
  z-index: 5
  background: #0a0a0a
  color: $white
  padding: 4rem 4vw 2.5rem

  +breakpoint(mobile)
    padding: 3rem 5vw 2rem

  &_inner
    display: grid
    grid-template-columns: 1fr 1fr 1fr
    gap: 3rem
    align-items: start

    +breakpoint(mobile)
      grid-template-columns: 1fr
      gap: 2.5rem

  &_col
    display: flex
    flex-direction: column
    gap: 0.6rem

    &--right
      align-items: flex-end
      text-align: right

      +breakpoint(mobile)
        align-items: flex-start
        text-align: left

  &_label
    font-family: $apfel
    font-weight: 400
    font-size: 0.7rem
    letter-spacing: 0.18em
    text-transform: uppercase
    color: rgba(255, 255, 255, 0.35)

  &_value
    font-family: $apfel
    font-weight: 700
    font-size: 1rem
    line-height: 1.4
    color: $white
    text-decoration: none
    transition: color 0.25s ease

    &:hover
      color: #ff8600
</style>
