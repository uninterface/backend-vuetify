import { createUiApplication } from '@uninterface/uninterface/setup'
import { computed, h, nextTick, reactive } from 'vue'
import {
  UiStrategy,
  UiField,
  UiForm,
  createUiFormControl,
  UiTextInput,
  UiCheckbox,
  UiSwitch,
  UiRadioGroup,
  UiCheckboxGroup,
  UiSelect,
  UiButton,
  uiControlSize,
  uiControlSizeQuery,
  uiFieldLabels,
  uiFieldHelp,
  uiRequiredAnnotations,
  uiRequiredAnnotationsQuery,
  uiValidationFailure,
  createUiFieldControl,
  createUiEntryControl,
  type UiControlSize,
} from '@uninterface/uninterface'

export async function mountStrategies() {
  const state = reactive({
    size: -1 as UiControlSize,
    labels: 'beside' as
      | 'show'
      | 'above'
      | 'beside'
      | 'beside-far'
      | 'beside-near'
      | 'floating'
      | 'hidden'
      | undefined,
    requiredAnnotations: 'yes' as 'prefix' | 'suffix' | 'yes' | 'no',
    help: 'replace-help' as 'together' | 'replace-help',
    failure: 'show' as
      | 'none'
      | 'show'
      | 'show-below'
      | 'show-embedded'
      | 'show-tooltip',
    blockRequiredGroup: true,
    fieldOnly: false,
    sizeDepth: undefined as number | undefined,
  })
  const text = createUiFieldControl('Keep this draft')
  const form = createUiFormControl({ name: text })
  const checkbox = createUiFieldControl(false)
  const switched = createUiFieldControl(true)
  const radio = createUiFieldControl('a')
  const checkedOptions = createUiFieldControl(['a'])
  const selected = createUiFieldControl('a')
  const choices = createUiEntryControl([{ key: 'a', label: 'Alpha' }])
  const host = document.createElement('div')
  document.body.append(host)
  const scope = computed(() => [
    uiControlSize(state.size, {
      scope: {
        targets: state.fieldOnly ? ['field'] : undefined,
        depth: state.sizeDepth,
      },
    }),
    ...(state.labels ? [uiFieldLabels(state.labels)] : []),
    uiFieldHelp(state.help),
    uiRequiredAnnotations(state.requiredAnnotations),
    uiValidationFailure(state.failure),
  ])
  const app = createUiApplication({
    render: () =>
      h('section', [
        h(UiStrategy, { use: scope.value }, () => [
          h(
            UiField,
            {
              field: text,
              label: 'Strategy text',
              help: 'Keep helping',
              required: true,
            },
            () => [h(UiTextInput, { 'data-strategy-target': 'text' })],
          ),
          h(
            UiField,
            { field: text, label: 'Sized field with blocked editor' },
            () =>
              h(UiStrategy, { block: uiControlSizeQuery }, () =>
                h(UiTextInput, { 'data-strategy-target': 'blocked-editor' }),
              ),
          ),
          h(
            UiForm,
            {
              control: form,
              save: async () => {},
              label: 'Native form integration',
            },
            () =>
              h(
                UiField,
                { field: text, label: 'Required within form', required: true },
                () => h(UiTextInput, { 'data-strategy-target': 'form-editor' }),
              ),
          ),
          h(
            UiField,
            { field: checkbox, label: 'Strategy checkbox', required: true },
            () => [h(UiCheckbox, { 'data-strategy-target': 'checkbox' })],
          ),
          h(
            UiField,
            { field: selected, label: 'Strategy select', required: true },
            () =>
              h(UiSelect, {
                control: choices,
                'data-strategy-target': 'select',
              }),
          ),
          h(
            UiField,
            { field: switched, label: 'Strategy switch', required: true },
            () => h(UiSwitch, { 'data-strategy-target': 'switch' }),
          ),
          ...[
            { name: 'radio', field: radio, component: UiRadioGroup },
            {
              name: 'checks',
              field: checkedOptions,
              component: UiCheckboxGroup,
            },
          ].map(({ name, field, component }) =>
            h(UiField, { field, label: `Strategy ${name}`, group: true }, () =>
              h(component, { control: choices, 'data-strategy-target': name }),
            ),
          ),
          h(
            UiStrategy,
            {
              block: state.blockRequiredGroup
                ? uiRequiredAnnotationsQuery
                : undefined,
              use: state.blockRequiredGroup
                ? uiRequiredAnnotations('no')
                : undefined,
            },
            () =>
              h(
                UiField,
                {
                  field: text,
                  label: 'Required group',
                  'data-strategy-group': '',
                  required: true,
                  group: true,
                },
                () => h(UiTextInput),
              ),
          ),
          h(
            UiButton,
            { 'data-strategy-target': 'button' },
            () => 'Strategy action',
          ),
        ]),
      ]),
  })
  await app.ui.ready
  await app.ui.i18n.loadNamespace('uninterface.entries')
  app.mount(host)
  await choices.load()
  await nextTick()
  return {
    host,
    state,
    text,
    checkbox,
    selected,
    tick: nextTick,
    dispose() {
      app.unmount()
      form.dispose()
      choices.dispose()
      host.remove()
    },
  }
}
