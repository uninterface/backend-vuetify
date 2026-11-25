<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { VEmptyState } from 'vuetify/components/VEmptyState'
  import type { UiEmptyViewProps } from '@uninterface/uninterface/backend'
  defineProps<UiEmptyViewProps>()
</script>
<template>
  <VEmptyState class="vuetify-empty">
    <template #text>
      <slot>{{ label }}</slot>
    </template>
    <template
      v-if="$slots.icon"
      #media
    >
      <slot name="icon" />
    </template>
    <template
      v-if="$slots.actions"
      #actions
    >
      <slot name="actions" />
    </template>
  </VEmptyState>
</template>
