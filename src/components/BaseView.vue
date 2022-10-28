<template>
  <v-row>
    <v-col cols="12">
      <v-card>
        <v-card-title>{{ project.name }}</v-card-title>
        <v-card-text class="d-flex">
          <div>
            <v-list-item prepend-icon="mdi-clock-start" :title="project.start" />
            <v-list-item prepend-icon="mdi-clock-end" :title="project.end" />
            <v-list-item prepend-icon="mdi-cash-multiple" :title="project.budget" />
          </div>
          <div>
            <v-list-item prepend-icon="mdi-clock-start" :title="null" />
            <v-list-item prepend-icon="mdi-clock-end" :title="null" />
            <v-list-item prepend-icon="mdi-cash-multiple" :title="null" />
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Tasks -->
    <v-col>
      <v-card>
        <v-card-title class="d-flex align-center">
          Tasks
          <v-spacer />
          <v-btn prepend-icon="mdi-plus-circle" color="primary" density="comfortable"
            @click="$emit('open-form', 'task')">New Task</v-btn>
        </v-card-title>
        <v-card-text>
          <base-list @change="task = $event" :items="project_tasks" checkbox edit>
            <template #subtitle="item">
              <v-icon icon="mdi-clock-start" start />{{ item.start }}
              <v-icon icon="mdi-clock-end" start />{{ item.end }}
              <v-icon icon="mdi-cash-multiple" start />{{ item.budget }}
            </template>
          </base-list>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Resources -->
    <v-col v-if="task">
      <v-card>
        <v-card-title class="d-flex align-center">
          Resources
          <v-spacer />
          <v-btn prepend-icon="mdi-plus-circle" color="primary" density="comfortable"
            @click="$emit('open-form', 'resource')">New Resource</v-btn>
        </v-card-title>
        <v-card-text>
          <base-list @change="resource = $event" :items="task_resources" checkbox edit>
            <template #subtitle="item">
              <v-icon icon="mdi-cash-multiple" start />{{ item.cost }}
            </template>
          </base-list>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import BaseList from '@/components/BaseList.vue'

export default {
  props: {
    tasks: Array,
    resources: Array,
    project: Object,
  },
  components: {
    BaseList
  },
  data: () => ({
    task: undefined,
    resource: undefined
  }),
  computed: {
    project_tasks() {
      return this.tasks.filter(task => task.parent === this.project.id)
    },
    task_resources() {
      return this.resources.filter(resource => resource.parent === this.task.id)
    },
  },
}
</script>