import { h, nextTick, ref } from 'vue'
import { createUiApplication } from '@uninterface/uninterface/setup'
import EntryBranch from '../../src/EntryBranch.vue'
import type { UiEntryViewNode } from '@uninterface/uninterface/backend'

export async function mount() {
  const checks = ref(true)
  const icons = ref(true)
  const selected = ref(false)
  const expanded = ref(false)
  const loaded = ref(false)
  const entries = (): UiEntryViewNode[] => [
    {
      entry: {
        key: 'plain',
        label: 'Plain',
        description: 'Description',
        shortcut: 'Ctrl+P',
      },
    },
    {
      entry: { kind: 'group', key: 'group', label: 'Group', entries: [] },
      children: [
        {
          entry: {
            key: 'choice',
            label: 'Choice',
            icon: icons.value ? { name: 'info' } : undefined,
          },
          selectionMode: checks.value ? 'multiple' : undefined,
          selected: selected.value,
        },
        {
          entry: {
            kind: 'group',
            key: 'nestedGroup',
            label: 'Nested group',
            entries: [],
          },
          children: [
            {
              entry: { key: 'radio', label: 'Radio' },
              selectionMode: checks.value ? 'single' : undefined,
              selected: true,
            },
          ],
        },
      ],
    },
    {
      entry: { kind: 'submenu', key: 'child', label: 'Child', children: [] },
      expanded: expanded.value,
      children: loaded.value
        ? [
            { entry: { key: 'childPlain', label: 'Child plain' } },
            {
              entry: { key: 'childChoice', label: 'Child choice' },
              selectionMode: 'multiple',
              selected: true,
            },
          ]
        : [{ entry: { key: 'childPlain', label: 'Child plain' } }],
    },
  ]
  const host = document.createElement('div')
  document.body.append(host)
  const errors: string[] = []
  const app = createUiApplication({
    render: () =>
      h(EntryBranch, {
        entries: entries(),
        label: 'Columns',
        onActivate: (key: string) => {
          if (key === 'choice') selected.value = !selected.value
        },
        onExpand: (_key: string, open: boolean) => {
          expanded.value = open
        },
      }),
  })
  app.config.errorHandler = (error) => errors.push(String(error))
  await app.ui.ready
  app.mount(host)
  const tick = async () => {
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 40))
  }
  await tick()
  return {
    host,
    errors,
    tick,
    async configure(hasChecks: boolean, hasIcons: boolean) {
      checks.value = hasChecks
      icons.value = hasIcons
      await tick()
    },
    async load() {
      loaded.value = true
      await tick()
    },
    dispose() {
      app.unmount()
      host.remove()
    },
  }
}
