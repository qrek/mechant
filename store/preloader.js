export const state = () => ({
  isCompleted: false,
  isLoadingStarted: false,
  isLoadingCompleted: false
})

export const mutations = {
  SET_LOADING_STARTED (state) {
    state.isLoadingStarted = true
  },
  SET_LOADING_COMPLETED (state) {
    state.isLoadingCompleted = true
  },
  SET_COMPLETED (state) {
    state.isCompleted = true
  }
}

export const getters = {
  isLoadingStarted (state) {
    return state.isLoadingStarted
  },
  isLoadingCompleted (state) {
    return state.isLoadingCompleted
  },
  isCompleted (state) {
    return state.isCompleted
  }
}

export const actions = {
  setLoadingStarted ({ commit }) {
    commit('SET_LOADING_STARTED')
  },
  setLoadingCompleted ({ commit }) {
    commit('SET_LOADING_COMPLETED')
  },
  setCompleted ({ commit }) {
    commit('SET_COMPLETED')
  }
}
