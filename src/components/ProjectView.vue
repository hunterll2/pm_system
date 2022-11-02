<template>
  <div class="text-center text-h1 my-9">{{currency.USD(budget - actual_budget)}}</div>
  <base-slider type="budget" :min="0" :max="Number(budget)" :value="Number(actual_budget)" show-ticks min-color="gray" max-color="primary" />

  <div class="mb-10"></div>

  <v-row v-if="actual_start_ms" no-gutters>
    <v-col :cols="getCols(plan_start_ms, actual_start_ms)">
      <base-slider :min="plan_start_ms" :max="actual_start_ms" :value="Date.now()" min-color="blue" hide-max hide-label
        show-ticks />
    </v-col>
    <v-col>
      <base-slider :min="actual_start_ms" :max="maxMs" :value="Date.now()" :min-color="minColor" :max-color="maxColor"
        show-ticks />
    </v-col>
  </v-row>

  <base-slider v-else :min="plan_start_ms" :max="plan_end_ms" :value="Date.now()" :min-color="minColor"
    :max-color="maxColor" show-ticks />
</template>

<script>
import { defineComponent } from "vue";
import { DateDiff, currency } from '@/helpers/helpers.js'
import BaseSlider from "@/components/BaseSlider.vue";

export default defineComponent({
  name: "ProjectView",

  components: { BaseSlider },

  props: {
    project: Object
  },

  data: () => ({
    value: [250, 160]
  }),

  computed: {
    minColor() {
      return this.actual_start_ms ? 'green' : 'blue'
    },
    maxMs() {
      return this.actual_end_ms ? this.actual_end_ms : this.plan_end_ms
    },
    maxColor() {
      return this.actual_end_ms ? 'primary' : 'blue'
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
    actual_budget() {
      return this.project.actual_budget
    },
    remaining_budget() {
      return this.project.remaining_budget
    },
    spent_budget() {
      return this.budget - this.remaining_budget
    },

    currency() {
      return currency
    }
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