/** Native positioning boundaries belong to this adapter, not the business tree. */
export function popupTarget(
  element: HTMLElement | null | undefined,
): HTMLElement | undefined {
  // Native transitions may expose a comment anchor before the surface mounts.
  if (!element || element.nodeType !== 1) return undefined
  return element?.closest<HTMLElement>('.v-overlay') ?? element ?? undefined
}
export function controlledPopup(id: string) {
  if (typeof document === 'undefined') return
  const trigger = document.getElementById(id)
  const ids = (
    trigger?.getAttribute('aria-controls') ??
    trigger?.getAttribute('aria-owns') ??
    ''
  )
    .split(/\s+/)
    .filter(Boolean)
  for (const id of ids) {
    const candidate = document.getElementById(id)
    if (candidate) return popupTarget(candidate)
  }
}
