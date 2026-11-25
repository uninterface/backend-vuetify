import '@uninterface/backend/style.css'
import '@uninterface/uninterface/style.css'
import { h } from 'vue'
import {
  createUiEntryControl,
  UiButton,
  UiMenu,
  type UiMenuHostBindings,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

const icon = { name: 'info' }
const control = createUiEntryControl(
  [
    { key: 'refresh', label: 'Refresh', icon, shortcut: 'Alt+Shift+R' },
    { kind: 'separator', key: 'boundary' },
    {
      kind: 'group',
      key: 'columns',
      label: 'Columns',
      entries: [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email', icon },
        { key: 'phone', label: 'Phone' },
        { key: 'status', label: 'Status' },
      ],
    },
    { kind: 'separator', key: 'columns-boundary' },
    {
      kind: 'submenu',
      key: 'more',
      label: 'More actions',
      icon,
      async children() {
        // Exercise the native enter/exit ordering with a genuinely delayed branch.
        await new Promise((resolve) => setTimeout(resolve, 400))
        return [
          { key: 'archive', label: 'Archive' },
          { key: 'duplicate', label: 'Duplicate', icon },
          { key: 'export', label: 'Export', icon },
          { key: 'print', label: 'Print' },
          { key: 'history', label: 'History' },
          {
            kind: 'submenu',
            key: 'organize',
            label: 'Organize',
            children: [
              { key: 'addTag', label: 'Add tag' },
              { key: 'removeTag', label: 'Remove tag' },
            ],
          },
          { key: 'remove', label: 'Remove', icon, disabled: true },
        ]
      },
    },
  ],
  {
    selection: [
      {
        key: 'columns',
        mode: 'multiple',
        keys: ['name', 'email', 'phone', 'status'],
        selectedKeys: ['name'],
      },
    ],
  },
)

const app = createUiApplication({
  render: () =>
    h('section', { 'aria-label': 'Menus', style: 'padding: 2rem' }, [
      h(
        UiMenu,
        { control, mode: 'popup', 'aria-label': 'Record commands' },
        {
          host: ({ buttonTrigger }: UiMenuHostBindings) =>
            h(UiButton, buttonTrigger, () => 'Click to open menu'),
        },
      ),
    ]),
})
const host = document.body.appendChild(document.createElement('div'))
void app.ui.ready.then(() => app.mount(host))
