<script setup lang="ts">
  defineProps<{
    part: 'panel' | 'row' | 'movement' | 'field' | 'remove' | 'add'
    multiple?: boolean
  }>()
</script>
<template>
  <div
    class="vuetify-collection-sort-layout"
    :data-sort-part="part"
    :data-sort-multiple="multiple ? '' : undefined"
  >
    <slot />
  </div>
</template>
