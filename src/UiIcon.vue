<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import type { UiIconViewProps } from '@uninterface/uninterface/backend'
  defineProps<UiIconViewProps>()
</script>
<template>
  <span
    class="icon-frame"
    :class="tone ? `text-${tone === 'danger' ? 'error' : tone}` : undefined"
  >
    <slot />
  </span>
</template>
<style scoped>
  .icon-frame {
    display: inline-flex;
    flex: none;
    width: 1em;
    height: 1em;
    vertical-align: -0.125em;
  }
</style>
