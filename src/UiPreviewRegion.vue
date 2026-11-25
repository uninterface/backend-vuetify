<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import {
    useUiFieldFailure,
    useUiFieldDescription,
    type UiPreviewRegionViewProps,
  } from '@uninterface/uninterface/backend'
  import { useControlSize } from './controlSize'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiPreviewRegionViewProps>()
  const invalid = useUiFieldFailure(() => props.binding)
  import { provide } from 'vue'
  import { fieldLayoutKey, useFieldPresentation } from './fieldLayout'
  import { VInput } from 'vuetify/components/VInput'
  import { VField } from 'vuetify/components/VField'
  const description = useUiFieldDescription(() => props.binding, 'replace-help')
  const { field, presentation, requiredMarker, requiredPrefix } =
    useFieldPresentation(true, true)
  provide(fieldLayoutKey, undefined)
  const size = useControlSize('UiPreviewRegion')
</script>
<template>
  <VInput
    class="vuetify-preview-host"
    :density="size"
    :disabled="binding.disabled"
    :error="invalid"
    :rules="[]"
    readonly
    hide-details
  >
    <VField
      data-preview-frame
      :id="binding.id + '-frame'"
      :label="presentation.label"
      :label-id="field ? `${field.id}-label` : undefined"
      :single-line="presentation.singleLine"
      :active="true"
      :disabled="binding.disabled"
      :error="invalid"
      :class="{
        'vuetify-required-control': requiredMarker,
        'vuetify-required-prefix': requiredPrefix,
      }"
    >
      <template #default="{ props: contentProps }">
        <div
          v-bind="$attrs"
          :id="binding.id"
          data-ui-preview-region
          :data-extent="extent"
          role="group"
          :aria-label="label"
          :aria-describedby="description"
          :aria-invalid="binding.invalid || undefined"
          :aria-disabled="binding.disabled || undefined"
          :aria-busy="binding.validating || undefined"
          :class="contentProps.class"
          class="vuetify-preview-region"
        >
          <div
            class="vuetify-preview-viewport"
            data-preview-viewport
          >
            <slot />
          </div>
        </div>
      </template>
    </VField>
  </VInput>
</template>
