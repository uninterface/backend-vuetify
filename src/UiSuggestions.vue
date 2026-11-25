<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import {
    useUiSuggestionsView,
    useUiOverlayTarget,
    type UiSuggestionsViewProps,
  } from '@uninterface/uninterface/backend'
  const props = defineProps<UiSuggestionsViewProps>()
  const { anchor, anchorWidth, surface, visible, host, active, accept } =
    useUiSuggestionsView(props)
  const portal = useUiOverlayTarget()
  import { VMenu } from 'vuetify/components/VMenu'
  import { VList, VListItem } from 'vuetify/components/VList'
  import { VSheet } from 'vuetify/components/VSheet'
  import type { ComponentPublicInstance } from 'vue'
  function setSurface(instance: Element | ComponentPublicInstance | null) {
    const element = instance && '$el' in instance ? instance.$el : instance
    surface.value = element instanceof HTMLElement ? element : undefined
  }
  import { useUiZPopup } from '@uninterface/uninterface/backend'
  import { popupTarget } from './zOrder'
  useUiZPopup(() => popupTarget(surface.value), { source: 'UiSuggestions' })
</script>
<template>
  <slot
    name="host"
    :host="host"
  />
  <VMenu
    v-if="anchor"
    :activator="anchor"
    :model-value="visible"
    :attach="portal"
    :width="anchorWidth"
    :open-on-click="false"
    :open-on-arrow="false"
    :close-on-content-click="false"
    :retain-focus="false"
  >
    <!-- VMenu gives its direct VSheet child the native background and elevation. -->
    <VSheet
      :ref="setSurface"
      class="vuetify-suggestions"
    >
      <VList
        :id="id"
        role="listbox"
        :aria-busy="pending || undefined"
        :aria-label="label"
      >
        <VListItem
          v-for="(item, index) in results"
          :id="`${id}-${index}`"
          :key="item.key"
          :active="active === index"
          :disabled="item.disabled"
          role="option"
          tabindex="-1"
          :aria-label="item.label"
          :aria-selected="active === index"
          :aria-disabled="item.disabled || undefined"
          @mousedown.prevent
          @click="accept(index)"
        >
          <template #title>
            <slot
              name="suggestion"
              :item="item"
              :active="active === index"
            >
              {{ item.label }}
            </slot>
          </template>
        </VListItem>
      </VList>
      <VListItem
        v-if="message"
        role="status"
      >
        <template #title>
          <small v-if="results.length">{{ message }}</small>
          <template v-else>{{ message }}</template>
        </template>
      </VListItem>
    </VSheet>
  </VMenu>
</template>
