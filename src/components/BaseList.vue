<template>
  <v-list v-model:selected="selected" return-object :lines="!!$slots.subtitle ? 'three' : undefined" variant="tonal" color="primary">
    <v-list-item v-for="item in items" :key="item.id" :value="item" :title="item.name" class="mb-1" rounded>
      <template #subtitle>
        <slot v-bind="item" name="subtitle" />
      </template>
      <template v-if="checkbox" #prepend>
        <v-list-item-action start>
          <v-checkbox-btn />
        </v-list-item-action>
      </template>
      <template v-if="edit" #append>
        <v-list-item-action end>
        <v-btn icon="mdi-cog" size="x-small" @click.stop="$emit('edit', item)" />
        </v-list-item-action>
      </template>
    </v-list-item>
  </v-list>
</template>

<script>
export default {
  props: {
    items: Array,
    checkbox: Boolean,
    edit: Boolean,
  },
  data: () => ({
    selected: []
  }),
  computed: {
    selected_item() {
      return this.selected.length ? this.selected[0] : null
    }
  },
  watch: {
    selected_item: {
      handler(val) {
        this.$emit('change', val)
      },
      deep: true
    },
  },
}
</script>