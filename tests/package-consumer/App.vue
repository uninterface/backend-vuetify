<script setup lang="ts">
  import { onUnmounted, ref } from 'vue'
  import {
    createUiEntryControl,
    createUiFieldControl,
    UiApp,
    UiButton,
    UiContent,
    UiField,
    UiSelect,
  } from '@uninterface/uninterface'

  const acknowledged = ref(false)
  const category = createUiFieldControl('supplies')
  const options = createUiEntryControl([
    { key: 'supplies', label: 'Supplies' },
    { key: 'services', label: 'Services' },
  ])
  onUnmounted(() => options.dispose())
</script>

<template>
  <UiApp>
    <UiContent>
      <h1>Application ready</h1>
      <UiButton
        color="primary"
        :disabled="acknowledged"
        @click="acknowledged = true"
      >
        Acknowledge
      </UiButton>
      <p
        v-if="acknowledged"
        role="status"
      >
        Acknowledged.
      </p>
      <UiField
        :field="category"
        label="Category"
      >
        <UiSelect :control="options" />
      </UiField>
      <output aria-label="Category key">{{ category.state.input }}</output>
    </UiContent>
  </UiApp>
</template>
