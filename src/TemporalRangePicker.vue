<script setup lang="ts">
  import { useUiZPopup } from '@uninterface/uninterface/backend'
  import { popupTarget } from './zOrder'
  import {
    computed,
    nextTick,
    onDeactivated,
    ref,
    shallowRef,
    watch,
  } from 'vue'
  import { useDate } from 'vuetify'
  import { VMenu } from 'vuetify/components/VMenu'
  import { VBtn } from 'vuetify/components/VBtn'
  import { VCard } from 'vuetify/components/VCard'
  import { VDatePicker } from 'vuetify/components/VDatePicker'
  import { useUiI18n } from '@uninterface/uninterface'
  import {
    useUiControlFrameParticipant,
    useUiOverlayTarget,
    type UiTemporalEditorViewProps,
  } from '@uninterface/uninterface/backend'
  import TemporalIcon from './TemporalIcon.vue'
  const props = defineProps<
    Omit<UiTemporalEditorViewProps, 'kind' | 'value' | 'update'> & {
      value: { start: string; end: string }
      update(value: { start: string; end: string }): void
    }
  >()
  const adapter = useDate()
  const portal = useUiOverlayTarget()
  const i18n = useUiI18n()
  const open = ref(false)
  const menu = ref<InstanceType<typeof VMenu>>()
  const draft = shallowRef<unknown[]>([])
  const { setEngaged } = useUiControlFrameParticipant({
    focus: async () => null,
  })
  watch(open, setEngaged, { flush: 'sync' })
  const pickerLabel = computed(
    () =>
      i18n.text({ namespace: 'uninterface', key: 'pickDate' }) +
      (props.label ? ' — ' + props.label : ''),
  )
  function nativeDate(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
    const date = adapter.date(value)
    // The text draft owns invalid dates; do not let a native adapter repair them.
    return date != null &&
      adapter.isValid(date) &&
      adapter.toISO(date) === value
      ? date
      : null
  }
  function sync() {
    const pair = [nativeDate(props.value.start), nativeDate(props.value.end)]
    draft.value = pair.every((value) => value != null) ? pair : []
  }
  watch([() => props.value.start, () => props.value.end], sync, {
    immediate: true,
  })
  watch(open, (visible) => {
    if (visible) sync()
  })
  function close() {
    open.value = false
    void nextTick(() => menu.value?.activatorEl?.focus())
  }
  function choose(value: unknown) {
    if (props.binding.disabled || props.readonly || !Array.isArray(value))
      return
    // Vuetify emits [] on a second click of the same day. With no native
    // clear action here, that means completion of our inclusive one-day range.
    const pair =
      value.length === 0 && draft.value.length === 1
        ? [draft.value[0], draft.value[0]]
        : value
    if (!pair.every((date) => date != null && adapter.isValid(date))) return
    draft.value = pair
    if (pair.length !== 2) return
    const [start, end] = pair.map((date) => adapter.toISO(date))
    if (!props.eligible(start!) || !props.eligible(end!)) return
    props.update({ start: start!, end: end! })
    void nextTick(() => props.blur())
    close()
  }
  watch(
    () => [props.binding.disabled, props.readonly],
    () => {
      if (props.binding.disabled || props.readonly) open.value = false
    },
  )
  onDeactivated(() => {
    open.value = false
  })
  defineExpose({
    show() {
      if (!props.binding.disabled && !props.readonly) open.value = true
    },
  })
  useUiZPopup(() => popupTarget(menu.value?.contentEl))
</script>
<template>
  <VMenu
    ref="menu"
    v-model="open"
    :attach="portal"
    :close-on-content-click="false"
    :disabled="binding.disabled || readonly"
    location="bottom start"
  >
    <template #activator="{ props: activator }">
      <VBtn
        v-bind="activator"
        type="button"
        icon
        variant="text"
        size="small"
        :disabled="binding.disabled || readonly"
        :aria-label="pickerLabel"
        aria-haspopup="dialog"
        :aria-expanded="open"
        data-temporal-trigger
        data-temporal-range-trigger
        @keydown.esc.stop.prevent="close"
      >
        <TemporalIcon />
      </VBtn>
    </template>
    <VCard
      v-if="open"
      role="dialog"
      :aria-label="pickerLabel"
      data-temporal-popup
      data-temporal-range-popup
      @keydown.esc.stop.prevent="close"
    >
      <VDatePicker
        :model-value="draft"
        multiple="range"
        hide-header
        :allowed-dates="
          (value: unknown) => eligible(adapter.toISO(adapter.date(value)))
        "
        @update:model-value="choose"
      />
    </VCard>
  </VMenu>
</template>
