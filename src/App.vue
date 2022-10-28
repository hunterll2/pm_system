<template>
  <v-app>
    <v-app-bar color="primary">
      <v-toolbar-title>PM System</v-toolbar-title>
      <v-spacer />
      <v-btn @click="clear_local_storage">Clear Local Storage</v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { firestore } from "./plugins/firebase";

export default {
  name: "App",

  data: () => ({
  }),

  methods: {
    clear_local_storage() {
      localStorage.clear()
    },
  }
};
</script>
