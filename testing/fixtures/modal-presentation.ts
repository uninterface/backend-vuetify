import { h } from 'vue'
import {
  UiModal,
  createUiModalControl,
  UiButton,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

export async function mountModal() {
  const control = createUiModalControl<void>()
  const errors: string[] = []
  const app = createUiApplication({
    render: () =>
      h(
        UiModal,
        { control, title: 'Modal example' },
        {
          default: () => 'Review the details.',
          actions: () =>
            h(
              UiButton,
              { onClick: () => control.state.session?.cancel() },
              () => 'Cancel',
            ),
        },
      ),
  })
  app.config.errorHandler = (error) => errors.push(String(error))
  await app.ui.ready
  const host = document.body.appendChild(document.createElement('div'))
  app.mount(host)
  return {
    control,
    errors,
    async dispose() {
      app.unmount()
      await control.dispose()
      host.remove()
    },
  }
}
