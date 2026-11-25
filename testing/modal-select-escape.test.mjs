import { test } from 'node:test'
import assert from 'node:assert/strict'
import { withBuiltDomFixture } from '@uninterface/testing/jsdom'
import { build } from './fixture-build.mjs'

test('select Escape closes the popup and keeps the native dialog open', async () => {
  await withBuiltDomFixture(
    build,
    new URL('./fixtures/modal-multi-select.ts', import.meta.url),
    async ({ mountModalMultiSelect }, window) => {
      window.HTMLDialogElement.prototype.showModal = function () {
        this.open = true
      }
      window.HTMLDialogElement.prototype.close = function () {
        this.open = false
      }
      // Model visible elements so the native popup's focus logic can run in jsdom.
      window.HTMLElement.prototype.getClientRects = function () {
        return [new window.DOMRect(0, 0, 100, 30)]
      }
      const example = await mountModalMultiSelect()
      try {
        const tick = () => new Promise((resolve) => setTimeout(resolve, 80))
        window.document.querySelector('button').click()
        await tick()
        const dialog = window.document.querySelector('dialog[open]')
        assert.ok(dialog)
        const combobox = () => dialog.querySelector('[role=combobox]')
        const key = (target, value) => {
          const event = new window.KeyboardEvent('keydown', {
            key: value,
            bubbles: true,
            cancelable: true,
          })
          target.dispatchEvent(event)
          return event
        }
        for (const destination of ['trigger', 'option']) {
          combobox().focus()
          key(combobox(), 'ArrowDown')
          await tick()
          const trigger = combobox()
          assert.equal(trigger.getAttribute('aria-expanded'), 'true')
          const target =
            destination === 'trigger'
              ? trigger
              : dialog.querySelector('[role=option]')
          assert.ok(target, 'popup is hosted inside its native dialog')
          target.focus()
          const escape = key(target, 'Escape')
          await tick()
          assert.equal(
            escape.defaultPrevented,
            true,
            `${destination}: popup consumes the dialog cancellation key`,
          )
          assert.equal(combobox().getAttribute('aria-expanded'), 'false')
          assert.equal(dialog.open, true)
          assert.equal(window.document.activeElement, combobox())
        }
      } finally {
        example.dispose()
      }
    },
  )
})
