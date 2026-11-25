<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { useUiFieldFailure } from '@uninterface/uninterface/backend'
  import { useUiFieldDescription } from '@uninterface/uninterface/backend'
  import { useControlSize } from './controlSize'
  import { focusUiTarget } from '@uninterface/uninterface/backend'
  import { VLocaleProvider } from 'vuetify/components/VLocaleProvider'
  import { useNativeDirection } from './nativeDirection'
  import { useTargetListeners } from './targetListeners'
  const { surfaceAttributes, directive: vTargetListeners } =
    useTargetListeners()
  import { ref, watchPostEffect } from 'vue'
  import { VCheckbox } from 'vuetify/components/VCheckbox'
  import type { UiCheckboxViewProps } from '@uninterface/uninterface/backend'
  import { useFieldPresentation } from './fieldLayout'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiCheckboxViewProps>()
  const invalidPresentation = useUiFieldFailure(() => props.binding)
  defineEmits<{ update: [value: boolean] }>()
  const { field, presentation, messageId, requiredMarker, requiredPrefix } =
    useFieldPresentation(false, false, true)
  const checkbox = ref<InstanceType<typeof VCheckbox>>()
  watchPostEffect(() => {
    const input = checkbox.value?.$el?.querySelector('input')
    if (input) {
      input.checked = props.value === true
      input.indeterminate = props.value === 'indeterminate'
    }
  })
  // Read outside our own native locale provider; it writes a direction class.
  const direction = useNativeDirection(
    () => checkbox.value?.$el?.parentElement?.parentElement,
  )
  defineExpose({
    focus: () =>
      focusUiTarget(
        () => checkbox.value?.$el?.querySelector('input'),
        () => props.binding.disabled,
      ),
  })
  const description = useUiFieldDescription(() => props.binding, 'replace-help')
  const controlSize = useControlSize('UiCheckbox')
</script>
<template>
  <VLocaleProvider
    :rtl="direction === 'rtl'"
    class="vuetify-checkbox-host"
  >
    <VCheckbox
      :density="controlSize"
      ref="checkbox"
      v-target-listeners
      v-bind="{ ...surfaceAttributes(), ...presentation }"
      :id="binding.id"
      :model-value="value === true"
      :indeterminate="value === 'indeterminate'"
      :class="{
        'vuetify-required-checkbox': requiredMarker,
        'vuetify-required-prefix': requiredPrefix,
      }"
      :disabled="binding.disabled"
      :error="invalidPresentation"
      :aria-busy="binding.validating || undefined"
      :aria-required="binding.required || undefined"
      :aria-describedby="description"
      :aria-invalid="binding.invalid || undefined"
      :rules="[]"
      @update:model-value="$emit('update', Boolean($event))"
    >
      <template #message="{ message }">
        <span :id="messageId">{{ message }}</span>
      </template>
    </VCheckbox>
  </VLocaleProvider>
</template>
