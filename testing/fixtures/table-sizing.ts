import { defineComponent, h, nextTick, ref } from 'vue'
import { createUiApplication } from '@uninterface/uninterface/setup'
import {
  createUiListControl,
  createUiTableColumnBinding,
  UiTable,
  UiButton,
  UiTableColumn,
} from '@uninterface/uninterface'
export async function mountSizing(direct = false) {
  let reads = 0
  const control = createUiListControl({
    itemKey: (item: { id: string; value: string }) => item.id,
    query: { filters: {}, sort: [] },
    source: () => {
      reads++
      return { items: [{ id: 'a', value: 'Draft' }], complete: true }
    },
  })
  const align = ref<'left' | 'center' | 'right'>('right'),
    reverse = ref(false),
    scroll = ref<'none' | 'horizontal'>('none'),
    fixed = ref(false),
    resizable = ref(true),
    content = ref(false),
    actionLabel = ref('Remove')
  const names = ['description', 'amount', 'actions']
  const bindings = names.map((name, index) =>
    createUiTableColumnBinding(control.bindings.list, () => ({
      columnKey: name,
      label: name,
      preferredWidth:
        index === 2 && content.value ? 'content' : index === 0 ? 300 : 150,
      minWidth: index === 2 && content.value ? 'content' : 80,
      spring: index === 0 && !fixed.value,
      resizable: resizable.value,
      align: index === 0 ? 'left' : index === 1 ? align.value : 'center',
    })),
  )
  const host = document.createElement('div')
  document.body.append(host)
  const errors: string[] = []
  const app = createUiApplication(
    defineComponent({
      setup: () => () =>
        h(
          UiTable,
          {
            binding: control.bindings.list,
            'aria-label': 'Sized table',
            scroll: scroll.value,
          },
          () =>
            (reverse.value ? [...bindings].reverse() : bindings).map(
              (binding) =>
                h(
                  UiTableColumn<
                    { id: string; value: string },
                    Record<string, unknown>,
                    string
                  >,
                  {
                    ...(direct ? binding.definition : { binding }),
                    key: binding.definition.columnKey,
                  },
                  {
                    default: () =>
                      binding.definition.columnKey === 'description'
                        ? h('input', {
                            'aria-label': 'Draft',
                            defaultValue: 'Unfinished',
                            style: { width: '100%', minWidth: 0 },
                          })
                        : binding.definition.columnKey === 'actions'
                          ? h(UiButton, {}, () => actionLabel.value)
                          : 'Value',
                  },
                ),
            ),
        ),
    }),
  )
  app.config.errorHandler = (error) =>
    errors.push(String((error as Error).stack ?? error))
  await app.ui.ready
  await app.ui.ready
  await app.ui.i18n.loadNamespace('uninterface.collections')
  app.mount(host)
  await control.refresh()
  async function flush() {
    for (let i = 0; i < 10; i++) await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 20))
    await nextTick()
  }
  await flush()
  return {
    host,
    errors,
    align,
    reverse,
    scroll,
    fixed,
    resizable,
    content,
    actionLabel,
    reads: () => reads,
    flush,
    dispose() {
      app.unmount()
      control.dispose()
      host.remove()
    },
  }
}
