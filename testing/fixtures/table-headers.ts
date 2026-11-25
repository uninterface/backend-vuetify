import '@uninterface/backend/style.css'
import { h } from 'vue'
import {
  createUiListControl,
  UiButton,
  UiTable,
  UiTableColumn,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

async function mountTable() {
  const items = [
    { id: 'line', description: 'Notebook', quantity: 2, amount: 6 },
  ]
  const control = createUiListControl({
    itemKey: (item: (typeof items)[number]) => item.id,
    query: { filters: {}, sort: [] },
    source: () => ({ items, complete: true }),
  })
  const columns = [
    { key: 'description', label: 'Description', value: 'Notebook' },
    { key: 'quantity', label: 'Quantity', value: '2' },
    { key: 'unitAmount', label: 'Unit amount (USD)', value: '6' },
    { key: 'lineAmount', label: 'Line amount (USD)', value: '12' },
    { key: 'actions', label: 'Actions', value: 'Edit' },
  ]
  const app = createUiApplication({
    render: () =>
      h(
        UiTable,
        { binding: control.bindings.list, ariaLabel: 'Lines' },
        {
          default: () =>
            columns.map(({ key, label, value }) =>
              h(
                UiTableColumn,
                { columnKey: key, label },
                {
                  default: () =>
                    key === 'actions' ? h(UiButton, () => value) : value,
                },
              ),
            ),
        },
      ),
  })
  await app.ui.ready
  await control.refresh()
  app.mount(document.body.appendChild(document.createElement('div')))
}

void mountTable()
