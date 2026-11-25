<script setup lang="ts">
  import { onDeactivated, shallowRef as zRef } from 'vue'
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { useUiOverlayTarget } from '@uninterface/uninterface/backend'
  const overlayTarget = useUiOverlayTarget()
  import { useUiFieldFailure } from '@uninterface/uninterface/backend'
  import { useUiFieldDescription } from '@uninterface/uninterface/backend'
  import { useControlSize } from './controlSize'
  import { focusUiTarget } from '@uninterface/uninterface/backend'
  import { VLocaleProvider } from 'vuetify/components/VLocaleProvider'
  import { useNativeDirection } from './nativeDirection'
  import { useFieldPresentation } from './fieldLayout'
  const { field, presentation, messageId, requiredMarker, requiredPrefix } =
    useFieldPresentation()
  import { useTargetListeners } from './targetListeners'
  const { surfaceAttributes, directive: vTargetListeners } =
    useTargetListeners()
  import { computed, nextTick, ref, watch, type Directive } from 'vue'
  import { VSelect } from 'vuetify/components/VSelect'
  import { selectEscape } from './selectEscape'
  import { VListItem, VListSubheader } from 'vuetify/components/VList'
  import type { UiSelectViewProps } from '@uninterface/uninterface/backend'
  defineOptions({ inheritAttrs: false })
  // Vuetify 4.2.5 copies its combobox role to both VField and the input.
  // Keep accessibility and popup state on the actual focusable target only.
  // Revisit this adapter workaround when upgrading the pinned toolkit.
  function repairCombobox(root: HTMLElement) {
    const input = root.querySelector<HTMLInputElement>('input[role="combobox"]')
    if (!input) return
    input.setAttribute('aria-haspopup', 'listbox')
    for (const wrapper of root.querySelectorAll<HTMLElement>('.v-field')) {
      for (const attribute of [
        'role',
        'aria-haspopup',
        'aria-expanded',
        'aria-controls',
        'aria-owns',
      ])
        wrapper.removeAttribute(attribute)
    }
  }
  const vComboboxTarget: Directive<HTMLElement> = {
    mounted(root) {
      void nextTick(() => repairCombobox(root))
    },
    updated(root) {
      void nextTick(() => repairCombobox(root))
    },
  }
  const props = defineProps<UiSelectViewProps>()
  const invalidPresentation = useUiFieldFailure(() => props.binding)
  const select = ref<InstanceType<typeof VSelect>>()
  const emit = defineEmits<{
    update: [value: string]
    blur: []
    requestLoad: []
  }>()
  watch(
    () => select.value?.isFocused,
    (focused, wasFocused) => {
      if (wasFocused && !focused) emit('blur')
    },
    { flush: 'post' },
  )
  const selection = computed(
    () =>
      props.options.find((option) => option.value === props.value) ?? {
        value: props.value,
        label: props.value,
      },
  )
  const items = computed(() => [
    ...props.options
      .filter((option) => props.available && !option.hidden)
      .map((option) => ({
        ...option,
        props: { disabled: Boolean(option.disabled || option.hidden) },
      })),
  ])
  const sourceDescription = computed(
    () =>
      [
        description.value,
        props.status.message ? `${props.binding.id}-source-status` : undefined,
      ]
        .filter(Boolean)
        .join(' ') || undefined,
  )
  function requestLoad() {
    if (!props.binding.disabled) emit('requestLoad')
  }
  function keydown(event: KeyboardEvent) {
    dismiss(event)
    if (
      ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'F4'].includes(
        event.key,
      ) ||
      (event.key.length === 1 && !event.ctrlKey && !event.metaKey)
    )
      requestLoad()
  }
  function update(value: unknown) {
    const key =
      typeof value === 'object' && value !== null && 'value' in value
        ? value.value
        : undefined
    const option = props.options.find((option) => option.value === key)
    if (
      !props.binding.disabled &&
      props.available &&
      option &&
      !option.disabled &&
      !option.hidden
    )
      emit('update', option.value)
  }
  const direction = useNativeDirection(() => select.value?.$el?.parentElement)
  defineExpose({
    focus: () =>
      focusUiTarget(
        () => select.value?.$el?.querySelector('input[role="combobox"]'),
        () => props.binding.disabled,
      ),
  })
  const description = useUiFieldDescription(() => props.binding, 'replace-help')
  const controlSize = useControlSize('UiSelect')
  import { useUiZPopup } from '@uninterface/uninterface/backend'
  import { popupTarget, controlledPopup } from './zOrder'
  useUiZPopup(() => controlledPopup(props.binding.id), {
    source: 'UiSelect choices',
  })
  const opened = zRef(false)
  const dismiss = selectEscape(opened, () =>
    select.value?.$el.querySelector('input[role="combobox"]'),
  )
  const menuProps = computed(() => ({
    attach: overlayTarget.value ?? false,
    contentProps: { onKeydownCapture: dismiss },
  }))
  onDeactivated(() => {
    opened.value = false
  })
</script>
<template>
  <VLocaleProvider :rtl="direction === 'rtl'">
    <div
      @pointerdown.capture="requestLoad"
      @keydown.capture="keydown"
    >
      <VSelect
        v-model:menu="opened"
        :density="controlSize"
        :class="{
          'vuetify-required-control': requiredMarker,
          'vuetify-required-prefix': requiredPrefix,
        }"
        ref="select"
        :menu-props="menuProps"
        v-combobox-target
        v-target-listeners
        v-bind="{ ...surfaceAttributes(), ...presentation }"
        :id="binding.id"
        :model-value="selection"
        return-object
        :items="items"
        item-title="label"
        item-value="value"
        :disabled="binding.disabled"
        :error="invalidPresentation"
        :loading="status.pending"
        :aria-busy="binding.validating || status.pending || undefined"
        :aria-required="binding.required || undefined"
        :aria-describedby="sourceDescription"
        :aria-invalid="binding.invalid || undefined"
        :rules="[]"
        @update:model-value="update"
        @update:menu="
          (open) => {
            if (open) requestLoad()
          }
        "
      >
        <template #no-data>
          <VListItem
            :title="status.message"
            role="status"
          />
        </template>
        <template #message="{ message }">
          <span :id="messageId">{{ message }}</span>
        </template>
        <template #item="{ item, props: itemProps, index }">
          <template v-if="!item.hidden">
            <VListSubheader
              v-if="item.group && item.group !== items[index - 1]?.group"
            >
              {{ item.group }}
            </VListSubheader>
            <VListItem
              v-bind="itemProps"
              :data-uninterface-key="item.value"
              role="option"
              :aria-disabled="item.props.disabled || undefined"
            />
          </template>
        </template>
        <template #selection="{ item }">{{ item.label }}</template>
      </VSelect>
      <span
        :id="`${binding.id}-source-status`"
        :data-uninterface-source-state="status.state"
        class="vuetify-sr-only vuetify-select-status"
        role="status"
      >
        {{ status.message }}
      </span>
    </div>
  </VLocaleProvider>
</template>
