<template>
  <v-card>
    <v-card-text>
      <v-form v-if="type === 'project'" ref="form" @keypress.enter="doAction()">
        <v-text-field v-model="project.name" label="Name" :rules="rules.name" />
        <v-text-field v-model="project.start" label="Start Date" type="date" :min="minDate" :max="maxDate"
          :rules="rules.start" />
        <v-text-field v-model="project.end" label="End Date" type="date" :min="minDate" :max="maxDate"
          :rules="rules.end" />
        <v-text-field v-model="project.budget" label="Budget" :rules="rules.budget">
          <template #append-inner>{{ currency.USD(project.budget) }}</template>
        </v-text-field>
      </v-form>

      <v-form v-else-if="type === 'task'" ref="form" @keypress.enter="doAction()">
        <v-text-field v-model="task.name" label="Name" :rules="rules.name" />
        <v-text-field v-model="task.start" label="Start Date" type="date" :min="minDate" :max="maxDate"
          :rules="rules.task_start" />
        <v-text-field v-model="task.end" label="End Date" type="date" :min="minDate" :max="maxDate"
          :rules="rules.task_end" />
        <v-text-field v-model="task.budget" label="Budget" :rules="rules.task_budget">
          <template #append-inner>{{ currency.USD(task.budget) }}</template>
        </v-text-field>
      </v-form>

      <v-form v-else-if="type === 'resource'" ref="form" @keypress.enter="doAction()">
        <v-text-field v-model="resource.name" label="Name" :rules="rules.name" />
        <v-text-field v-model="resource.cost" label="cost" :rules="rules.resource_cost">
          <template #append-inner>{{ currency.USD(resource.cost) }}</template>
        </v-text-field>
      </v-form>
    </v-card-text>

    <v-card-actions>
      <v-btn @click="$emit('cancel')">Cancel</v-btn>
      <v-spacer />
      <v-btn v-if="item === undefined" prepend-icon="mdi-plus-circle" color="primary" @click="create">
        Create
      </v-btn>
      <template v-else>
        <v-btn prepend-icon="mdi-delete" color="error" @click="deleteItem">
          Delete
        </v-btn>
        <v-btn prepend-icon="mdi-content-save" color="blue" @click="saveItem">
          Save
        </v-btn>
      </template>
    </v-card-actions>
  </v-card>
</template>

<script>
import _ from 'lodash/lang'
import uniqid from 'uniqid'
import { GetDate, currency } from '@/helpers/helpers.js'

export default {
  name: "BaseForm",

  props: {
    type: {
      type: String,
      required: true
    },
    selected_project: {
      type: Object,
      default: undefined
    },
    selected_task: {
      type: Object,
      default: undefined
    },
    item: {
      type: Object,
      default: undefined
    },
  },

  data: () => ({
    project: {
      name: null,
      start: null,
      actual_start: undefined,
      end: null,
      actual_end: undefined,
      budget: null,
      actual_budget: undefined,
      remaining_budget: undefined
    },
    task: {
      parent: undefined,
      name: null,
      start: null,
      actual_start: undefined,
      end: null,
      actual_end: undefined,
      budget: null,
      actual_budget: undefined,
      remaining_budget: undefined
    },
    resource: {
      parent: undefined,
      name: null,
      cost: null,
    },
  }),

  computed: {
    currency() {
      return currency
    },
    minDate() {
      return GetDate.string(new Date())
    },
    maxDate() {
      return GetDate.string(new Date(new Date().getFullYear() + 10, 0, 1))
    },
    rules() {
      const D = (v) => v === undefined ? new Date(new Date()) : new Date(v)

      // get project and task data
      let project_start, project_end, project_budget, remaining_budget, task_budget, task_remaining_budget
      if (this.selected_project) {
        project_start = D(this.selected_project.start)
        project_end = D(this.selected_project.end)
        project_budget = Number(this.selected_project.budget)
        remaining_budget = this.item ? (project_budget + this.item.budget) : Number(this.selected_project.remaining_budget)
      }
      if (this.selected_task) {
        task_budget = Number(this.selected_task.budget)
        task_remaining_budget = this.item ? (task_budget + this.item.cost) : Number(this.selected_task.remaining_budget)
      }

      return {
        name: [v => !!v || 'Name is required'],
        start: [
          v => !!v || 'Invalid date',
          v => D(v).toDateString() === D().toDateString() || D(v) > D() || 'The start date can\'t be in the past.',
        ],
        end: [
          v => D(v) > D(this.project.start) || 'The end date can\'t be past the start date.'
        ],
        task_start: [
          v => D(v).toDateString() === D().toDateString() || D(v) > project_start || 'The task can\'t start before the project.'
        ],
        task_end: [
          v => D(v) > D(this.task.start) || 'The end date can\'t be past the start date.',
          v => D(v).toDateString() === project_end.toDateString() || D(v) < project_end || 'The task can\'t end after the project.'
        ],
        budget: [v => Number(v) > 0 || 'Invalid budget'],
        task_budget: [
          v => Number(v) > 0 || 'Invalid budget',
          v => Number(v) <= project_budget || 'The task budget can\'t be larger than project budget',
          v => Number(v) <= remaining_budget || 'Not enough budget remain'
        ],
        resource_cost: [
          v => Number(v) > 0 || 'Invalid cost',
          v => Number(v) <= task_budget || 'The resource cost can\'t be larger than task budget',
          v => Number(v) <= task_remaining_budget || 'Not enough budget remain',
        ]
      }
    }
  },

  created() {
    // if it 'edit form' => bind item values into this component
    if (this.item) {
      const item = _.clone(this.item)
      const ref = this[this.type]
      for (const key in item) {
        if (!Object.hasOwn(ref, key) && key !== 'type' && key !== 'id') continue
        else if (key === 'start' || key === 'end')
          ref[key] = GetDate.string(new Date(item[key]))
        else ref[key] = item[key]
      }

      // if it a 'create form' => bind default vlaues
    } else if (this[this.type].start === null) {
      this[this.type].start = GetDate.string(new Date())
      const next = new Date().getFullYear() + 1
      this[this.type].end = GetDate.string(new Date(next, 0, 1))
    }
  },

  methods: {
    doAction() {
      this.item ? undefined : this.create()
    },
    async create() {
      const { valid } = await this.$refs.form.validate()
      if (!valid) return

      let obj = this[this.type]
      obj = {
        ...obj,
        id: uniqid.time(),
        type: this.type,
        start: new Date(obj.start).valueOf(),
        end: new Date(obj.end).valueOf(),
      }

      if (this.type === 'project')
        obj.remaining_budget = obj.budget
      if (this.type === 'task') {
        obj.parent = this.selected_project.id
        obj.remaining_budget = obj.budget
      }
      else if (this.type === 'resource')
        obj.parent = this.selected_task.id

      this.$emit('add', _.clone(obj))
      this.$emit('cancel')
    },
    deleteItem() {
      this.$emit('delete', this[this.type])
      this.$emit('cancel')
    },
    saveItem() {
      const obj = this[this.type]

      obj.start = new Date(obj.start).valueOf()
      obj.end = new Date(obj.end).valueOf()

      console.log(obj);

      this.$emit('update', obj)
      this.$emit('cancel')
    },
  }
}
</script>