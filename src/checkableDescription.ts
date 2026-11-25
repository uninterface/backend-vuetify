import { onScopeDispose, onUpdated, watchPostEffect, type Ref } from 'vue'

/** Align descriptions to actual native label text, including customized sizes/RTL.
 * The toolkit retains its control, label, hit target and feedback presentation.
 */
export function useCheckableDescriptionAlignment(
  element: Ref<HTMLElement | { $el: HTMLElement } | undefined>,
  active: () => boolean,
) {
  let frame = 0
  let observer: ResizeObserver | undefined
  const adjusted = new Map<HTMLElement, string>()
  const observed = new Set<Element>()
  let directionObserver: MutationObserver | undefined
  let host: HTMLElement | undefined
  function watchDirection(root: HTMLElement | undefined) {
    if (root === host) return
    host = root
    directionObserver?.disconnect()
    if (!root || typeof MutationObserver === 'undefined') return
    directionObserver ??= new MutationObserver(schedule)
    for (let node: HTMLElement | null = root; node; node = node.parentElement)
      directionObserver.observe(node, {
        attributes: true,
        attributeFilter: ['dir', 'class', 'style'],
      })
  }
  function observe(nodes: Element[]) {
    const next = new Set(nodes)
    for (const node of observed) if (!next.has(node)) observer?.unobserve(node)
    for (const node of next) if (!observed.has(node)) observer?.observe(node)
    observed.clear()
    for (const node of next) observed.add(node)
  }
  function clear() {
    for (const [target, padding] of adjusted)
      target.style.paddingInlineStart = padding
    adjusted.clear()
  }
  function align() {
    frame = 0
    const value = element.value
    const root = value && ('$el' in value ? value.$el : value)
    watchDirection(root && active() ? root : undefined)
    if (!root || !active()) {
      observe([])
      clear()
      return
    }
    const owns = (node: Element) => node.closest('.vuetify-field') === root
    const label = [
      ...root.querySelectorAll<HTMLElement>('.v-selection-control .v-label'),
    ].find(owns)
    if (!label) {
      observe([])
      clear()
      return
    }
    observe([
      root,
      label,
      ...(label.parentElement ? [label.parentElement] : []),
    ])
    const range = root.ownerDocument.createRange()
    range.selectNodeContents(label)
    // DOM-only environments do not supply text geometry.
    if (typeof range.getBoundingClientRect !== 'function') return
    const text = range.getBoundingClientRect()
    if (!text.width || !text.height) return
    const targets = [
      ...root.querySelectorAll<HTMLElement>(
        '.v-input__details, .vuetify-field-feedback',
      ),
    ].filter(owns)
    for (const [target, padding] of adjusted) {
      if (!targets.includes(target)) {
        target.style.paddingInlineStart = padding
        adjusted.delete(target)
      }
    }
    for (const target of targets) {
      const bounds = target.getBoundingClientRect()
      const style = root.ownerDocument.defaultView!.getComputedStyle(target)
      const rtl = style.direction === 'rtl'
      const inset = rtl
        ? bounds.right - text.right - (parseFloat(style.borderRightWidth) || 0)
        : text.left - bounds.left - (parseFloat(style.borderLeftWidth) || 0)
      if (!adjusted.has(target))
        adjusted.set(target, target.style.paddingInlineStart)
      target.style.paddingInlineStart = `${Math.max(0, inset)}px`
    }
  }
  function schedule() {
    if (!frame && (active() || adjusted.size))
      frame = requestAnimationFrame(align)
  }
  watchPostEffect(() => {
    element.value
    active()
    if (active() && !observer && typeof ResizeObserver !== 'undefined')
      observer = new ResizeObserver(schedule)
    schedule()
  })
  onUpdated(schedule)
  onScopeDispose(() => {
    cancelAnimationFrame(frame)
    observer?.disconnect()
    directionObserver?.disconnect()
    clear()
  })
}
