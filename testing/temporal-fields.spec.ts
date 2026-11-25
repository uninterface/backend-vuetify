import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { build } from './fixture-build.mjs'
import { expect, test, type Locator } from '@playwright/test'
import {
  clickUiFieldLabel,
  createUiTest,
  waitForPresentation,
} from '@uninterface/testing/playwright'
import { uiTestAdapter } from './index'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/temporal-browser.ts', import.meta.url),
)

async function expectLabelClearsEditors(
  frame: Locator,
  label: Locator,
  editors: readonly Locator[],
) {
  await expect(label).toHaveCount(1)
  await waitForPresentation(label)
  const labelBounds = (await label.boundingBox())!
  const bounds = (await frame.boundingBox())!
  expect(labelBounds.y).toBeGreaterThanOrEqual(bounds.y)
  for (const editor of editors) {
    await expect(editor).toHaveValue('')
    const inputBounds = (await editor.boundingBox())!
    expect(labelBounds.y + labelBounds.height).toBeLessThanOrEqual(
      inputBounds.y + 1,
    )
  }
}

for (const width of [1024, 390]) {
  test(`compound frame labels float without overlapping editors at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 })
    await openFixture(page, { floating: 'true' })

    const reference = page.getByRole('textbox', {
      name: 'Reference code',
      exact: true,
    })
    const parts = await createUiTest(page, uiTestAdapter).field(reference)
    await expect(parts.label).toHaveText('Reference code')
    await expect(parts.label).toHaveClass(/v-field-label--floating/)
    await expectLabelClearsEditors(parts.surface, parts.label, [reference])
    await expect(reference).not.toBeFocused()
    await clickUiFieldLabel(parts)
    await expect(reference).toBeFocused()
    await expect(parts.label).toBeVisible()

    const range = page.getByRole('group', { name: 'Date range', exact: true })
    const start = range.getByRole('textbox', {
      name: 'Date range — Start',
      exact: true,
    })
    const end = range.getByRole('textbox', {
      name: 'Date range — End (inclusive)',
      exact: true,
    })
    const frame = range.locator('.vuetify-input-frame')
    const label = frame.locator('.v-field-label--floating')
    await expect(label).toHaveText('Date range')
    await expectLabelClearsEditors(frame, label, [start, end])
    // The outer Vuetify label passes pointer events through to the range frame.
    await label.scrollIntoViewIfNeeded()
    const labelBounds = (await label.boundingBox())!
    const bounds = (await frame.boundingBox())!
    const border = await frame.evaluate((element) => ({
      left: parseFloat(getComputedStyle(element).borderLeftWidth),
      top: parseFloat(getComputedStyle(element).borderTopWidth),
    }))
    await frame.click({
      position: {
        x: labelBounds.x + labelBounds.width / 2 - bounds.x - border.left,
        y: labelBounds.y + labelBounds.height / 2 - bounds.y - border.top,
      },
    })
    await expect(start).toBeFocused()
    await expect(label).toBeVisible()
  })
}

test('range endpoints relinquish native background and underline to the outer frame', async ({
  page,
}) => {
  await openFixture(page)
  for (const width of [1024, 390]) {
    await page.setViewportSize({ width, height: 844 })
    for (const kind of ['date', 'datetime', 'time']) {
      const range = page.locator(`[data-range=${kind}]`)
      const input = range.locator('input').first()
      const outer = range.locator('.vuetify-input-frame')
      const inner = range.locator(
        '[data-ui-control-frame=parent] > .v-input__control > .v-field',
      )
      await expect(inner).toHaveCount(2)
      for (const state of ['idle', 'focus', 'hover', 'invalid'] as const) {
        if (state === 'focus') await input.focus()
        if (state === 'hover') await inner.last().hover()
        if (state === 'invalid') {
          await input.fill('unfinished')
          await page.getByLabel('Password', { exact: true }).focus()
          await expect(input).toHaveAttribute('aria-invalid', 'true')
          await expect(outer).toHaveClass(/v-field--error/)
        }
        for (const decoration of ['.v-field__overlay', '.v-field__outline']) {
          for (const part of await inner.all()) {
            await expect(part.locator(':scope > ' + decoration)).toHaveCSS(
              'display',
              'none',
            )
          }
          await expect(outer.locator(':scope > ' + decoration)).toBeVisible()
        }
      }
    }
  }
})
