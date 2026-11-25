<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import {
    VExpansionPanels,
    VExpansionPanel,
    VExpansionPanelTitle,
    VExpansionPanelText,
  } from 'vuetify/components/VExpansionPanel'
  import type { UiCollapsibleViewProps } from '@uninterface/uninterface/backend'
  const props = defineProps<UiCollapsibleViewProps>()
  const emit = defineEmits<{ 'update:expanded': [expanded: boolean] }>()
  function request(value: unknown) {
    if (!props.disabled)
      emit(
        'update:expanded',
        Array.isArray(value) && value.includes(props.panelId),
      )
  }
</script>
<template>
  <VExpansionPanels
    :model-value="expanded ? [panelId] : []"
    multiple
    @update:model-value="request"
  >
    <VExpansionPanel
      :value="panelId"
      :disabled="disabled"
    >
      <VExpansionPanelTitle
        :color="color === 'danger' ? 'error' : color"
        :id="triggerId"
        :aria-controls="panelId"
      >
        <span class="d-inline-flex flex-wrap align-center ga-2">
          <slot name="summary" />
        </span>
      </VExpansionPanelTitle>
      <VExpansionPanelText
        :id="panelId"
        :aria-labelledby="triggerId"
        :inert="!expanded"
        eager
      >
        <slot v-if="mounted" />
      </VExpansionPanelText>
    </VExpansionPanel>
  </VExpansionPanels>
</template>
