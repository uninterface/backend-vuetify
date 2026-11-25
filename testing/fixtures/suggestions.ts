import '@uninterface/backend/style.css'
import {
  createUiFieldControl,
  createUiSearchControl,
  UiField,
  UiTextInput,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'
import { h, onUnmounted } from 'vue'

const app = createUiApplication(
  {
    setup() {
      const field = createUiFieldControl('')
      const search = createUiSearchControl(
        async ({ query, signal }) => {
          await new Promise((resolve) => setTimeout(resolve, 650))
          if (signal.aborted) return []
          const term = query.toLowerCase()
          return ['Birch', 'Cedar Falls'].flatMap((name) => {
            const start = name.toLowerCase().indexOf(term)
            return start < 0
              ? []
              : [{ name, match: [start, start + term.length] as const }]
          })
        },
        {
          key: (item) => item.name,
          label: (item) => item.name,
          matchRanges: (item) => [item.match],
        },
      )
      const binding = search.bindings.textInput({ text: (item) => item.name })
      onUnmounted(() => search.dispose())
      return () =>
        h(UiField, { field, label: 'Suggested name' }, () =>
          h(UiTextInput, { suggestions: binding }),
        )
    },
  },
  {
    colorMode: { document },
    i18n: { preloadCore: ['uninterface.entries'] },
  },
)

void app.ui.ready.then(() =>
  app.mount(document.body.appendChild(document.createElement('div'))),
)
