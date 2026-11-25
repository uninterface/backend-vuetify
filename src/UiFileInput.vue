<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { ref, computed, nextTick, onMounted, onUpdated, useAttrs } from 'vue'
  import { VFileInput } from 'vuetify/components/VFileInput'
  import { VIcon } from 'vuetify/components/VIcon'
  import { VLocaleProvider } from 'vuetify/components/VLocaleProvider'
  import {
    focusUiTarget,
    syncUiTargetAttributes,
    useUiFieldDescription,
    useUiFieldFailure,
    type UiFileInputViewProps,
  } from '@uninterface/uninterface/backend'
  import { useFieldPresentation } from './fieldLayout'
  import { useControlSize } from './controlSize'
  import { useNativeDirection } from './nativeDirection'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiFileInputViewProps>()
  const root = ref<HTMLElement>()
  const attrs = useAttrs()
  const focused = ref(false)
  const { presentation, messageId, requiredMarker, requiredPrefix } =
    useFieldPresentation()
  const size = useControlSize('UiFileInput')
  const direction = useNativeDirection(() => root.value)
  const invalid = useUiFieldFailure(() => props.binding)
  const fieldDescription = useUiFieldDescription(
    () => props.binding,
    'replace-help',
  )
  const description = computed(
    () =>
      [
        fieldDescription.value,
        attrs['aria-describedby'],
        props.file ? props.binding.id + '-filename' : '',
        props.rejection ? props.binding.id + '-rejection' : '',
      ]
        .filter(Boolean)
        .join(' ') || undefined,
  )
  const input = () =>
    root.value?.querySelector<HTMLInputElement>('input[type=file]')
  function sync() {
    const target = input()
    if (target)
      syncUiTargetAttributes(target, {
        ...attrs,
        id: props.binding.id,
        accept: props.accept,
        capture: props.capture,
        'aria-label': attrs['aria-label'] ?? (props.label || props.chooseLabel),
        'aria-describedby': description.value,
        'aria-required': props.binding.required || undefined,
        'aria-invalid': props.binding.invalid || !!props.rejection || undefined,
        'aria-busy': props.pending || props.binding.validating || undefined,
      })
  }
  onMounted(sync)
  onUpdated(sync)
  const focus = () => focusUiTarget(input, () => props.binding.disabled)
  async function changed(value: File | File[] | null | undefined) {
    const target = input()
    if (target) target.value = ''
    const files = Array.isArray(value) ? value : value ? [value] : []
    if (files.length) await props.select(files)
  }
  function choose(event: Event) {
    const target = event.target as HTMLInputElement
    if (target.type !== 'file') return
    // Native model equality suppresses selecting the same File twice. Acquisition
    // must inspect every chooser request, even when the current value is unchanged.
    event.stopPropagation()
    void changed([...(target.files ?? [])])
  }
  async function clearFile() {
    if (props.binding.disabled || props.readonly) return
    await props.clear()
    await nextTick()
    await focus()
  }
  function leave(event: FocusEvent) {
    if (root.value?.contains(event.relatedTarget as Node | null)) return
    focused.value = false
  }
  defineExpose({ focus })
</script>
<template>
  <div
    ref="root"
    class="vuetify-file-input"
    data-ui-file-input
    @focusin="focused = true"
    @focusout="leave"
    @change.capture="choose"
  >
    <VLocaleProvider :rtl="direction === 'rtl'">
      <VFileInput
        v-bind="presentation"
        :id="binding.id"
        :density="size"
        :class="{
          'vuetify-required-control': requiredMarker,
          'vuetify-required-prefix': requiredPrefix,
        }"
        :model-value="file?.value ?? null"
        :multiple="false"
        :clearable="!!file && !readonly"
        persistent-clear
        :disabled="binding.disabled"
        :readonly="readonly"
        :error="invalid || !!rejection"
        :loading="pending || binding.validating"
        :focused="focused"
        @update:focused="
          (value) => {
            if (value) focused = true
          }
        "
        prepend-icon=""
        prepend-inner-icon="$file"
        :placeholder="chooseLabel"
        :accept="accept"
        :capture="capture"
        filter-by-type=""
        :rules="[]"
        @update:model-value="changed"
      >
        <template #selection>
          <span
            :id="binding.id + '-filename'"
            class="vuetify-file-name"
            data-ui-file-name
            :title="file?.name"
          >
            {{ file?.name }}
          </span>
        </template>
        <template
          v-if="file && !readonly"
          #clear
        >
          <VIcon
            tag="button"
            type="button"
            icon="$clear"
            class="vuetify-file-clear"
            :disabled="binding.disabled || readonly"
            :aria-label="clearLabel"
            data-ui-file-clear
            @click.stop="clearFile"
          />
        </template>
        <template #message="{ message }">
          <span :id="messageId">{{ message }}</span>
        </template>
      </VFileInput>
    </VLocaleProvider>
    <div
      v-if="rejection"
      :id="binding.id + '-rejection'"
      role="status"
    >
      {{ rejection }}
    </div>
  </div>
</template>
