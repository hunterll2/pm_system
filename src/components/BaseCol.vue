<template>
  <v-col>
    <v-card v-bind="$attrs" :variant="variant" :elevation="variant === 'elevated' ? 4 : 0" min-height="100%">
      <v-card-title v-if="title || addLabel || editLabel" class="pt-4 text-h5 d-flex">
        {{ title }}
        <v-spacer />
        <v-btn v-if="addLabel" prepend-icon="mdi-plus-circle" color="primary" variant="tonal" @click="$emit('add-new')">
          {{ addLabel }}</v-btn>
        <v-btn v-if="editLabel" prepend-icon="mdi-cog" color="primary" variant="tonal" @click="$emit('edit')">
          {{ editLabel }}</v-btn>
      </v-card-title>
      <v-divider v-if="title || addLabel || editLabel" />
      <v-card-text>
        <slot name="default" />
      </v-card-text>
    </v-card>
  </v-col>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    title: String,
    addLabel: String,
    editLabel: String,
    variant: {
      type: String,
      default: 'elevated'
    }
  },
}
</script>