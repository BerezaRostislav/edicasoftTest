<template>
  <v-layout>
    <v-flex xs6 sm3>
      <div>
        <h1>User list</h1>
        <p v-if="$fetchState.pending">
          Fetching Users...
        </p>
        <p v-else-if="$fetchState.error">
          Error while fetching posts: {{ $fetchState.error.message }}
        </p>
        <v-text-field
          v-model="query"
          label="Search User"
        />
        <v-list>
          <v-list-item
            v-for="(user, index) in computedUsers"
            :key="index"
            @click="pickActiveUser(user.id)"
          >
            <v-list-item-content>
              <v-list-item-title v-text="user.name" />
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-btn @click="openAddDialog">
          Add User
        </v-btn>
      </div>
    </v-flex>
    <v-flex xs6 offset-sm2 sm4>
      <v-card
        v-if="pickedUser"
        class="mx-auto my-12"
        max-width="400"
      >
        <v-card-title>{{ pickedUser.name }}</v-card-title>
        <v-card-text>
          <v-row
            align="center"
            class="mx-0"
          >
            <div class="grey--text ml-4">
              {{ pickedUser.username }}
            </div>
          </v-row>
          <div class="my-4 subtitle-1">
            {{ pickedUser.email }}
          </div>
          <div>
            {{ pickedUser.address.street }} {{ pickedUser.address.suite }}, {{ pickedUser.address.city }}
          </div>
        </v-card-text>
        <v-divider class="mx-4" />
        <v-card-title>{{ pickedUser.phone }}</v-card-title>
        <v-card-actions>
          <v-btn
            @click="deleteSnackBar = true"
            color="deep-purple lighten-2"
            text
          >
            Delete
          </v-btn>
          <v-btn
            @click="openEditDialog()"
            color="deep-purple lighten-2"
            text
          >
            Edit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
    <v-snackbar
      v-model="deleteSnackBar"
      top
    >
      <span v-if="pickedUser && pickedUser.name">
        Are you sure you want to delete {{ pickedUser.name }}?
      </span>
      <v-btn
        @click="deleteUser(pickedUser.id)"
        color="red"
        text
      >
        Delete
      </v-btn>
      <v-btn
        @click="deleteSnackBar = false"
        color="red"
        text
      >
        Close
      </v-btn>
    </v-snackbar>
    <v-dialog
      v-model="dialog"
      max-width="290"
    >
      <v-card>
        <v-card-title class="headline">
          {{ dialogType === 'add' ? 'Add a new' : 'Edit' }} user
        </v-card-title>
        <form @submit.prevent="[dialogType === 'add' ? addUser() : editUser(pickedUser.id)]">
          <v-card-text>
            <v-text-field
              v-model="inputs.username"
              label="Username"
              required
            />
          </v-card-text>
          <v-card-text>
            <v-text-field
              v-model="inputs.email"
              label="Email"
              type="email"
              required
            />
          </v-card-text>
          <v-card-text>
            <v-text-field
              v-model="inputs.street"
              label="Street"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              @click="dialog = false"
              color="green darken-1"
              text
            >
              Disagree
            </v-btn>
            <v-btn
              type="submit"
              value="Submit"
              color="green darken-1"
              text
            >
              Agree
            </v-btn>
          </v-card-actions>
        </form>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>

export default {
  data () {
    return {
      query: '',
      dialogType: null,
      dialog: false,
      deleteSnackBar: false,
      inputs: {
        username: null,
        email: null,
        street: null
      }
    }
  },
  computed: {
    users () { return this.$store.getters['users/getUsers'] },
    pickedUser () { return this.$store.getters['users/getActiveUser'] },
    computedUsers () {
      const vm = this
      const result = []
      this.users.forEach((user) => {
        if (user.name.toLowerCase().includes(vm.query.toLowerCase())) {
          result.push(user)
        }
      })
      return result
    }
  },
  async fetch () {
    const resp = await this.$axios.$get('https://jsonplaceholder.typicode.com/users')
    this.$store.commit('users/updateUsers', resp)
  },
  methods: {
    pickActiveUser (id) {
      const result = this.users.find(user => user.id === id)
      this.$store.commit('users/setActiveUser', result)
    },
    deleteUser (id) {
      this.deleteSnackBar = false
      const index = this.users.map(user => user.id).indexOf(id)
      this.$store.commit('users/deleteUser', index)
    },
    getFreshId () {
      const result = []
      this.users.forEach((user) => {
        result.push(user.id)
      })
      return (Math.max(...result) + 1)
    },
    openAddDialog () {
      this.dialogType = 'add'
      this.dialog = true
      this.clearData()
    },
    openEditDialog () {
      this.inputs.username = this.pickedUser.name
      this.inputs.email = this.pickedUser.email
      this.inputs.street = this.pickedUser.address.street
      this.dialogType = 'edit'
      this.dialog = true
    },
    editUser (id) {
      const index = this.users.map(user => user.id).indexOf(id)
      this.$store.commit('users/editUser', {
        id: index,
        data: this.inputs.username,
        pathName: 'name'
      })
      this.$store.commit('users/editUser', {
        id: index,
        data: this.inputs.email,
        pathName: 'email'
      })
      this.$store.commit('users/editUserStreet', {
        id: index,
        data: this.inputs.street
      })
      this.dialog = false
      this.clearData()
    },
    addUser () {
      const user = {
        id: this.getFreshId(),
        name: this.inputs.username,
        email: this.inputs.email,
        address: {
          street: this.inputs.street
        }
      }
      this.dialog = false
      this.clearData()
      this.$store.commit('users/addUser', user)
    },
    clearData () {
      this.inputs.username = null
      this.inputs.email = null
      this.inputs.street = null
    }
  }
}
</script>
