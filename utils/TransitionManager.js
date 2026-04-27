import Singleton from '@/webgl/utils/Singleton'
import {
  TRANSITION_LEAVE_START,
  TRANSITION_LEAVE_END,
  TRANSITION_ENTER_START,
  TRANSITION_ENTER_END
} from '@/store/router'

class TransitionManager extends Singleton {
  onInit() {
    this[TRANSITION_LEAVE_START] = null
    this[TRANSITION_LEAVE_END] = null
    this[TRANSITION_ENTER_START] = null
    this[TRANSITION_ENTER_END] = null

    this[`${TRANSITION_LEAVE_START}_cbk`] = []
    this[`${TRANSITION_LEAVE_END}_cbk`] = []
    this[`${TRANSITION_ENTER_START}_cbk`] = []
    this[`${TRANSITION_ENTER_END}_cbk`] = []
  }

  check(id) {
    const arr = [
      TRANSITION_LEAVE_START,
      TRANSITION_LEAVE_END,
      TRANSITION_ENTER_START,
      TRANSITION_ENTER_END
    ]

    return arr.findIndex(i => i === id) > -1
  }

  set(id, cbk = () => {}) {
    if (this.check(id))
      this[id] = cbk
  }

  get(id) {
    if (this.check(id))
      return this[id]

    return null
  }

  has(id) {
    return !!this.get(id)
  }

  addEventListener(id, cbk) {
    if (this.check(id)) {
      this[`${id}_cbk`].push(cbk)
    }
  }

  exec(id) {
    if (this.check(id) && this[id]) {
      if (this[`${id}_cbk`].length)
        for (let i = 0; i < this[`${id}_cbk`].length; i++) {
          this[`${id}_cbk`][i]()
        }

      this[`${id}_cbk`] = []

      this[id]()
      this.reset(id)
    }
  }

  reset(id) {
    if (this.check(id))
      this[id] = null
  }
}

export default TransitionManager
