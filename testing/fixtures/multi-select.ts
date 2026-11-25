import '@uninterface/backend/font-bundled.css'
import '@uninterface/backend/style.css'
import { h, nextTick, ref, type ComponentPublicInstance } from 'vue'
import {
  UiField,
  UiMultiSelect,
  UiButton,
  createUiFieldControl,
  createUiEntryControl,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

export async function mountMultiSelect() {
  const keys = ['', 'one', 'two', 'locked', 'missing']
  const field = createUiFieldControl<number[], string[]>(
    [1, 3],
    {
      format: (values) => values.map((value) => keys[value]),
      parse: (values) => ({
        ok: true,
        value: values.map((key) => keys.indexOf(key)),
      }),
    },
    [],
    {
      inputEquals: (a, b) =>
        a.length === b.length && a.every((key) => b.includes(key)),
    },
  )
  let removed = false
  let failed = false
  let resolve!: () => void
  const source = createUiEntryControl(async () => {
    await new Promise<void>((done) => {
      resolve = done
    })
    if (failed) throw new Error('Offline')
    return [
      { key: '', label: 'Empty key' },
      ...(!removed ? [{ key: 'one', label: 'First' }] : []),
      {
        key: 'two',
        label:
          'Second point of contact for weekend and public holiday escalations',
      },
      { key: 'locked', label: 'Locked', disabled: true },
    ]
  })
  const view = ref<
    ComponentPublicInstance & { focus(): Promise<boolean | null> }
  >()
  const disabled = ref(false)
  const errors: string[] = []
  const host = document.createElement('div')
  document.body.append(host)
  const app = createUiApplication({
    render: () =>
      h('main', { style: { width: 'min(100%, 22rem)' } }, [
        h(
          UiField,
          {
            field,
            'data-testid': 'membership-field',
            label: 'Membership',
            help: 'Choose available members',
            required: true,
          },
          () =>
            h(UiMultiSelect, {
              ref: view,
              control: source,
              autoLoad: false,
              disabled: disabled.value,
            }),
        ),
        h(
          'output',
          { 'data-testid': 'selected' },
          JSON.stringify(field.state.input),
        ),
        ...[
          ['Load', () => source.load()],
          ['Resolve', () => resolve?.()],
          [
            'Remove first',
            () => {
              removed = true
              return source.refresh()
            },
          ],
          [
            'Fail',
            () => {
              failed = true
              return source.refresh()
            },
          ],
          [
            'Restore',
            () => {
              failed = false
              removed = false
              return source.refresh()
            },
          ],
          ['Reset', () => field.reset()],
        ].map(([label, action]) =>
          h(
            UiButton,
            { onClick: action as () => unknown },
            () => label as string,
          ),
        ),
      ]),
  })
  app.config.errorHandler = (error) => errors.push(String(error))
  await app.ui.ready
  await app.ui.i18n.loadNamespace('uninterface.entries')
  app.mount(host)
  await app.ui.ready
  await nextTick()
  return {
    host,
    field,
    source,
    disabled,
    errors,
    resolve() {
      resolve()
    },
    remove() {
      removed = true
      return source.refresh()
    },
    fail() {
      failed = true
      return source.refresh()
    },
    restore() {
      failed = false
      removed = false
      return source.refresh()
    },
    presentation: () => view.value!.$.subTree.component!.props,
    update: (keys: string[]) =>
      view.value!.$.subTree.component!.emit('update', keys),
    focus: () => view.value!.focus(),
    dispose() {
      app.unmount()
      source.dispose()
      host.remove()
    },
  }
}
