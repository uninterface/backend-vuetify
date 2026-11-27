import '@uninterface/backend/style.css'
import { UiFlowLayout, UiSpacer } from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'
import { h } from 'vue'

const peers = [
  h('input', { 'aria-label': 'First' }),
  h('input', { 'aria-label': 'Second' }),
]
const app = createUiApplication({
  render: () =>
    h('div', { 'data-testid': 'offer', style: { width: '216px' } }, [
      h(
        UiFlowLayout,
        {
          align: 'center',
          direction: 'horizontal',
          wrap: true,
          'data-testid': 'flow',
        },
        () => [peers[0], h(UiSpacer), peers[1]],
      ),
    ]),
})
const host = document.body.appendChild(document.createElement('div'))
void app.ui.ready.then(() => app.mount(host))
