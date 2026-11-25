<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import type { UiBadgeViewProps } from '@uninterface/uninterface/backend'
  defineProps<UiBadgeViewProps>()
  import { VChip } from 'vuetify/components/VChip'
</script>
<template>
  <VChip
    class="vuetify-badge"
    :color="color === 'danger' ? 'error' : color"
    :closable="false"
    :ripple="false"
    :draggable="false"
  >
    <slot />
  </VChip>
</template>
