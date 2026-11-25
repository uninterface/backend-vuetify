import '@uninterface/backend/style.css'
import { h, nextTick, ref } from 'vue'
import {
  createUiEntryControl,
  UiNavbar,
  UiNavMenu,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

export async function mountNavigation() {
  const current = ref('dates')
  const activated: string[] = []
  const errors: string[] = []
  const control = createUiEntryControl([
    {
      kind: 'submenu',
      key: 'examples',
      label: 'Examples',
      children: [
        { key: 'native', label: 'Native HTML', href: '#native' },
        { key: 'dates', label: 'Dates and times', href: '#dates' },
        {
          key: 'disabled',
          label: 'Unavailable',
          href: '#disabled',
          disabled: true,
        },
        {
          kind: 'group',
          key: 'group',
          label: 'More examples',
          entries: [{ key: 'cards', label: 'Cards', href: '#cards' }],
        },
      ],
    },
  ])
  const host = document.createElement('div')
  document.body.append(host)
  const app = createUiApplication({
    render: () =>
      h('main', [
        h(
          UiNavbar,
          { 'aria-label': 'Workspace' },
          {
            default: () =>
              h(UiNavMenu, {
                control,
                modelValue: current.value,
                'aria-label': 'Destinations',
                onActivate: (key: string) => {
                  activated.push(key)
                  current.value = key
                },
              }),
          },
        ),
        h('ul', { 'data-prose': '' }, [
          h('li', [h('a', { href: '#prose' }, 'Ordinary link')]),
        ]),
      ]),
  })
  app.config.errorHandler = (error) => errors.push(String(error))
  await app.ui.ready
  app.mount(host)
  const tick = async () => {
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 80))
    await nextTick()
  }
  await tick()
  return {
    host,
    activated,
    errors,
    tick,
    dispose() {
      app.unmount()
      control.dispose()
      host.remove()
    },
  }
}

export { mountTravel } from './travel-navigation'
