<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import {
    useUiTabPanel,
    type UiTabPanelViewProps,
  } from '@uninterface/uninterface/backend'
  import { uiFocusPresentation } from './focus'
  const props = defineProps<UiTabPanelViewProps>()
  const { element } = useUiTabPanel(props)
</script>
<template>
  <div
    ref="element"
    v-bind="uiFocusPresentation"
    :id="panelId"
    role="tabpanel"
    :aria-labelledby="tabId"
    :hidden="!selected"
    :inert="!selected"
    tabindex="0"
    class="vuetify-tab-panel"
    :style="{ height: height === 'full' ? '100%' : undefined }"
  >
    <slot v-if="mounted" />
  </div>
</template>
