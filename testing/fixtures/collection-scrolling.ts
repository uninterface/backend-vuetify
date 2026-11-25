import { h, nextTick, ref } from 'vue'
import {
  UiList,
  UiTable,
  UiTableColumn,
  createUiListControl,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

export async function mountCollectionScrolling() {
  const bounded = ref(false)
  const horizontal = ref(false)
  const control = createUiListControl({
    itemKey: (item: number) => item,
    query: { filters: {}, sort: [] },
    source: () => ({
      items: Array.from({ length: 40 }, (_, i) => i + 1),
      complete: true,
    }),
  })
  await control.refresh()
  const host = document.createElement('div')
  document.body.append(host)
  const errors: string[] = []
  const app = createUiApplication({
    render: () =>
      h('div', { style: { width: '360px' } }, [
        ...(['table', 'list'] as const).map((kind) =>
          h(
            'section',
            {
              'data-allocation': kind,
              style: { height: bounded.value ? '240px' : undefined },
            },
            [
              h(
                kind === 'table' ? UiTable<number> : UiList<number>,
                {
                  binding: control.bindings.list,
                  'aria-label': `Scrolling ${kind}`,
                  height: bounded.value ? 'full' : 'content',
                  scroll: horizontal.value ? 'horizontal' : 'none',
                },
                kind === 'table'
                  ? {
                      default: () =>
                        h(
                          UiTableColumn<number>,
                          {
                            columnKey: 'number',
                            label: 'Number',
                            minWidth: horizontal.value ? '600px' : '100px',
                          },
                          {
                            default: ({ item }: { item: number }) =>
                              h(
                                'div',
                                { style: { height: '40px' } },
                                `Row ${item}`,
                              ),
                          },
                        ),
                    }
                  : {
                      default: ({ item }: { item: number }) =>
                        h(
                          'div',
                          {
                            style: {
                              height: '40px',
                              minWidth: horizontal.value ? '600px' : undefined,
                            },
                          },
                          `Row ${item}`,
                        ),
                    },
              ),
            ],
          ),
        ),
      ]),
  })
  app.config.errorHandler = (error) => errors.push(String(error))
  await app.ui.ready
  await app.ui.i18n.loadNamespace('uninterface.collections')
  app.mount(host)
  async function configure(full: boolean, wide: boolean) {
    bounded.value = full
    horizontal.value = wide
    for (let i = 0; i < 10; i++) await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  await configure(false, false)
  return {
    host,
    errors,
    configure,
    dispose() {
      app.unmount()
      control.dispose()
      host.remove()
    },
  }
}
