<template>
  <v-row>
    <base-col variant="flat" >
      <project-view :project="project" />
    </base-col>
  </v-row>
  <v-row>
    <base-col title="Tasks" add-label="New Task" @add-new="$emit('open-form', 'task')">
      <v-list-item>Started</v-list-item>
      <draggable :list="started_tasks" item-key="id" group="name" :move="itemMoved" class="started-list"
        @change="reorder">
        <template #item="{ element }">
          <base-item :key="element.id" :item="element" :expand="selected && selected.id === element.id"
            @expand="$emit('task-selected', $event); selected = $event" @edit="$emit('open-form', 'task', $event)"
            @item-check="$emit('task-checked', element, $event)" />
        </template>
      </draggable>

      <v-list-item>Wait</v-list-item>
      <draggable :list="waited_tasks" item-key="id" group="name" :move="itemMoved" class="waited-list"
        @change="reorder">
        <template #item="{ element }">
          <base-item :key="element.id" :item="element" :expand="selected && selected.id === element.id"
            @expand="$emit('task-selected', $event); selected = $event" @edit="$emit('open-form', 'task', $event)"
            @item-check="$emit('task-checked', element, $event)" />
        </template>
      </draggable>
    </base-col>

    <base-col :disabled="!selected" title="Resources" add-label="New Resource"
      @add-new="$emit('open-form', 'resource')">
      <template v-if="!selected">Select Task</template>
      <template v-else>
        <base-item v-for="r in resources" :key="r.id" :item="r" @edit="$emit('open-form', 'resource', $event)" />
      </template>
    </base-col>
  </v-row>
</template>

<script>
import { defineComponent } from "vue";
import ProjectView from '@/components/ProjectView.vue'
import BaseCol from "@/components/BaseCol.vue";
import BaseItem from "@/components/BaseItem.vue";
import draggable from "vuedraggable";
import _ from 'lodash/lang'

export default defineComponent({
  name: "BaseView",

  components: { ProjectView, BaseCol, BaseItem, draggable },

  props: {
    project: Object,
    tasks: Array,
    resources: Array,
  },

  emits: ['open-form', 'task-selected', 'task-checked'],

  data: () => ({
    started_tasks: [],
    waited_tasks: [],
    selected: undefined
  }),

  watch: {
    tasks: {
      handler() {
        this.started_tasks = this.tasks.filter(t => t.actual_start)
        this.waited_tasks = this.tasks.filter(t => !t.actual_start)
      },
      deep: true
    },
  },

  created() {
    this.started_tasks = this.tasks.filter(t => t.actual_start)
    this.waited_tasks = this.tasks.filter(t => !t.actual_start)
  },

  methods: {
    itemMoved(e, c) {
      const isFinished = !!e.draggedContext.element.actual_end
      const isInternal = e.from.classList.contains('started-list') && e.to.classList.contains('started-list')
      if (isFinished && !isInternal) return false
    },
    reorder($) {
      if (!$.added) return

      const prop = $.moved ? 'moved' : $.added ? 'added' : 'removed'
      const { element } = $[prop]

      // update task
      const isMovedToStarted = this.started_tasks.findIndex(t => t.id === element.id) !== -1
      element.actual_start = isMovedToStarted ? new Date().valueOf() : null

      // update project
      const startedLength = this.started_tasks.length
      if (startedLength === 1)
        this.project.actual_start = new Date().valueOf()
      else if (startedLength === 0)
        this.project.actual_start = null
    }
  }
});
</script>
