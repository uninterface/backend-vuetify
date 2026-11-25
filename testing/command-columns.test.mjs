import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { build } from './fixture-build.mjs'
import { installDomEnvironment } from '@uninterface/testing/jsdom'

test('Vuetify command columns share groups, reset at popups and use native append spacing', async () => {
  const result = await build({
    logLevel: 'silent',
    define: { 'process.env.NODE_ENV': '"production"', 'process.env': '{}' },
    build: {
      write: false,
      lib: {
        entry: fileURLToPath(
          new URL('./fixtures/command-columns.ts', import.meta.url),
        ),
        formats: ['iife'],
        name: 'Columns',
      },
    },
  })
  const code = (Array.isArray(result) ? result : [result])
    .flatMap((r) => r.output)
    .find((o) => o.type === 'chunk').code
  const dom = new JSDOM('<!doctype html><body></body>', {
    url: 'http://localhost/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  })
  let fixture
  try {
    installDomEnvironment(dom.window)
    dom.window.eval(code)
    fixture = await dom.window.Columns.mount()
    const row = (key) =>
      dom.window.document.querySelector(`[data-entry-key="${key}"]`)
    const check = (key) =>
      row(key).querySelector(
        ':scope > .v-list-item__prepend > .vuetify-entry-check',
      )
    const icon = (key) =>
      row(key).querySelector(
        ':scope > .v-list-item__prepend > .vuetify-entry-icon',
      )
    for (const key of ['plain', 'choice', 'radio', 'child']) {
      assert.ok(
        check(key).classList.contains('v-icon'),
        `${key}: native check square`,
      )
      assert.equal(check(key).getAttribute('aria-hidden'), 'true')
      assert.ok(icon(key), `${key}: independent icon square`)
      assert.equal(
        row(key).style.getPropertyValue('--v-list-prepend-gap'),
        '8px',
      )
    }
    assert.equal(check('plain').querySelector('svg'), null)
    assert.equal(check('choice').querySelector('svg'), null)
    assert.ok(check('radio').querySelector('svg'))
    assert.equal(row('plain').getAttribute('aria-checked'), null)
    assert.equal(row('choice').getAttribute('role'), 'menuitemcheckbox')
    assert.equal(row('radio').getAttribute('role'), 'menuitemradio')
    const choice = row('choice')
    choice.focus()
    choice.click()
    await fixture.tick()
    assert.equal(row('choice'), choice)
    assert.equal(dom.window.document.activeElement, choice)
    assert.equal(choice.getAttribute('aria-checked'), 'true')
    assert.ok(check('choice').querySelector('svg'))
    assert.ok(
      icon('choice').classList.contains('v-icon'),
      'check and icon remain separate',
    )
    assert.ok(
      row('plain').querySelector(
        ':scope > .v-list-item__append > .v-list-item-action > kbd',
      ),
    )
    assert.ok(
      row('child').querySelector(':scope > .v-list-item__append > .v-icon'),
    )
    row('child').click()
    await fixture.tick()
    assert.equal(
      check('childPlain'),
      null,
      'popup does not inherit parent selection columns',
    )
    await fixture.load()
    assert.ok(
      check('childPlain'),
      'loaded selection creates sibling check columns',
    )
    assert.ok(check('childChoice').querySelector('svg'))
    assert.equal(
      icon('childChoice'),
      null,
      'check-only surface needs no icon column',
    )
    assert.equal(
      row('childChoice').style.getPropertyValue('--v-list-prepend-gap'),
      '',
      'checks alone retain the native default',
    )
    for (const [checks, icons] of [
      [true, false],
      [false, true],
      [false, false],
    ]) {
      await fixture.configure(checks, icons)
      for (const key of ['plain', 'choice', 'radio', 'child']) {
        assert.equal(Boolean(check(key)), checks)
        assert.equal(Boolean(icon(key)), icons)
        assert.equal(
          row(key).style.getPropertyValue('--v-list-prepend-gap'),
          icons ? '8px' : '',
        )
      }
    }
    assert.deepEqual(Array.from(fixture.errors), [])
  } finally {
    fixture?.dispose()
    dom.window.close()
  }
})
