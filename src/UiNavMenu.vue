<script setup lang="ts">
  import { useUiZPopup } from '@uninterface/uninterface/backend'
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  defineOptions({ inheritAttrs: false })
  import { ref as navigationRef } from 'vue'
  import {
    useUiNavigationPresentation,
    useUiOverlayTarget,
  } from '@uninterface/uninterface/backend'

  import type { UiNavMenuViewBinding } from '@uninterface/uninterface/backend'
  import NavigationTree from './NavigationTree.vue'
  import EntryBranch from './EntryBranch.vue'
  const props = defineProps<{ binding: UiNavMenuViewBinding }>()
  defineEmits<{
    activate: [key: string]
    expand: [key: string, open: boolean]
    retry: [key?: string]
  }>()
  const navigationSurface = navigationRef<HTMLElement>()
  const navigationOverlay = useUiOverlayTarget()
  const {
    hint,
    hintId,
    hintAnchor,
    events: navigationEvents,
  } = useUiNavigationPresentation(() => props.binding, navigationSurface)
  useUiZPopup(
    () =>
      typeof document === 'undefined'
        ? undefined
        : document.getElementById(hintId),
    {
      tooltip: {
        anchor: () => hintAnchor.value,
        visible: () => Boolean(hint.value),
      },
      source: 'navigation hint',
    },
  )
</script>
<template>
  <div
    ref="navigationSurface"
    class="vuetify-navigation-surface"
    :data-navigation-mode="binding.presentation"
    :data-navigation-boundary="
      binding.boundary ??
      (binding.presentation === 'horizontal' ? 'block-end' : 'inline-end')
    "
    v-bind="{ ...$attrs, ...navigationEvents }"
  >
    <component
      :is="
        binding.presentation === 'vertical-tree' ? NavigationTree : EntryBranch
      "
      :class="
        binding.presentation === 'horizontal'
          ? 'vuetify-entry-navigation'
          : undefined
      "
      navigation
      :presentation="binding.presentation"
      :entries="binding.entries"
      :status="binding.status"
      :label="binding.label"
      @activate="$emit('activate', $event)"
      @expand="(key, open) => $emit('expand', key, open)"
      @retry="$emit('retry', $event)"
    >
      <template #entry="scope">
        <slot
          name="entry"
          v-bind="scope"
        />
      </template>
      <template #icon="scope">
        <slot
          name="icon"
          v-bind="scope"
        />
      </template>
    </component>
  </div>
  <Teleport :to="navigationOverlay ?? 'body'">
    <span
      v-if="hint"
      :id="hintId"
      role="tooltip"
      class="vuetify-navigation-hint"
      :style="{ left: `${hint.x}px`, top: `${hint.y}px` }"
    >
      {{ hint.label }}
    </span>
  </Teleport>
</template>
