import { expect, test } from '@playwright/test'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { createUiTest } from '@uninterface/testing/playwright'
import { build } from './fixture-build.mjs'
import { uiTestAdapter } from './index'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/picker-during-loading.ts', import.meta.url),
)

test('Vuetify returns focus after Escape from a focused picker option during loading', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1000, height: 650 })
  await openFixture(page)
  const select = createUiTest(page, uiTestAdapter).select({
    name: 'Choose a value',
  })
  await select.control.press('ArrowDown')
  const popup = await select.popupSurface()
  await expect(
    popup.getByRole('option', { name: 'Choice A', exact: true }),
  ).toBeFocused()

  await page.evaluate(() => window.startVuetifyFixtureLoading())
  const loading = page.locator('[data-ui-loading-overlay]')
  await expect(loading).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(select.control).toHaveAttribute('aria-expanded', 'false')
  await expect(popup).toBeHidden()
  await expect(select.control).toBeFocused()
  await expect(loading).toBeVisible()
  expect(await page.evaluate(() => window.vuetifyPickerErrors)).toEqual([])
})
