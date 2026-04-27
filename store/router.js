export const TRANSITION_LEAVE_START = 'transitionLeaveStart'
export const TRANSITION_LEAVE_END = 'transitionLeaveEnd'
export const TRANSITION_ENTER_START = 'transitionEnterStart'
export const TRANSITION_ENTER_END = 'transitionEnterEnd'

export const state = () => ({
  previous: null,
  current: null,
  pageView: 0,
  status: ''
})

export const mutations = {
  SET_PREVIOUS (state, value) {
    state.previous = value
  },
  SET_CURRENT (state, value) {
    state.current = value
  },
  SET_PAGEVIEW (state) {
    state.pageView++
  },
  SET_STATUS (state, value) {
    state.status = value
  }
}

export const getters = {
  previous (state) {
    return state.previous
  },
  current (state) {
    return state.current
  },
  state (state) {
    return state
  },
  pageView (state) {
    return state.pageView
  },
  transitionStatus (state) {
    return state.status
  }
}

export const actions = {
  setPrevious ({ commit }, previous) {
    commit('SET_PREVIOUS', previous)
  },
  setCurrent ({ commit }, current) {
    commit('SET_CURRENT', current)
  },
  setPageView ({ commit }) {
    commit('SET_PAGEVIEW')
  },
  setTransitionStatus ({ commit }, payload) {
    commit('SET_STATUS', payload)
  }
}
