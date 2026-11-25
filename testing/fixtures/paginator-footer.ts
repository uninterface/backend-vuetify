import '@uninterface/backend/style.css'
import '@uninterface/uninterface/style.css'
import { h } from 'vue'
import {
  createUiListControl,
  createUiLocalListSource,
  UiCollectionFooter,
  UiPaginator,
  UiPaginatorJumper,
  UiPaginatorSizeSelect,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

async function mountFooter() {
  const items = Array.from({ length: 137 }, (_, index) => index + 1)
  const control = createUiListControl({
    itemKey: (item: number) => item,
    query: { filters: {}, sort: [] },
    pagination: {
      kind: 'numbered',
      pageSize: 5,
      pageSizes: [5, 10, 20, 50, 100],
      canJump: true,
    },
    source: createUiLocalListSource({ items: () => items }),
  })
  const pagination = control.bindings.paginator!
  const app = createUiApplication({
    render: () =>
      h(
        UiCollectionFooter,
        { 'data-testid': 'paginator-footer' },
        {
          info: () =>
            pagination.range &&
            h(
              'span',
              `${pagination.range.start}–${pagination.range.end} of ${pagination.total} records`,
            ),
          size: () => h(UiPaginatorSizeSelect, { binding: pagination }),
          paginator: () =>
            h(UiPaginator, { binding: pagination, 'aria-label': 'Pages' }),
          jumper: () => h(UiPaginatorJumper, { binding: pagination }),
        },
      ),
  })
  await app.ui.ready
  await control.refresh()
  // Keep the offer tied to viewport changes while leaving a page inset on either side.
  const host = document.body.appendChild(document.createElement('div'))
  host.style.marginInline = '1rem'
  app.mount(host)
}
void mountFooter()
