<template>
  <v-row>
    <base-col title="Projects" add-label="New Project" @add-new="openForm('project')">
      <transition-group name="dialog-transition">
        <base-item v-for="p in projects" :key="p.id"
          v-show="projects.filter(p => isExpand(p)).length === 0 || isExpand(p)" :item="p" @expand="selectItem"
          :expand="isExpand(p)" @edit="openForm('project', $event)" class="mb-2" />
      </transition-group>
    </base-col>

    <base-col title="Tasks" add-label="New Task" :disabled="!selected_project" @add-new="openForm('task')">
      <template v-if="selected_project">
        
        <v-list-item>Started</v-list-item>
        <draggable :list="project_tasks_started" item-key="id" group="people" @change="reorder">
          <template #item="{ element }">
            <base-item :key="element.id" :item="element" @expand="selectItem" :expand="isExpand(element)"
              @edit="openForm('task', $event)" @item-check="checkItem" class="mb-2" />
          </template>
        </draggable>

        <v-list-item>Wait</v-list-item>
        <draggable :list="project_tasks_waited" item-key="id" group="people" @change="reorder">
          <template #item="{ element }">
            <base-item :key="element.id" :item="element" @expand="selectItem" :expand="isExpand(element)"
              @edit="openForm('task', $event)" @item-check="checkItem" class="mb-2" />
          </template>
        </draggable>
      </template>
      <template v-else>
        Select Project
      </template>
    </base-col>

    <base-col title="Resources" add-label="New Resource" :disabled="!selected_task" @add-new="openForm('resource')">
      <template v-if="selected_task">
        <base-item v-for="r in task_resources" :key="r.id" :item="r" @expand="selectItem" :expand="isExpand(r)"
          @edit="openForm('resource', $event)" class="mb-2" />
      </template>
      <template v-else>
        Select Task
      </template>
    </base-col>
  </v-row>
  <v-dialog v-model="dialog" width="400">
    <base-form :key="key" :type="form" :selected_project="selected_project" :selected_task="selected_task"
      :item="edit_item" @add="addItem" @update="updateItem" @delete="deleteItem" @cancel="cancel" />
  </v-dialog>
</template>

<script>
import { defineComponent } from "vue";
import BaseItem from "@/components/BaseItem.vue";
import BaseCol from "@/components/BaseCol.vue";
import BaseForm from '@/components/BaseForm.vue'
import _ from 'lodash/lang'
import draggable from "vuedraggable";

