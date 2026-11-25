<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import type { UiLoadingIndicatorViewProps } from '@uninterface/uninterface/backend'
  import { VProgressCircular } from 'vuetify/components/VProgressCircular'
  import { computed } from 'vue'
  import {
    useUiStrategy,
    uiControlSizeQuery,
  } from '@uninterface/uninterface/backend'
  const requestedSize = useUiStrategy(uiControlSizeQuery, [-2, -1, 0, 1, 2])
  const scale = computed(() =>
    requestedSize.value.status === 'answered' ? requestedSize.value.value : 0,
  )
  defineProps<UiLoadingIndicatorViewProps>()
</script>
<template>
  <span
    class="vuetify-loading-indicator"
    :style="{ fontSize: `${1 + scale * 0.125}em` }"
  >
    <VProgressCircular
      indeterminate
      :size="18 + scale * 2"
      :width="2"
      aria-hidden="true"
    />
    <slot>
      <span class="vuetify-loading-label-hidden">{{ label }}</span>
    </slot>
  </span>
</template>
