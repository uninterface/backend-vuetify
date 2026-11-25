import { h, nextTick } from 'vue'
import {
  createUiEntryControl,
  createUiFieldControl,
  UiField,
  UiSelect,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

export async function mountSelectTarget() {
  const entries = createUiEntryControl([{ key: 'first', label: 'First' }])
  const field = createUiFieldControl('first')
  const errors: string[] = []
  let focusCount = 0
  const app = createUiApplication({
    render: () =>
      h(UiField, { field, label: 'Choice' }, () =>
        h(UiSelect, {
          control: entries,
          'data-testid': 'choice',
          onFocus: () => {
            focusCount++
          },
        }),
      ),
  })
  app.config.errorHandler = (error) => errors.push(String(error))
  await app.ui.ready
  const host = document.body.appendChild(document.createElement('div'))
  app.mount(host)
  await nextTick()
  return {
    host,
    errors,
    focusCount: () => focusCount,
    dispose() {
      app.unmount()
      entries.dispose()
      host.remove()
    },
  }
}
