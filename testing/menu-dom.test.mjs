import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import { build } from './fixture-build.mjs'
import { installDomEnvironment } from '@uninterface/testing/jsdom'

test('Vuetify popup enters focus after native transition and preserves child focus', async () => {
  const result = await build({
    logLevel: 'silent',
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env': '{}',
    },
    build: {
      write: false,
      lib: {
        entry: fileURLToPath(new URL('./fixtures/menu.ts', import.meta.url)),
        formats: ['iife'],
        name: 'MenuFixture',
      },
    },
  })
  const code = (Array.isArray(result) ? result : [result])
    .flatMap((result) => result.output)
    .find((output) => output.type === 'chunk').code
  const dom = new JSDOM('<!doctype html><body></body>', {
    url: 'http://localhost/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  })
  try {
    installDomEnvironment(dom.window)
    dom.window.eval(code)
    let entering = true
    const nativeFocus = dom.window.HTMLElement.prototype.focus
    dom.window.HTMLElement.prototype.focus = function (...args) {
      // Real VDialogTransition hides entering surfaces; jsdom ignores CSS.
      if (entering && this.closest('.v-overlay__content')) return
      nativeFocus.apply(this, args)
    }
    const fixture = await dom.window.MenuFixture.mountMenu()
    const settle = async () => {
      await fixture.tick()
      await new Promise((resolve) => setTimeout(resolve, 40))
    }
    const { document } = dom.window
    await settle()
    const root = document.querySelector('[role=menu][aria-label="Commands"]')
    assert.ok(root)
    const refresh = root.querySelector('[data-entry-key=refresh]')
    assert.notEqual(document.activeElement, refresh)
    entering = false
    fixture.shown()
    await settle()
    assert.equal(
      document.activeElement,
      refresh,
      'after-enter must retry initial focus',
    )
    const more = root.querySelector('[data-entry-key=more]')
    more.focus()
    fixture.shown()
    await settle()
    assert.equal(
      document.activeElement,
      more,
      'late completion preserves root cursor',
    )
    await fixture.expand()
    await settle()
    const child = document.querySelector('[role=menu][aria-label="More"]')
    assert.ok(child)
    child.focus()
    fixture.shown()
    await settle()
    assert.equal(
      document.activeElement,
      child,
      'late root event preserves loading child focus',
    )
    await fixture.finish()
    await settle()
    const archive = child.querySelector('[data-entry-key=archive]')
    archive.focus()
    fixture.shown()
    await settle()
    assert.equal(
      document.activeElement,
      archive,
      'late root event preserves loaded child focus',
    )
    fixture.shown()
    fixture.dispose()
    const outside = document.createElement('button')
    document.body.append(outside)
    outside.focus()
    await settle()
    assert.equal(
      document.activeElement,
      outside,
      'disposed focus work does not run',
    )
    assert.deepEqual(Array.from(fixture.errors), [])
  } finally {
    dom.window.close()
  }
})
