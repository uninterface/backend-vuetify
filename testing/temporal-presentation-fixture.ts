import { h, ref, nextTick } from 'vue'
import {
  UiDateInput,
  UiDateTimeInput,
  UiTimeInput,
  createUiDateControl,
  createUiDateTimeControl,
  createUiTimeControl,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'
type DateFormatWish = 'YMD' | 'DMY' | 'MDY'

export async function mount() {
  const format = ref<DateFormatWish>()
  const readonly = ref(false),
    disabled = ref(false)
  const options = {
    range: true,
    allowOpenStart: true,
    allowOpenEnd: true,
    allowUnrestricted: true,
  }
  const controls = {
    date: createUiDateControl('2026-03-02'),
    datetime: createUiDateTimeControl('2026-03-02T09:05'),
    range: createUiDateControl(
      { start: '2026-03-02', end: '2026-03-04' },
      { ...options, allowed: (date: string) => date !== '2026-03-16' },
    ),
    datetimeRange: createUiDateTimeControl(
      { start: '2026-03-02T09:05', end: '2026-03-04T17:10' },
      options,
    ),
    text: createUiDateTimeControl('2026-03-02T09:05:12.345', {
      precision: 'millisecond',
    }),
    independent: createUiDateControl('2026-03-02'),
    time: createUiTimeControl('09:05'),
    timeRange: createUiTimeControl({ start: '22:00', end: '02:00' }, options),
  }
  const errors: string[] = []
  const app = createUiApplication(
    {
      render: () =>
        h(
          'main',
          Object.entries(controls).map(([key, control]) => {
            const binding = Object.values(control.bindings)[0]
            const component =
              key === 'time' || key === 'timeRange'
                ? UiTimeInput
                : key === 'datetime' ||
                    key === 'datetimeRange' ||
                    key === 'text'
                  ? UiDateTimeInput
                  : UiDateInput
            return h('section', { 'data-case': key }, [
              h(component, {
                binding,
                'aria-label': key,
                'date-format-wish':
                  key === 'independent' ? 'MDY' : format.value,
                presentation: { locale: 'zh-CN', hourCycle: 'h23' },
                readonly: readonly.value,
                disabled: disabled.value,
              }),
            ])
          }),
        ),
    },
    { i18n: { locale: 'zh-Hans', formattingLocale: 'zh-CN' } },
  )
  app.config.errorHandler = (error) => errors.push(String(error))
  await app.ui.ready
  const host = document.createElement('div')
  document.body.append(host)
  app.mount(host)
  async function tick() {
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 50))
    await nextTick()
  }
  await tick()
  return {
    host,
    controls,
    errors,
    tick,
    async format(value?: DateFormatWish) {
      format.value = value
      await tick()
    },
    async language(value: string) {
      await app.ui.i18n.setLocale(value)
      await tick()
    },
    async readonly(value: boolean) {
      readonly.value = value
      await tick()
    },
    async disabled(value: boolean) {
      disabled.value = value
      await tick()
    },
    dispose() {
      app.unmount()
      Object.values(controls).forEach((control) => control.dispose())
      host.remove()
    },
  }
}
