import '@uninterface/backend/style.css'
import {
  createUiFeedbackRoute,
  createUiNotificationTarget,
  createUiToastTarget,
  type UiFloatingFeedbackRoute,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'
import { h, nextTick } from 'vue'

let unmount: (() => void) | undefined

export async function send(kind: 'toast' | 'notification') {
  unmount?.()
  const host = document.body.appendChild(document.createElement('div'))
  let route: UiFloatingFeedbackRoute
  const app = createUiApplication(
    {
      setup() {
        const target =
          kind === 'toast'
            ? createUiToastTarget({ duration: null })
            : createUiNotificationTarget({ duration: null })
        route = createUiFeedbackRoute({ target })
        return () => h('div')
      },
    },
    { i18n: { preloadCore: ['uninterface.feedback'] } },
  )
  await app.ui.ready
  app.mount(host)
  unmount = () => {
    app.unmount()
    host.remove()
  }
  route!.send({
    message: 'Action check',
    actions: [
      { key: 'first', label: 'First' },
      { key: 'next', label: 'Next' },
    ],
  })
  await nextTick()
}
