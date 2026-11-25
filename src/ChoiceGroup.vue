<script setup lang="ts">
  import { uiFocusPresentation } from './focus'
  import { computed, ref } from 'vue'
  import {
    useUiChoiceGroupView,
    useUiFieldDescription,
    useUiFieldFailure,
  } from '@uninterface/uninterface/backend'
  import type { UiChoiceGroupViewProps } from '@uninterface/uninterface/backend'
  import { useControlSize } from './controlSize'
  import { VRadio } from 'vuetify/components/VRadio'
  import { VCheckboxBtn } from 'vuetify/components/VCheckbox'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiChoiceGroupViewProps & { multiple: boolean }>()
  const emit = defineEmits<{ choose: [key: string]; blur: [] }>()
  const root = ref<HTMLElement>()
  const size = useControlSize(props.multiple ? 'UiCheckbox' : 'UiRadioGroup')
  const description = useUiFieldDescription(() => props.binding, 'replace-help')
  const failure = useUiFieldFailure(() => props.binding)
  const describedBy = computed(
    () =>
      [
        description.value,
        props.status.message ? `${props.binding.id}-source-status` : undefined,
      ]
        .filter(Boolean)
        .join(' ') || undefined,
  )
  function targets() {
    return Array.from(
      root.value?.querySelectorAll<HTMLElement>(
        'input[type=radio], input[type=checkbox], [role=radio], [role=checkbox]',
      ) ?? [],
    )
      .filter(
        (element) =>
          element.getAttribute('aria-hidden') !== 'true' &&
          element.tabIndex >= -1,
      )
      .flatMap((element) => {
        const key =
          element
            .closest('[data-uninterface-key]')
            ?.getAttribute('data-uninterface-key') ??
          element.getAttribute('value')
        return key === null || key === undefined ? [] : [{ key, element }]
      })
  }
  const { focus, keydown, focusout } = useUiChoiceGroupView(
    props,
    () => props.multiple,
    () => root.value,
    targets,
    (key) => emit('choose', key),
    () => emit('blur'),
  )
  defineExpose({ focus })
  function optionDescription(index: number) {
    return (
      [
        description.value,
        props.options[index].description
          ? `${props.binding.id}-option-${index}-help`
          : undefined,
      ]
        .filter(Boolean)
        .join(' ') || undefined
    )
  }
</script>
<template>
  <div
    ref="root"
    v-bind="$attrs"
    :id="binding.id"
    :role="multiple ? 'group' : 'radiogroup'"
    :aria-label="label"
    :aria-required="(!multiple && binding.required) || undefined"
    :aria-describedby="describedBy"
    :aria-invalid="binding.invalid || undefined"
    :aria-disabled="binding.disabled || undefined"
    :aria-busy="binding.validating || status.pending || undefined"
    :class="uiFocusPresentation.class"
    data-uninterface-choice-group
    class="vuetify-choice-group d-flex flex-column ga-2"
    @keydown.capture="keydown"
    @focusout="focusout"
  >
    <div
      class="d-flex ga-2"
      :class="
        orientation === 'horizontal' ? 'flex-row flex-wrap' : 'flex-column'
      "
    >
      <div
        v-for="(option, index) in options"
        :key="option.key"
        :data-uninterface-key="option.key"
      >
        <VCheckboxBtn
          v-if="multiple"
          :id="`${binding.id}-option-${index}`"
          :model-value="option.selected"
          :label="option.label"
          :disabled="binding.disabled || !available || option.disabled"
          :density="size"
          :error="failure"
          :aria-describedby="optionDescription(index)"
          :aria-invalid="binding.invalid || undefined"
          @update:model-value="emit('choose', option.key)"
        />
        <VRadio
          v-else
          :id="`${binding.id}-option-${index}`"
          :name="binding.id"
          :model-value="option.selected"
          :true-value="true"
          :false-value="false"
          :label="option.label"
          :disabled="binding.disabled || !available || option.disabled"
          :density="size"
          :error="failure"
          :aria-describedby="optionDescription(index)"
          :aria-invalid="binding.invalid || undefined"
          @update:model-value="emit('choose', option.key)"
        />
        <div
          v-if="option.description"
          :id="`${binding.id}-option-${index}-help`"
          class="text-caption"
        >
          {{ option.description }}
        </div>
      </div>
    </div>
    <div
      v-for="item in retained"
      :key="item.key"
      data-uninterface-retained
    >
      {{ item.label }}
      <template v-if="unavailableLabel">— {{ unavailableLabel }}</template>
    </div>
    <div
      :id="`${binding.id}-source-status`"
      role="status"
      :data-uninterface-source-state="status.state"
    >
      {{ status.message }}
    </div>
  </div>
</template>

<style scoped></style>
