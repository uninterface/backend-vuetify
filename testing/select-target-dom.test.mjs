import { test } from 'node:test'
import assert from 'node:assert/strict'
import { withBuiltDomFixture } from '@uninterface/testing/jsdom'
import { build } from './fixture-build.mjs'

test('Vuetify select forwards consumer listeners to its interactive input', async () => {
  await withBuiltDomFixture(
    build,
    new URL('./fixtures/select-target.ts', import.meta.url),
    async ({ mountSelectTarget }, window) => {
      const fixture = await mountSelectTarget()
      try {
        const control = fixture.host.querySelector('input[role="combobox"]')
        const hidden = fixture.host.querySelector('input[type="hidden"]')
        assert.ok(control)
        assert.ok(hidden, 'exercise the native form participant')
        assert.equal(control.getAttribute('data-testid'), 'choice')
        assert.equal(hidden.hasAttribute('data-testid'), false)
        hidden.dispatchEvent(new window.FocusEvent('focus'))
        assert.equal(fixture.focusCount(), 0)
        control.dispatchEvent(new window.FocusEvent('focus'))
        assert.equal(fixture.focusCount(), 1)
        assert.deepEqual(Array.from(fixture.errors), [])
      } finally {
        fixture.dispose()
      }
    },
  )
})
