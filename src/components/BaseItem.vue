<template>
  <v-card :variant="expand ? 'tonal' : 'text'" :color="!!item.actual_end ? 'success' : undefined"
    @click="$emit('expand', this.item, this.expand)">
    <v-card-title class="d-flex align-center">
      <v-list-item-action v-if="item.budget" start>
        <v-checkbox-btn :model-value="!!item.actual_end" @update:modelValue="$emit('item-check', item, $event)"
          @click.stop="" :disabled="item.type === 'project' || !item.started" />
      </v-list-item-action>

      {{ item.name }}
      
      <v-spacer />
      
      <span v-if="!expand">
        <v-icon left icon="mdi-cash" />{{ item.budget ? getMoney(item.budget) : getMoney(item.cost) }}
      </span>
      <v-btn v-else prepend-icon="mdi-cog" color="secondary" variant="text" @click.stop="$emit('edit', item)">Edit
      </v-btn>
    </v-card-title>

    <v-expand-transition>
      <div v-if="expand">
        <v-card-text v-if="item.budget" class="pt-0 text-body-1">
          <v-row>
            <v-col>
              <v-list-item>Start: {{ item.start }}</v-list-item>
              <v-list-item>End: {{ item.end }}</v-list-item>
              <v-list-item>Budget: {{ getMoney(item.budget) }}</v-list-item>
              <v-list-item v-if="item.remaining_budget >= 0">Remaining Budget: {{ getMoney(item.remaining_budget) }}</v-list-item>
            </v-col>
            <v-col>
              <v-list-item>Acutal Start: {{ item.actual_start }}</v-list-item>
              <v-list-item>Acutal End: {{ item.actual_end }}</v-list-item>
              <v-list-item>Acutal Budget: {{ getMoney(item.actual_budget) }}</v-list-item>
            </v-col>
          </v-row>
        </v-card-text>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script>
export default {
  props: {
    item: Object,
    expand: Boolean
  },
  data: () => ({
    box: false
  }),
  methods: {
    getMoney(val) {
      val = String(val)
      if (val.length > 3)
        return `$${val.slice(0, val.length - 3)},${val.slice(val.length - 3)}`
      else return `$${val}`
    }
  }
}
</script>