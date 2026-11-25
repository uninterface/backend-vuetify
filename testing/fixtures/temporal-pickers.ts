import { h, ref, nextTick } from 'vue'
import {
  UiField,
  createUiFormControl,
  UiDateInput,
  UiTimeInput,
  UiDateTimeInput,
  createUiDateControl,
  createUiTimeControl,
  createUiDateTimeControl,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

export async function mount(native = false, browserDefaults = false) {
  const locale = ref('en-US')
  const disabled = ref(false),
    readonly = ref(false)
  const date = createUiDateControl('2024-02-29', {
    allowed: (value) => value !== '2024-02-16',
  })
  const time = createUiTimeControl(native ? '09:30:12' : '09:30:12.345', {
    precision: native ? 'second' : 'millisecond',
  })
  const datetime = createUiDateTimeControl(
    native ? '2024-02-29T09:30:12' : '2024-02-29T09:30:12.345',
    {
      precision: native ? 'second' : 'millisecond',
    },
  )
  const form = createUiFormControl({
    date: date.field,
    time: time.field,
    datetime: datetime.field,
  })
  const errors: string[] = []
  const app = createUiApplication({
    render: () =>
      h('main', [
        h(
          UiField,
          { field: date.field, label: 'Date' },
          {
            default: () =>
              h(UiDateInput, {
                binding: date.bindings.dateInput,
                disabled: disabled.value,
                readonly: readonly.value,
                presentation: browserDefaults
                  ? undefined
                  : { locale: locale.value, hourCycle: native ? 'h12' : 'h23' },
              }),
          },
        ),
        h(
          UiField,
          { field: time.field, label: 'Time' },
          {
            default: () =>
              h(UiTimeInput, {
                binding: time.bindings.timeInput,
                presentation: browserDefaults
                  ? undefined
                  : { locale: locale.value, hourCycle: native ? 'h12' : 'h23' },
                disabled: disabled.value,
                readonly: readonly.value,
              }),
          },
        ),
        h(
          UiField,
          { field: datetime.field, label: 'Date and time' },
          {
            default: () =>
              h(UiDateTimeInput, {
                binding: datetime.bindings.dateTimeInput,
                disabled: disabled.value,
                readonly: readonly.value,
              }),
          },
        ),
      ]),
  })
  app.config.errorHandler = (error) => errors.push(String(error))
  await app.ui.ready
  const host = document.createElement('div')
  document.body.append(host)
  await app.ui.ready
  await app.ui.i18n.loadNamespace('uninterface.temporal')
  app.mount(host)
  async function tick() {
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 250))
    await nextTick()
  }
  await tick()
  return {
    host,
    form,
    date,
    time,
    datetime,
    errors,
    tick,
    async setLocale(value: string) {
      locale.value = value
      await tick()
    },
    async setDisabled(value: boolean) {
      disabled.value = value
      await tick()
    },
    async setReadonly(value: boolean) {
      readonly.value = value
      await tick()
    },
    dispose() {
      app.unmount()
      host.remove()
      form.dispose()
      date.dispose()
      time.dispose()
      datetime.dispose()
    },
  }
}
