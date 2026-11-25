import { h, nextTick } from 'vue'
import {
  createUiFieldControl,
  UiField,
  UiStrategy,
  UiTextInput,
  uiValidationFailure,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

export async function mountFieldTooltip() {
  const field = createUiFieldControl('', undefined, [
    (value) => (value ? null : 'Enter a value.'),
  ])
  const errors: string[] = []
  const app = createUiApplication({
    render: () =>
      h(UiStrategy, { use: uiValidationFailure('show-tooltip') }, () =>
        h(UiField, { field, label: 'Editable value', required: true }, () =>
          h(UiTextInput),
        ),
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
    async validate() {
      await field.validate()
      await nextTick()
    },
    async recover() {
      await field.set('Recovered')
      await field.validate()
      await nextTick()
    },
    dispose() {
      app.unmount()
      host.remove()
    },
  }
}
