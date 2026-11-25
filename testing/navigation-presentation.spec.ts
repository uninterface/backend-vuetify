import { test, expect } from '@playwright/test'
import { waitForPresentation } from '@uninterface/testing/playwright'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { build } from './fixture-build.mjs'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/travel-navigation-browser.ts', import.meta.url),
)

test('navbar submenu uses native links without prose bullets or underlines', async ({
  page,
}) => {
  await openFixture(page, { links: 'true' })
  await expect(page.locator('[data-prose] a')).toHaveCSS(
    'text-decoration-line',
    'underline',
  )
  const trigger = page.getByRole('button', { name: 'Examples', exact: true })
  await trigger.click()
  const link = page.getByRole('link', { name: 'Dates and times', exact: true })
  await expect(link).toBeVisible()
  await expect(link).toHaveClass(/v-list-item/)
  await expect(link).toHaveAttribute('aria-current', 'page')
  const list = page.locator('.v-list.vuetify-entry-list').filter({ has: link })
  await expect(list).toHaveCSS('list-style-type', 'none')
  await expect(list).toHaveCSS('margin-top', '0px')
  await expect(list.locator(':scope > li').first()).toHaveCSS(
    'list-style-type',
    'none',
  )
  await expect(link).toHaveCSS('text-decoration-line', 'none')
  await link.hover()
  await expect(link).toHaveCSS('text-decoration-line', 'none')
  await link.focus()
  await expect(link).toHaveCSS('text-decoration-line', 'none')
  await link.press('Escape')
  await expect(trigger).toBeFocused()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
})

for (const mode of ['vertical-tree', 'vertical-popup', 'icon-popup']) {
  test(`navigation row geometry in ${mode}`, async ({ page }) => {
    await openFixture(page, { mode })
    const entry = (key: string) =>
      page.locator(`[data-entry-key="${key}"]:visible`)
    const equalWidths = async (keys: string[]) => {
      const rows = keys.map(entry)
      for (const row of rows) await waitForPresentation(row)
      const handles = await Promise.all(rows.map((row) => row.elementHandle()))
      const widths = await page.evaluate(
        (elements) => elements.map((el) => el!.getBoundingClientRect().width),
        handles,
      )
      expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1)
    }
    const spacing = async (key: string) => {
      const geometry = await entry(key).evaluate((row) => {
        const icon = row.querySelector(
          ':scope > .v-list-item__prepend > .v-icon',
        )!
        const spacer = icon.nextElementSibling!
        const copy = row.querySelector(':scope > .v-list-item__content')!
        const rtl = getComputedStyle(row).direction === 'rtl'
        const iconBox = icon.getBoundingClientRect()
        const textBox = copy.getBoundingClientRect()
        return {
          gap: rtl
            ? iconBox.left - textBox.right
            : textBox.left - iconBox.right,
          nativeGap: spacer.getBoundingClientRect().width,
        }
      })
      expect(geometry.nativeGap).toBeGreaterThan(0)
      expect(Math.abs(geometry.gap - geometry.nativeGap)).toBeLessThanOrEqual(1)
    }
    await equalWidths(['overview', 'destinations', 'travelJournal'])
    if (mode === 'icon-popup') {
      for (const key of ['overview', 'destinations']) {
        const centerError = await entry(key).evaluate((row) => {
          const outer = row.getBoundingClientRect()
          const icon = row
            .querySelector('.vuetify-entry-icon')!
            .getBoundingClientRect()
          return Math.abs(
            (outer.left + outer.right) / 2 - (icon.left + icon.right) / 2,
          )
        })
        expect(centerError).toBeLessThanOrEqual(1)
      }
    } else await spacing('overview')
    await entry('destinations').click()
    await expect(entry('asia')).toBeVisible()
    await equalWidths(['allDestinations', 'asia', 'nearby'])
    await spacing('asia')
    await spacing('allDestinations')
    await entry('asia').click()
    await expect(entry('singapore')).toBeVisible()
    await equalWidths(['japan', 'singapore', 'thailand'])
    await spacing('singapore')
    if (mode === 'vertical-tree') {
      const rows = await Promise.all(
        ['destinations', 'asia', 'singapore'].map((key) =>
          entry(key).evaluate((row) => {
            const bounds = row.getBoundingClientRect()
            const label = row
              .querySelector('.v-list-item-title')!
              .getBoundingClientRect()
            const icon = row
              .querySelector(':scope > .v-list-item__prepend > .v-icon')!
              .getBoundingClientRect()
            return {
              end: bounds.right,
              labelStart: label.left,
              iconStart: icon.left,
              height: bounds.height,
            }
          }),
        ),
      )
      for (let depth = 1; depth < rows.length; depth++) {
        // Native slim nesting aligns the child's icon with its parent's text.
        expect(
          Math.abs(rows[depth].iconStart - rows[depth - 1].labelStart),
        ).toBeLessThanOrEqual(1)
      }
      for (const row of rows) expect(row.height).toBeCloseTo(44, 0)
      expect(
        Math.max(...rows.map((row) => row.end)) -
          Math.min(...rows.map((row) => row.end)),
      ).toBeLessThanOrEqual(1)
      await expect(
        page.locator('.vuetify-navigation-tree:visible .v-list'),
      ).toHaveCount(0)
    }
    await entry('singapore').click()
    await expect(
      page.getByTestId('navigation-content').getByRole('heading', { level: 3 }),
    ).toHaveText('Singapore')
  })
}
