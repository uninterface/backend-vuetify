import {
  onMounted,
  onBeforeUnmount,
  onActivated,
  onDeactivated,
  ref,
  watch,
} from 'vue'

/** Bridge inherited document/local direction to the toolkit's behavioral context. */
export function useNativeDirection(target: () => HTMLElement | undefined) {
  const direction = ref<'ltr' | 'rtl'>('ltr')
  let observer: MutationObserver | undefined
  function read() {
    const element = target() ?? document.documentElement
    direction.value =
      getComputedStyle(element).direction === 'rtl' ||
      (!getComputedStyle(element).direction &&
        element.closest('[dir]')?.getAttribute('dir') === 'rtl')
        ? 'rtl'
        : 'ltr'
  }
  function observe() {
    observer?.disconnect()
    for (
      let node = target() ?? document.documentElement;
      node;
      node = node.parentElement!
    )
      observer?.observe(node, {
        attributes: true,
        attributeFilter: ['dir', 'class', 'style'],
      })
    read()
  }
  onMounted(() => {
    observer = new MutationObserver(read)
    observe()
  })
  watch(
    target,
    () => {
      if (observer) observe()
    },
    { flush: 'post' },
  )
  onActivated(() => {
    if (observer) observe()
  })
  onDeactivated(() => observer?.disconnect())
  onBeforeUnmount(() => observer?.disconnect())
  return direction
}
