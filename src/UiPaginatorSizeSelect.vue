<script setup lang="ts">
  import { onDeactivated, shallowRef as zRef } from 'vue'
  import { useId } from 'vue'
  import {
    useUiZPopup,
    useUiOverlayTarget,
  } from '@uninterface/uninterface/backend'
  import { controlledPopup } from './zOrder'
  const zId = useId(),
    portal = useUiOverlayTarget()
  useUiZPopup(() => controlledPopup(zId))
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { VSelect } from 'vuetify/components/VSelect'
  import type { UiPaginatorSizeSelectViewProps } from '@uninterface/uninterface/backend'
  defineProps<UiPaginatorSizeSelectViewProps>()
  const opened = zRef(false)
  onDeactivated(() => {
    opened.value = false
  })
</script>
<template>
  <VSelect
    v-model:menu="opened"
    :id="zId"
    :menu-props="{ attach: portal }"
    density="comfortable"
    class="vuetify-paginator-size"
    :label="label"
    :model-value="value"
    :items="options"
    item-title="label"
    item-value="value"
    :item-props="(item) => ({ 'data-uninterface-key': String(item.value) })"
    :disabled="disabled"
    :aria-busy="pending"
    hide-details
    @update:model-value="(value) => select(Number(value))"
  />
</template>
