<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import {
    useUiNativeTabList,
    type UiTabsViewProps,
  } from '@uninterface/uninterface/backend'
  import { VTabs, VTab } from 'vuetify/components/VTabs'
  const props = defineProps<UiTabsViewProps>()
  const emit = defineEmits<{ select: [key: string] }>()
  const { root, keydown, focusin } = useUiNativeTabList(
    props,
    (key) => emit('select', key),
    { nativeAttributes: true },
  )
</script>
<template>
  <div
    ref="root"
    class="vuetify-tabs"
    @keydown.capture="keydown"
    @focusin="focusin"
  >
    <VTabs
      :model-value="items.find((item) => item.selected)?.key"
      :direction="orientation"
      :mandatory="false"
      :aria-label="label"
      :aria-orientation="orientation"
      @update:model-value="emit('select', String($event))"
    >
      <VTab
        v-for="item in items"
        :key="item.key"
        v-bind="item.attributes"
        :id="item.tabId"
        :value="item.key"
        :disabled="item.disabled"
        :aria-controls="item.panelId"
      >
        <slot :item="item" />
      </VTab>
    </VTabs>
  </div>
</template>
