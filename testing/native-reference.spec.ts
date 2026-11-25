import { expect } from '@playwright/test'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { testReferenceFixture } from '@uninterface/testing/fixtures/reference-playwright'
import { build } from './fixture-build.mjs'
import { uiTestAdapter } from './index'
import { browserControlParts } from './browser-control-parts'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/native-reference.ts', import.meta.url),
)

testReferenceFixture(openFixture, uiTestAdapter, {
  collapsibleTrigger: browserControlParts.collapsibleTrigger,
  nativeModal: true,
  nestedNavigation: true,
  async verifyLoading(page) {
    const adapter = page.getByRole('region', { name: 'Uninterface adapter' })
    const native = page.getByRole('region', { name: 'Native reference' })
    const picker = adapter.getByRole('combobox', { name: 'Location' })
    const owned = await picker.getAttribute('aria-controls')
    const popup = page.locator(`[id="${owned}"] .v-overlay__content`)
    await expect(popup.getByRole('status')).toBeVisible()
    await expect(popup.getByRole('option')).toHaveCount(0)
    await expect(adapter.locator('.v-select .v-progress-linear')).toBeVisible()
    await expect(native.locator('.v-select .v-progress-linear')).toBeVisible()
  },
})
