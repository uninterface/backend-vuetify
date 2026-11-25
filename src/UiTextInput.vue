<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { useUiFieldFailure } from '@uninterface/uninterface/backend'
  import { useUiFieldDescription } from '@uninterface/uninterface/backend'
  import { useControlSize } from './controlSize'
  import { focusUiTarget } from '@uninterface/uninterface/backend'
  import { VLocaleProvider } from 'vuetify/components/VLocaleProvider'
  import { useNativeDirection } from './nativeDirection'
  import { useFieldPresentation } from './fieldLayout'
  const { field, presentation, messageId, requiredMarker, requiredPrefix } =
    useFieldPresentation()
  import { useTargetListeners } from './targetListeners'
  const { surfaceAttributes, directive: vTargetListeners } =
    useTargetListeners()
  import { ref } from 'vue'
  import { VBtn } from 'vuetify/components/VBtn'
  import { VTextField } from 'vuetify/components/VTextField'
  import { VTextarea } from 'vuetify/components/VTextarea'
  import type { UiTextInputViewProps } from '@uninterface/uninterface/backend'
  import ShowIcon from './icons/show.vue'
  import HideIcon from './icons/hide.vue'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiTextInputViewProps>()
  const invalidPresentation = useUiFieldFailure(
    () => props.descriptionBinding ?? props.binding,
  )
  const emit = defineEmits<{ update: [value: string]; blur: [] }>()
  const element = ref<
    InstanceType<typeof VTextField> | InstanceType<typeof VTextarea>
  >()
  const direction = useNativeDirection(() => element.value?.$el?.parentElement)
  defineExpose({
    focus: () =>
      focusUiTarget(
        () =>
          element.value?.$el?.querySelector(
            'textarea:not(.v-textarea__sizer), input:not([type=hidden])',
          ),
        () => props.binding.disabled,
      ),
  })
  const description = useUiFieldDescription(
    () => props.descriptionBinding ?? props.binding,
    'replace-help',
  )
  const controlSize = useControlSize('UiTextInput')
</script>
<template>
  <VLocaleProvider :rtl="direction === 'rtl'">
    <component
      :data-ui-control-frame="frame?.owner"
      :style="{
        '--ui-text-min-width':
          minWidthCharacters === undefined
            ? undefined
            : `${minWidthCharacters}ch`,
        '--ui-text-max-width':
          maxWidthCharacters === undefined
            ? undefined
            : `${maxWidthCharacters}ch`,
      }"
      :data-ui-frame-editor="frame?.owner === 'parent' ? '' : undefined"
      :is="multiline ? VTextarea : VTextField"
      :density="controlSize"
      :class="{
        'vuetify-required-control': requiredMarker,
        'vuetify-required-prefix': requiredPrefix,
      }"
      ref="element"
      v-target-listeners
      v-bind="{
        ...surfaceAttributes(),
        ...presentation,
        ...(frame?.owner === 'parent'
          ? {
              variant: 'plain',
              hideDetails: true,
              label: undefined,
              messages: undefined,
              errorMessages: [],
            }
          : {}),
      }"
      :id="binding.id"
      :type="multiline ? undefined : type"
      :readonly="readonly"
      :model-value="value"
      :inputmode="inputmode"
      :autocomplete="autocomplete"
      :disabled="binding.disabled"
      :error="frame?.owner !== 'parent' && invalidPresentation"
      :aria-busy="binding.validating || undefined"
      :aria-required="binding.required || undefined"
      :aria-describedby="description"
      :aria-invalid="binding.invalid || undefined"
      :rules="[]"
      @update:model-value="emit('update', $event ?? '')"
      @keydown="reveal?.keydown($event)"
      @blur="emit('blur')"
    >
      <template
        v-if="$slots.leading"
        #prepend-inner
      >
        <slot name="leading" />
      </template>
      <template
        v-if="reveal || $slots.trailing"
        #append-inner
      >
        <slot name="trailing" />
        <VBtn
          v-if="reveal"
          icon
          variant="text"
          size="small"
          :disabled="binding.disabled"
          :aria-label="reveal.label"
          data-password-reveal
          :aria-pressed="reveal.shown"
          @mousedown.prevent
          @click="reveal.toggle"
        >
          <component
            :is="reveal.shown ? HideIcon : ShowIcon"
            aria-hidden="true"
          />
        </VBtn>
      </template>
      <template #message="{ message }">
        <span :id="messageId">{{ message }}</span>
      </template>
    </component>
  </VLocaleProvider>
</template>
