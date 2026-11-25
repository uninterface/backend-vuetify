<script setup lang="ts">
  import { uiFocusPresentation } from './focus'
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()
  import { computed, ref, nextTick, onDeactivated, watchPostEffect } from 'vue'
  import {
    useUiChoiceGroupView,
    useUiFieldDescription,
    useUiFieldFailure,
  } from '@uninterface/uninterface/backend'
  import type { UiChoiceGroupViewProps } from '@uninterface/uninterface/backend'
  import { useControlSize } from './controlSize'
  import { VBtnToggle } from 'vuetify/components/VBtnToggle'
  import { VBtn } from 'vuetify/components/VBtn'
  import { VInput } from 'vuetify/components/VInput'
  import { VField } from 'vuetify/components/VField'
  import { useFieldPresentation } from './fieldLayout'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiChoiceGroupViewProps>()
  const emit = defineEmits<{ choose: [key: string]; blur: [] }>()
  const root = ref<HTMLElement>()
  const scrollport = ref<HTMLElement>()
  const nativeScrollbarSpace = ref(0)
  const hasClassicScrollbar = ref(false)
  const density = useControlSize('UiSegmentedSelect')
  const focused = ref(false)
  const { field, presentation, requiredMarker, requiredPrefix } =
    useFieldPresentation(true, true)
  onDeactivated(() => {
    focused.value = false
  })
  const description = useUiFieldDescription(() => props.binding, 'replace-help')
  const failure = useUiFieldFailure(() => props.binding)
  const describedBy = computed(
    () =>
      [
        description.value,
        props.status.message ? `${props.binding.id}-source-status` : undefined,
      ]
        .filter(Boolean)
        .join(' ') || undefined,
  )
  const selected = computed(
    () => props.options.find((option) => option.selected)?.key,
  )
  function revealFocusedChoice(element: HTMLElement) {
    const active = element.ownerDocument.activeElement
    if (!active?.matches('[role=radio]') || !element.contains(active)) return

    const left = element.getBoundingClientRect().left + element.clientLeft
    const right = left + element.clientWidth
    const choice = active.getBoundingClientRect()
    const leftDelta = choice.left - left
    const rightDelta = choice.right - right
    // Use the nearest edge, including when a single caption is wider than
    // the viewport. Scroll only this strip and keep its current focus.
    const minDelta = Math.min(leftDelta, rightDelta)
    const maxDelta = Math.max(leftDelta, rightDelta)
    const delta = minDelta > 0 ? minDelta : Math.min(0, maxDelta)
    if (Math.abs(delta) >= 1)
      element.scrollBy({ left: delta, behavior: 'instant' })
  }
  watchPostEffect((onCleanup) => {
    const element = scrollport.value
    if (!element) return

    const measure = () => {
      if (!element.isConnected) return
      const overflowing = element.scrollWidth > element.clientWidth
      // Measure the native track even when the choices fit, so switching to
      // overflow can use the same space. Restore auto before the browser paints.
      if (!overflowing) element.style.overflowX = 'scroll'
      const nativeSpace = element.offsetHeight - element.clientHeight
      if (!overflowing) element.style.removeProperty('overflow-x')
      nativeScrollbarSpace.value = nativeSpace
      hasClassicScrollbar.value = overflowing && nativeSpace > 0
      if (overflowing) revealFocusedChoice(element)
    }
    measure()
    const ResizeObserver = element.ownerDocument.defaultView?.ResizeObserver
    if (!ResizeObserver) return
    // The button strip can grow after a caption or font change even when its
    // scrollport keeps the same width. Scrolling itself triggers neither size.
    const observer = new ResizeObserver(measure)
    observer.observe(element, { box: 'border-box' })
    if (element.firstElementChild) observer.observe(element.firstElementChild)
    onCleanup(() => observer.disconnect())
  })
  function targets() {
    return Array.from(
      root.value?.querySelectorAll<HTMLElement>(
        'input[type=radio], input[type=checkbox], [role=radio], [role=checkbox]',
      ) ?? [],
    )
      .filter(
        (element) =>
          element.getAttribute('aria-hidden') !== 'true' &&
          element.tabIndex >= -1,
      )
      .flatMap((element) => {
        const key =
          element
            .closest('[data-uninterface-key]')
            ?.getAttribute('data-uninterface-key') ??
          element.getAttribute('value')
        return key === null || key === undefined ? [] : [{ key, element }]
      })
  }
  const { focus, keydown, focusout } = useUiChoiceGroupView(
    props,
    () => false,
    () => root.value,
    targets,
    (key) => emit('choose', key),
    () => emit('blur'),
    { fieldLabel: true },
  )
  async function leave(event: FocusEvent) {
    await focusout(event)
    await nextTick()
    focused.value = Boolean(
      root.value?.contains(root.value.ownerDocument.activeElement),
    )
  }
  defineExpose({ focus })
  function optionDescription(index: number) {
    return (
      [
        description.value,
        props.options[index].description
          ? `${props.binding.id}-option-${index}-help`
          : undefined,
      ]
        .filter(Boolean)
        .join(' ') || undefined
    )
  }
