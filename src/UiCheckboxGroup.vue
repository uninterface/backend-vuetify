<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { ref } from 'vue'
  import type {
    UiChoiceGroupViewProps,
    UiFocusHandle,
  } from '@uninterface/uninterface/backend'
  import ChoiceGroup from './ChoiceGroup.vue'
  defineOptions({ inheritAttrs: false })
  defineProps<UiChoiceGroupViewProps>()
  const emit = defineEmits<{ choose: [key: string]; blur: [] }>()
  const view = ref<UiFocusHandle>()
  defineExpose({ focus: () => view.value?.focus() ?? Promise.resolve(false) })
</script>
<template>
  <ChoiceGroup
    ref="view"
    v-bind="{ ...$attrs, ...$props }"
    :multiple="true"
    @choose="emit('choose', $event)"
    @blur="emit('blur')"
  />
</template>
