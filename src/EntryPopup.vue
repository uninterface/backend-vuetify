<script setup lang="ts">
  import { useUiZPopup } from '@uninterface/uninterface/backend'
  import { popupTarget } from './zOrder'
  import { useUiOverlayTarget } from '@uninterface/uninterface/backend'
  const overlayTarget = useUiOverlayTarget()
  import {
    useUiMenuPopup,
    useUiMenuPoint,
  } from '@uninterface/uninterface/backend'
  import { VSheet } from 'vuetify/components/VSheet'
  import { VLocaleProvider } from 'vuetify/components/VLocaleProvider'
  import { VMenu } from 'vuetify/components/VMenu'
  import { nextTick, onMounted, onBeforeUnmount, ref } from 'vue'
  import { useNativeDirection } from './nativeDirection'
  const props = defineProps<{
    anchor?: HTMLElement
    point?: { x: number; y: number }
    side?: boolean
    navigation?: boolean
  }>()
  const emit = defineEmits<{ close: [] }>()
  const surface = ref<HTMLElement>()
  const popup = useUiMenuPopup(surface)
  useUiZPopup(() => popupTarget(surface.value), {
    scope: true,
    source: 'menu popup',
  })
  const effectivePoint = useUiMenuPoint(
    () => props.point,
    () => props.anchor,
  )
  const direction = useNativeDirection(() => props.anchor)
  let disposed = false
  function focus() {
    nextTick(() => {
      // Native entry transitions initially hide the popup. Retry when shown,
      // without taking focus back from a registered (possibly teleported) child.
      if (disposed || popup.contains(document.activeElement)) return
      ;(
        surface.value?.querySelector<HTMLElement>(
          '[role^="menuitem"]:not([disabled]):not([aria-disabled="true"]), a[href]:not([aria-disabled="true"]), button:not([disabled])',
        ) ??
        surface.value?.querySelector<HTMLElement>('[role="menu"]') ??
        surface.value
      )?.focus()
    })
  }
  function keyboard(event: KeyboardEvent) {
    if (props.navigation && event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      emit('close')
      nextTick(() => props.anchor?.focus())
    }
  }
  onMounted(focus)
  onBeforeUnmount(() => {
    disposed = true
  })
</script>
<template>
  <VLocaleProvider :rtl="direction === 'rtl'">
    <VMenu
      :model-value="true"
      :target="effectivePoint ? [effectivePoint.x, effectivePoint.y] : anchor"
      :open-on-click="false"
      :open-on-hover="false"
      :open-on-focus="false"
      :close-on-content-click="false"
      :attach="overlayTarget ?? false"
      :location="
        side
          ? direction === 'rtl'
            ? 'left top'
            : 'right top'
          : direction === 'rtl'
            ? 'bottom right'
            : 'bottom left'
      "
      :submenu="side"
      :retain-focus="false"
      @after-enter="focus"
      @update:model-value="
        (open: boolean) => {
          if (!open) emit('close')
        }
      "
    >
      <VSheet
        :ref="
          (instance: any) => {
            surface = instance?.$el
          }
        "
        :dir="direction"
        @keydown="keyboard"
      >
        <slot />
      </VSheet>
    </VMenu>
  </VLocaleProvider>
</template>
