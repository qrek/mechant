import { mapGetters, mapActions } from 'vuex'

import { TRANSITION_LEAVE_END } from '@/store/router'
import TransitionManager from "~/utils/TransitionManager";

export default {
  data () {
    return {
      scene: null,
      isInit: false
    }
  },

  computed: {
    ...mapGetters({
      isCompleted: 'preloader/isCompleted',
      transitionStatus: 'router/transitionStatus',
      isMobile: 'layout/isMobile'
    })
  },

  watch: {
    isCompleted (newVal, oldVal) {
      if (newVal && !oldVal)
        this.__init()
    }
  },

  mounted() {
    window.addEventListener('resize', this.__resize.bind(this))

    if (this.isCompleted)
      this.__init()
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.__resize.bind(this))
  },

  methods: {
    ...mapActions({
      setDevice: 'layout/setDevice'
    }),
    __init () {
      if (this.$root.webglApp && this.__checkCond()) {
        this.scene = this.$root.webglApp?.scene

        const transitionManager = new TransitionManager()
        transitionManager.addEventListener(TRANSITION_LEAVE_END, () => {
          this.__destroy()
        })

        this.onInit()

        this.isInit = true
      }
      this.onSoftInit()
    },
    __destroy () {
      if (this.$root.webglApp && this.isInit) {
        this.isInit = false
        this.onDestroy()
      }
      this.onSoftDestroy()
    },
    __resize () {
      this.setDevice()

      if (this.isInit) {
        if (this.desktopOnly && this.isMobile)
          this.__destroy()
      } else {
        if (this.desktopOnly && !this.isMobile)
          this.__init()
      }

      if (this.onResize) {
        this.onResize()
      }
    },
    __checkCond () {
      return this.isMobile ? (!this.desktopOnly) : true
    },
    onInit () {},
    onSoftInit () {},
    onDestroy () {},
    onSoftDestroy () {},
    onResize () {}
  }
}
