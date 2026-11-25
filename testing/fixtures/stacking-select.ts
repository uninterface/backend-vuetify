import { h, nextTick } from 'vue'
import { createUiApplication } from '@uninterface/uninterface/setup'
import {
  UiField,
  UiSelect,
  createUiFieldControl,
  createUiEntryControl,
  useUiStacking,
} from '@uninterface/uninterface'

export async function mountZSelection() {
  const host = document.createElement('div')
  document.body.append(host)
  const field = createUiFieldControl('a'),
    choices = createUiEntryControl([
      { key: 'a', label: 'Alpha' },
      { key: 'b', label: 'Beta' },
    ])
  const errors: string[] = []
  let stacking: ReturnType<typeof useUiStacking>
  const app = createUiApplication({
    setup() {
      stacking = useUiStacking()
      return () =>
        h(UiField, { field, label: 'Popup choice' }, () =>
          h(UiSelect, { control: choices }),
        )
    },
  })
  app.config.errorHandler = (e) => errors.push(String(e))
  await app.ui.ready
  app.mount(host)
  await nextTick()
  await nextTick()
  return {
    errors,
    host,
    popupValue(element: Element) {
      const handle = stacking!.fromElement(element)
      return stacking!.snapshot.value.entries.find(
        (entry) => entry.handle === handle,
      )?.value
    },
    dispose() {
      app.unmount()
      choices.dispose()
      host.remove()
    },
  }
}
