import { test } from 'node:test'
import assert from 'node:assert/strict'
import { setTimeout as delay } from 'node:timers/promises'
import { readFile } from 'node:fs/promises'
import { withBuiltDomFixture } from '@uninterface/testing/jsdom'
import { build } from './fixture-build.mjs'

const entry = new URL('./fixtures/feedback-presentation.ts', import.meta.url)
test('Vuetify feedback keeps native content/action anatomy, icons and appearing transition', async () => {
  const css = await readFile(
    new URL('../src/style.css', import.meta.url),
    'utf8',
  )
  const view = await readFile(
    new URL('../src/FeedbackItem.vue', import.meta.url),
    'utf8',
  )
  // Match direct focus against the native CSS rule. Paint is verified in the browser.
  const focusRule = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find(
    ([, selector, declarations]) =>
      selector.includes(':has(') &&
      selector.includes('feedback') &&
      /outline:/.test(declarations),
  )
  assert.ok(focusRule)
  const focusedSurface = focusRule[1]
    .trim()
    .replaceAll(':focus-visible', ':focus')
  assert.match(css, /feedback-viewport\s*\{[^}]*padding: 1rem;/s)

  await withBuiltDomFixture(build, entry, async ({ mountFeedback }, window) => {
    for (const kind of ['toast', 'notification']) {
      const example = await mountFeedback({ duration: null }, kind)
      try {
        const handle = example.send(`${kind} native surface`, true)
        await delay(150)
        const item = window.document.getElementById(handle.id)
        assert.ok(item)
        const content = item.querySelector('.vuetify-feedback-content')
        assert.ok(content)
        assert.equal(content.getAttribute('role'), 'region')
        const surface = content.closest('.vuetify-feedback-surface')
        assert.ok(surface)
        function verifyCue(target, expected) {
          assert.ok(target)
          target.focus()
          assert.equal(window.document.activeElement, target)
          assert.equal(surface.matches(focusedSurface), expected)
        }
        verifyCue(content, true)
        verifyCue(content.querySelector('input'), false)
        verifyCue(item.querySelector('button[aria-label="Close"]'), false)
        verifyCue(item.querySelector('[data-ui-footer-actions] button'), false)
        verifyCue(content, true)
        content.blur()
        assert.equal(surface.matches(focusedSurface), false)

        if (kind === 'toast') {
          assert.ok(item.querySelector('.v-snackbar__wrapper'))
          assert.ok(
            item.querySelector(
              '.v-snackbar__header .v-snackbar__content input',
            ),
          )
          assert.ok(
            item.querySelector(
              '.v-snackbar__actions button[aria-label="Close"] .v-icon',
            ),
          )
          assert.equal(
            item.querySelector('.v-snackbar__content[role="status"]'),
            null,
          )
        } else {
          assert.ok(
            item.querySelector('.v-card--variant-elevated .v-card-text input'),
          )
          assert.ok(
            item.querySelector(
              '.v-card-item__append button[aria-label="Close"] .v-icon',
            ),
          )
          assert.ok(item.querySelector('.v-card-actions'))
          assert.match(view, /<VFadeTransition[\s\S]*?\bappear\b/)
        }
        assert.deepEqual(Array.from(example.state.errors), [])
      } finally {
        example.dispose()
      }
    }
  })
})
