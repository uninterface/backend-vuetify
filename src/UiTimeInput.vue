<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { ref } from 'vue'
  import TemporalInput from './TemporalInput.vue'
  import type {
    UiTemporalInputViewProps,
    UiFocusHandle,
  } from '@uninterface/uninterface/backend'
  const props = defineProps<UiTemporalInputViewProps>()
  const view = ref<UiFocusHandle>()
  defineExpose({ focus: () => view.value?.focus() ?? Promise.resolve(null) })
</script>
<template>
  <TemporalInput
    ref="view"
    v-bind="props"
  />
</template>