</script>
<template>
  <div
    ref="root"
    v-bind="$attrs"
    :id="binding.id"
    role="radiogroup"
    :aria-orientation="orientation"
    :aria-label="label"
    :aria-required="binding.required || undefined"
    :aria-describedby="describedBy"
    :aria-invalid="binding.invalid || undefined"
    :aria-disabled="binding.disabled || undefined"
    :aria-busy="binding.validating || status.pending || undefined"
    :class="uiFocusPresentation.class"
    data-uninterface-segmented-select
    data-uninterface-choice-group
    class="vuetify-choice-group"
    @keydown.capture="keydown"
    @focusin="focused = true"
    @focusout="leave"
  >
    <VInput
      class="segmented-field-host"
      :density="density"
      :disabled="binding.disabled"
      :error="failure"
      :rules="[]"
      hide-details
    >
      <VField
        class="segmented-field"
        :class="{
          'vuetify-required-control': requiredMarker,
          'vuetify-required-prefix': requiredPrefix,
        }"
        :style="{
          '--segmented-native-scrollbar-space': nativeScrollbarSpace
            ? `${nativeScrollbarSpace}px`
            : undefined,
        }"
        :id="`${binding.id}-surface`"
        :label="presentation.label"
        :label-id="field ? `${field.id}-label` : undefined"
        :single-line="false"
        :active="true"
        :focused="focused"
        :disabled="binding.disabled"
        :error="failure"
        @click="focus"
      >
        <template #default="{ props: contentProps }">
          <!-- Choices are always visible: keep the native label raised, even
               without a selected value. VField's single-input click handler
               must not cancel the embedded buttons' activation. -->
          <div
            :id="`${binding.id}-surface`"
            :class="contentProps.class"
            class="segmented-content"
            @click.stop="$event.target === $event.currentTarget && focus()"
          >
            <div
              ref="scrollport"
              class="segmented-scroll"
              :class="{
                'segmented-scroll-classic': hasClassicScrollbar,
              }"
            >
              <VBtnToggle
                :model-value="
                  selected === undefined ? undefined : `choice:${selected}`
                "
                :disabled="binding.disabled || !available"
                :direction="orientation"
                :color="failure ? 'error' : 'primary'"
                variant="text"
                class="segmented-buttons"
                mandatory
                role="presentation"
                @update:model-value="
                  typeof $event === 'string' && emit('choose', $event.slice(7))
                "
              >
                <VBtn
                  v-for="(option, index) in options"
                  :key="option.key"
                  :id="`${binding.id}-option-${index}`"
                  :data-uninterface-key="option.key"
                  :value="`choice:${option.key}`"
                  :disabled="binding.disabled || !available || option.disabled"
                  height="auto"
                  min-height="var(--vuetify-segment-min-height)"
                  role="radio"
                  :aria-label="option.label"
                  :aria-checked="option.selected"
                  :aria-describedby="optionDescription(index)"
                  :aria-invalid="binding.invalid || undefined"
                >
                  <span>
                    {{ option.label }}
                    <small
                      v-if="option.description"
                      :id="`${binding.id}-option-${index}-help`"
                    >
                      {{ option.description }}
                    </small>
                  </span>
                </VBtn>
              </VBtnToggle>
            </div>
          </div>
        </template>
      </VField>
    </VInput>
    <div
      v-for="item in retained"
      :key="item.key"
      data-uninterface-retained
      class="mt-2"
    >
      {{ item.label }}
      <template v-if="unavailableLabel">— {{ unavailableLabel }}</template>
    </div>
    <div
      :id="`${binding.id}-source-status`"
      role="status"
      :data-uninterface-source-state="status.state"
      :class="status.message ? 'mt-2' : undefined"
    >
      {{ status.message }}
    </div>
  </div>
