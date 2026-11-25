<script setup lang="ts">
  import {
    useUiZPopup,
    useUiOverlayTarget,
    useUiTooltipAnchorVisibility,
    useUiTooltipPlacement,
    useUiTooltipPositionUpdate,
  } from '@uninterface/uninterface/backend'
  import { popupTarget } from './zOrder'
  import { ref, onDeactivated, watch } from 'vue'
  import { VTooltip } from 'vuetify/components/VTooltip'
  const props = defineProps<{ message: string | null; id: string }>()
  const anchor = ref<HTMLElement>()
  const tooltip = ref<InstanceType<typeof VTooltip>>()
  const surface = ref<HTMLElement>(),
    portal = useUiOverlayTarget()
  const bubble = () =>
    surface.value?.closest<HTMLElement>('.v-overlay__content') ?? undefined
  useUiZPopup(() => popupTarget(surface.value), {
    tooltip: {
      anchor: () => anchor.value,
      visible: () => visible.value,
      bubble,
    },
    source: 'field failure tooltip',
  })
  const suppressed = ref(false)
  const placement = useUiTooltipPlacement(
    () => anchor.value,
    () => 'top',
  )
  const visible = useUiTooltipAnchorVisibility(
    () => anchor.value,
    () => Boolean(props.message) && !suppressed.value,
  )
  useUiTooltipPositionUpdate(
    () => anchor.value,
    bubble,
    () => visible.value,
    () => tooltip.value?.updateLocation?.(new Event('resize')),
  )
  onDeactivated(() => {
    suppressed.value = true
  })
  watch(
    () => props.message,
    () => {
      suppressed.value = false
    },
  )
</script>
<template>
  <div
    ref="anchor"
    class="vuetify-field-editor"
  >
    <slot />
    <span
      v-if="message"
      :id="id"
      class="vuetify-tooltip-description"
    >
      {{ message }}
    </span>
    <!-- Validation owns visibility. An unrelated outside click must neither
         dismiss the error nor animate it. There is no focus-return activator. -->
    <VTooltip
      ref="tooltip"
      :eager="false"
      :attach="portal"
      :target="anchor"
      :model-value="visible"
      :disabled="!message"
      :location="placement"
      persistent
      no-click-animation
      :open-on-hover="false"
      :open-on-focus="false"
      :open-on-click="false"
    >
      <span
        ref="surface"
        :data-ui-field-tooltip-for="id"
      >
        {{ message }}
      </span>
    </VTooltip>
  </div>
</template>
