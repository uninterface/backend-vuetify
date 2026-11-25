<script setup lang="ts">
  import { onScopeDispose, ref } from 'vue'
  import {
    UiButton,
    UiField,
    UiMenu,
    UiNavbar,
    UiSegmentedSelect,
    UiSelect,
    UiStrategy,
    createUiEntryControl,
    createUiFieldControl,
    uiFieldLabels,
  } from '@uninterface/uninterface'

  const scenario = new URLSearchParams(location.search).get('scenario')
  const choice = createUiFieldControl('one')
  const entries = createUiEntryControl([
    { key: 'one', label: 'First' },
    { key: 'two', label: 'Second' },
    { key: 'three', label: 'Third' },
  ])
  onScopeDispose(entries.dispose)
  const lastCommand = ref('')
  const commands = createUiEntryControl(
    [
      { key: 'refresh', label: 'Refresh' },
      { kind: 'separator', key: 'before-actions' },
      {
        kind: 'group',
        key: 'actions',
        label: 'Actions',
        entries: [{ key: 'copy', label: 'Copy' }],
      },
      { kind: 'separator', key: 'after-actions' },
      {
        kind: 'submenu',
        key: 'more',
        label: 'More actions',
        children: [
          { key: 'archive', label: 'Archive' },
          { key: 'delete', label: 'Delete', disabled: true },
          {
            kind: 'submenu',
            key: 'organize',
            label: 'Organize',
            children: [{ key: 'tag', label: 'Add tag' }],
          },
        ],
      },
    ],
    {
      selection: [{ key: 'actions', mode: 'multiple', keys: ['copy'] }],
    },
  )
  onScopeDispose(commands.dispose)
</script>

<template>
  <main>
    <UiStrategy
      v-if="scenario === 'segmented-focus'"
      :use="uiFieldLabels('above')"
    >
      <UiNavbar aria-label="Field alignment">
        <template #actions>
          <UiField
            :field="choice"
            label="Selection"
          >
            <UiSelect :control="entries" />
          </UiField>
          <UiField
            :field="choice"
            label="Choices"
          >
            <UiSegmentedSelect :control="entries" />
          </UiField>
        </template>
      </UiNavbar>
    </UiStrategy>
    <template v-else-if="scenario === 'commands'">
      <UiMenu
        :control="commands"
        mode="popup"
        aria-label="Commands"
        @activate="lastCommand = $event"
      >
        <template #host="{ buttonTrigger }">
          <UiButton v-bind="buttonTrigger">Open commands</UiButton>
        </template>
      </UiMenu>
      <output aria-label="Last command">{{ lastCommand }}</output>
    </template>
  </main>
</template>
