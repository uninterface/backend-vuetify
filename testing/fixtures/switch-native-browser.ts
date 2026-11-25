import { createUiApplication } from '@uninterface/uninterface/setup'
import { h, type Component } from 'vue'
import { VSwitch } from 'vuetify/components'
import '@uninterface/backend/style.css'

// Compare the installed toolkit's own switch options.
async function mountNativeSwitches() {
  const variants = [
    { name: 'Native default', props: {} },
    { name: 'Primary', props: { color: 'primary' } },
    { name: 'Inset', props: { inset: true } },
    { name: 'Inset + primary', props: { inset: true, color: 'primary' } },
    { name: 'Material inset', props: { inset: 'material' } },
  ]
  const host = document.createElement('main')
  document.body.append(host)
  const mode = new URLSearchParams(window.location.search).get('mode')
  const app = createUiApplication(
    {
      render: () =>
        h(
          'div',
          {
            style: {
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            },
          },
          variants.map((variant) =>
            h('section', { 'data-variant': variant.name }, [
              h('p', variant.name),
              ...[false, true].map((value) =>
                h(VSwitch as Component, {
                  ...variant.props,
                  modelValue: value,
                  label: value ? 'On' : 'Off',
                  hideDetails: true,
                }),
              ),
            ]),
          ),
        ),
    },
    { colorMode: { document, preference: mode === 'dark' ? 'dark' : 'light' } },
  )
  await app.ui.ready
  app.mount(host)
}

void mountNativeSwitches()
