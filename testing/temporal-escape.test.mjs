import { test } from 'node:test'
import assert from 'node:assert/strict'
import { withBuiltDomFixture } from '@uninterface/testing/jsdom'
import { build } from './fixture-build.mjs'

test('Vuetify temporal Escape closes the popup and returns focus without consuming Escape when closed', async () => {
  await withBuiltDomFixture(
    build,
    new URL('./fixtures/temporal-escape.ts', import.meta.url),
    async ({ mountTemporalEscape }, window) => {
      const example = await mountTemporalEscape()
      try {
        const trigger = example.host.querySelector('[data-temporal-trigger]')
        const escape = (target) => {
          const event = new window.KeyboardEvent('keydown', {
            key: 'Escape',
            bubbles: true,
            cancelable: true,
          })
          target.dispatchEvent(event)
          return event
        }
        for (const destination of ['trigger', 'popup']) {
          trigger.focus()
          trigger.click()
          await example.tick()
          assert.equal(trigger.getAttribute('aria-expanded'), 'true')
          const target =
            destination === 'trigger'
              ? trigger
              : window.document.querySelector('[data-temporal-popup] button')
          assert.ok(target)
          target.focus()
          assert.equal(escape(target).defaultPrevented, true)
          await example.tick()
          assert.equal(trigger.getAttribute('aria-expanded'), 'false')
          assert.equal(window.document.activeElement, trigger)
        }
        // A real pointer sequence starts with mousedown. The surrounding VTextField
        // must not cancel the button's default focus and focus its editor instead.
        const input = example.host.querySelector('input')
        input.focus()
        const down = new window.MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
        })
        trigger.dispatchEvent(down)
        assert.equal(down.defaultPrevented, false)
        // JSDOM does not implement mouse default focus; browser acceptance covers it.
        trigger.focus()
        trigger.click()
        await example.tick()
        assert.equal(window.document.activeElement, trigger)
        escape(trigger)
        await example.tick()
        assert.equal(window.document.activeElement, trigger)
        assert.equal(escape(trigger).defaultPrevented, false)
        assert.deepEqual(Array.from(example.errors), [])
      } finally {
        example.dispose()
      }
    },
  )
})
