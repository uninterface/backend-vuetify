import { h, nextTick, ref } from 'vue'
import {
  UiField,
  UiInputFrame,
  UiTextInput,
  UiStrategy,
  UiDateInput,
  UiTimeInput,
  UiDateTimeInput,
  createUiFieldControl,
  createUiDateControl,
  createUiTimeControl,
  createUiDateTimeControl,
  uiFieldLabels,
  uiRequiredAnnotations,
  uiValidationFailure,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

export async function mount() {
  const labels = ref<'show' | 'floating' | 'above' | 'hidden'>()
  const required = ref<'yes' | 'no' | 'prefix'>('yes')
  const failure = ref<'show' | 'none'>('show')
  const disabled = ref(false),
    readonly = ref(false),
    split = ref(false)
  const label = ref('Compound value')
  const field = createUiFieldControl('initial')
  const removeCheck = field.addCheck(() =>
    field.state.input === 'bad' ? 'Invalid compound value' : null,
  )
  const scalar = createUiFieldControl('hello')
  const options = {
    range: true,
    allowOpenStart: true,
    allowOpenEnd: true,
    allowUnrestricted: true,
  }
  const ranges = {
    date: createUiDateControl(
      { start: '2026-03-02', end: '2026-03-04' },
      options,
    ),
    time: createUiTimeControl({ start: '22:00', end: '02:00' }, options),
    datetime: createUiDateTimeControl(
      { start: '2026-03-02T09:00', end: '2026-03-04T17:00' },
      options,
    ),
  }
  const frame = (key: number) =>
    h(UiInputFrame, { key, readonly: readonly.value }, () => [
      h('span', 'From'),
      h(UiTextInput),
      h('span', 'units'),
    ])
  const app = createUiApplication({
    render: () =>
      h(
        UiStrategy,
        {
          use: [
            ...(labels.value ? [uiFieldLabels(labels.value)] : []),
            uiRequiredAnnotations(required.value),
            uiValidationFailure(failure.value),
          ],
        },
        () => [
          h('section', { 'data-case': 'compound' }, [
            h(
              UiField,
              {
                field,
                label: label.value,
                help: 'Compound help',
                group: true,
                required: true,
                disabled: disabled.value,
              },
              () => (split.value ? [frame(0), frame(1)] : [frame(0)]),
            ),
          ]),
          ...Object.entries(ranges).map(([kind, control]) =>
            h('section', { 'data-case': kind }, [
              h(
                UiField,
                {
                  field: control.field,
                  label: kind,
                  help: `${kind} help`,
                  group: true,
                  required: true,
                  disabled: disabled.value,
                },
                () =>
                  h(
                    kind === 'date'
                      ? UiDateInput
                      : kind === 'time'
                        ? UiTimeInput
                        : UiDateTimeInput,
                    {
                      binding: Object.values(control.bindings)[0],
                      readonly: readonly.value,
                    },
                  ),
              ),
            ]),
          ),
          h('section', { 'data-case': 'scalar' }, [
            h(UiField, { field: scalar, label: 'Scalar' }, () =>
              h(UiTextInput),
            ),
          ]),
          h('section', { 'data-case': 'group' }, [
            h(
              UiField,
              { field: scalar, label: 'Ordinary group', group: true },
              () => h('span', 'Group content'),
            ),
          ]),
        ],
      ),
  })
  const errors: string[] = []
  app.config.errorHandler = (error) => errors.push(String(error))
  await app.ui.ready
  const host = document.createElement('div')
  document.body.append(host)
  app.mount(host)
  const tick = async () => {
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 80))
    await nextTick()
  }
  await tick()
  return {
    host,
    errors,
    field,
    ranges,
    labels,
    required,
    failure,
    disabled,
    readonly,
    split,
    label,
    tick,
    dispose() {
      app.unmount()
      removeCheck()
      Object.values(ranges).forEach((control) => control.dispose())
      host.remove()
    },
  }
}
