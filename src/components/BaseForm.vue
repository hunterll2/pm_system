<template>
  <v-card>
    <v-card-text>
      <v-form v-if="type === 'project'" ref="form" @keypress.enter="doAction()">
        <v-text-field v-model="name" label="Name" :rules="rules.name" />
        <v-text-field v-model="start" label="Start Date" type="date" :min="minDate" :max="maxDate"
          :rules="rules.start" />
        <v-text-field v-model="end" label="End Date" type="date" :min="minDate" :max="maxDate" :rules="rules.end" />
        <v-text-field v-model="budget" label="Budget" :rules="rules.budget">
          <template #append-inner>{{ currency.USD(budget) }}</template>
        </v-text-field>
      </v-form>

      <v-form v-else-if="type === 'task'" ref="form" @keypress.enter="doAction()">
        <v-text-field v-model="name" label="Name" :rules="rules.name" />
        <v-text-field v-model="start" label="Start Date" type="date" :min="minDate" :max="maxDate"
          :rules="rules.task_start" />
        <v-text-field v-model="end" label="End Date" type="date" :min="minDate" :max="maxDate"
          :rules="rules.task_end" />
        <v-text-field v-model="budget" label="Budget" :rules="rules.task_budget">
          <template #append-inner>{{ currency.USD(budget) }}</template>
        </v-text-field>
      </v-form>

      <v-form v-else-if="type === 'resource'" ref="form" @keypress.enter="doAction()">
        <v-text-field v-model="name" label="Name" :rules="rules.name" />
        <v-text-field v-model="cost" label="cost" :rules="rules.resource_cost">
          <template #append-inner>{{ currency.USD(cost) }}</template>
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
    parent: undefined,
    name: null,
    start: null,
    actual_start: null,
    end: null,
    actual_end: null,
    budget: null,
    actual_budget: null,
    remaining_budget: null,
    cost: null,
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
          v => D(v) > D(this.start) || 'The end date can\'t be past the start date.'
        ],
        task_start: [
          v => D(v).toDateString() === D().toDateString() || D(v) > project_start || 'The task can\'t start before the project.'
        ],
        task_end: [
          v => D(v) > D(this.start) || 'The end date can\'t be past the start date.',
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
      for (const key in item) {
        if (!Object.hasOwn(this.$data, key) && key !== 'id') continue
        else if (key === 'start' || key === 'end')
          this[key] = GetDate.string(new Date(item[key]))
        else this[key] = item[key]
      }

      // if it a 'create form' => bind default vlaues
    } else if (this.start === null /* avoid delete case */) {
      const nextYear = new Date().getFullYear() + 1
      this.start = GetDate.string(new Date())
      this.end = GetDate.string(new Date(nextYear, 0, 1))
    }
  },

  methods: {
    doAction() {
      this.item ? undefined : this.create()
    },
    createItem(type, name, start, end, budget, cost) {
      const project = {
        id: uniqid.time(),
        type,
        name,
        start: new Date(start).valueOf(),
        actual_start: null,
        end: new Date(end).valueOf(),
        actual_end: null,
        budget: Number(budget),
        actual_budget: null,
        remaining_budget: Number(budget)
      }

      if (type === 'project')
        return project
      else if (type === 'task')
        return { ...project, parent: this.selected_project.id }
      else if (type === 'resource')
        return { id: uniqid.time(), type, parent: this.selected_task.id, name, cost: Number(cost) }
    },
    async create() {
      const { valid } = await this.$refs.form.validate()
      if (!valid) return

      const { name, start, end, budget, cost } = this
      const newItem = this.createItem(this.type, name, start, end, budget, cost)

      this.$emit('add', newItem)
      this.$emit('cancel')
    },
    saveItem() {
      // basic prop
      const item = {
        type: this.type,
        id: this.item.id
      }

      // item prop
      for (const key in this.$data)
        if (Object.hasOwn(this.item, key))
          item[key] = this[key]

      // correct types
      if (this.type === 'resource')
        item.cost = Number(item.cost)
      else {
        item.start = new Date(item.start).valueOf()
        item.end = new Date(item.end).valueOf()
        item.budget = Number(item.budget)
      }

      this.$emit('update', item)
      this.$emit('cancel')
    },
    deleteItem() {
      this.$emit('delete', this.item)
      this.$emit('cancel')
    },
  }
}
</script>