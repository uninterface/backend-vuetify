<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { shallowRef } from 'vue'
  import { useUiLoadingSurface } from '@uninterface/uninterface/backend'
  import LoadingRegion from './UiLoadingRegion.vue'
  defineOptions({ inheritAttrs: false })
  const loadingHost = shallowRef<HTMLElement | { $el: HTMLElement }>()
  const loadingSurface = useUiLoadingSurface(() => loadingHost.value)
  import { VDivider } from 'vuetify/components/VDivider'
  import { VSheet } from 'vuetify/components/VSheet'
  import type { UiCardViewProps } from '@uninterface/uninterface/backend'
  defineProps<UiCardViewProps>()
</script>
<template>
  <VSheet
    ref="loadingHost"
    v-bind="$attrs"
    class="vuetify-card"
    :data-card-body="bodyLayout ? 'layout' : undefined"
    :data-card-top-end="$slots['top-end'] ? '' : undefined"
    :data-card-level="level"
    :data-card-header="treatment.header"
    :data-card-footer="treatment.footer"
    :data-card-density="treatment.density"
    :data-card-surface="treatment.surface"
    :data-card-elevation="treatment.elevation"
    :data-card-border="treatment.border"
    :data-card-title-size="treatment.titleSize"
    :style="{
      '--vuetify-card-accent': color
        ? `rgb(var(--v-theme-${color === 'danger' ? 'error' : color}))`
        : 'rgba(var(--v-border-color), var(--v-border-opacity))',
    }"
    border
    rounded="lg"
    :elevation="treatment.elevation === 'raised' ? 4 : 0"
  >
    <div
      v-if="$slots.header || $slots.title || $slots.description"
      key="header"
      class="vuetify-card-header"
    >
      <slot name="header">
        <div
          v-if="$slots.title"
          class="vuetify-card-title"
        >
          <slot name="title" />
        </div>
        <div
          v-if="$slots.description"
          class="vuetify-card-description"
        >
          <slot name="description" />
        </div>
      </slot>
    </div>
    <div
      key="body"
      class="vuetify-card-body"
    >
      <slot />
    </div>
    <div
      v-if="$slots.footer"
      key="footer"
      class="vuetify-card-footer"
    >
      <VDivider
        role="presentation"
        :variant="treatment.border === 'double' ? 'solid' : treatment.border"
      />
      <div class="vuetify-card-footer-content"><slot name="footer" /></div>
    </div>
    <div
      v-if="$slots['top-end']"
      key="top-end"
      class="vuetify-card-top-end"
    >
      <slot name="top-end" />
    </div>
  </VSheet>
  <LoadingRegion
    :surface="loadingSurface"
    :loading="loading"
    :label="loadingLabel"
  />
</template>
