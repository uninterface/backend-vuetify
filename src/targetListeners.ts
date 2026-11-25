import { useAttrs, type Directive } from 'vue'
import { syncUiTargetAttributes } from '@uninterface/uninterface/backend'

/** Preserve listener modifiers and semantic test identity on the native target.
 * Vuetify otherwise forwards data-testid to its outer presentation wrapper.
 */
export function useTargetListeners() {
  const attrs = useAttrs()
  const isListener = (key: string) => /^on[^a-z]/.test(key)
  const isTargetAttribute = (key: string) =>
    isListener(key) || key === 'data-testid'
  function surfaceAttributes() {
    return Object.fromEntries(
      Object.entries(attrs).filter(([key]) => !isTargetAttribute(key)),
    )
  }
  function sync(root: HTMLElement) {
    const input = root.querySelector(
      'textarea:not(.v-textarea__sizer), input:not([type="hidden"])',
    )
    if (input)
      syncUiTargetAttributes(
        input,
        Object.fromEntries(
          Object.entries(attrs).filter(([key]) => isTargetAttribute(key)),
        ),
      )
  }
  const directive: Directive<HTMLElement> = {
    mounted: sync,
    updated: sync,
    beforeUnmount(root) {
      const input = root.querySelector(
        'textarea:not(.v-textarea__sizer), input:not([type="hidden"])',
      )
      if (input) syncUiTargetAttributes(input, {})
    },
  }
  return { surfaceAttributes, directive }
}
