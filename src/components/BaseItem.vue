<template>
  <v-card :variant="'tonal'" :color="getColor" class="mb-2" @dblclick="$emit('edit', item)"
    @click="$emit('expand', expand ? undefined : item)">
    <v-card-text class="d-flex align-center text-h6 font-weight-regular">

      <v-list-item-action start>
        <v-checkbox-btn v-if="itemStarted" :model-value="itemDone" class="text-h5 mr-2"
          @update:modelValue="$emit('item-check', $event)" @click.stop="" />
        <v-chip>{{ budget }}</v-chip>
        <v-chip v-if="item.type === 'task'" class="ml-1">{{ actual_budget }}</v-chip>
      </v-list-item-action>


      <span>{{ item.name }}</span>
      <v-spacer />

      <div class="text-subtitle-1">
        <template v-if="item.type === 'task' && itemStarted">
          <v-icon icon="mdi-calendar-start" size="small" />
          {{ GetDate.string(item.actual_start, 'mm-d') }}

          <template v-if="itemDone">
            <v-icon icon="mdi-calendar-end" size="small" />
            {{ GetDate.string(item.actual_end, 'mm-d') }}
          </template>
        </template>

        <template v-else-if="item.type === 'task'">
          <v-icon icon="mdi-calendar-start" size="small" />
          {{ GetDate.string(item.start, 'mm-d') }}

          <v-icon icon="mdi-calendar-end" size="small" />
          {{ GetDate.string(item.end, 'mm-d') }}
        </template>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { currency, GetDate } from '@/helpers/helpers.js'

export default {
  props: {
    expand: Boolean,
    item: Object,
  },
  data: () => ({
  }),
  computed: {
    GetDate() {
      return GetDate
    },
    currency() {
      return currency
    },
    itemStarted() {
      return !!this.item.actual_start
    },
    itemDone() {
      return !!this.item.actual_end
    },
    budget() {
      const { budget, cost } = this.item
      return budget ? currency.USD(budget) : currency.USD(cost)
    },
    actual_budget() {
      return currency.USD(this.item.actual_budget || 0)
    },
    getColor() {
      if (this.expand) return 'primary'
      else if (this.itemDone) return 'success'
      else if (!this.itemStarted && this.item.type !== 'resource') return 'blue'
      else return undefined
    },
  },
}
</script>