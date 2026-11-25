import '@uninterface/backend/style.css'
import '@uninterface/uninterface/style.css'
import { h, nextTick, ref } from 'vue'
import {
  UiApp,
  UiField,
  UiFileInput,
  UiInputFrame,
  UiTextInput,
  UiButton,
  UiUploadRegion,
  createUiFieldControl,
  createUiUploadRegionControl,
  createUiUploadController,
  createUiFileDescriptorFromFile,
  type UiFileDescriptor,
  type UiUploadRegionAction,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

export async function mount() {
  const disabled = ref(false),
    readonly = ref(false)
  const file = createUiFieldControl<UiFileDescriptor<File> | null>(null)
  const uploaded = createUiFieldControl<UiFileDescriptor<File> | null>(null)
  const shared = createUiFieldControl('Retain draft')
  const ordinary = createUiFieldControl('Ordinary')
  let transfer: 'success' | 'failure' | 'pending' = 'success'
  const controller = createUiUploadController<File>({
    transport(file) {
      if (transfer === 'failure')
        return Promise.reject(new Error('Upload failed'))
      if (transfer === 'pending') return new Promise(() => {})
      return Promise.resolve(file)
    },
  })
  const actions = ref<readonly UiUploadRegionAction[]>()
  const workflow = createUiUploadRegionControl({
    uploadController: controller,
    destination: { field: uploaded },
    retry: true,
  })
  const handles: Record<string, { focus(): Promise<boolean | null> }> = {}
  const errors: string[] = []
  const restrictions = () => ({
    disabled: disabled.value,
    readonly: readonly.value,
  })
  const section = (name: string, content: () => any) =>
    h(
      'section',
      {
        'data-surface': name,
        style: 'margin:16px;width:500px',
      },
      [
        h('button', { 'data-before': name }, 'Before ' + name),
        content(),
        h('button', { 'data-after': name }, 'After ' + name),
      ],
    )
  const handle = (name: string) => (value: any) => {
    if (value) handles[name] = value
  }
  const host = document.createElement('main')
  document.body.append(host)
  const app = createUiApplication(
    {
      render: () =>
        h(
          UiApp,
          {},
          {
            default: () => [
              section('ordinary', () =>
                h(UiField, { field: ordinary, label: 'Ordinary' }, () =>
                  h(UiTextInput, restrictions()),
                ),
              ),
              section('file', () =>
                h(UiField, { field: file, label: 'File' }, () =>
                  h(UiFileInput, { ...restrictions(), ref: handle('file') }),
                ),
              ),
              section('frame', () =>
                h(UiField, { field: shared, label: 'Shared' }, () =>
                  h(
                    UiInputFrame,
                    { ...restrictions(), ref: handle('frame') },
                    () => [
                      h('span', { 'data-prefix': '' }, 'Prefix'),
                      h(UiTextInput),
                      h(
                        UiButton,
                        { onClick: () => shared.set('') },
                        () => 'Clear',
                      ),
                    ],
                  ),
                ),
              ),
              section('upload', () =>
                h(UiField, { field: uploaded, label: 'Upload' }, () =>
                  h(UiUploadRegion, {
                    ...restrictions(),
                    binding: workflow.bindings.region,
                    actions: actions.value,
                    ref: handle('upload'),
                  }),
                ),
              ),
            ],
          },
        ),
    },
    { colorMode: { document } },
  )
  app.config.errorHandler = (error) => errors.push(String(error))
  await app.ui.ready
  await app.ui.i18n.loadNamespace('uninterface.files')
  app.mount(host)
  const flush = async () => {
    await nextTick()
    await new Promise((r) => setTimeout(r, 70))
    await nextTick()
  }
  await flush()
  return {
    errors,
    disabled,
    readonly,
    flush,
    values: () => ({
      file: file.state.input?.name ?? null,
      uploaded: uploaded.state.input?.name ?? null,
      shared: shared.state.input,
    }),
    focus: (name: string) => handles[name].focus(),
    async fail() {
      transfer = 'failure'
      await workflow.acquire([new File(['failed'], 'failed.txt')])
      await flush()
    },
    async pendingWithoutActions() {
      actions.value = []
      transfer = 'pending'
      void workflow.acquire([new File(['pending'], 'pending.txt')])
      await flush()
    },
    async reject() {
      await workflow.acquire([
        new File(['a'], 'a.txt'),
        new File(['b'], 'b.txt'),
      ])
      await flush()
    },
    async retained(value: boolean) {
      const descriptor = value
        ? createUiFileDescriptorFromFile(
            new File(['notes'], 'notes.txt', { type: 'text/plain' }),
          )
        : null
      await file.set(descriptor)
      await uploaded.set(descriptor)
      await flush()
    },
    mode: (value: 'light' | 'dark') => app.ui.colorMode!.setPreference(value),
    dispose() {
      app.unmount()
      workflow.dispose()
      controller.dispose()
      host.remove()
    },
  }
}
