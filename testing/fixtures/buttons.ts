import { createUiApplication } from '@uninterface/uninterface/setup'
import { h, nextTick, reactive } from 'vue'
import {
  UiButton,
  UiStrategy,
  uiButtonVariant,
  uiButtonVariantQuery,
  type UiButtonVariant,
} from '@uninterface/uninterface'

// A consumer exercising runtime bindings, including invalid JavaScript callers.
export async function mountButton(
  options: Record<string, unknown> = {},
  content: {
    icon?: boolean
    label?: string
    strategy?: UiButtonVariant
    conflict?: UiButtonVariant
    block?: boolean
  } = {},
) {
  const presentation = reactive(content)
  const props = reactive(options)
  const state = { clicks: 0, submits: 0, errors: [] as string[] }
  const host = document.createElement('div')
  document.body.append(host)
  const app = createUiApplication({
    render: () =>
      h(
        UiStrategy,
        {
          use: [
            presentation.strategy && uiButtonVariant(presentation.strategy),
            presentation.conflict && uiButtonVariant(presentation.conflict),
          ].filter(Boolean) as any,
        },
        () =>
          h(
            UiStrategy,
            { block: presentation.block ? uiButtonVariantQuery : [] },
            () =>
              h(
                'form',
                {
                  onSubmit: (event: Event) => {
                    event.preventDefault()
                    state.submits++
                  },
                },
                [
                  h(
                    UiButton,
                    {
                      ...props,
                      'aria-label': presentation.icon
                        ? undefined
                        : 'Example action',
                      ...(props.binding
                        ? {}
                        : { onClick: () => state.clicks++ }),
                    },
                    {
                      default: () => presentation.label ?? 'Example',
                      ...(presentation.icon
                        ? {
                            icon: () =>
                              h('span', { 'data-button-icon': '' }, '◇'),
                          }
                        : {}),
                    },
                  ),
                ],
              ),
          ),
      ),
  })
  await app.ui.ready
  app.config.errorHandler = (error) => state.errors.push(String(error))
  app.mount(host)
  await nextTick()
  return {
    host,
    state,
    updateContent: async (values: typeof content) => {
      Object.assign(presentation, values)
      await nextTick()
    },
    update: async (values: Record<string, unknown>) => {
      Object.assign(props, values)
      await nextTick()
    },
    dispose: () => {
      app.unmount()
      host.remove()
    },
  }
}
