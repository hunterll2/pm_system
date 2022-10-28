<template>
  <v-col>
      <v-card v-bind="$attrs" variant="elevated">
        <v-card-title class="py-6 text-h4 d-flex">
          {{title}}
          <v-spacer />
          <v-btn prepend-icon="mdi-plus-circle" color="primary" variant="tonal" @click="$emit('add-new')">{{addLabel}}</v-btn>
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
    addLabel: String
  },
}
</script>