export default defineComponent({
  name: "HomeView",

  components: { BaseCol, BaseItem, BaseForm, draggable },

  data: () => ({
    projects: [],
    selected_project: undefined,

    tasks: [],
    project_tasks_started: [],
    project_tasks_waited: [],

    selected_task: undefined,
    resources: [],
    task_resources: [],
    selected_resource: undefined,
    expandId: null,

    dialog: false,
    key: 0,
    form: null,
    edit_item: null,

    drag: false
  }),

  watch: {
    selected_project() {
      this.setTasks()
    },
    selected_task() {
      this.setResources()
    },
    projects: {
      handler(val) {
        localStorage.setItem('projects', JSON.stringify(val))
      },
      deep: true
    },
    tasks: {
      handler(val) {
        const id = this.selected_project ? this.selected_project.id : undefined
        if (id) {
          let remaining_budget = 0, actual_budget = 0
          for (const task of val.filter(r => r.parent === id)) {
            remaining_budget += Number(task.budget)
            actual_budget += Number(task.actual_budget)
          }

          this.selected_project.remaining_budget = this.selected_project.budget - remaining_budget
          this.selected_project.actual_budget = actual_budget
        }

        this.setTasks()
        localStorage.setItem('tasks', JSON.stringify(val))
      },
      deep: true
    },
    resources: {
      handler(val) {
        const id = this.selected_task ? this.selected_task.id : undefined
        if (id) {
          let sum = 0
          for (const resource of val.filter(r => r.parent === id))
            sum += Number(resource.cost)

          this.selected_task.actual_budget = Number(sum)
        }

        this.setResources()
        localStorage.setItem('resources', JSON.stringify(val))
      },
      deep: true
    },
  },

  created() {
    let collections = ['projects', 'tasks', 'resources']
    for (const collection of collections)
      if (localStorage.getItem(collection) != null)
        this[collection] = JSON.parse(localStorage.getItem(collection))

    // for (const collection of ['projects', 'tasks'])
    //   for (const item of this[collection])
    //     item.actual_budget = 0

    // this['tasks'][0].started = true
  },

  computed: {
    project_tasks() {
      if (this.selected_project)
        return this.tasks.filter(task => task.parent === this.selected_project.id)
      else return []
    }
  },

  methods: {
    setTasks() {
      if (this.selected_project) {
        this.project_tasks_started = this.project_tasks.filter(t => t.started)
        this.project_tasks_waited = this.project_tasks.filter(t => !t.started)
        return
      }

      this.project_tasks_started = []
      this.project_tasks_waited = []
    },
    setResources() {
      if (this.selected_task)
        this.task_resources = this.resources.filter(resource => resource.parent === this.selected_task.id)
      else this.task_resources = []
    },
    selectItem($item, value) {
      const item_prop = `selected_${$item.type}`

      if (value) this[item_prop] = undefined
      else this[item_prop] = $item

      if ($item.type === 'project') {
        this.selected_task = undefined
        this.selected_resource = undefined
      } else if ($item.type === 'task')
        this.selected_resource = undefined
    },
    isExpand(item) {
      const item_prop = `selected_${item.type}`
      if (this[item_prop])
        return this[item_prop].id === item.id
      else false
    },
    openForm(type, item) {
      this.key++
      this.form = type
      this.edit_item = item
      this.dialog = true
    },
    cancel() {
      this.edit_item = null
      this.dialog = false
    },
    addItem($item) {
      const item_prop = `${$item.type}s`
      this[item_prop].push($item)
    },
    updateItem($item) {
      const item_prop = `${$item.type}s`
      const items = this[item_prop]
      const index = items.findIndex(item => item.id === $item.id)
      items.splice(index, 1, $item)
    },
    deleteItem($item) {
      const item_prop = `${$item.type}s`
      const items = this[item_prop]
      const index = items.findIndex(item => item.id === $item.id)
      items.splice(index, 1)
    },

    checkItem($item, $value) {
      if ($item.type === 'task')
        if ($value)
          this.taskDone($item)
        else
          this.taskUnDone($item)
    },

    taskDone($item) {
      const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
      const date = new Date().toLocaleDateString('en-US', options)

      // update task
      const index = this.tasks.findIndex(item => item.id === $item.id)
      $item.actual_end = date
      this.tasks.splice(index, 1, $item)


      // update project /ToDo => all "current project" tasks
      const count = this.project_tasks.filter(item => !!item.actual_end).length
      if (count === this.project_tasks.length)
        this.selected_project.actual_end = date
    },
    taskUnDone($item) {
      // update task
      const index = this.tasks.findIndex(item => item.id === $item.id)
      $item.actual_end = undefined
      this.tasks.splice(index, 1, $item)

      // update project
      this.selected_project.actual_end = undefined
    },

    reorder($) {
      const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
      const date = new Date().toLocaleDateString('en-US', options)

      const prop = $.moved ? 'moved' : $.added ? 'added' : 'removed'
      const { element } = $[prop]

      const isMovedToWaitTasks = this.project_tasks_waited.find(t => t.id === element.id) !== undefined
      element.started = isMovedToWaitTasks ? false : true
      element.actual_start = element.started ? date : undefined

      if (this.project_tasks_started.length === 1) {
        this.selected_project.actual_start = date
      } else if (this.project_tasks_started.length === 0) {
        this.selected_project.actual_start = undefined
      }
    }
  }
});
</script>
