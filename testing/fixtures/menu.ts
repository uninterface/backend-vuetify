import { h, isVNode, nextTick, ref } from 'vue'
import { createUiApplication } from '@uninterface/uninterface/setup'
import EntryPopup from '../../src/EntryPopup.vue'
import EntryBranch from '../../src/EntryBranch.vue'
import type { UiEntryViewNode } from '@uninterface/uninterface/backend'

export async function mountMenu() {
  const host = document.createElement('div')
  const anchor = document.createElement('button')
  anchor.textContent = 'Commands'
  host.append(anchor)
  document.body.append(host)
  anchor.focus()
  const mount = document.createElement('div')
  host.append(mount)
  const expanded = ref(false)
  const pending = ref(true)
  const popup = ref<InstanceType<typeof EntryPopup>>()
  const errors: string[] = []
  const status = () => ({
    pending: pending.value,
    failed: false,
    message: pending.value ? 'Loading' : '',
    retryLabel: 'Retry',
  })
  const entries = (): UiEntryViewNode[] => [
    { entry: { key: 'refresh', label: 'Refresh' } },
    {
      entry: { kind: 'submenu', key: 'more', label: 'More', children: [] },
      expanded: expanded.value,
      status: status(),
      children: pending.value
        ? []
        : [{ entry: { key: 'archive', label: 'Archive' } }],
    },
  ]
  const app = createUiApplication({
    render: () =>
      h(
        EntryPopup,
        { ref: popup, anchor },
        {
          default: () =>
            h(EntryBranch, {
              entries: entries(),
              status: {
                pending: false,
                failed: false,
                message: '',
                retryLabel: 'Retry',
              },
              label: 'Commands',
              onExpand: (_key: string, open: boolean) => {
                expanded.value = open
              },
            }),
        },
      ),
  })
  app.config.errorHandler = (error) => errors.push(String(error))
  await app.ui.ready
  app.mount(mount)
  await nextTick()
  return {
    errors,
    tick: nextTick,
    // Deliver the native VOverlay transition event; VMenu forwards it to the adapter.
    shown() {
      const queue = [popup.value!.$.subTree]
      while (queue.length) {
        const vnode = queue.shift()!
        if (vnode.component) {
          if ((vnode.component.type as { name?: string }).name === 'VOverlay') {
            vnode.component.emit('afterEnter')
            return
          }
          queue.push(vnode.component.subTree)
        }
        if (Array.isArray(vnode.children))
          queue.push(...vnode.children.filter(isVNode))
      }
      throw new Error('Native overlay transition event not found.')
    },
    async expand() {
      expanded.value = true
      await nextTick()
    },
    async finish() {
      pending.value = false
      await nextTick()
    },
    dispose() {
      app.unmount()
      host.remove()
    },
  }
}
