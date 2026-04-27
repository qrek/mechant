export const state = () => ({
  id: null,
  data: {},
  active: false
})

export const mutations = {
  SET_ID (state, value) {
    state.id = value
  },
  SET_DATA (state, value) {
    state.data = value
  },
  SET_ACTIVE (state, value) {
    state.active = value
  }
}

export const getters = {
  id (state) {
    return state.id
  },
  data (state) {
    return state.data
  },
  isActive (state) {
    return state.active
  }
}

export const actions = {
  setId ({ commit }, payload) {
    commit('SET_ID', payload)
  },
  setData ({ commit }, payload) {
    commit('SET_DATA', payload)
  },
  setActive ({ commit }, payload) {
    commit('SET_ACTIVE', payload)
  },
  reset ({ commit }) {
    commit('SET_ID', null)
    commit('SET_DATA', {})
  }
}
