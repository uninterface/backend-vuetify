<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { useId } from 'vue'
  import { VTextField } from 'vuetify/components/VTextField'
  import { useUiFieldStrategies } from '@uninterface/uninterface/backend'
  import FieldFailureTooltip from './FieldFailureTooltip.vue'
  import type { UiPaginatorJumperViewProps } from '@uninterface/uninterface/backend'
  const props = defineProps<UiPaginatorJumperViewProps>()
  const id = `paginator-jumper-${useId()}`
  const policy = useUiFieldStrategies(
    () => ({
      id,
      label: props.label,
      issue: props.error || null,
      validating: false,
      describedBy: props.error ? `${id}-issue` : undefined,
    }),
    { failureModes: ['show-tooltip', 'show-below'] },
  )
  function keydown(event: KeyboardEvent) {
    if (event.key !== 'Enter' || event.isComposing) return
    event.preventDefault()
    event.stopPropagation()
    void props.commit('enter')
  }
</script>
<template>
  <div class="vuetify-paginator-jumper">
    <label :for="id">{{ label }}</label>
    <FieldFailureTooltip
      :message="policy.failure === 'show-tooltip' ? policy.issue : null"
      :id="`${id}-issue`"
    >
      <VTextField
        density="comfortable"
        :id="id"
        class="vuetify-paginator-jumper-input"
        :aria-label="label"
        :model-value="value"
        :disabled="disabled"
        :error="Boolean(error)"
        :error-messages="
          policy.failure === 'show-below' ? policy.issue || '' : ''
        "
        :aria-describedby="policy.describedBy"
        :aria-invalid="error ? 'true' : undefined"
        :hide-details="policy.failure !== 'show-below' || !policy.issue"
        inputmode="numeric"
        autocomplete="off"
        :aria-busy="pending"
        @update:model-value="(value) => update(value ?? '')"
        @keydown="keydown"
        @blur="commit('blur')"
      >
        <!-- Keep native padding/min-height on the field wrapper, not on the
             five-character content-box input. -->
        <template #default />
        <template #message="{ message }">
          <span :id="`${id}-issue`">{{ message }}</span>
        </template>
      </VTextField>
    </FieldFailureTooltip>
  </div>
</template>
