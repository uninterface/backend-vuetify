<script setup lang="ts">
  import { useUiZPart } from '@uninterface/uninterface/backend'
  const vUiZPart = useUiZPart()
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import {
    computed,
    shallowRef,
    useTemplateRef,
    watchPostEffect,
    type CSSProperties,
  } from 'vue'
  import {
    flowSpacerItemStyle,
    flowSpacerLayoutStyle,
    startEndLayoutItemStyle,
    UiLayoutSeparators,
    useUiLayoutResizeView,
  } from '@uninterface/uninterface/backend'
  import { uiFocusPresentation } from './focus'
  import type { UiLayoutViewBinding } from '@uninterface/uninterface/backend'
  import { uiLayoutPresentation } from './layout'
  const props = defineProps<{ binding: UiLayoutViewBinding }>()
  const spacing = computed(
    () =>
      (props.binding.density &&
        uiLayoutPresentation.peerSpacingLevels?.[props.binding.density]) ||
      uiLayoutPresentation.peerSpacing,
  )
  const gapProbe = useTemplateRef('gapProbe')
  const gap = shallowRef({ row: '0px', column: '0px' })
  const spacerGap = computed(() =>
    props.binding.direction === 'vertical' ? gap.value.row : gap.value.column,
  )
  watchPostEffect((onCleanup) => {
    const probe = gapProbe.value
    const win = probe?.ownerDocument.defaultView
    if (!probe || !win) return

    // Vuetify generates ga-* from its Sass spacing map. Observe the inherited
    // gaps even when a theme change leaves the layout's own size untouched.
    // https://github.com/vuetifyjs/vuetify/blob/v4.2.5/packages/vuetify/src/styles/settings/_utilities.scss
    const measure = () => {
      const { rowGap, columnGap } = win.getComputedStyle(probe)
      gap.value = {
        row: rowGap === 'normal' ? '0px' : rowGap,
        column: columnGap === 'normal' ? '0px' : columnGap,
      }
    }
    measure()
    if (!win.ResizeObserver) return
    const observer = new win.ResizeObserver(measure)
    observer.observe(probe)
    onCleanup(() => observer.disconnect())
  })
  const { resizeRoot, itemId, boundaryAfter, onKeydown, onPointerdown } =
    useUiLayoutResizeView(() => props.binding)
  const framingAfter = (key: string) =>
    props.binding.framing?.boundaries.find((boundary) => boundary.first === key)
  const raisedEdges = (key: string) =>
    props.binding.framing?.boundaries
      .filter((boundary) => boundary.raised === key)
      .map((boundary) => ({
        ...boundary,
        edge: boundary.first === key ? 'after' : 'before',
      }))
  const style = computed<CSSProperties>(() => {
    const b = props.binding
    // Content rows retain their intrinsic height in a bounded scrollport.
    // `auto` may shrink toward the allocation wrapper's zero minimum height.
    const contentTrack = b.direction === 'vertical' ? 'max-content' : 'auto'
    const shares =
      b.division === 'content'
        ? b.items.map(() => contentTrack)
        : b.division === 'equal'
          ? b.items.map(() => 'minmax(0, 1fr)')
          : b.division.map((value, index) =>
              b.resizeSizes?.[b.items[index]!] !== undefined
                ? `${b.resizeSizes[b.items[index]!]!}px`
                : value === 'content'
                  ? contentTrack
                  : `minmax(0, ${value}fr)`,
            )
    const tracks = shares.flatMap((share, index) => {
      if (index === b.items.length - 1) return [share]
      if (boundaryAfter(b.items[index]!))
        return [share, 'var(--vuetify-layout-handle-size)']
      if (
        framingAfter(b.items[index]!)?.separator &&
        !framingAfter(b.items[index]!)?.raised
      )
        return [share, 'var(--vuetify-layout-separator-size)']
      return [share]
    })
    // The other axis stays reachable via scrolling if it also overflows a scrollport.
    const scrolling = b.scroll !== 'none' || b.resizeOverflow
    return {
      isolation: b.framing ? 'isolate' : undefined,
      gap: b.spacing === 'none' ? 0 : spacing.value.gap,
      display: b.wrap ? 'flex' : 'grid',
      flexWrap: b.wrap ? 'wrap' : undefined,
      // Content-sized tracks stay together instead of stretching along the flow.
      justifyContent:
        !b.wrap && b.direction === 'horizontal' && b.division === 'content'
          ? 'start'
          : undefined,
      alignContent:
        b.wrap || (b.direction === 'vertical' && b.division === 'content')
          ? 'start'
          : undefined,
      alignItems: b.direction === 'horizontal' ? b.align : 'stretch',
      justifyItems: b.direction === 'vertical' ? b.align : 'stretch',
      gridTemplateColumns: b.wrap
        ? undefined
        : b.direction === 'horizontal'
          ? tracks.join(' ') || 'none'
          : 'minmax(0, 1fr)',
      gridTemplateRows: b.wrap
        ? undefined
        : b.direction === 'vertical'
          ? tracks.join(' ') || 'none'
          : 'minmax(0, 1fr)',
      width: b.width === 'full' ? '100%' : 'fit-content',
      height: b.height === 'full' ? '100%' : 'auto',
      overflowX: scrolling ? 'auto' : 'visible',
      overflowY: scrolling ? 'auto' : 'visible',
      ...flowSpacerLayoutStyle(b),
    }
  })
