import { h, nextTick } from 'vue'
import { createUiListControl, UiPaginator } from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

export async function mountNumberedPaginator() {
  const control = createUiListControl<number>({
    itemKey: (item) => item,
    query: { filters: {}, sort: [] },
    pagination: { kind: 'numbered', canJump: true, pageSize: 10 },
    async source(query) {
      const page = query.pagination
      if (page?.kind !== 'numbered')
        throw new Error('Expected numbered pagination')
      return {
        items: [1, 2],
        complete: false,
        pagination: { ...page, total: 250 },
      }
    },
  })
  const errors: string[] = []
  const app = createUiApplication({
    render: () =>
      h(UiPaginator, {
        binding: control.bindings.paginator!,
        'aria-label': 'Pages',
      }),
  })
  app.config.errorHandler = (error) => errors.push(String(error))
  await app.ui.ready
  await app.ui.i18n.loadNamespace('uninterface.collections')
  const host = document.body.appendChild(document.createElement('div'))
  function dispose() {
    app.unmount()
    control.dispose()
    host.remove()
  }
  try {
    app.mount(host)
    await control.refresh()
    await nextTick()
    return { host, errors, dispose }
  } catch (error) {
    dispose()
    throw error
  }
}
