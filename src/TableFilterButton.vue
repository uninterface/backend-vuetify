<script setup lang="ts">
  import { VBtn } from 'vuetify/components/VBtn'
  import FilterIcon from './icons/filter.vue'
  defineProps<{ active: boolean; disabled: boolean }>()
</script>
<template>
  <VBtn
    type="button"
    :color="active ? 'primary' : undefined"
    variant="text"
    size="x-small"
    icon
    class="vuetify-table-filter"
    :disabled="disabled"
    :data-filter-active="active || undefined"
  >
    <span aria-hidden="true"><FilterIcon class="table-filter-icon" /></span>
  </VBtn>
</template>
