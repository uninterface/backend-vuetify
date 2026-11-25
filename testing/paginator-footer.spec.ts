import { test, expect } from '@playwright/test'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { build } from './fixture-build.mjs'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/paginator-footer.ts', import.meta.url),
)

test('collection footer bounds its page window alongside the other controls', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1350, height: 900 })
  await openFixture(page)
  const footer = page.getByTestId('paginator-footer')
  const paginator = footer.locator('.vuetify-paginator')
  await expect(paginator.locator('[aria-current="true"]')).toBeVisible()
  const parts = ['size', 'info', 'paginator', 'jumper'].map((part) =>
    footer.locator(`.vuetify-collection-footer-${part}`),
  )
  await expect
    .poll(async () => {
      const boxes = await Promise.all(parts.map((part) => part.boundingBox()))
      if (boxes.some((box) => !box)) return false
      // A common vertical intersection establishes one row despite differing heights.
      return (
        Math.max(...boxes.map((box) => box!.y)) <
        Math.min(...boxes.map((box) => box!.y + box!.height))
      )
    })
    .toBe(true)
  expect(
    await paginator.locator('.v-pagination__item').count(),
  ).toBeLessThanOrEqual(7)

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(paginator.locator('.v-pagination__item')).toHaveCount(1)
  await expect
    .poll(async () => {
      const parent = await footer.boundingBox()
      const navigation = await paginator.boundingBox()
      return Boolean(
        parent &&
          navigation &&
          navigation.x >= parent.x - 1 &&
          navigation.x + navigation.width <= parent.x + parent.width + 1,
      )
    })
    .toBe(true)
  await expect(paginator.locator('.v-pagination__first')).toBeVisible()
  await expect(paginator.locator('.v-pagination__last')).toBeVisible()
})
