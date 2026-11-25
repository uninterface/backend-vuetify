<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import type { UiNoticeViewProps } from '@uninterface/uninterface/backend'
  defineProps<UiNoticeViewProps>()
  import { VAlert } from 'vuetify/components/VAlert'
</script>
<template>
  <VAlert
    :type="kind === 'custom' ? undefined : kind"
    :color="
      color === 'danger'
        ? 'error'
        : (color ?? (variant === 'filled' ? 'surface-variant' : undefined))
    "
    :icon="$slots.icon || kind === 'custom' ? false : undefined"
    :variant="
      variant === 'filled'
        ? 'flat'
        : variant === 'outline'
          ? 'outlined'
          : 'tonal'
    "
    :title="title"
    class="vuetify-notice"
    :data-variant="variant"
    :closable="dismissible"
    :close-label="dismissLabel"
    :model-value="true"
    @update:model-value="onDismissRequest"
    :role="undefined"
  >
    <template
      v-if="$slots.icon"
      #prepend
    >
      <span
        class="vuetify-notice-icon"
        aria-hidden="true"
      >
        <slot name="icon" />
      </span>
    </template>
    <slot>
      <div v-if="message">{{ message }}</div>
      <ul v-if="details?.length">
        <li
          v-for="(detail, index) in details"
          :key="index"
        >
          {{ detail }}
        </li>
      </ul>
    </slot>
    <div
      v-if="$slots.actions"
      class="vuetify-notice-actions"
    >
      <slot name="actions" />
    </div>
  </VAlert>
</template>
