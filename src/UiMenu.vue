<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { uiFocusPresentation } from './focus'
  import {
    useUiMenuView,
    type UiMenuViewBinding,
  } from '@uninterface/uninterface/backend'
  import EntryBranch from './EntryBranch.vue'
  import EntryPopup from './EntryPopup.vue'
  const props = defineProps<{ binding: UiMenuViewBinding }>()
  const emit = defineEmits<{
    open: []
    close: []
    activate: [key: string]
    expand: [key: string, open: boolean]
    retry: [key?: string]
  }>()
  const {
    host,
    surface,
    id,
    anchor,
    point,
    hostBindings,
    expanded,
    activated,
    close,
    first,
  } = useUiMenuView(() => props.binding, emit, {
    // VList owns movement within a list; core's helper supplements branch,
    // typeahead and host dismissal behavior across lazily mounted popups.
    contextTriggerClass: uiFocusPresentation.class,
    nativeInteraction: (event) =>
      !event || ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key),
  })
</script>
<template>
  <div
    ref="host"
    class="vuetify-entry-host"
  >
    <slot
      v-if="binding.mode === 'popup'"
      name="host"
      v-bind="hostBindings"
    />

    <component
      :is="binding.mode === 'popup' ? EntryPopup : 'div'"
      v-if="binding.open"
      :anchor="anchor"
      :point="point"
      @close="close(false)"
    >
      <div
        ref="surface"
        class="vuetify-entry-surface"
      >
        <EntryBranch
          :id="id"
          :entries="binding.entries"
          :status="binding.status"
          :label="binding.label"
          :tabindex="binding.mode === 'inline' ? 0 : -1"
          @focus="
            (event: FocusEvent) => {
              if (event.target === event.currentTarget) first()?.focus()
            }
          "
          @activate="activated"
          @expand="expanded"
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
        </EntryBranch>
      </div>
    </component>
  </div>
</template>
