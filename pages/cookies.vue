<template>
  <section class="cookiesPage">
    <GenericPage :text="cookiesPageData?.content[0]?.text" :image="sticker" />
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import customPageTransitions from '@/mixins/customPageTransitions'
import GenericPage from '@/components/GenericPage'
import sticker from '@/assets/images/sticker_froid_big.png'

export default {
  name: 'TermsPage',
  components: {
    GenericPage
  },
  mixins: [customPageTransitions],
  head() {
    return {
      title: this.cookiesPageData.meta_title,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.cookiesPageData.meta_description
        }
      ]
    }
  },
  data () {
    return {
      sticker
    }
  },
  computed: {
    ...mapGetters({
      data: 'data/getData',
    }),
    cookiesPageData() {
      return this.data.cookiesPage
    }
  },
}
</script>

<style lang="sass" scoped>
</style>
