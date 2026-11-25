<script setup lang="ts">
  import { useUiFormFocus } from '@uninterface/uninterface/backend'
  import { uiFocusPresentation } from './focus'
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { ref } from 'vue'
  import type { UiFormViewBinding } from '@uninterface/uninterface/backend'
  defineProps<{ binding: UiFormViewBinding }>()
  defineEmits<{ submit: []; reset: [] }>()
  const element = ref<HTMLFormElement>()
  const focusInvalid = useUiFormFocus(() => element.value)
  defineExpose({ focusInvalid })
</script>
<template>
  <form
    ref="element"
    class="vuetify-form ga-5"
    :data-form-full="binding.height === 'full' || undefined"
    :id="binding.id"
    :aria-label="binding.label"
    :aria-busy="binding.pending"
    novalidate
    v-bind="uiFocusPresentation"
    @submit.prevent="$emit('submit')"
    @reset.prevent="$emit('reset')"
  >
    <slot />
  </form>
</template>
