import { h, reactive, nextTick, ref } from 'vue'
import { VDefaultsProvider } from 'vuetify/components/VDefaultsProvider'
import {
  UiStrategy,
  UiField,
  UiSegmentedSelect,
  UiSelect,
  UiTextInput,
  createUiFieldControl,
  createUiEntryControl,
  uiFieldLabels,
  uiRequiredAnnotations,
  uiValidationFailure,
  uiControlSize,
  type UiControlSize,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'
import '../../src/style.css'

export async function mountSegmentedField(locale = 'en') {
  const state = reactive({
    labels: undefined as 'floating' | 'show' | 'above' | 'hidden' | undefined,
    required: 'yes' as 'yes' | 'no' | 'prefix',
    failure: 'show' as 'show' | 'none' | 'show-tooltip',
    help: 'Select a period',
    size: undefined as UiControlSize | undefined,
    disabled: false,
    label: 'Period',
    monthLabel: 'This month',
    variant: 'filled' as 'filled' | 'outlined',
    orientation: 'horizontal' as 'horizontal' | 'vertical',
  })
  const field = createUiFieldControl<string | undefined>(undefined, undefined, [
    (value) => (value === undefined ? 'Choose a period' : null),
  ])
  const text = createUiFieldControl('')
  const selected = createUiFieldControl('week')
  const choices = createUiEntryControl([
    { key: '', label: 'Today' },
    { key: 'week', label: 'This week' },
    { key: 'locked', label: 'Locked', disabled: true },
    {
      key: 'month',
      get label() {
        return state.monthLabel
      },
    },
  ])
  const view = ref<{ focus(): Promise<boolean | null> }>()
  const host = document.createElement('div')
  document.body.append(host)
  const errors: string[] = []
  const app = createUiApplication(
    {
      render: () =>
        h(
          VDefaultsProvider,
          {
            defaults: {
              VField: { variant: state.variant, singleLine: true },
              VTextField: { singleLine: true, variant: state.variant },
            },
          },
          () =>
            h(
              UiStrategy,
              {
                use: [
                  ...(state.labels ? [uiFieldLabels(state.labels)] : []),
                  uiRequiredAnnotations(state.required),
                  uiValidationFailure(state.failure),
                  ...(state.size !== undefined
                    ? [uiControlSize(state.size)]
                    : []),
                ],
              },
              () => [
                h(
                  UiField,
                  {
                    field,
                    label: state.label,
                    required: true,
                    help: state.help,
                    'data-case': 'segmented',
                  },
                  () =>
                    h(UiSegmentedSelect, {
                      control: choices,
                      disabled: state.disabled,
                      orientation: state.orientation,
                      ref: view,
                    }),
                ),
                h(
                  UiField,
                  { field: text, label: 'Ordinary text', 'data-case': 'text' },
                  () => h(UiTextInput),
                ),
                h(
                  UiField,
                  {
                    field: selected,
                    label: 'Ordinary select',
                    'data-case': 'select',
                  },
                  () => h(UiSelect, { control: choices }),
                ),
                h(
                  'button',
                  { type: 'button', 'data-case': 'outside' },
                  'Outside',
                ),
              ],
            ),
        ),
    },
    { i18n: { locale } },
  )
  app.config.errorHandler = (error) => errors.push(String(error))
  await app.ui.ready
  app.mount(host)
  await choices.load()
  const tick = async () => {
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 30))
    await nextTick()
  }
  await tick()
  return {
    host,
    errors,
    field,
    state,
    tick,
    focus: () => view.value!.focus(),
    dispose: () => {
      app.unmount()
      choices.dispose()
      host.remove()
    },
  }
}
