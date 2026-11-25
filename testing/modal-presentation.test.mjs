import { test } from 'node:test'
import assert from 'node:assert/strict'
import { setTimeout as delay } from 'node:timers/promises'
import { withBuiltDomFixture } from '@uninterface/testing/jsdom'
import { build } from './fixture-build.mjs'

test('modal close uses native presentation', async () => {
  await withBuiltDomFixture(
    build,
    new URL('./fixtures/modal-presentation.ts', import.meta.url),
    async ({ mountModal }, window) => {
      window.HTMLDialogElement.prototype.showModal = function () {
        this.open = true
      }
      window.HTMLDialogElement.prototype.close = function () {
        this.open = false
      }
      const example = await mountModal()
      try {
        const run = example.control.run()
        await delay(100)
        const dialog = window.document.querySelector('dialog[open]')
        assert.ok(dialog)
        assert.ok(dialog.querySelector('.v-card.elevation-5'))
        assert.ok(dialog.querySelector('.v-card-item .v-card-title'))
        assert.ok(dialog.querySelector('.v-card-actions'))
        const close = dialog.querySelector('button.v-btn--icon')
        assert.ok(close)
        assert.ok(close.classList.contains('v-btn--variant-text'))
        assert.ok(
          close.querySelector('.v-icon svg path'),
          'configured native icon alias renders artwork',
        )
        assert.equal(close.getAttribute('aria-label'), 'Close')
        assert.equal(
          close.textContent.trim(),
          '',
          'no text cross substitutes for native artwork',
        )
        await example.control.state.session.cancel()
        await run
        assert.deepEqual(Array.from(example.errors), [])
      } finally {
        await example.dispose()
      }
    },
  )
})
