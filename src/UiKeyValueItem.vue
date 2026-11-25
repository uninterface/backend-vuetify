<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import type { UiKeyValueItemViewProps } from '@uninterface/uninterface/backend'
  defineProps<UiKeyValueItemViewProps>()
</script>
<template>
  <div class="vuetify-key-value-item">
    <dt>{{ label }}</dt>
    <dd><slot /></dd>
  </div>
</template>
