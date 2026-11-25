import { expect, test, type Page } from '@playwright/test'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import {
  createUiTest,
  expectContainedFocusPaint,
} from '@uninterface/testing/playwright'
import { build } from './fixture-build.mjs'
import type { mountMultiSelect } from './fixtures/multi-select'
import { uiTestAdapter } from './index'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/native-conformance.ts', import.meta.url),
)
const openMultiSelect = createBrowserFixture(
  build,
  new URL('./fixtures/multi-select.ts', import.meta.url),
)
const uiTest = (page: Page) => createUiTest(page, uiTestAdapter)

test('Vuetify paints contained focus on each native segment overlay', async ({
  page,
}) => {
  await openFixture(page, { scenario: 'segmented-focus' })
  const group = uiTest(page).radioGroup({ name: 'Choices' })
  await expect(group.option('one')).toBeChecked()
  await page.keyboard.press('Tab')
  for (const key of ['one', 'two', 'three']) {
    const option = group.option(key)
    // Programmatic focus exercises unselected paint without changing the selection.
    await option.focus()
    await expect(option).toBeFocused()
    await expectContainedFocusPaint({
      target: option.locator(':scope > .v-btn__overlay'),
      kind: 'background',
    })
  }
})

test('Vuetify command menu uses a native overlay surface and disabled rows', async ({
  page,
}) => {
  await openFixture(page, { scenario: 'commands' })
  await page.getByRole('button', { name: 'Open commands' }).click()
  const menu = page.getByRole('menu', { name: 'Commands', exact: true })
  const overlay = page
    .locator('.v-menu > .v-overlay__content')
    .filter({ has: menu })
  await expect(
    overlay.locator(':scope > :first-child:is(.v-sheet, .v-list)'),
  ).toBeVisible()
  await menu.getByRole('menuitem', { name: 'More actions' }).click()
  const submenu = page.getByRole('menu', { name: 'More actions', exact: true })
  const remove = submenu.getByRole('menuitem', { name: 'Delete', exact: true })
  await expect(remove).toBeDisabled()
  await expect(remove).toContainClass('v-list-item--disabled')
})

test('Vuetify multiselect keeps long native chip labels visible', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await openMultiSelect(page)
  await page.evaluate(async () => {
    await (
      window as unknown as {
        Fixture: { mountMultiSelect: typeof mountMultiSelect }
      }
    ).Fixture.mountMultiSelect()
  })
  expect(await page.evaluate(() => document.compatMode)).toBe('CSS1Compat')
  await page.getByRole('button', { name: 'Load', exact: true }).click()
  await page.getByRole('button', { name: 'Resolve', exact: true }).click()

  const field = page.getByTestId('membership-field')
  const picker = uiTest(page).multiSelect({ name: 'Membership' })
  const chips = field.locator('.v-select__selection .v-chip')
  await expect(chips).toHaveText(['First', 'Locked'])
  await picker.setSelected('two', true)
  const longLabel =
    'Second point of contact for weekend and public holiday escalations'
  await expect(chips).toHaveText(['First', 'Locked', longLabel])
  await expect(field.locator('.v-chip__close')).toHaveCount(0)

  const longChip = chips.filter({ hasText: longLabel })
  await expect(longChip).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  const layout = await longChip.evaluate((chip) => {
    const range = document.createRange()
    range.selectNodeContents(chip.querySelector('.v-chip__content')!)
    const lines = [...range.getClientRects()]
    const bounds = chip.getBoundingClientRect()
    return {
      lineCount: lines.length,
      contained: lines.every(
        (line) =>
          line.left >= bounds.left &&
          line.right <= bounds.right &&
          line.top >= bounds.top &&
          line.bottom <= bounds.bottom,
      ),
    }
  })
  expect(layout.lineCount).toBeGreaterThan(1)
  expect(layout.contained).toBe(true)

  await longChip.scrollIntoViewIfNeeded()
  const bounds = (await longChip.boundingBox())!
  await page.mouse.click(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2,
  )
  await expect(picker.control).toHaveAttribute('aria-expanded', 'true')
  await picker.close()

  await picker.clear()
  await expect(chips).toHaveText(['Locked'])
  await expect(picker.control).toBeFocused()
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  await expect(chips).toHaveText(['First', 'Locked'])
})
