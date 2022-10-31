<template>
  <v-app>
    <v-navigation-drawer app class="pa-2">
      <v-btn prepend-icon="mdi-plus-circle" color="primary" variant="tonal" block @click="dialog = true">New Project
      </v-btn>
      <v-divider class="mt-2" />
      <v-list-item v-for="p in projects" :key="p.id" :title="p.name" link @click="project = p" :active="project === p"
        rounded class="my-1" />
    </v-navigation-drawer>

    <v-app-bar color="primary" app>
      <v-toolbar-title>PM System</v-toolbar-title>
      <v-spacer />
      <v-btn @click="clear_local_storage">Clear Local Storage</v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <base-view :selected_project="project" @update-project="updateProject" @delete-project="deleteProject" />
      </v-container>
    </v-main>

    <v-dialog v-model="dialog" width="400">
      <base-form :key="key" type="project" @add="projects.push($event)" @cancel="dialog = false" />
    </v-dialog>
  </v-app>
</template>

<script>
import BaseView from "./components/BaseView.vue";
import BaseForm from '@/components/BaseForm.vue'

export default {
  name: "App",

  components: { BaseView, BaseForm },

  data: () => ({
    projects: [],
    project: undefined,
    dialog: false,
    key: 0,
  }),

  created() {
    if (localStorage.getItem('projects') != null)
      this.projects = JSON.parse(localStorage.getItem('projects'))
  },

  watch: {
    projects: {
      handler(val) {
        localStorage.setItem('projects', JSON.stringify(val))
      },
      deep: true
    },
    dialog() {
      this.key++
    }
  },

  methods: {
    updateProject($project) {
      const i = this.projects.findIndex(p => p.id === $project.id)
      this.projects.splice(i, 1, $project)
      this.project = $project
    },
    deleteProject($project) {
      const i = this.projects.findIndex(p => p.id === $project.id)
      this.projects.splice(i, 1)
    },
    clear_local_storage() {
      localStorage.clear()
    },
  }
};
</script>
