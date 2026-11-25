<script setup lang="ts">
  import { shallowRef } from 'vue'
  import {
    useUiZView,
    useUiCollectionFooterLayout,
  } from '@uninterface/uninterface/backend'
  useUiZView()
  const host = shallowRef<HTMLElement>()
  const slots = defineSlots<{
    info?: () => unknown
    size?: () => unknown
    paginator?: () => unknown
    jumper?: () => unknown
  }>()
  const order = ['size', 'info', 'paginator', 'jumper'] as const
  const layout = useUiCollectionFooterLayout(host, order, () =>
    order.filter((part) => Boolean(slots[part])),
  )
  const { split } = layout
</script>
<template>
  <div
    ref="host"
    class="vuetify-collection-footer"
    :data-compact="split ? '' : undefined"
  >
    <template
      v-for="part in layout.parts()"
      :key="part"
    >
      <span
        v-if="layout.start(part) && layout.row(part) > 0"
        class="vuetify-collection-footer-break"
        aria-hidden="true"
      />
      <div
        :data-footer-part="part"
        :data-footer-row="layout.row(part)"
        :data-row-start="layout.start(part) ? '' : undefined"
        :data-row-end="layout.end(part) ? '' : undefined"
        :data-navigation-start="layout.sharedStart(part) ? '' : undefined"
        :class="`vuetify-collection-footer-${part}`"
        :style="{ flexBasis: layout.basis(part) }"
      >
        <slot :name="part" />
      </div>
    </template>
  </div>
</template>
