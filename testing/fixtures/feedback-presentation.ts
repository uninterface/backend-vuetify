import { defineComponent, h, nextTick } from 'vue'
import {
  createUiToastTarget,
  createUiNotificationTarget,
  createUiFeedbackRoute,
  type UiFeedbackTargetOptions,
  type UiFloatingFeedbackRoute,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

export async function mountFeedback(
  options: UiFeedbackTargetOptions,
  kind: 'toast' | 'notification',
) {
  const state = { errors: [] as string[] }
  let route: UiFloatingFeedbackRoute
  const app = createUiApplication(
    defineComponent({
      setup() {
        const target =
          kind === 'toast'
            ? createUiToastTarget(options)
            : createUiNotificationTarget(options)
        route = createUiFeedbackRoute({ target })
        return () => h('button', 'Origin')
      },
    }),
  )
  app.config.errorHandler = (error) => state.errors.push(String(error))
  await app.ui.ready
  const host = document.body.appendChild(document.createElement('div'))
  app.mount(host)
  await nextTick()
  return {
    host,
    state,
    flush: nextTick,
    send(title: string, rich = false, duration?: number | null) {
      return route.send(
        {
          title,
          message: 'Operation completed',
          announcement: 'polite',
          details: ['Related detail'],
          actions: [
            {
              key: 'action',
              label: 'Action',
              binding: {
                target: 'button',
                type: 'button',
                disabled: false,
                loading: false,
                activate: () => {},
              },
            },
          ],
        },
        {
          duration,
          ...(rich
            ? { content: () => h('input', { 'aria-label': 'Delivery draft' }) }
            : {}),
        },
      )
    },
    dispose() {
      app.unmount()
      host.remove()
    },
  }
}
