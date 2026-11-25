import '@uninterface/backend/style.css'
import '@uninterface/uninterface/style.css'
import { h, ref } from 'vue'
import {
  createUiEntryControl,
  createUiFieldControl,
  UiApp,
  UiCard,
  UiField,
  UiSelect,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

declare global {
  interface Window {
    startVuetifyFixtureLoading(): void
    vuetifyPickerErrors: string[]
  }
}

const choices = createUiEntryControl([
  { key: 'a', label: 'Choice A' },
  { key: 'b', label: 'Choice B' },
])
const selection = createUiFieldControl('a')
const busy = ref(false)
window.startVuetifyFixtureLoading = () => (busy.value = true)
window.vuetifyPickerErrors = []

const app = createUiApplication({
  render: () =>
    h(UiApp, () =>
      h('main', { style: 'padding:32px' }, [
        h(UiField, { field: selection, label: 'Choose a value' }, () =>
          h(UiSelect, { control: choices }),
        ),
        h(UiCard, { loading: busy.value }, () => 'Unrelated work'),
      ]),
    ),
})
app.config.errorHandler = (error) =>
  window.vuetifyPickerErrors.push(String(error))
const host = document.body.appendChild(document.createElement('div'))
void app.ui.ready.then(() => app.mount(host))
