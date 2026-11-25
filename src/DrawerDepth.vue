<script setup lang="ts">
  import type { UiDrawerEdge } from '@uninterface/uninterface'
  defineProps<{ edge: UiDrawerEdge }>()
</script>
<template>
  <span
    class="vuetify-drawer-depth"
    :data-edge="edge"
    aria-hidden="true"
  >
    <span class="vuetify-drawer-depth-shadow elevation-5" />
  </span>
</template>
