<template>
  <v-slider :model-value="value" :min="getMin" :max="getMax" :thumb-label="!hideLabel ? 'always' : undefined" readonly
    :show-ticks="showTicks ? 'always' : undefined" :ticks="get_ticks" >
    <template #prepend>
      <v-chip label large :color="minColor">
        <template v-if="type === 'budget'">{{ currency.USD(min) }}</template>
        <template v-else>{{ GetDate.string(min) }}</template>
      </v-chip>
    </template>
    <template v-if="!hideLabel" #thumb-label>
      <div style="width:80px" class="text-center">
        <template v-if="type === 'budget'">{{ currency.USD(value) }}</template>
        <template v-else>{{ `Today ${GetDate.string(value, 'm-d')}` }}</template>
      </div>
    </template>
    <template v-if="!hideMax" #append>
      <v-chip label large :color="maxColor">
        <template v-if="type === 'budget'">{{ currency.USD(max) }}</template>
        <template v-else>{{ GetDate.string(max) }}</template>
      </v-chip>
    </template>
  </v-slider>
</template>

<script>
import { GetDate, DateDiff, currency } from '@/helpers/helpers.js'

export default {
  props: {
    type: {
      type: String,
      default: 'date',
    },

    min: Number,
    max: Number,
    value: Number,
    minColor: {
      type: String,
      default: 'blue'
    },
    maxColor: {
      type: String,
      default: 'blue'
    },

    showTicks: Boolean,
    hideMax: Boolean,
    hideLabel: Boolean,
  },
  computed: {
    GetDate() {
      return GetDate
    },
    currency() {
      return currency
    },
    getMin() {
      if (this.type === 'budget')
        return this.min

      const [startYear, startMonth] = [new Date(this.min).getFullYear(), new Date(this.min).getMonth()]
      return new Date(startYear, startMonth).valueOf()
    },
    getMax() {
      if (this.max === undefined)
        return undefined

      if (this.type === 'budget')
        return this.max

      let [endYear, endMonth] = [new Date(this.max).getFullYear(), new Date(this.max).getMonth()]
      return new Date(endYear, endMonth).valueOf()
    },
    months_labels() {
      return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
    },
    get_ticks() {
      if (this.type === 'budget')
        return this.get_ticks_percentage()

      return this.get_ticks_months()
    }
  },
  methods: {
    get_ticks_percentage(budget = this.max) {
      const labels = {}

      const ds = [0, 0.25, 0.5, 0.75, 1]
      for (const d of ds)
        labels[budget * d] = `${d * 100}%`

      return labels
    },
    get_ticks_months(start = this.min, end = this.max) {
      start = new Date(start)
      end = new Date(end)

      let [startYear, startMonth] = [start.getFullYear(), start.getMonth()]
      const months = DateDiff.inMonths(start, end)
      const labels = {}

      const add_label = (y, m) => {
        const ms = new Date(y, m).valueOf()
        labels[ms] = m % 12 === 0 ? `${this.months_labels[m]} ${y}` : this.months_labels[m]
      }

      for (let m = startMonth, c = 1; c <= months; m++, c++) {
        if (m === 12) {
          m = 0
          startYear++
        }

        add_label(startYear, m)
      }

      return labels
    }
  }
}
</script>