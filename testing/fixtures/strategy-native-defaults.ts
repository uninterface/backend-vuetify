import { VDefaultsProvider as Defaults } from 'vuetify/components/VDefaultsProvider'
import { h, nextTick } from 'vue'
import { createUiApplication } from '@uninterface/uninterface/setup'
import {
  UiField,
  UiTextInput,
  UiStrategy,
  createUiFieldControl,
  uiFieldLabels,
} from '@uninterface/uninterface'

export async function mount() {
  const field = createUiFieldControl('Draft')
  const theme = { defaults: { VTextField: { singleLine: true } } }
  const host = document.createElement('div')
  document.body.append(host)
  const app = createUiApplication({
    render: () =>
      h(Defaults, theme, () => [
        h(UiStrategy, { use: uiFieldLabels('show') }, () =>
          h(UiField, { field, label: 'Show labels' }, () =>
            h(UiTextInput, { 'data-native-show': '' }),
          ),
        ),
        h(UiStrategy, { use: uiFieldLabels('floating') }, () =>
          h(UiField, { field, label: 'Explicit floating' }, () =>
            h(UiTextInput, { 'data-native-floating': '' }),
          ),
        ),
        h(UiField, { field, label: 'Native defaults' }, () =>
          h(UiTextInput, { 'data-native-default': '' }),
        ),
      ]),
  })
  await app.ui.ready
  app.mount(host)
  await nextTick()
  return {
    host,
    dispose() {
      app.unmount()
      host.remove()
    },
  }
}
