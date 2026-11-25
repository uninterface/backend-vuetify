<script setup lang="ts">
  import { useUiControlFrameParticipant } from '@uninterface/uninterface/backend'
  import { ref } from 'vue'
  import {
    useUiTemporalEditor,
    type UiTemporalEditorViewProps,
    type UiFocusHandle,
  } from '@uninterface/uninterface/backend'
  import UiTextInput from './UiTextInput.vue'
  import TemporalPicker from './TemporalPicker.vue'
  import TemporalAction from './TemporalAction.vue'
  const props = defineProps<
    UiTemporalEditorViewProps & {
      openRangePicker?: () => void
      unbounded?: boolean
      boundaryLabel?: string
      toggleBoundary?: () => void
    }
  >()
  const { text, focused, update, blur } = useUiTemporalEditor(props)
  const editor = ref<UiFocusHandle>()
  const { frame, setEngaged } = useUiControlFrameParticipant({
    focus: () => editor.value?.focus() ?? Promise.resolve(null),
    invalid: () => props.binding.invalid,
  })
  const picker = ref<{ show(): void }>()
  function pick(value: string) {
    // Picker output is canonical, not text to parse with the display adapter.
    props.update(value)
  }
  defineExpose({ focus: () => editor.value?.focus() ?? Promise.resolve(null) })
</script>
<template>
  <div
    class="vuetify-temporal-editor"
    :class="{ 'vuetify-temporal-part': frame.owner === 'parent' }"
    :style="{
      '--vuetify-temporal-text-width': `${Math.max(text.length, kind === 'date' ? 10 : kind === 'time' ? 5 : 18)}ch`,
    }"
  >
    <UiTextInput
      ref="editor"
      v-bind="$attrs"
      :binding="binding"
      :frame="frame"
      :aria-label="label || $attrs['aria-label']"
      :value="unbounded ? '∞' : text"
      type="text"
      inputmode="text"
      autocomplete="off"
      :readonly="readonly || unbounded"
      @update="update"
      @focus="focused = true"
      @blur="blur"
      @keydown.alt.down.prevent="
        openRangePicker ? openRangePicker() : picker?.show()
      "
    >
      <template
        v-if="!unbounded && !openRangePicker"
        #leading
      >
        <TemporalPicker
          @open-change="setEngaged($event)"
          ref="picker"
          :binding="binding"
          :kind="kind"
          :value="value"
          :precision="precision"
          :readonly="readonly"
          :label="label"
          :presentation="presentation"
          :eligible="eligible"
          :update="pick"
          :blur="blur"
        />
      </template>
      <template
        v-if="toggleBoundary"
        #trailing
      >
        <TemporalAction
          :label="boundaryLabel ?? ''"
          :active="unbounded"
          :disabled="binding.disabled || readonly"
          @click="toggleBoundary"
        />
      </template>
    </UiTextInput>
  </div>
</template>