</script>
<template>
  <div
    ref="resizeRoot"
    class="vuetify-layout"
    :class="binding.spacing === 'none' ? undefined : spacing.class"
    :style="style"
    :data-scroll="
      binding.scroll !== 'none' || binding.resizeOverflow ? '' : undefined
    "
    :role="
      binding.scroll !== 'none' || binding.resizeOverflow ? 'region' : undefined
    "
    :aria-label="
      binding.scroll !== 'none' || binding.resizeOverflow
        ? binding['aria-label']
        : undefined
    "
    :tabindex="
      binding.scroll !== 'none' || binding.resizeOverflow ? 0 : undefined
    "
  >
    <template
      v-for="key in binding.items"
      :key="key"
    >
      <div
        :id="itemId(key)"
        v-ui-z-part="binding.zItems?.[key]"
        class="vuetify-layout-item"
        :data-layout-region="binding.framing ? key : undefined"
        :data-raised="binding.framing?.regions[key]?.raised || undefined"
        :data-ui-flow-spacer="binding.spacers?.includes(key) || undefined"
        :aria-hidden="binding.spacers?.includes(key) || undefined"
        :style="
          binding.framing
            ? {
                position: 'relative',
              }
            : (startEndLayoutItemStyle(binding, key) ??
              flowSpacerItemStyle(binding, key, spacerGap))
        "
      >
        <slot :name="key" />
        <span
          v-for="edge in raisedEdges(key)"
          :key="edge.edge"
          class="vuetify-layout-edge"
          :data-edge="edge.edge"
          :data-boundary-role="edge.role"
          :data-resizable="Boolean(boundaryAfter(edge.first)) || undefined"
          :data-direction="binding.direction"
          aria-hidden="true"
        >
          <span class="vuetify-layout-edge-shadow elevation-4" />
        </span>
      </div>
      <div
        v-if="boundaryAfter(key)"
        class="vuetify-layout-resizer"
        :data-boundary-role="framingAfter(key)?.role"
        :class="uiFocusPresentation.class"
        v-ui-z-part="binding.zResize"
        role="separator"
        tabindex="0"
        :aria-label="boundaryAfter(key)!.label"
        :aria-orientation="
          binding.direction === 'horizontal' ? 'vertical' : 'horizontal'
        "
        :aria-controls="itemId(key)"
        :aria-valuemin="Math.round(boundaryAfter(key)!.min * 100) / 100"
        :aria-valuemax="Math.round(boundaryAfter(key)!.max * 100) / 100"
        :aria-valuenow="Math.round(boundaryAfter(key)!.value * 100) / 100"
        @keydown="onKeydown($event, boundaryAfter(key)!)"
        @pointerdown="onPointerdown($event, boundaryAfter(key)!)"
      />
      <div
        v-else-if="framingAfter(key)?.separator && !framingAfter(key)?.raised"
        class="vuetify-layout-separator"
        :data-boundary-role="framingAfter(key)?.role"
        aria-hidden="true"
      />
    </template>
    <UiLayoutSeparators
      v-if="binding.separators?.length"
      :root="resizeRoot"
      :binding="binding"
      :item-id="itemId"
      color="rgba(var(--v-border-color), var(--v-border-opacity))"
      thickness="var(--vuetify-layout-separator-size)"
    />
    <div
      v-if="binding.spacers?.length && binding.items.length > 1"
      ref="gapProbe"
      class="vuetify-layout-gap-probe"
      aria-hidden="true"
    />
  </div>
</template>
