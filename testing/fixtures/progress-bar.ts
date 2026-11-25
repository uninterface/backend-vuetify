import '@uninterface/backend/style.css'
import { UiProgressBar, type UiThemeColor } from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'
import { h, nextTick, ref } from 'vue'

export async function mount() {
  const color = ref<UiThemeColor>()
  const app = createUiApplication({
    render: () =>
      h(UiProgressBar, {
        id: 'standalone',
        'aria-label': 'Import records',
        value: 1,
        max: 3,
        color: color.value,
      }),
  })
  await app.ui.ready
  app.mount(document.body.appendChild(document.createElement('div')))
  await nextTick()
  return { color, tick: nextTick }
}
