export const state = () => ({
  graphics_improved: false
})

export const mutations = {
  SET_GRAPHICS_IMPROVED (state, value) {
    state.graphics_improved = value
  }
}

export const getters = {
  graphics_improved (state) {
    return state.graphics_improved
  }
}

export const actions = {
  setGraphicsImproved ({ commit }, current) {
    commit('SET_GRAPHICS_IMPROVED', current)
  }
}
