<script setup lang="ts">
  import { useUiZPopup } from '@uninterface/uninterface/backend'
  import { popupTarget } from './zOrder'
  import { onDeactivated, onScopeDispose } from 'vue'
  import { computed, ref, watch, nextTick } from 'vue'
  import type { UiTemporalEditorViewProps } from '@uninterface/uninterface/backend'
  import { useUiI18n } from '@uninterface/uninterface'
  import { useUiOverlayTarget } from '@uninterface/uninterface/backend'
  import { VMenu } from 'vuetify/components/VMenu'
  import TemporalIcon from './TemporalIcon.vue'
  import { VBtn } from 'vuetify/components/VBtn'
  import { VCard } from 'vuetify/components/VCard'
  const portal = useUiOverlayTarget()
  const props = defineProps<UiTemporalEditorViewProps>()
  const menu = ref<InstanceType<typeof VMenu>>()
  function close() {
    open.value = false
    void nextTick(() => menu.value?.activatorEl?.focus())
  }
  function dismiss(event: KeyboardEvent) {
    if (event.key !== 'Escape' || !open.value) return
    event.preventDefault()
    event.stopPropagation()
    close()
  }
  const open = ref(false),
    i18n = useUiI18n()
  const pickerLabel = computed(() =>
    i18n.text({
      namespace: 'uninterface',
      key:
        props.kind === 'date'
          ? 'pickDate'
          : props.kind === 'time'
            ? 'pickTime'
            : 'pickDateTime',
    }),
  )
  const draftDate = ref(''),
    draftTime = ref('')
  function syncDraft(value: string) {
    draftDate.value = props.kind === 'time' ? '' : (value.split('T')[0] ?? '')
    draftTime.value =
      props.kind === 'time' ? value : (value.split('T')[1] ?? '')
  }
  watch(() => props.value, syncDraft, { immediate: true })
  watch(open, (visible) => {
    if (visible) syncDraft(props.value)
  })
  const date = computed(() => draftDate.value)
  const clock = computed(() => draftTime.value)
  // VTimePicker accepts whole seconds only. Invalid/extended drafts must not
  // enter its clock arithmetic; keep those drafts in the owning text editor.
  const nativeClock = computed(() => {
    const value = clock.value.split('.')[0]
    return /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value)
      ? value
      : undefined
  })
  function chosen(value: string) {
    if (props.binding.disabled || props.readonly) return
    if (props.eligible(value)) {
      props.update(value)
      void nextTick(() => props.blur())
      if (props.kind === 'date') close()
    }
  }
  function chooseDate(value: string) {
    draftDate.value = value
    if (props.kind === 'datetime') {
      if (clock.value) chosen(value + 'T' + clock.value)
    } else chosen(value)
  }
  function chooseTime(value: string) {
    if (props.precision === 'millisecond' && !value.includes('.'))
      value += clock.value.match(/\.\d{1,3}$/)?.[0] ?? '.000'
    draftTime.value = value
    if (props.kind === 'datetime') {
      if (date.value) chosen(date.value + 'T' + value)
    } else chosen(value)
  }
  import { VDatePicker } from 'vuetify/components/VDatePicker'
  import { VTimePicker } from 'vuetify/components/VTimePicker'
  function dateString(value: any) {
    const date = value instanceof Date ? value : new Date(value)
    return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
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
  const emit = defineEmits<{ 'open-change': [open: boolean] }>()
  watch(open, (value) => emit('open-change', value), { flush: 'sync' })
  onScopeDispose(() => emit('open-change', false))
  useUiZPopup(() => popupTarget(menu.value?.contentEl))
</script>
<template>
  <VMenu
    ref="menu"
    v-model="open"
    :content-props="{ onKeydownCapture: dismiss }"
    :attach="portal"
    :close-on-content-click="false"
    :disabled="binding.disabled || readonly"
    location="bottom start"
  >
    <template #activator="{ props: activator }">
      <VBtn
        v-bind="activator"
        @mousedown.stop
        @keydown.capture="dismiss"
        icon
        variant="text"
        size="small"
        :disabled="binding.disabled || readonly"
        :aria-label="pickerLabel + (label ? ' — ' + label : '')"
        aria-haspopup="dialog"
        :aria-expanded="open"
        data-temporal-trigger
      >
        <TemporalIcon :time="kind === 'time'" />
      </VBtn>
    </template>
    <VCard
      role="dialog"
      :aria-label="pickerLabel"
      data-temporal-popup
    >
      <VDatePicker
        v-if="kind !== 'time'"
        :model-value="date"
        hide-header
        :allowed-dates="
          kind === 'date'
            ? (value: any) => eligible(dateString(value))
            : undefined
        "
        @update:model-value="chooseDate(dateString($event))"
      />
      <VTimePicker
        v-if="kind !== 'date'"
        :model-value="nativeClock"
        :format="presentation?.hourCycle === 'h12' ? 'ampm' : '24hr'"
        :use-seconds="precision !== 'minute'"
        @update:model-value="chooseTime(String($event ?? ''))"
      />
    </VCard>
  </VMenu>
</template>
