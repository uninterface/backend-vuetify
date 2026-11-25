import '@uninterface/backend/style.css'
import {
  createCommentVNode,
  defineComponent,
  Fragment,
  h,
  nextTick,
  onMounted,
  ref,
} from 'vue'
import {
  UiCollectionFooter,
  UiPaginator,
  UiPaginatorSizeSelect,
  UiPaginatorJumper,
  createUiListControl,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

export async function mountCollectionFooter() {
  let reads = 0
  let mounts = 0
  const show = ref(true)
  const size = ref(true)
  const info = ref(true)
  const rtl = ref(false)
  const navigation = ref(true)
  const jump = ref(true)
  const control = createUiListControl<number>({
    itemKey: (item) => item,
    query: { filters: {}, sort: [] },
    pagination: {
      kind: 'numbered',
      pageSize: 5,
      pageSizes: [5, 10],
      canJump: true,
    },
    source(query) {
      reads++
      const page = query.pagination!
      if (page.kind !== 'numbered') throw new Error('Expected numbered page')
      return {
        items: Array.from(
          { length: page.size },
          (_, i) => (page.number - 1) * page.size + i,
        ),
        complete: false,
        pagination: { ...page, total: 30 },
      }
    },
  })
  const pagination = control.bindings.paginator!
  const CustomJumper = defineComponent({
    setup() {
      onMounted(() => mounts++)
      return () => h(UiPaginatorJumper, { binding: pagination })
    },
  })
  const host = document.createElement('div')
  document.body.append(host)
  const errors: string[] = []
  const app = createUiApplication({
    render: () =>
      h(
        UiCollectionFooter,
        {
          id: 'order-footer',
          'data-footer': '',
          dir: rtl.value ? 'rtl' : 'ltr',
        },
        {
          info: () =>
            h(
              Fragment,
              info.value && show.value
                ? [
                    h(
                      'span',
                      { 'data-part': 'info' },
                      'Selected or result information',
                    ),
                  ]
                : [createCommentVNode('empty'), '  '],
            ),
          size: () =>
            show.value && size.value
              ? h('div', { 'data-part': 'size' }, [
                  h(UiPaginatorSizeSelect, { binding: pagination }),
                ])
              : null,
          paginator: () =>
            show.value && navigation.value
              ? h('div', { 'data-part': 'paginator' }, [
                  h(UiPaginator, {
                    binding: pagination,
                    ariaLabel: 'Order pages',
                  }),
                ])
              : null,
          jumper: () =>
            show.value && jump.value
              ? h('div', { 'data-part': 'jumper' }, [h(CustomJumper)])
              : null,
        },
      ),
  })
  app.config.errorHandler = (error) => errors.push(String(error))
  app.config.warnHandler = (message) => errors.push(message)
  await app.ui.ready
  await app.ui.ready
  await app.ui.i18n.loadNamespace('uninterface.collections')
  await app.ui.i18n.loadNamespace('uninterface.entries')
  await app.ui.i18n.loadNamespace('uninterface.numbers')
  app.mount(host)
  async function flush() {
    for (let i = 0; i < 10; i++) await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))
    await nextTick()
  }
  await flush()
  return {
    host,
    errors,
    flush,
    get reads() {
      return reads
    },
    get mounts() {
      return mounts
    },
    async load() {
      await control.refresh()
      await flush()
    },
    async toggleSize() {
      size.value = !size.value
      await flush()
    },
    async toggleInfo() {
      info.value = !info.value
      await flush()
    },
    async toggleDirection() {
      rtl.value = !rtl.value
      await flush()
    },
    async setParts(parts: string[]) {
      info.value = parts.includes('info')
      size.value = parts.includes('size')
      navigation.value = parts.includes('paginator')
      jump.value = parts.includes('jumper')
      await flush()
    },
    async toggleAll() {
      show.value = !show.value
      await flush()
    },
    dispose() {
      app.unmount()
      app.ui.dispose()
      control.dispose()
      host.remove()
    },
  }
}
