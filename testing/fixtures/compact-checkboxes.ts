import { h, reactive, nextTick, Fragment } from 'vue'
import { createUiApplication } from '@uninterface/uninterface/setup'
import {
  UiStrategy,
  UiLayout,
  UiFlowLayout,
  UiGridLayout,
  UiRegionLayout,
  UiField,
  UiCheckbox,
  UiCheckboxGroup,
  createUiFieldControl,
  createUiEntryControl,
  uiLayoutDensity,
  uiLayoutDensityQuery,
  uiControlSize,
  type UiLayoutDensity,
} from '@uninterface/uninterface'
import '../../src/style.css'

export async function mountCompactCheckboxes() {
  const state = reactive({
    level: -1 as UiLayoutDensity | undefined,
    small: false,
  })
  const flags = Array.from({ length: 3 }, () =>
    createUiFieldControl(false, undefined, [
      (value) => (value ? null : 'Enable this setting'),
    ]),
  )
  const choices = createUiEntryControl([
    { key: 'a', label: 'Option A' },
    { key: 'b', label: 'Option B' },
  ])
  const selection = createUiFieldControl<string[]>([])
  const errors: string[] = []
  const host = document.createElement('div')
  document.body.append(host)
  const flag = (name: string, index = 0, help?: string) =>
    h(
      UiField,
      {
        field: flags[index],
        label: name,
        help,
      },
      () => h(UiCheckbox),
    )
  const pair = (prefix: string) => [flag(prefix + ' A'), flag(prefix + ' B', 1)]
  const app = createUiApplication({
    render: () =>
      h(
        UiStrategy,
        {
          use: [
            ...(state.level === undefined
              ? []
              : [uiLayoutDensity(state.level, { scope: { depth: 1 } })]),
            ...(state.small ? [uiControlSize(-1)] : []),
          ],
        },
        () =>
          h(Fragment, [
            h(UiLayout, { 'data-case': 'linear' }, () => [
              flag('Disabled'),
              flag('Readonly', 1),
              flag('Slow save', 2, 'A helper remains available'),
            ]),
            h(UiFlowLayout, { 'data-case': 'flow' }, () => pair('Flow')),
            h(UiGridLayout, { 'data-case': 'grid', columns: 2 }, () =>
              pair('Grid'),
            ),
            h(UiLayout, { 'data-case': 'outer' }, () => [
              h(UiLayout, { 'data-case': 'depth-stopped' }, () =>
                pair('Nested'),
              ),
              h('section', { 'data-case': 'opaque' }, pair('Opaque')),
              h(UiStrategy, { block: uiLayoutDensityQuery }, () =>
                h(UiLayout, { 'data-case': 'blocked' }, () => pair('Blocked')),
              ),
              h(
                UiStrategy,
                { block: uiLayoutDensityQuery, use: uiLayoutDensity(0) },
                () =>
                  h(UiLayout, { 'data-case': 'reset' }, () => pair('Reset')),
              ),
            ]),
            h(
              UiRegionLayout,
              { 'data-case': 'region' },
              { main: () => flag('Region') },
            ),
            h(
              UiField,
              {
                field: selection,
                group: true,
                label: 'Reference group',
                'data-case': 'reference',
              },
              () => h(UiCheckboxGroup, { control: choices }),
            ),
          ]),
      ),
  })
  app.config.errorHandler = (error) => errors.push(String(error))
  app.mount(host)
  await nextTick()
  await choices.load()
  await nextTick()
  return {
    host,
    errors,
    update: async (level: UiLayoutDensity | undefined, small = false) => {
      state.level = level
      state.small = small
      await nextTick()
    },
    validate: async () => {
      await flags[2].validate()
      await nextTick()
    },
    checked: () => flags[0].state.input,
    dispose: () => {
      app.unmount()
      choices.dispose()
      host.remove()
    },
  }
}
