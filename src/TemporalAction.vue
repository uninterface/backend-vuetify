<script setup lang="ts">
  import { VBtn } from 'vuetify/components/VBtn'
  defineProps<{
    label: string
    disabled: boolean
    active?: boolean
    clear?: boolean
  }>()
  defineEmits<{ click: [] }>()
</script>
<template>
  <VBtn
    type="button"
    icon
    variant="text"
    size="small"
    :disabled="disabled"
    :aria-label="label"
    :title="label"
    :aria-pressed="clear ? undefined : active"
    :data-temporal-unbounded="!clear ? '' : undefined"
    :data-temporal-clear="clear ? '' : undefined"
    @mousedown.prevent
    @click="$emit('click')"
  >
    <span aria-hidden="true">{{ clear ? '×' : '∞' }}</span>
  </VBtn>
</template>
