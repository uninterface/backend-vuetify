import { test } from 'node:test'
import assert from 'node:assert/strict'
import { withBuiltDomFixture } from '@uninterface/testing/jsdom'
import { build } from './fixture-build.mjs'

test('validation tooltip dismissal does not refocus its editor', async () => {
  await withBuiltDomFixture(
    build,
    new URL('./fixtures/field-tooltip-focus.ts', import.meta.url),
    async ({ mountFieldTooltip }, window) => {
      const fixture = await mountFieldTooltip()
      try {
        const input = fixture.host.querySelector('input[inputmode="text"]')
        assert.ok(input)
        // Vuetify filters focus candidates by geometry, which jsdom lacks.
        input.getClientRects = () => [new window.DOMRect(0, 0, 100, 30)]
        input.focus()
        await fixture.validate()
        assert.equal(input.getAttribute('aria-invalid'), 'true')
        const description = input.getAttribute('aria-describedby')
        assert.ok(description)
        assert.match(
          description
            .split(/\s+/)
            .map((id) => window.document.getElementById(id)?.textContent ?? '')
            .join(' '),
          /Enter a value/,
        )
        assert.ok(
          window.document.querySelector(
            '.v-tooltip [role="tooltip"], .v-tooltip[role="tooltip"]',
          ),
        )
        const focusCalls = []
        const prototype = window.HTMLElement.prototype
        const focus = prototype.focus
        prototype.focus = function (...args) {
          focusCalls.push(this)
          return focus.apply(this, args)
        }
        try {
          await fixture.recover()
          assert.equal(input.hasAttribute('aria-invalid'), false)
          assert.equal(window.document.activeElement, input)
          assert.equal(
            focusCalls.length,
            0,
            'Dismissing validation feedback must not invoke focus restoration',
          )
        } finally {
          prototype.focus = focus
        }
        assert.deepEqual(Array.from(fixture.errors), [])
      } finally {
        fixture.dispose()
      }
    },
  )
})
