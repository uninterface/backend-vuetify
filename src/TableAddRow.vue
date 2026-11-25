<script setup lang="ts">
  defineProps<{
    tracks: readonly number[]
    keys: readonly string[]
    viewport: number
  }>()
</script>
<template>
  <div
    class="vuetify-table-add-preview"
    data-collection-add-row
    :style="{
      gridTemplateColumns: tracks.map((width) => `${width}px`).join(' '),
    }"
  >
    <div
      v-for="(key, index) in keys"
      :key="index"
      class="vuetify-table-add-cell"
      :style="{ gridColumn: index + 1 }"
      :data-collection-add-preview="key"
      aria-hidden="true"
    >
      <span />
    </div>
    <div
      class="vuetify-table-add-action"
      :style="{ inlineSize: viewport > 0 ? `${viewport}px` : '100%' }"
    >
      <slot />
    </div>
  </div>
</template>
