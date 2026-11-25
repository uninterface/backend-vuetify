import { h, nextTick } from 'vue'
import {
  createUiDateControl,
  UiDateInput,
  UiField,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

export async function mountTemporalEscape() {
  const date = createUiDateControl('2024-02-29')
  const errors: string[] = []
  const app = createUiApplication({
    render: () =>
      h(UiField, { field: date.field, label: 'Date' }, () =>
        h(UiDateInput, {
          binding: date.bindings.dateInput,
          presentation: { locale: 'en-US' },
        }),
      ),
  })
  app.config.errorHandler = (error) => errors.push(String(error))
  await app.ui.ready
  const host = document.body.appendChild(document.createElement('div'))
  app.mount(host)
  async function tick() {
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 250))
    await nextTick()
  }
  await tick()
  return {
    host,
    errors,
    tick,
    dispose() {
      app.unmount()
      date.dispose()
      host.remove()
    },
  }
}
