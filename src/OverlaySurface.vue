<script setup lang="ts">
  import DrawerDepth from './DrawerDepth.vue'
  import FooterActions from './FooterActions.vue'
  import {
    useUiOverlayView,
    useUiDrawerResize,
    createUiModalCssMotion,
    type UiOverlayViewProps,
  } from '@uninterface/uninterface/backend'
  import type { UiOverlayCloseTrigger } from '@uninterface/uninterface'
  import { uiFocusPresentation } from './focus'
  import { VCard, VCardText, VCardActions } from 'vuetify/components/VCard'
  import { VBtn } from 'vuetify/components/VBtn'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<
    UiOverlayViewProps & {
      kind: 'drawer' | 'popover'
      anchor?: HTMLElement
      trigger?: HTMLElement
    }
  >()
  const emit = defineEmits<{
    cancel: [reason: UiOverlayCloseTrigger]
    'update:expanded': [expanded: boolean]
    failure: [error: unknown]
  }>()
  const {
    surface,
    visible,
    cssPanel,
    heading,
    open,
    close,
    widthStyle,
    cancel,
    pointerdown,
    click,
  } = useUiOverlayView(
    () => props,
    props.kind,
    () => props.anchor,
    () => props.trigger,
    emit,
    props.kind === 'drawer' ? createUiModalCssMotion('vuetify-drawer') : {},
  )
  const resize = useUiDrawerResize(() => props, surface)
  defineExpose({ open, close, element: surface })
</script>
<template>
  <component
    v-bind="$attrs"
    :is="modal ? 'dialog' : 'div'"
    :role="modal ? undefined : 'dialog'"
    :id="`${id}-surface`"
    ref="surface"
    :popover="modal || docked || cssPanel ? undefined : 'manual'"
    :inert="!active || undefined"
    :class="['vuetify-modal', 'vuetify-overlay']"
    :style="[
      widthStyle,
      drawerSizing
        ? ['start', 'end'].includes(edge)
          ? { width: `${drawerSizing.extent}px` }
          : { height: `${drawerSizing.extent}px` }
        : undefined,
      kind === 'drawer' ? resize.style() : undefined,
    ]"
    :data-docked="docked || undefined"
    :data-css-panel="cssPanel || undefined"
    :hidden="((docked || cssPanel) && !active && !visible) || undefined"
    :data-ui-overlay="kind"
    :data-edge="edge"
    :data-panel="panel || undefined"
    :aria-modal="modal ? true : undefined"
    :aria-labelledby="title ? `${id}-title` : undefined"
    :aria-label="title ? undefined : name"
    @cancel="cancel"
    @pointerdown="pointerdown"
    @click="click"
  >
    <VCard
      class="vuetify-modal-surface"
      :elevation="5"
    >
      <header
        v-if="
          title || closeOn.includes('close-button') || $slots['header-extra']
        "
        class="vuetify-modal-header pa-4"
      >
        <div class="vuetify-overlay-heading">
          <h2
            v-if="title"
            :id="`${id}-title`"
            ref="heading"
            tabindex="-1"
            v-bind="uiFocusPresentation"
          >
            {{ title }}
          </h2>
          <VBtn
            v-if="closeOn.includes('close-button')"
            icon="$close"
            variant="text"
            :aria-label="closeLabel"
            :disabled="pendingClose || disabled"
            @click="emit('cancel', 'close-button')"
          />
        </div>
        <slot name="header-extra" />
      </header>
      <VCardText
        class="vuetify-modal-body"
        :ref="!title ? (el: any) => (heading = el?.$el ?? el) : undefined"
        role="region"
        tabindex="0"
        :aria-label="name"
        v-bind="uiFocusPresentation"
      >
        <slot />
      </VCardText>
      <VCardActions
        v-if="$slots.actions || $slots.footer"
        class="vuetify-modal-footer"
      >
        <FooterActions v-if="$slots.actions">
          <slot name="actions" />
        </FooterActions>
        <slot
          v-else
          name="footer"
        />
      </VCardActions>
    </VCard>
    <DrawerDepth
      v-if="kind === 'drawer' && !docked"
      :edge="edge"
    />
    <div
      v-if="drawerSizing?.enabled"
      class="vuetify-drawer-resize"
      v-bind="resize.attributes()"
    />
  </component>
</template>
