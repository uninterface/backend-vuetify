<script setup lang="ts">
  import { uiFocusPresentation } from './focus'
  import { useUiCollectionHeaderField } from '@uninterface/uninterface/backend'
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { computed, provide, ref } from 'vue'
  import { useUiFieldStrategies } from '@uninterface/uninterface/backend'
  import FieldFailureTooltip from './FieldFailureTooltip.vue'
  import { VLabel } from 'vuetify/components/VLabel'
  import type { UiFieldViewBinding } from '@uninterface/uninterface/backend'
  import { fieldLayoutKey, needsCustomFeedback } from './fieldLayout'
  const element = ref()
  useUiCollectionHeaderField(element, '.v-field')
  const props = defineProps<{ binding: UiFieldViewBinding }>()
  const policy = useUiFieldStrategies(() => props.binding, {
    ...{ feedbackRoot: element },
    help: 'replace-help',
    checkableModes: ['flushed'],
    defaultLabels: () =>
      (props.binding.group && !frameLabel.value) ||
      !controls.value ||
      (frameControls.value > 0 && !frameLabel.value)
        ? 'above'
        : 'integrated',
    failureModes: ['show-below', 'show-tooltip'],
    labels: (value) =>
      (value === 'above' &&
        (props.binding.group || !checkableControls.value)) ||
      (value === 'floating' &&
        (!props.binding.group || frameLabel.value) &&
        floatingControls.value === 1 &&
        controls.value === 1),
  })
  const deferredIssue = computed(() =>
    'inlineFeedbackDeferred' in policy.value &&
    policy.value.inlineFeedbackDeferred === true &&
    policy.value.failure !== 'show-tooltip'
      ? policy.value.issue
      : null,
  )
  const customFeedback = computed(() => needsCustomFeedback(policy.value))
  const controls = ref(0)
  const checkableControls = ref(0)
  const floatingControls = ref(0)
  const frameControls = ref(0)
  const frameLabel = computed(
    () => frameControls.value === 1 && controls.value === 1,
  )
  import { useCheckableDescriptionAlignment } from './checkableDescription'
  useCheckableDescriptionAlignment(
    element,
    () =>
      !props.binding.group &&
      controls.value === 1 &&
      checkableControls.value === 1 &&
      policy.value.checkableMode === 'flushed',
  )
  provide(fieldLayoutKey, {
    binding: computed(() => props.binding),
    frameLabel,
    deferredIssue,
    registerControl(floating, frame = false, checkable = false) {
      controls.value++
      if (checkable) checkableControls.value++
      if (frame) frameControls.value++
      if (floating) floatingControls.value++
      return () => {
        controls.value--
        if (checkable) checkableControls.value--
        if (frame) frameControls.value--
        if (floating) floatingControls.value--
      }
    },
  })
</script>
<template>
  <div
    ref="element"
    :data-ui-label-align="policy.labelAlignment"
    :data-ui-checkable="policy.checkableMode"
    :data-ui-checkable-group="
      binding.checkable && binding.group ? true : undefined
    "
    :data-ui-checkable-label-align="
      binding.checkable ? policy.checkableLabelAlignment : undefined
    "
    class="vuetify-field"
    :role="binding.group ? 'group' : undefined"
    :aria-labelledby="binding.group ? `${binding.id}-label` : undefined"
    :aria-describedby="
      binding.group
        ? [
            policy.describedBy,
            binding.requiredLabel ? `${binding.id}-required` : undefined,
          ]
            .filter(Boolean)
            .join(' ') || undefined
        : undefined
    "
    :aria-busy="binding.group && binding.validating ? true : undefined"
    :aria-invalid="binding.group && binding.issue ? true : undefined"
    v-bind="binding.group ? uiFocusPresentation : {}"
  >
    <VLabel
      v-if="
        (binding.group && !frameLabel) ||
        !controls ||
        (frameControls > 0 && !frameLabel) ||
        (policy.labels !== 'floating' &&
          policy.labels !== 'integrated' &&
          policy.labels !== 'adjacent')
      "
      :id="`${binding.id}-label`"
      :for="binding.group ? undefined : binding.id"
      :class="{
        'vuetify-sr-only': policy.labels === 'hidden',
        'vuetify-required': policy.marker === 'required',
        'vuetify-required-prefix':
          policy.marker === 'required' && policy.markerPosition === 'prefix',
      }"
      class="mb-2"
    >
      <span v-if="binding.checkable">{{ binding.label }}</span>
      <template v-else>{{ binding.label }}</template>
    </VLabel>
    <span
      v-if="binding.group && binding.requiredLabel"
      :id="`${binding.id}-required`"
      class="vuetify-sr-only vuetify-required-description"
    >
      {{ binding.requiredLabel }}
    </span>
    <FieldFailureTooltip
      :message="policy.failure === 'show-tooltip' ? policy.issue : null"
      :id="`${binding.id}-issue`"
    >
      <slot />
    </FieldFailureTooltip>
    <div
      v-if="
        (binding.group || frameControls > 0 || !controls || customFeedback) &&
        (policy.showHelp ||
          (policy.issue && !deferredIssue && policy.failure !== 'show-tooltip'))
      "
      class="vuetify-field-feedback text-caption mt-1"
    >
      <div
        v-if="policy.showHelp"
        :id="`${binding.id}-help`"
      >
        {{ binding.help }}
      </div>
      <div
        v-if="
          policy.issue && !deferredIssue && policy.failure !== 'show-tooltip'
        "
        :id="`${binding.id}-issue`"
        class="text-error"
      >
        {{ policy.issue }}
      </div>
    </div>
    <span
      v-if="deferredIssue"
      :id="`${binding.id}-issue`"
      class="vuetify-sr-only"
    >
      {{ deferredIssue }}
    </span>
  </div>
</template>