</template>

<style scoped>
  .vuetify-choice-group {
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }
  .segmented-field-host {
    display: block;
    width: 100%;
    min-width: 0;
  }
  .segmented-field {
    --segmented-scrollbar-space: var(
      --segmented-native-scrollbar-space,
      0.75rem
    );
    --segmented-target-height: 1.5rem;
    --segmented-field-height: var(--v-input-control-height, 56px);
    /* Center one choice line in the same native content area as input values. */
    --segmented-content-start: max(
      var(--segmented-label-band, 0px),
      calc(
        (
            var(--segmented-field-height) + var(--v-field-input-padding-top) -
              var(--v-field-input-padding-bottom) -
              var(--segmented-target-height)
          ) /
          2
      )
    );
    --segmented-content-end: max(
      0px,
      calc(
        var(--segmented-field-height) - var(--segmented-content-start) -
          var(--segmented-target-height)
      )
    );
    /* Move the whole native track below the field when its bottom inset is
       too small. Keep the choice line at the same position in both states. */
    --segmented-external-scrollbar-space: calc(
      var(--segmented-scrollbar-space) *
        sign(
          max(
            0px,
            calc(
              var(--segmented-scrollbar-space) - var(--segmented-content-end)
            )
          )
        )
    );
    --segmented-scroll-padding: calc(
      var(--segmented-content-end) + var(--segmented-external-scrollbar-space)
    );
    margin-block-end: var(--segmented-external-scrollbar-space);
  }
  .segmented-field:not(.v-field--no-label) {
    --segmented-label-band: var(--v-field-input-padding-top);
  }
  .segmented-field.v-field--variant-outlined:not(.v-field--no-label) {
    --segmented-label-band: 0.625rem;
  }
  .segmented-field:is(
      .v-field--variant-filled,
      .v-field--variant-solo,
      .v-field--variant-solo-filled,
      .v-field--variant-solo-inverted
    ):not(.v-field--no-label) {
    --segmented-label-band: 0.9375rem;
  }
  .segmented-field:is(
      .v-field--variant-filled,
      .v-field--variant-solo,
      .v-field--variant-solo-filled,
      .v-field--variant-solo-inverted
    )
    :deep(.v-field-label--floating) {
    line-height: var(--segmented-label-band);
    top: min(
      calc(var(--v-input-padding-top) / 2 - 1px),
      calc(var(--segmented-content-start) - var(--segmented-label-band))
    );
  }
  .segmented-content {
    --vuetify-segment-min-height: var(--segmented-target-height);
    min-height: var(--segmented-field-height);
    min-width: 0;
    padding-block: var(--segmented-content-start) 0;
    padding-inline: 0;
  }
  .segmented-scroll {
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    padding-block-end: var(--segmented-scroll-padding);
    margin-block-end: calc(-1 * var(--segmented-external-scrollbar-space));
  }
  .segmented-scroll-classic {
    /* The native track takes the place of padding when it appears. */
    padding-block-end: calc(
      var(--segmented-scroll-padding) - var(--segmented-scrollbar-space)
    );
  }
  .segmented-buttons {
    display: flex;
    height: auto;
    width: 100%;
    min-width: max-content;
    overflow: visible;
  }
  .segmented-buttons :deep(.v-btn) {
    /* Remove resting selection fill; native hover/focus overlays still apply.
       Set on each button because its theme class defines this token locally. */
    --v-activated-opacity: 0;
    flex: 1 0 0;
    font-size: inherit;
    letter-spacing: inherit;
    line-height: inherit;
    min-width: max-content;
    padding-inline: var(--v-field-padding-start) var(--v-field-padding-end);
    text-indent: 0;
  }
  @media (forced-colors: active) {
    .segmented-buttons :deep(.v-btn:focus-visible) {
      outline-offset: -2px;
    }
  }
  small {
    display: block;
  }
</style>
