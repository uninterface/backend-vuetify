<script setup lang="ts">
  import { ref } from 'vue'
  const root = ref<HTMLElement>()
  function focus() {
    root.value
      ?.querySelector<HTMLElement>(
        '[role="combobox"]:not([aria-disabled="true"]), input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled), button:not(:disabled)',
      )
      ?.focus()
  }
  defineExpose({ focus })
</script>
<template>
  <div
    ref="root"
    data-ui-collection-filter-editor
  >
    <slot />
  </div>
</template>
