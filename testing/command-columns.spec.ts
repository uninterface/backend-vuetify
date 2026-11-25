import { test, expect, type Locator } from '@playwright/test'
import { waitForPresentation } from '@uninterface/testing/playwright'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { build } from './fixture-build.mjs'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/command-menu-browser.ts', import.meta.url),
)

for (const direction of ['ltr', 'rtl']) {
  for (const width of [600, 1280]) {
    test(`command menu columns and trailing clearance at ${width}px ${direction}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 })
      await openFixture(page)
      await page
        .getByRole('region', { name: 'Menus', exact: true })
        .evaluate((node, dir) => node.setAttribute('dir', dir), direction)
      const trigger = page.getByRole('button', {
        name: 'Click to open menu',
        exact: true,
      })
      await trigger.click()
      const rows = (keys: string[]) =>
        page.locator(
          keys.map((key) => `[data-entry-key="${key}"]:visible`).join(', '),
        )
      const row = (key: string) => rows([key])
      const aligned = async (keys: string[]) => {
        const labels = rows(keys).locator('.vuetify-entry-copy')
        await expect(labels).toHaveCount(keys.length)
        await waitForPresentation(row(keys[0]))
        const starts = await labels.evaluateAll((nodes) =>
          nodes.map((node) => {
            const box = node.getBoundingClientRect()
            return getComputedStyle(node).direction === 'rtl'
              ? box.right
              : box.left
          }),
        )
        expect(Math.max(...starts) - Math.min(...starts)).toBeLessThanOrEqual(1)
      }
      const clearance = async (item: Locator) => {
        const gap = await item.evaluate((node) => {
          const content = node
            .querySelector('.v-list-item__content')!
            .getBoundingClientRect()
          const trailing = node
            .querySelector('.v-list-item__append > :not(.v-list-item__spacer)')!
            .getBoundingClientRect()
          return getComputedStyle(node).direction === 'rtl'
            ? content.left - trailing.right
            : trailing.left - content.right
        })
        expect(gap).toBeGreaterThan(0)
      }
      const rootKeys = ['refresh', 'name', 'email', 'phone', 'status', 'more']
      await aligned(rootKeys)
      await clearance(row('refresh'))
      await clearance(row('more'))
      await row('email').click()
      await expect(row('email')).toHaveAttribute('aria-checked', 'true')
      await aligned(rootKeys)
      await row('more').click()
      await aligned([
        'archive',
        'duplicate',
        'export',
        'print',
        'history',
        'organize',
        'remove',
      ])
      await expect(row('archive').locator('.vuetify-entry-check')).toHaveCount(
        0,
      )
      await clearance(row('organize'))
      await row('organize').click()
      await aligned(['addTag', 'removeTag'])
      await expect(
        row('addTag').locator('.vuetify-entry-icon, .vuetify-entry-check'),
      ).toHaveCount(0)
      await row('addTag').press('Escape')
      await expect(row('organize')).toBeFocused()
      await row('organize').press('Escape')
      await expect(row('more')).toBeFocused()
      await row('more').press('Escape')
      await expect(trigger).toBeFocused()
    })
  }
}
