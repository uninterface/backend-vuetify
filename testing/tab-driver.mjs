/** Activate a native tab through its pointer event path in DOM simulation. */
export function activateTab(element) {
  element.click()
}

export function isTabPresentedSelected(element) {
  return element.classList.contains('v-tab--selected')
}
