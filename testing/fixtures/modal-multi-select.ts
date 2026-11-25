import { h, onUnmounted } from 'vue'
import {
  UiButton,
  UiField,
  UiModal,
  UiMultiSelect,
  createUiEntryControl,
  createUiFieldControl,
  createUiModalControl,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

export async function mountModalMultiSelect() {
  const app = createUiApplication({
    setup() {
      const channels = createUiFieldControl<string[]>(['email'])
      const choices = createUiEntryControl([
        { key: 'email', label: 'Email' },
        { key: 'sms', label: 'Text message' },
      ])
      const modal = createUiModalControl<void>()
      onUnmounted(() => {
        void modal.dispose()
        choices.dispose()
      })
      return () => [
        h(UiButton, { onClick: () => void modal.run() }, () => 'Edit channels'),
        h(
          UiModal<void>,
          { control: modal, title: 'Channel dialog' },
          {
            default: () =>
              h(
                UiField,
                { field: channels, label: 'Notification channels' },
                () => h(UiMultiSelect, { control: choices }),
              ),
          },
        ),
      ]
    },
  })
  await app.ui.ready
  const host = document.body.appendChild(document.createElement('div'))
  app.mount(host)
  return {
    dispose() {
      app.unmount()
      host.remove()
    },
  }
}
