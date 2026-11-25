<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { type UiContentViewProps } from '@uninterface/uninterface/backend'
  defineProps<UiContentViewProps>()
</script>
<template>
  <div
    class="vuetify-content"
    :data-inset="inset"
    :data-ui-content-height="height"
    :data-scroll="scroll !== 'none' ? '' : undefined"
    :style="{
      height: height === 'full' ? '100%' : undefined,
      overflow: scroll !== 'none' ? 'auto' : undefined,
    }"
    :role="scroll !== 'none' ? 'region' : undefined"
    :aria-label="label"
    :tabindex="scroll !== 'none' ? 0 : undefined"
  >
    <slot />
  </div>
</template>
