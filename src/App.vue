<template>
  <v-app>
    <v-app-bar color="primary">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title>PM System</v-toolbar-title>
      <v-spacer />
      <v-btn @click="clear_local_storage">Clear Local Storage</v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer">
      <v-list-item prepend-icon="mdi-file-plus" title="Create New Project" value="create_project" link
        @click="openForm('project')" />
      <v-divider />
      <v-list @click:select="select">
        <v-list-item v-for="item in projects" :key="item.name" :title="item.name" :value="item.id">
          <template #append>
            <v-btn icon="mdi-cog" size="x-small" @click.stop="openSetting(item)"></v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container>
        <v-row v-if="selected_project">
          <v-col>
            <v-card>
              <v-card-title>{{ selected_project.name }}</v-card-title>
              <v-card-text>
                <v-list-item prepend-icon="mdi-clock-start" :title="selected_project.start" />
                <v-list-item prepend-icon="mdi-clock-end" :title="selected_project.end" />
                <v-list-item prepend-icon="mdi-cash-multiple" :title="selected_project.budget" />
              </v-card-text>
            </v-card>
          </v-col>
          <v-col>
            <v-card>
              <v-card-title class="d-flex">
                Tasks
                <v-spacer />
                <v-btn color="primary" @click="openForm('task')">Create New Task</v-btn>
              </v-card-title>
              <v-card-text>
                <v-list @click:select="select_task">
                  <v-list-item v-for="item in project_tasks" :key="item.name" :title="item.name" :value="item.id">
                    <template #prepend>
                      <v-checkbox-btn />
                    </template>
                    <template #append>
                      <v-btn icon="mdi-cog" size="x-small" @click.stop="openSetting(item)"></v-btn>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col v-if="selected_task">
            <v-card>
              <v-card-title class="d-flex">
                Task's Resources
                <v-spacer />
                <v-btn color="primary" @click="openForm('resource')">Create New Resource</v-btn>
              </v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item v-for="item in project_resources" :key="item.name" :title="item.name" :value="item.id">
                    <template #prepend>
                      <v-checkbox-btn />
                    </template>
                    <template #append>
                      <v-btn icon="mdi-cog" size="x-small" @click.stop="openSetting(item)"></v-btn>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <v-dialog v-model="dialog" width="400">
      <v-card>
        <v-card-title>{{ form.title }}</v-card-title>
        <v-card-text>
          <v-form :key="form.key" ref="form">
            <template v-if="form.type === 'project'">
              <v-text-field v-model="project.name" label="Name" required :rules="rules('name')" />
              <v-text-field v-model="project.start" label="Start Date" type="date" required
                :rules="project_rules('start')" />
              <v-text-field v-model="project.end" label="End Date" type="date" required :rules="project_rules('end')" />
              <v-text-field v-model="project.budget" label="Budget" prefix="$" type="number" required
                :rules="project_rules('budget')" />
            </template>
            <template v-else-if="form.type === 'task'">
              <v-text-field v-model="task.name" label="Name" required :rules="rules('name')" />
              <v-text-field v-model="task.start" label="Start Date" type="date" required :rules="task_rules('start')" />
              <v-text-field v-model="task.end" label="End Date" type="date" required :rules="task_rules('end')" />
              <v-text-field v-model="task.budget" label="Budget" prefix="$" type="number" required
                :rules="task_rules('budget')" />
            </template>
            <template v-else>
              <v-text-field v-model="resource.name" label="Name" required :rules="rules('name')" />
              <v-text-field v-model="resource.cost" label="cost" prefix="$" type="number" required
                :rules="resource_rules('cost')" />
            </template>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="cancel">Cancel</v-btn>
          <v-spacer />
          <v-btn prepend-icon="mdi-plus-circle" color="primary" @click="create">
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import { firestore } from "./plugins/firebase";
import _ from 'lodash/lang'
import uniqid from 'uniqid'

