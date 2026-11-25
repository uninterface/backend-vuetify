// The shared alignment contract measures the visible editor surface, which can
// differ from the native input target in composite toolkits.
export function textSurface(input) {
  return input.locator(
    'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " v-field ")][1]',
  )
}

export function textFocus(input) {
  return {
    target: textSurface(input).locator('.v-field__outline'),
    kind: 'underline',
    pseudo: '::after',
  }
}
