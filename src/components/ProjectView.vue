<template>
  <base-col :title="project.name" edit-label="Edit" @edit="$emit('edit', project)">
    <div class="text-h6 mb-8">Project Schedule</div>
    <v-row v-if="actual_start_ms" no-gutters>
      <v-col :cols="getCols(plan_start_ms, actual_start_ms)">
        <base-slider :min="plan_start_ms" :max="actual_start_ms" :value="Date.now()" min-color="blue" hide-max
          hide-label show-ticks />
      </v-col>
      <v-col>
        <base-slider :min="actual_start_ms" :max="maxMs" :value="Date.now()" :min-color="minColor" :max-color="maxColor"
          show-ticks />
      </v-col>
    </v-row>

    <base-slider v-else :min="plan_start_ms" :max="plan_end_ms" :value="Date.now()" :min-color="minColor" :max-color="maxColor"
      show-ticks />

    <div class="text-h6 my-8">Project Budget</div>
    <base-slider type="budget" :min="0" :max="Number(budget)" :value="Number(spent_budget)" show-ticks />
  </base-col>
</template>

<script>
import { defineComponent } from "vue";
import { DateDiff } from '@/helpers/helpers.js'
import BaseCol from "@/components/BaseCol.vue";
import BaseSlider from "@/components/BaseSlider.vue";

export default defineComponent({
  name: "ProjectView",

  components: { BaseCol, BaseSlider },

  props: {
    project: Object
  },

  computed: {
    minColor() {
      return this.actual_start_ms ? 'green' : 'blue'
    },
    maxMs() {
      return this.actual_end_ms ? this.actual_end_ms : this.plan_end_ms
    },
    maxColor() {
      return this.actual_end_ms ? 'green' : 'blue'
    },

    plan_start_ms() {
      return this.project.start
    },
    actual_start_ms() {
      return this.project.actual_start
    },
    plan_end_ms() {
      return this.project.end
    },
    actual_end_ms() {
      return this.project.actual_end
    },

    budget() {
      return this.project.budget
    },
    remaining_budget() {
      return this.project.remaining_budget
    },
    spent_budget() {
      return this.budget - this.remaining_budget
    },
  },

  methods: {
    getCols(start, end) {
      const months = DateDiff.inMonths(new Date(start), new Date(end))
      if (months < 9)
        return 3
      else
        return 4
    },
  }
})
</script>