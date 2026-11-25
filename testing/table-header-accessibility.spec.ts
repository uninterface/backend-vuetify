import { expect, test } from '@playwright/test'
import { createUiTest } from '@uninterface/testing/playwright'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { build } from './fixture-build.mjs'
import { uiTestAdapter } from './index'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/table-headers.ts', import.meta.url),
)

test('Chromium exposes native table column headers and names', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Uses Chromium accessibility APIs.')
  await page.setViewportSize({ width: 1100, height: 900 })
  await openFixture(page)
  const lines = page.getByRole('table', { name: 'Lines', exact: true })
  const headers = createUiTest(page, uiTestAdapter).columnHeaders(lines)
  const names = [
    /^Description\b/,
    /^Quantity\b/,
    /^Unit amount \(USD\)/,
    /^Line amount \(USD\)/,
    /^Actions$/,
  ]
  await expect(headers).toHaveCount(names.length)
  const selectors = await headers.evaluateAll((nodes) =>
    nodes.map((node) => `#${CSS.escape(node.id)}`),
  )
  const client = await page.context().newCDPSession(page)
  try {
    const { root } = await client.send('DOM.getDocument')
    for (const [index, selector] of selectors.entries()) {
      const { nodeId } = await client.send('DOM.querySelector', {
        nodeId: root.nodeId,
        selector,
      })
      const { nodes } = await client.send('Accessibility.getPartialAXTree', {
        nodeId,
        fetchRelatives: false,
      })
      expect(nodes[0]).toMatchObject({
        ignored: false,
        role: { value: 'columnheader' },
        name: { value: expect.stringMatching(names[index]) },
      })
    }
  } finally {
    await client.detach()
  }
})
