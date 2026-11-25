<script setup lang="ts">
  import {
    useUiDrawerLayoutView,
    type UiDrawerLayoutViewProps,
  } from '@uninterface/uninterface/backend'
  import DrawerDock from './DrawerDock.vue'
  import { useUiZPart } from '@uninterface/uninterface/backend'
  const vUiZPart = useUiZPart()
  const props = defineProps<UiDrawerLayoutViewProps>()
  const { root, style, mainStyle, drawerStyle } = useUiDrawerLayoutView(props)
</script>
<template>
  <div
    ref="root"
    class="vuetify-drawer-layout"
    data-ui-drawer-layout
    :style="style"
  >
    <div
      v-ui-z-part="zItems?.main"
      :style="mainStyle"
    >
      <slot name="main" />
    </div>
    <DrawerDock
      v-ui-z-part="zItems?.drawer"
      :edge="edge"
      :style="drawerStyle"
    >
      <slot name="drawer" />
    </DrawerDock>
  </div>
</template>
