import assert from 'node:assert/strict'
import { test } from 'node:test'
import { withBuiltDomFixture } from '@uninterface/testing/jsdom'
import { build } from './fixture-build.mjs'

test('native select positioner restores the allocated rank after a native write', async () => {
  await withBuiltDomFixture(
    build,
    new URL('./fixtures/stacking-select.ts', import.meta.url),
    async ({ mountZSelection }, window) => {
      const select = await mountZSelection()
      try {
        const trigger = select.host.querySelector('[role=combobox]')
        assert.ok(trigger)
        for (const type of ['mousedown', 'click'])
          trigger.dispatchEvent(new window.MouseEvent(type, { bubbles: true }))
        let popup
        for (let attempt = 0; attempt < 20 && !popup; attempt++) {
          popup = window.document.querySelector('.v-overlay')
          if (!popup || !Number(popup.style.zIndex)) {
            popup = undefined
            await new Promise((resolve) => setTimeout(resolve, 10))
          }
        }
        assert.ok(popup, 'native choices opened and received a rank')
        const rank = select.popupValue(popup)
        assert.ok(rank > 0)
        assert.equal(Number(popup.style.zIndex), rank)
        popup.style.zIndex = String(rank + 1)
        await new Promise((resolve) => setTimeout(resolve, 0))
        assert.equal(Number(popup.style.zIndex), rank)
        assert.deepEqual([...select.errors], [])
      } finally {
        select.dispose()
      }
    },
  )
})
