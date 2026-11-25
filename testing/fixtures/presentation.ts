import { h, nextTick, reactive, type VNode } from 'vue'
import {
  getUiRuntime,
  UiBadge,
  UiButton,
  UiCollapsible,
  type UiButtonVariant,
  type UiThemeColor,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

async function mount(render: () => VNode) {
  const app = createUiApplication({ render })
  const errors: string[] = []
  app.config.errorHandler = (error) => errors.push(String(error))
  await app.ui.ready
  const host = document.body.appendChild(document.createElement('div'))
  app.mount(host)
  await nextTick()
  return {
    host,
    errors,
    dispose() {
      app.unmount()
      host.remove()
    },
  }
}

export async function mountNeutralButton() {
  const props = reactive<{ color: UiThemeColor; variant: UiButtonVariant }>({
    color: 'primary',
    variant: 'neutral',
  })
  const example = await mount(() => h(UiButton, props, () => 'Cancel'))
  return {
    ...example,
    colors: getUiRuntime().theme.colors.supported,
    async update(values: Partial<typeof props>) {
      Object.assign(props, values)
      await nextTick()
    },
  }
}

export async function mountExpandedCollapsible() {
  const state = reactive<{ expanded: boolean; color?: UiThemeColor }>({
    expanded: true,
  })
  const example = await mount(() =>
    h(
      UiCollapsible,
      {
        'data-fixture': 'collapsible',
        modelValue: state.expanded,
        color: state.color,
      },
      {
        summary: () => [
          h('span', 'Account'),
          h(UiBadge, { color: 'warning' }, () => 'Incomplete'),
        ],
        default: () => 'Account details',
      },
    ),
  )
  return {
    ...example,
    async update(values: Partial<typeof state>) {
      Object.assign(state, values)
      await nextTick()
    },
  }
}
