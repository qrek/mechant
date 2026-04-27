// Vendor
import {mapActions, mapGetters} from 'vuex'

// Store
import {
  TRANSITION_LEAVE_START,
  TRANSITION_LEAVE_END,
  TRANSITION_ENTER_END,
  TRANSITION_ENTER_START
} from "@/store/router";

// Utils
import getPage from '@/utils/getPage'
import TransitionManager from '@/utils/TransitionManager'

export default {
  type: 'page',

  computed: {
    ...mapGetters({
      isCompleted: 'preloader/isCompleted',
      transitionStatus: 'router/transitionStatus'
    })
  },

  watch: {
    isCompleted (isCompleted) {
      if (isCompleted) {
        this.setTransitionStatus(TRANSITION_ENTER_END)
        this.__afterLoaderTransitionIn()
      }
    }
  },

  methods: {
    ...mapActions({
      setTransitionStatus: 'router/setTransitionStatus'
    }),
    __afterLoaderTransitionIn () {
      const routeInfos = {
        previous: this.$store.state.router.previous,
        current: this.$store.state.router.current
      }

      if (this.transitionIn) this.transitionIn(null, routeInfos)
    }
  },

  transition: {
    appear: true,
    mode: 'out-in',
    css: false,

    beforeLeave (el) {
      const page = getPage(el.__vue__)

      page.setTransitionStatus(TRANSITION_LEAVE_START)
    },

    enter (el, done) {
      const routeInfos = {
        previous: this.$store.state.router.previous,
        current: this.$store.state.router.current
      }

      // On first navigation, let preloader state trigger transitions (see line 17)
      if (!routeInfos.previous) {
        done()

        return
      }

      const page = getPage(el.__vue__)

      const transitionManager = new TransitionManager()

      if (page && page.transitionIn) {
        transitionManager.set(TRANSITION_ENTER_END, () => page.transitionIn(done, routeInfos))
      } else {
        transitionManager.set(TRANSITION_ENTER_END, () => done())
      }
    },

    leave (el, done) {
      const routeInfos = {
        previous: this.$store.state.router.previous,
        current: this.$store.state.router.current
      }

      const page = getPage(el.__vue__)

      if (page && page.transitionOut) page.transitionOut(done, routeInfos)
      else {
        const transitionManager = new TransitionManager()
        transitionManager.set(TRANSITION_LEAVE_END, () => done())
      }
    }
  }
}
