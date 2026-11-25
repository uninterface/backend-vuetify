import { h } from 'vue'
import {
  UiField,
  UiUploadRegion,
  createUiFieldControl,
  createUiUploadController,
  createUiUploadRegionControl,
  type UiFileDescriptor,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

export async function mountUpload() {
  const field = createUiFieldControl<UiFileDescriptor<File> | null>(null)
  const controller = createUiUploadController<File>({
    transport: async (file) => file,
  })
  const upload = createUiUploadRegionControl({
    uploadController: controller,
    destination: { field },
  })
  const app = createUiApplication({
    render: () =>
      h(UiField, { field, label: 'Image', required: true }, () =>
        h(UiUploadRegion, {
          binding: upload.bindings.region,
          'data-upload-fixture': '',
        }),
      ),
  })
  const errors: string[] = []
  app.config.errorHandler = (error) => errors.push(String(error))
  await app.ui.ready
  const host = document.body.appendChild(document.createElement('div'))
  app.mount(host)
  return {
    root: host.querySelector<HTMLElement>('[data-upload-fixture]'),
    errors,
    dispose() {
      app.unmount()
      upload.dispose()
      controller.dispose()
      host.remove()
    },
  }
}
