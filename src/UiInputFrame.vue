<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import {
    useUiFieldFailure,
    useUiFieldDescription,
    useUiInputFrameSurface,
    type UiInputFrameViewProps,
  } from '@uninterface/uninterface/backend'
  import { provide } from 'vue'
  import { fieldLayoutKey, useFieldPresentation } from './fieldLayout'
  import { useControlSize } from './controlSize'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiInputFrameViewProps>()
  const emit = defineEmits<{ enter: []; leave: [] }>()
  const { attrs, focused, focus } = useUiInputFrameSurface(props, emit)
  defineExpose({ focus })
  const invalid = useUiFieldFailure(() => props.binding)
  const description = useUiFieldDescription(
    () => props.descriptionBinding,
    'replace-help',
  )
  const { field, presentation, requiredMarker, requiredPrefix } =
    useFieldPresentation(true, true)
  // The compound frame is one field presenter. Its parts must not register
  // separate labels/details; a nested UiField may establish its own context.
  provide(fieldLayoutKey, undefined)
  const size = useControlSize('UiInputFrame')
  import { VInput } from 'vuetify/components/VInput'
  import { VField } from 'vuetify/components/VField'
</script>
<template>
  <VInput
    class="vuetify-input-frame-host"
    :density="size"
    :disabled="binding.disabled"
    :error="invalid"
    :rules="[]"
    hide-details
  >
    <!-- Parts and supporting content remain visible even for an empty value.
         Keep the native label floated, independently of business dirty state. -->
    <VField
      class="vuetify-input-frame"
      :class="{
        'vuetify-required-control': requiredMarker,
        'vuetify-required-prefix': requiredPrefix,
      }"
      :id="binding.id"
      :label="presentation.label"
      :label-id="field ? `${field.id}-label` : undefined"
      :single-line="presentation.singleLine"
      :active="true"
      @click="focus"
      :focused="focused"
      :disabled="binding.disabled"
      :error="invalid"
    >
      <template #default="{ props: contentProps }">
        <!-- Keep VField's single-editor click cancellation away from composed actions. -->
        <div
          v-bind="{
            ...$attrs,
            ...attrs,
          }"
          :aria-describedby="description"
          @click.stop="$event.target === $event.currentTarget && focus()"
          :class="contentProps.class"
          class="vuetify-input-frame-content"
        >
          <slot name="leading" />
          <slot />
          <slot name="trailing" />
        </div>
      </template>
    </VField>
  </VInput>
</template>
