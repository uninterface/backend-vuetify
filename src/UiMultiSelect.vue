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
  import type { UiMultiSelectViewProps } from '@uninterface/uninterface/backend'
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
  const props = defineProps<UiMultiSelectViewProps>()
  const invalidPresentation = useUiFieldFailure(() => props.binding)
  const select = ref<InstanceType<typeof VSelect>>()
  const opened = ref(false)
  const emit = defineEmits<{
    update: [value: string[]]
    clear: []
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
  const selection = computed(() =>
    props.value.map(
      (value) =>
        props.options.find((option) => option.value === value) ?? {
          value,
          label: value,
        },
    ),
  )
  const items = computed(() => [
    ...props.options
      .filter((option) => !option.hidden)
      .map((option) => ({
        ...option,
        props: {
          disabled: Boolean(
            !props.available || option.disabled || option.hidden,
          ),
        },
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
  const dismiss = selectEscape(opened, () =>
    select.value?.$el.querySelector('input[role="combobox"]'),
  )
  const menuProps = computed(() => ({
    attach: overlayTarget.value ?? false,
    contentProps: { onKeydownCapture: dismiss },
  }))
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
    if (!Array.isArray(value) || props.binding.disabled || !props.available)
      return
    const keys = value.map((item) =>
      typeof item === 'object' && item !== null ? item.value : undefined,
    )
    if (keys.some((key) => typeof key !== 'string')) return
    emit('update', keys)
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
  const controlSize = useControlSize('UiMultiSelect')
  import { useUiZPopup } from '@uninterface/uninterface/backend'
  import { popupTarget, controlledPopup } from './zOrder'
  useUiZPopup(() => controlledPopup(props.binding.id), {
    source: 'UiMultiSelect choices',
  })
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
        :density="controlSize"
        :class="{
          'vuetify-required-control': requiredMarker,
          'vuetify-required-prefix': requiredPrefix,
        }"
        ref="select"
        v-model:menu="opened"
        :menu-props="menuProps"
        v-combobox-target
        v-target-listeners
        v-bind="{ ...surfaceAttributes(), ...presentation }"
        :id="binding.id"
        :model-value="selection"
        return-object
        multiple
        chips
        :closable-chips="false"
        :clearable="clearable"
        :items="items"
        item-title="label"
        item-value="value"
        :disabled="binding.disabled"
        :placeholder="placeholder"
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

<style scoped>
  /* Vuetify 4.2.5 uses fixed-height, single-line chips. Preserve its density
     heights as minima so the full selection label can wrap at narrow widths. */
  .v-select--chips :deep(.v-select__selection .v-chip) {
    --multiselect-chip-density-offset: 0px;

    height: auto;
    min-height: calc(
      var(--v-chip-height) + var(--multiselect-chip-density-offset)
    );
    white-space: normal;
    overflow-wrap: anywhere;
    /* VSelect's chip handler stops mousedown. Let the field open the menu. */
    pointer-events: none;
  }
  .v-select--chips :deep(.v-select__selection .v-chip--density-comfortable) {
    --multiselect-chip-density-offset: -4px;
  }
  .v-select--chips :deep(.v-select__selection .v-chip--density-compact) {
    --multiselect-chip-density-offset: -8px;
  }
</style>
