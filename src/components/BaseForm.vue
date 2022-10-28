<template>
  <v-card>
    <v-card-text>
      <v-form ref="form">
        <template v-if="type === 'project'">
          <v-text-field v-model="project.name" label="Name" required :rules="rules('name')" />
          <v-text-field v-model="project.start" label="Start Date" type="date" required
            :rules="project_rules('start')" />
          <v-text-field v-model="project.end" label="End Date" type="date" required :rules="project_rules('end')" />
          <v-text-field v-model="project.budget" label="Budget" prefix="$" type="number" required
            :rules="project_rules('budget')" />
        </template>
        <template v-else-if="type === 'task'">
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
      end: null,
      budget: null,
      remaining_budget: 0
    },
    task: {
      name: null,
      start: null,
      end: null,
      budget: null,
      actual_budget: 0
    },
    resource: {
      name: null,
      cost: null
    }
  }),

  created() {
    if (this.item)
      this[this.type] = _.clone(this.item)
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
      else if (prop === 'budget') {
        return [v => Number(v) > 0 || 'error', v => Number(v) <= Number(this.selected_project.budget) || 'error', v => Number(v) <= Number(this.selected_project.remaining_budget) || 'Not Enogh']
      }
    },
    resource_rules(prop) {
      if (prop === 'cost')
        return [v => Number(v) > 0 || 'error', v => Number(v) <= Number(this.selected_task.budget) || 'error']
    },

    async create() {
      const options = { year: 'numeric', month: 'numeric', day: 'numeric' }

      const { valid } = await this.$refs.form.validate()

      if (!valid) return

      const obj = this[this.type]

      const newObj = {
        ...obj,
        id: uniqid.time(),
        type: this.type,
        start: new Date(obj.start).toLocaleDateString('en-US', options),
        end: new Date(obj.end).toLocaleDateString('en-US', options),
      }

      if (this.type === 'task')
        newObj.parent = this.selected_project.id
      else if (this.type === 'resource')
        newObj.parent = this.selected_task.id

      this.$emit('add', _.clone(newObj))
      this.$emit('cancel')
    },
    deleteItem() {
      this.$emit('delete', this[this.type])
      this.$emit('cancel')
    },
    saveItem() {
      this.$emit('update', this[this.type])
      this.$emit('cancel')
    },
  }
}
</script>