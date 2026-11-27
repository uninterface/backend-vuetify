import { expect, test } from '@playwright/test'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { build } from './fixture-build.mjs'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/flow-spacer-gap.ts', import.meta.url),
)

test('flow spacers preserve the effective Vuetify gap at the wrap threshold', async ({
  page,
}) => {
  await openFixture(page)
  await page.addStyleTag({
    content:
      '[data-testid="flow"] input { box-sizing: border-box; width: 100px; height: 32px }',
  })
  const offer = page.getByTestId('offer')
  const flow = offer.getByTestId('flow')
  const spacer = flow.locator('[data-ui-flow-spacer]')
  const first = flow.getByRole('textbox', { name: 'First' })
  const second = flow.getByRole('textbox', { name: 'Second' })
  const separation = async () => {
    const left = (await first.boundingBox())!
    const right = (await second.boundingBox())!
    return [right.x - left.x - left.width, right.y - left.y]
  }

  await expect(flow).toHaveCSS('column-gap', '16px')
  await expect.poll(separation).toEqual([16, 0])

  await offer.evaluate((element) => {
    element.style.width = '224px'
  })
  // Vuetify generates ga-* from its customizable spacing map.
  const theme = await page.addStyleTag({
    content: '[data-testid="flow"].ga-4 { gap: 8px 24px !important }',
  })
  await expect(flow).toHaveCSS('column-gap', '24px')
  await expect.poll(separation).toEqual([24, 0])

  await offer.evaluate((element) => {
    element.style.width = '223px'
  })
  await expect.poll(separation).toEqual([-100, 40])

  // The layout size stays the same here. Only the gap and spacer width change.
  await theme.evaluate((element) => {
    element.textContent =
      '[data-testid="flow"].ga-4 { gap: 8px 32px !important }'
  })
  await expect(spacer).toHaveCSS('margin-inline-start', '-32px')
  await expect.poll(separation).toEqual([-100, 40])
})
