<template>
  <v-col>
    <v-card v-bind="$attrs" variant="elevated">
      <v-card-title class="py-6 text-h4 d-flex">
        {{ title }}
        <v-spacer />
        <v-btn v-if="addLabel" prepend-icon="mdi-plus-circle" color="primary" variant="tonal" @click="$emit('add-new')">
          {{ addLabel }}</v-btn>
        <v-btn v-if="editLabel" prepend-icon="mdi-cog" color="primary" variant="tonal" @click="$emit('edit')">
          {{ editLabel }}</v-btn>
      </v-card-title>
      <v-divider />
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
  },
}
</script>