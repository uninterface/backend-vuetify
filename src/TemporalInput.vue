<script setup lang="ts">
  import { computed, ref } from 'vue'
  import {
    useUiTemporalRange,
    useUiOverlayTarget,
  } from '@uninterface/uninterface/backend'
  import type {
    UiTemporalInputViewProps,
    UiFocusHandle,
  } from '@uninterface/uninterface/backend'
  import { VChip } from 'vuetify/components/VChip'
  import { VTooltip } from 'vuetify/components/VTooltip'
  import TemporalMode from './TemporalMode.vue'
  import TemporalRangeIcon from './TemporalRangeIcon.vue'
  import TemporalRangePicker from './TemporalRangePicker.vue'
  import TemporalEditor from './TemporalEditor.vue'
  import TemporalAction from './TemporalAction.vue'
  import InputFrame from './UiInputFrame.vue'
  const props = withDefaults(defineProps<UiTemporalInputViewProps>(), {
    dateFormatWish: 'YMD',
  })
  defineOptions({ inheritAttrs: false })
  const editor = ref<UiFocusHandle>()
  const modeTarget = ref<UiFocusHandle>()
  const portal = useUiOverlayTarget()
  const endpoints = new Map<string, UiFocusHandle>()
  function endpointRef(side: string, value: unknown) {
    if (value) endpoints.set(side, value as UiFocusHandle)
    else endpoints.delete(side)
  }
  const {
    range,
    mode,
    modes,
    messages,
    nextDay,
    display: displayEndpoint,
    selectMode,
    updateEndpoint,
    updateRange,
    clear,
  } = useUiTemporalRange(props)
  const nativeRange = computed(
    () => mode.value === 'bounded' && props.kind === 'date',
  )
  const rangePicker = ref<{ show(): void }>()
  const showRangePicker = () => rangePicker.value?.show()
  async function focus() {
    if (!props.options.range) return editor.value?.focus() ?? null
    for (const side of ['start', 'end'] as const) {
      const result = await endpoints.get(side)?.focus()
      if (result === true) return true
    }
    return modeTarget.value?.focus() ?? null
  }
  defineExpose({ focus })
</script>
<template>
  <InputFrame
    v-if="options.range"
    :binding="binding"
    :description-binding="binding"
    :label="label"
    :readonly="readonly"
    :dirty="!!value"
    :focus-editor="focus"
    data-temporal-range
  >
    <template #leading>
      <TemporalMode
        v-if="modes.length > 1"
        ref="modeTarget"
        :value="mode"
        :modes="modes"
        :label="messages.rangeMode"
        :disabled="binding.disabled || readonly"
        @change="selectMode"
      />
      <TemporalRangePicker
        v-if="nativeRange"
        ref="rangePicker"
        :binding="binding"
        :value="{
          start: displayEndpoint('start'),
          end: displayEndpoint('end'),
        }"
        :precision="options.precision ?? 'minute'"
        :readonly="readonly"
        :label="label"
        :eligible="eligible"
        :update="updateRange"
        :blur="blur"
      />
    </template>
    <div
      class="vuetify-temporal-range"
      :data-temporal-unrestricted="mode === 'unrestricted' ? '' : undefined"
    >
      <template
        v-for="side in ['start', 'end'] as const"
        :key="side"
      >
        <span
          v-if="side === 'end'"
          aria-hidden="true"
          data-temporal-separator
        >
          –
        </span>
        <div
          class="vuetify-temporal-boundary"
          :data-temporal-side="side"
        >
          <VChip
            v-if="range[side] === null"
            size="small"
            label
            role="img"
            :aria-label="
              (side === 'start' ? startLabel : endLabel) +
              ' — ' +
              messages.openBoundary
            "
            data-temporal-infinity
          >
            <span aria-hidden="true">∞</span>
          </VChip>
          <TemporalEditor
            v-else
            :ref="(value) => endpointRef(side, value)"
            v-bind="$attrs"
            :binding="{
              ...binding,
              id: binding.id + '-' + side,
              disabled: binding.disabled,
            }"
            :kind="kind"
            :open-range-picker="nativeRange ? showRangePicker : undefined"
            :value="displayEndpoint(side)"
            :precision="options.precision ?? 'minute'"
            :presentation="presentation"
            :date-format-wish="dateFormatWish"
            :readonly="readonly"
            :label="label + ' — ' + (side === 'start' ? startLabel : endLabel)"
            :eligible="eligible"
            :update="(value) => updateEndpoint(side, value)"
            :blur="blur"
          />
        </div>
      </template>
      <span
        class="vuetify-temporal-spacer"
        aria-hidden="true"
      />
    </div>
    <template #trailing>
      <VTooltip
        v-if="kind === 'time' && mode === 'bounded'"
        :text="messages.rangeNextDay"
        :disabled="!nextDay"
        :attach="portal"
      >
        <template #activator="{ props: activator }">
          <span
            v-bind="activator"
            :style="{ visibility: nextDay ? undefined : 'hidden' }"
            :aria-hidden="!nextDay || undefined"
            :aria-label="messages.rangeNextDay"
            role="img"
            data-temporal-next-day
          >
            <TemporalRangeIcon mode="next-day" />
          </span>
        </template>
      </VTooltip>
      <TemporalAction
        clear
        :label="clearLabel"
        :disabled="binding.disabled || readonly"
        @click="clear"
      />
    </template>
  </InputFrame>
  <TemporalEditor
    v-else
    ref="editor"
    v-bind="$attrs"
    :binding="binding"
    :kind="kind"
    :value="typeof value === 'string' ? display(value) : ''"
    :precision="options.precision ?? 'minute'"
    :presentation="presentation"
    :date-format-wish="dateFormatWish"
    :readonly="readonly"
    :label="label"
    :eligible="eligible"
    :update="(value) => update(value === '' ? null : candidate(value))"
    :blur="blur"
  />
</template>
