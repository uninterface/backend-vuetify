<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import {
    useUiOverlayTarget,
    useUiZPopup,
  } from '@uninterface/uninterface/backend'
  import type { UiFeedbackPlacement } from '@uninterface/uninterface'
  defineProps<{
    placement: UiFeedbackPlacement
    kind: 'toast' | 'notification'
    label: string
  }>()
  const portal = useUiOverlayTarget()
  const ready = ref(false)
  const root = ref<HTMLElement>()
  useUiZPopup(() => root.value, { source: 'feedback viewport', scope: true })
  onMounted(() => {
    ready.value = true
  })
</script>
<template>
  <Teleport
    v-if="ready"
    :to="portal ?? 'body'"
  >
    <div
      ref="root"
      class="vuetify-feedback-viewport"
      :data-placement="placement"
      :data-feedback-target="kind"
      tabindex="-1"
      role="region"
      :aria-label="label"
    >
      <slot />
    </div>
  </Teleport>
</template>
