export const state = () => ({
  data: null,
  filter: 'all'
})

export const mutations = {
  setData (state, payload) {
    state.data = payload
  },
  setFilter (state, payload) {
    state.filter = payload
  },
}

export const getters = {
  getData: (state) => {
    return state.data
  },
  getFilter: (state) => {
    return state.filter
  }
}

export const actions = {
  async setData({ commit }, payload) {
    commit('setData', payload)
  },
  async setFilter({ commit }, payload) {
    commit('setFilter', payload)
  }
}