export default {
  name: "App",

  data: () => ({
    drawer: null,
    dialog: false,
    form: {
      key: 0,
      title: null,
      type: null
    },
    projects: [],
    selected_project: null,
    tasks: [],
    selected_task: null,
    resources: [],
    project: {
      name: null,
      start: null,
      end: null,
      budget: null,
    },
    task: {
      name: null,
      start: null,
      end: null,
      budget: null
    },
    resource: {
      name: null,
      cost: null
    }
  }),

  computed: {
    project_tasks() {
      return this.tasks.filter(task => task.parent === this.selected_project.id)
    },
    project_resources() {
      return this.resources.filter(resource => resource.parent === this.selected_task.id)
    },
  },

  watch: {
    projects: {
      handler(val) {
        localStorage.setItem('projects', JSON.stringify(val))
      },
      deep: true
    },
    tasks: {
      handler(val) {
        localStorage.setItem('tasks', JSON.stringify(val))
      },
      deep: true
    },
    resources: {
      handler(val) {
        localStorage.setItem('resources', JSON.stringify(val))
      },
      deep: true
    },
  },

  created() {
    const projects = localStorage.getItem('projects')
    if (projects !== null)
      this.projects = JSON.parse(projects)

    const tasks = localStorage.getItem('tasks')
    if (tasks !== null)
      this.tasks = JSON.parse(tasks)

    const resources = localStorage.getItem('resources')
    if (resources !== null)
      this.resources = JSON.parse(resources)
  },

  methods: {
    rules(prop) {
      if (prop === 'name')
        return [v => !!v || 'error']
    },
    project_rules(prop) {
      if (prop === 'start')
        return [v => new Date(v) > (new Date()) || 'error']
      else if (prop === 'end')
        return [v => new Date(v) > (new Date(this.project.start)) || 'error']
      else if (prop === 'budget')
        return [v => Number(v) > 0 || 'error']
    },
    task_rules(prop) {
      if (prop === 'start')
        return [v => new Date(v) >= (new Date(this.selected_project.start)) || 'error']
      else if (prop === 'end')
        return [v => new Date(v) > (new Date(this.task.start)) || 'error', v => new Date(v) < (new Date(this.selected_project.end)) || 'error2']
      else if (prop === 'budget')
        return [v => Number(v) > 0 || 'error', v => Number(v) <= Number(this.selected_project.budget) || 'error']
    },
    resource_rules(prop) {
      if (prop === 'cost')
        return [v => Number(v) > 0 || 'error', v => Number(v) <= Number(this.selected_task.budget) || 'error']
    },
    openForm(type) {
      this.form.key++
      this.form.type = type
      if (type === 'project')
        this.form.title = 'Create New Project'
      else if (type === 'task')
        this.form.title = 'Create New Task'
      else
        this.form.title = 'Create New Resource'

      this.dialog = true
    },
    async create() {
      const { valid } = await this.$refs.form.validate()

      if (!valid) return

      const type = this.form.type
      const obj = this[type]

      const newObj = {
        ...obj,
        id: uniqid.time()
      }

      if (type === 'task')
        newObj.parent = this.selected_project.id
      else if (type === 'resource')
        newObj.parent = this.selected_task.id

      this[`${type}s`].push(_.clone(newObj))

      this.cancel()
    },
    cancel() {
      this.dialog = false
      this.clear()
    },
    clear() {
      const obj = this[this.form.type]
      for (const prop in obj) {
        obj[prop] = null
      }
    },
    select($) {
      this.selected_task = null
      if ($.value)
        this.selected_project = this.projects.filter(p => p.id === $.id)[0]
      else
        this.selected_project = null
    },
    select_task($) {
      if ($.value)
        this.selected_task = this.tasks.filter(p => p.id === $.id)[0]
      else
        this.selected_task = null
    },
    clear_local_storage() {
      localStorage.clear()
    },
    openSetting(type) {
      console.log(type)
    }
  }
};
</script>
