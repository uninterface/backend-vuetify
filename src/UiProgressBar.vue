<script setup lang="ts">
  import {
    useUiZView,
    type UiProgressBarViewProps,
  } from '@uninterface/uninterface/backend'
  import { VProgressLinear } from 'vuetify/components/VProgressLinear'
  useUiZView()
  defineProps<UiProgressBarViewProps>()
</script>
<template>
  <VProgressLinear
    class="vuetify-progress-bar"
    data-ui-progress-bar
    :data-state="value === null ? 'indeterminate' : 'determinate'"
    :aria-label="label"
    :aria-valuetext="valueText"
    :model-value="value ?? 0"
    :max="max"
    :indeterminate="value === null"
    :clickable="false"
    :color="color === 'danger' ? 'error' : color"
  />
</template>
