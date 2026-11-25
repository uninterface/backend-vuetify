import { computed } from 'vue'
import {
  useUiStrategy,
  uiControlSizeQuery,
} from '@uninterface/uninterface/backend'
export function useControlSize(
  component: 'UiButton',
): import('vue').ComputedRef<
  'x-small' | 'small' | 'default' | 'large' | 'x-large' | undefined
>
export function useControlSize(
  component: string,
): import('vue').ComputedRef<'default' | 'comfortable' | 'compact' | undefined>
export function useControlSize(component: string) {
  const button = component === 'UiButton'
  const result = useUiStrategy(uiControlSizeQuery, [-2, -1, 0, 1, 2])
  return computed(() => {
    if (result.value.status !== 'answered') return undefined
    const value = result.value.value
    if (!button)
      return value === -2 ? 'compact' : value === -1 ? 'comfortable' : 'default'
    return (
      {
        '-2': 'x-small',
        '-1': 'small',
        '0': 'default',
        '1': 'large',
        '2': 'x-large',
      } as const
    )[value]
  })
}
