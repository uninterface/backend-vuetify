<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import {
    useUiTooltipView,
    useUiOverlayTarget,
    type UiTooltipViewProps,
  } from '@uninterface/uninterface/backend'
  const props = defineProps<UiTooltipViewProps>()
  const {
    anchor,
    surface,
    trigger,
    surfaceEvents,
    visible,
    describe,
    placement,
  } = useUiTooltipView(props)
  const portal = useUiOverlayTarget()
  import { VTooltip } from 'vuetify/components/VTooltip'
  import { useUiZPopup } from '@uninterface/uninterface/backend'
  import { popupTarget } from './zOrder'
  useUiZPopup(() => popupTarget(surface.value), {
    tooltip: {
      anchor: () => anchor.value,
      visible: () => visible.value,
      bubble: () => surface.value?.closest<HTMLElement>('.v-overlay__content'),
    },
    source: 'UiTooltip',
  })
</script>
<template>
  <slot
    name="host"
    :trigger="trigger"
  />
  <VTooltip
    v-if="anchor"
    :target="anchor"
    :model-value="visible"
    :disabled="disabled"
    :location="placement"
    :attach="portal"
    :open-on-hover="false"
    :open-on-focus="false"
    :open-on-click="false"
  >
    <div
      :id="id"
      ref="surface"
      v-bind="surfaceEvents"
    >
      <slot />
    </div>
  </VTooltip>
</template>
