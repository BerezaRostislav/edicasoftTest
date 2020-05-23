export const state = () => ({
  users: [],
  activeUser: null
})

export const mutations = {
  updateUsers (state, list) {
    state.users = list
  },
  setActiveUser (state, list) {
    state.activeUser = list
  },
  deleteUser (state, list) {
    state.users.splice(list, 1)
    state.activeUser = null
  },
  addUser (state, list) {
    state.users.push(list)
  },
  editUser (state, { id, data, pathName }) {
    state.users[id][pathName] = data
  },
  editUserStreet (state, { id, data }) {
    state.users[id].address.street = data
    console.log(state.users[id].address.street)
  }
}

export const getters = {
  getUsers (state) {
    return state.users
  },
  getActiveUser (state) {
    return state.activeUser
  }
}
