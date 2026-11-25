<script setup lang="ts">
  import {
    useUiCollectionBadgeReorder,
    type UiCollectionBadgeReorder,
  } from '@uninterface/uninterface/backend'
  import { ref } from 'vue'
  import { VChip } from 'vuetify/components/VChip'
  const props = defineProps<{
    label: string
    removeLabel: string
    disabled: boolean
    reorder?: UiCollectionBadgeReorder
  }>()
  const chip = ref<InstanceType<typeof VChip>>()
  defineExpose({
    focus() {
      if (!props.disabled)
        chip.value?.$el.querySelector('button.v-chip__close')?.focus()
    },
  })
  const reorderBody = ref<HTMLElement>()
  const reorderView = useUiCollectionBadgeReorder(reorderBody, () => props)
  const emit = defineEmits<{ remove: [] }>()
  function remove() {
    if (!props.disabled) emit('remove')
  }
</script>
<template>
  <VChip
    ref="chip"
    class="vuetify-query-badge"
    :model-value="true"
    @update:model-value="() => {}"
    closable
    :close-label="removeLabel"
    :disabled="disabled"
    :link="false"
    :ripple="false"
    role="group"
    :aria-label="label"
    @click:close="remove"
  >
    <span
      ref="reorderBody"
      class="vuetify-query-badge-content"
      v-bind="reorderView.bindings.value"
    >
      <slot />
    </span>
    <span
      v-if="reorder"
      class="vuetify-query-badge-announcement"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ reorderView.announcement.value }}
    </span>
    <template #close><slot name="remove" /></template>
  </VChip>
</template>
