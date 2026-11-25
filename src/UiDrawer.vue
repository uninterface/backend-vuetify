<script setup lang="ts">
  import { ref, useAttrs, useSlots } from 'vue'
  import {
    useUiZView,
    useUiOverlayHost,
    useUiOverlayTarget,
    type UiOverlayViewProps,
    type UiModalViewHandle,
  } from '@uninterface/uninterface/backend'
  import type { UiOverlayCloseTrigger } from '@uninterface/uninterface'
  import OverlaySurface from './OverlaySurface.vue'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiOverlayViewProps>()
  const emit = defineEmits<{
    cancel: [reason: UiOverlayCloseTrigger]
    'update:expanded': [expanded: boolean]
    failure: [error: unknown]
  }>()
  const { trigger, anchor, buttonTrigger, anchorBinding } = useUiOverlayHost(
    props,
    emit,
  )
  if (!props.modal)
    useUiZView({
      targets: () =>
        [
          trigger.value,
          props.docked
            ? (surface.value as unknown as { element?: HTMLElement })?.element
            : undefined,
        ].filter((el): el is HTMLElement => !!el),
    })
  const portal = useUiOverlayTarget()
  const surface = ref<UiModalViewHandle>()
  const attrs = useAttrs(),
    slots = useSlots()
  defineExpose({
    async open() {
      if (!surface.value) throw new Error('Overlay surface is not mounted.')
      await surface.value.open()
    },
    async close() {
      await surface.value?.close()
    },
  })
</script>
<template>
  <slot
    name="host"
    :button-trigger="buttonTrigger"
    :anchor="anchorBinding"
  />
  <Teleport
    :to="portal ?? 'body'"
    :disabled="!portal || docked"
  >
    <OverlaySurface
      v-if="mounted"
      ref="surface"
      v-bind="{ ...attrs, ...props }"
      kind="drawer"
      :anchor="anchor"
      :trigger="trigger"
      @cancel="emit('cancel', $event)"
      @failure="emit('failure', $event)"
    >
      <template
        v-for="(_, name) in slots"
        #[name]="scope"
      >
        <slot
          v-if="name !== 'host'"
          :name="name"
          v-bind="scope"
        />
      </template>
    </OverlaySurface>
  </Teleport>
</template>
