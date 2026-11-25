<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { VSheet } from 'vuetify/components/VSheet'
</script>
<template>
  <VSheet
    tag="nav"
    class="vuetify-navbar pa-4 ga-4"
  >
    <div
      v-if="$slots.brand"
      class="vuetify-navbar-brand"
    >
      <slot name="brand" />
    </div>
    <div
      v-if="$slots.default"
      class="vuetify-navbar-links"
    >
      <slot />
    </div>
    <div
      v-if="$slots.actions"
      class="vuetify-navbar-actions"
    >
      <slot name="actions" />
    </div>
  </VSheet>
</template>
