import type { Ref } from 'vue'

export function selectEscape(
  opened: Ref<boolean>,
  trigger: () => HTMLElement | undefined,
) {
  return (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || event.defaultPrevented || !opened.value)
      return
    event.preventDefault()
    event.stopPropagation()
    if (event.repeat) return
    opened.value = false
    trigger()?.focus({ preventScroll: true })
  }
}
