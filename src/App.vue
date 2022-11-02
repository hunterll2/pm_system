<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" temporary app class="pa-2">
      <v-btn prepend-icon="mdi-plus" block color="primary" @click="openForm('project')">
        New Project
      </v-btn>
      <v-divider class="mt-2" />
      <v-list-item v-for="p in projects" :key="p.id" :title="p.name" link @click="project = p" :active="project === p"
        rounded class="my-1" />
    </v-navigation-drawer>

    <v-app-bar color="primary" app>
      <template #prepend>
        <v-app-bar-nav-icon @click="drawer = !drawer" />
      </template>
      <v-toolbar-title>
        {{ project ? project.name : 'PM System' }}
      </v-toolbar-title>
      <template #append>
        <v-progress-circular v-if="loading" indeterminate color="secondary" class="mx-2" />
        <v-btn v-if="project && !loading" prepend-icon="mdi-pen" @click="openForm('project', project)">
          Edit Project
        </v-btn>
      </template>
    </v-app-bar>

    <v-main>
      <v-container>
        <!-- <div class="d-flex justify-center align-center"></div> -->
        <base-view v-if="project" :project="project" :tasks="project_tasks" :resources="task_resources"
          @open-form="openForm" @task-selected="task = $event" @task-checked="taskChecked" />
      </v-container>
    </v-main>

    <v-dialog v-model="dialog" width="400">
      <base-form :key="key" :type="form" :selected_project="project" :selected_task="task" :item="edit_item"
        @cancel="dialog = false" @add="addItem($event.type, $event)" @update="updateItem($event.type, $event)"
        @delete="deleteItem($event.type, $event)" />
    </v-dialog>
  </v-app>
</template>

<script>
import BaseView from "./components/BaseView.vue";
import BaseForm from '@/components/BaseForm.vue'
import { firestore } from "./plugins/firebase";

export default {
  name: "App",

  components: { BaseView, BaseForm },

  data: () => ({
    drawer: true,
    loading: true,

    // all items
    projects: [],
    tasks: [],
    resources: [],

    // selected
    project: undefined,
    task: undefined,
    resource: undefined,

    // dialog
    key: 0,
    form: undefined,
    edit_item: undefined,
    dialog: false,
  }),

  async created() {
    const projects = await firestore.collection(`projects`).get()

    for (const doc of projects.docs)
      this.projects.push(doc.data())

    this.loading = false
  },

  computed: {
    // when project is selected/changed => set tasks
    project_tasks() {
      return this.project ? this.tasks.filter(t => t.parent === this.project.id) : []
    },
    // when task is selected/changed => set resources
    task_resources() {
      return this.task ? this.resources.filter(r => r.parent === this.task.id) : []
    }
  },

  watch: {
    dialog() {
      this.key++
    },
    async project() {
      this.loading = true

      this.tasks = []
      this.resources = []

      const tasks = await firestore.collection(`tasks`).get()
      const resources = await firestore.collection(`resources`).get()
      
      for (const doc of tasks.docs)
        this.tasks.push(doc.data())
      for (const doc of resources.docs)
        this.resources.push(doc.data())

      this.loading = false
    },

    // save changes of projects, tasks, and resources
    projects: {
      handler(projects) {
        for (const project of projects)
          firestore.doc(`projects/${project.id}`).set(project)
      },
      deep: true
    },
    tasks: {
      handler(tasks) {
        const id = this.project ? this.project.id : undefined
        if (!id) return

        let total_plan_budget = 0, total_actual_budget = 0
        for (const task of tasks.filter(t => t.parent === id)) {
          total_plan_budget += Number(task.budget)
          total_actual_budget += task.actual_budget ? Number(task.actual_budget) : 0
        }

        this.project.remaining_budget = this.project.budget - total_plan_budget
        this.project.actual_budget = total_actual_budget

        for (const task of tasks)
          firestore.doc(`tasks/${task.id}`).set(task)
      },
      deep: true
    },
    resources: {
      handler(resources) {
        const id = this.task ? this.task.id : undefined
        if (!id) return

        let actual_budget = 0
        for (const resource of resources.filter(r => r.parent === id))
          actual_budget += Number(resource.cost)

        this.task.remaining_budget = this.task.budget - Number(actual_budget)
        this.task.actual_budget = Number(actual_budget)

        for (const resource of resources)
          firestore.doc(`resources/${resource.id}`).set(resource)
      },
      deep: true
    },
  },

  methods: {
    openForm(type, item) {
      this.key++
      this.form = type
      this.edit_item = item
      this.dialog = true
    },

    // add/edit/delete opeations
    addItem(type, item) {
      this[`${type}s`].push(item)
    },
    updateItem(type, item) {
      const items = this[`${type}s`]
      const index = items.findIndex(i => i.id === item.id)
      items.splice(index, 1, item)
    },
    deleteItem(type, item) {
      const items = this[`${type}s`]
      const index = items.findIndex(i => i.id === item.id)
      items.splice(index, 1)

      if (type === 'project') {
        for (const child of this.projects.filter(p => p.parent === item.id))
          this.deleteItem('task', child)
      }
      else if (type === 'task') {
        for (const child of this.resources.filter(r => r.parent === item.id))
          this.deleteItem('resource', child)
      }
    },

    // task check/uncheck opeartions
    taskChecked(task, value) {
      value ? this.taskDone(task) : this.taskUnDone(task)
    },
    taskDone(item) {
      // update task
      const i = this.tasks.findIndex(t => t.id === item.id)
      item.actual_end = new Date().valueOf() // set task end Date
      this.tasks.splice(i, 1, item)

      // update project
      const count = this.project_tasks.filter(t => t.actual_end !== null).length
      if (count === this.project_tasks.length)
        this.project.actual_end = new Date().valueOf() // set project end date
    },
    taskUnDone(item) {
      // update task
      const i = this.tasks.findIndex(t => t.id === item.id)
      item.actual_end = null
      this.tasks.splice(i, 1, item)

      // update project
      this.project.actual_end = null
    },
  }
};
</script>
