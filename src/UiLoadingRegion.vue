<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'

  import { Teleport } from 'vue'
  import {
    useUiLoadingRegion,
    type UiLoadingRegionViewProps,
  } from '@uninterface/uninterface/backend'
  import Indicator from './UiLoadingIndicator.vue'
  import { VOverlay } from 'vuetify/components/VOverlay'
  const props = withDefaults(defineProps<UiLoadingRegionViewProps>(), {
    announce: true,
    manageBusy: true,
  })
  const { visible, overlay, style, announcementHost, announcement } =
    useUiLoadingRegion(props)
  useUiZView({
    host: () => props.surface.overlayHost.value!,
    targets: () => (overlay.value ? [overlay.value] : []),
  })
</script>
<template>
  <Teleport
    v-if="visible && surface.overlayHost.value"
    :to="surface.overlayHost.value"
  >
    <div
      ref="overlay"
      data-ui-loading-overlay
      class="vuetify-loading-region"
      :data-custom="$slots.default ? '' : undefined"
      :style="style"
    >
      <!-- Local busy presentation must not take Escape priority from menus. -->
      <VOverlay
        :model-value="true"
        contained
        persistent
        :attach="true"
        :close-on-back="false"
        :_disable-global-stack="true"
        no-click-animation
        scroll-strategy="none"
        :z-index="0"
        class="vuetify-loading-native"
        content-class="vuetify-loading-content"
      >
        <slot><Indicator :label="label" /></slot>
      </VOverlay>
    </div>
  </Teleport>
  <Teleport
    v-if="announcementHost && announce !== false"
    :to="announcementHost"
  >
    <span
      class="vuetify-loading-announcement"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ announcement }}
    </span>
  </Teleport>
</template>
