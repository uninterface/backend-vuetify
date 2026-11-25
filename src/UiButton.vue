<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { useControlSize } from './controlSize'
  import { ref } from 'vue'
  import {
    focusUiTarget,
    useUiButtonPresentation,
  } from '@uninterface/uninterface/backend'
  import { VProgressCircular } from 'vuetify/components/VProgressCircular'
  import { VBtn } from 'vuetify/components/VBtn'
  import type { UiButtonViewProps } from '@uninterface/uninterface/backend'
  defineOptions({ inheritAttrs: false })
  const props = withDefaults(defineProps<UiButtonViewProps>(), {
    color: 'secondary',
  })
  const element = ref<{ $el: HTMLElement }>()
  defineExpose({
    focus: () =>
      focusUiTarget(
        () => element.value?.$el,
        () => Boolean(props.disabled || props.loading),
      ),
  })
  const {
    variant: buttonVariant,
    width: buttonWidth,
    iconOnly,
    hint,
  } = useUiButtonPresentation(props, { collectionActionVariant: 'bordered' })
  const controlSize = useControlSize('UiButton')
</script>
<template>
  <span
    class="vuetify-button-host"
    :data-ui-button-width="buttonWidth()"
    :data-ui-control-frame="frame?.owner"
  >
    <VBtn
      :block="
        buttonWidth() === undefined ? undefined : buttonWidth() === 'full'
      "
      :size="controlSize"
      ref="element"
      class="vuetify-button"
      v-bind="$attrs"
      :type="type"
      :form="form"
      :title="hint()"
      :data-ui-button-variant="buttonVariant()"
      :color="
        buttonVariant() === 'neutral'
          ? ''
          : color === 'danger'
            ? 'error'
            : color
      "
      :style="
        buttonVariant() === 'neutral'
          ? {
              '--vuetify-button-neutral-color':
                'rgb(var(--v-theme-' +
                (color === 'danger' ? 'error' : color) +
                '))',
            }
          : undefined
      "
      :variant="
        buttonVariant() === undefined
          ? undefined
          : (
              {
                filled: 'flat',
                outline: 'outlined',
                neutral: 'outlined',
                soft: 'tonal',
                text: 'text',
                icon: 'text',
              } as const
            )[buttonVariant()!]
      "
      :icon="iconOnly()"
      :disabled="disabled || loading"
      :loading="loading"
      :aria-busy="loading || undefined"
    >
      <template
        v-if="$slots.icon && !iconOnly()"
        #prepend
      >
        <span
          class="vuetify-button-icon"
          aria-hidden="true"
        >
          <slot name="icon" />
        </span>
      </template>
      <span
        v-if="$slots.icon && iconOnly()"
        class="vuetify-button-icon"
        aria-hidden="true"
      >
        <slot name="icon" />
      </span>
      <span
        class="vuetify-button-label"
        :class="{ 'vuetify-sr-only vuetify-button-label-hidden': iconOnly() }"
      >
        <slot />
      </span>
      <template #loader>
        <VProgressCircular
          indeterminate
          :width="2"
          aria-hidden="true"
        />
      </template>
    </VBtn>
    <span
      class="vuetify-sr-only vuetify-button-status"
      role="status"
      aria-live="polite"
    >
      {{ loading ? loadingLabel : '' }}
    </span>
  </span>
</template>
