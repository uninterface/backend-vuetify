import { expect, test } from '@playwright/test'
import { uiTestAdapter } from '@uninterface/backend/testing'
import { createUiTest } from '@uninterface/testing/playwright'

test('uses the packaged button and select', async ({ page }) => {
  const errors: Error[] = []
  page.on('pageerror', (error) => errors.push(error))
  await page.goto('/')

  const acknowledge = page.getByRole('button', { name: 'Acknowledge' })
  await acknowledge.click()
  await expect(acknowledge).toBeDisabled()
  await expect(page.getByText('Acknowledged.', { exact: true })).toBeVisible()

  const category = createUiTest(page, uiTestAdapter).select({
    name: 'Category',
  })
  await category.choose({ key: 'services' })
  await expect(page.getByLabel('Category key')).toHaveText('services')
  expect(errors).toEqual([])
})
