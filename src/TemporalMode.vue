<script setup lang="ts">
  import { useUiZPopup } from '@uninterface/uninterface/backend'
  import { popupTarget } from './zOrder'
  import { computed, ref, watch, onDeactivated, nextTick } from 'vue'
  import { VMenu } from 'vuetify/components/VMenu'
  import { VBtn } from 'vuetify/components/VBtn'
  import { VList, VListItem } from 'vuetify/components/VList'
  import {
    useUiControlFrameParticipant,
    useUiOverlayTarget,
    focusUiTarget,
    type UiTemporalBoundaryMode,
  } from '@uninterface/uninterface/backend'
  import TemporalRangeIcon from './TemporalRangeIcon.vue'
  const props = defineProps<{
    value: UiTemporalBoundaryMode
    modes: { value: UiTemporalBoundaryMode; label: string; symbol: string }[]
    label: string
    disabled: boolean
  }>()
  const emit = defineEmits<{ change: [value: UiTemporalBoundaryMode] }>()
  const menu = ref<InstanceType<typeof VMenu>>()
  const open = ref(false)
  const portal = useUiOverlayTarget()
  const focus = () =>
    focusUiTarget(
      () => menu.value?.activatorEl,
      () => props.disabled,
    )
  defineExpose({ focus })
  const { setEngaged } = useUiControlFrameParticipant({
    focus: async () => null,
  })
  watch(open, setEngaged, { flush: 'sync' })
  watch(
    () => props.disabled,
    (disabled) => {
      if (disabled) open.value = false
    },
  )
  onDeactivated(() => {
    open.value = false
  })
  const selected = computed(() =>
    props.modes.find((item) => item.value === props.value),
  )
  async function select(value: UiTemporalBoundaryMode) {
    if (props.disabled) return
    emit('change', value)
    open.value = false
    await nextTick()
    await focus()
  }
  useUiZPopup(() => popupTarget(menu.value?.contentEl))
</script>
<template>
  <VMenu
    ref="menu"
    v-model="open"
    :attach="portal"
    :disabled="disabled"
    location="bottom start"
  >
    <template #activator="{ props: activator }">
      <VBtn
        v-bind="activator"
        type="button"
        icon
        variant="text"
        size="small"
        :disabled="disabled"
        :aria-label="label + ': ' + selected?.label"
        :title="selected?.label"
        data-temporal-mode
      >
        <TemporalRangeIcon :mode="value" />
      </VBtn>
    </template>
    <VList
      role="menu"
      :aria-label="label"
      density="compact"
    >
      <VListItem
        v-for="item in modes"
        :key="item.value"
        :title="item.label"
        :active="item.value === value"
        :disabled="disabled"
        role="menuitemradio"
        :aria-checked="item.value === value"
        :data-temporal-mode-value="item.value"
        @click="select(item.value)"
      >
        <template #prepend>
          <TemporalRangeIcon
            :mode="item.value"
            data-temporal-mode-icon
          />
        </template>
      </VListItem>
    </VList>
  </VMenu>
</template>
