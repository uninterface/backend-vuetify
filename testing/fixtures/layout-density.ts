import { createUiApplication } from '@uninterface/uninterface/setup'
import { h, nextTick, reactive, Fragment } from 'vue'
import {
  UiLayout,
  UiFlowLayout,
  UiGridLayout,
  UiRegionLayout,
  UiStrategy,
  UiField,
  UiCheckbox,
  createUiFieldControl,
  uiLayoutDensity,
  uiLayoutDensityQuery,
  type UiLayoutDensity,
  type UiStrategyScope,
} from '@uninterface/uninterface'

export async function mountDensity() {
  const state = reactive({
    levels: [] as UiLayoutDensity[],
    scope: {} as UiStrategyScope,
  })
  const checked = createUiFieldControl(false)
  const errors: string[] = []
  const host = document.createElement('div')
  document.body.append(host)
  const input = (name: string) => h('input', { 'aria-label': name })
  const app = createUiApplication({
    render: () =>
      h(
        UiStrategy,
        {
          use: state.levels.map((level) =>
            uiLayoutDensity(level, { scope: state.scope }),
          ),
        },
        () =>
          h(Fragment, [
            h(UiLayout, { 'data-density': 'linear' }, () => [
              input('Retained draft'),
              h(UiField, { field: checked, label: 'Independent flag' }, () =>
                h(UiCheckbox),
              ),
            ]),
            h(
              UiFlowLayout,
              { 'data-density': 'flow', direction: 'horizontal', wrap: true },
              () => [input('Flow A'), input('Flow B')],
            ),
            h(UiGridLayout, { 'data-density': 'grid', columns: 2 }, () => [
              input('Grid A'),
              input('Grid B'),
            ]),
            h(UiLayout, { 'data-density': 'parent' }, () =>
              h(UiLayout, { 'data-density': 'nested' }, () => [
                input('Nested A'),
                input('Nested B'),
              ]),
            ),
            h(UiStrategy, { block: uiLayoutDensityQuery }, () =>
              h(UiLayout, { 'data-density': 'blocked' }, () => [
                input('Blocked A'),
                input('Blocked B'),
              ]),
            ),
            h(
              UiStrategy,
              { block: uiLayoutDensityQuery, use: uiLayoutDensity(0) },
              () =>
                h(UiLayout, { 'data-density': 'reset' }, () => [
                  input('Reset A'),
                  input('Reset B'),
                ]),
            ),
            h(
              UiRegionLayout,
              { 'data-density': 'regions' },
              {
                start: () => input('Region start'),
                main: () => input('Region main'),
              },
            ),
          ]),
      ),
  })
  app.config.errorHandler = (error) => errors.push(String(error))
  app.mount(host)
  await nextTick()
  return {
    host,
    errors,
    update: async (levels: UiLayoutDensity[], scope: UiStrategyScope = {}) => {
      state.levels = levels
      state.scope = scope
      await nextTick()
    },
    checked: () => checked.state.input,
    dispose: () => {
      app.unmount()
      host.remove()
    },
  }
}
