import { test } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { installDomEnvironment } from '@uninterface/testing/jsdom'
import { buildCompactCheckboxes } from './compact-checkboxes-build.mjs'

test('compact layout checkbox accommodation matches actual fields without crossing layout boundaries', async () => {
  const fixture = await buildCompactCheckboxes()
  // Match the built CSS selector against actual adapter DOM, rather than just
  // checking the layout's class. Geometry and native cascade need a browser.
  const rule = fixture.styles.match(
    /([^{}]*\.vuetify-compact-layout[^{}]*)\{([^{}]*)\}/,
  )
  assert.ok(rule, 'the accommodation is shipped in the backend stylesheet')
  const selector = rule[1].trim()
  assert.match(rule[2], /min-height:\s*var\(--v-selection-control-size\)/)
  const dom = new JSDOM('<!doctype html><body></body>', {
    url: 'http://localhost/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  })
  try {
    installDomEnvironment(dom.window)
    dom.window.eval(fixture.script)
    const example = await dom.window.CompactCheckboxes.mountCompactCheckboxes()
    const root = (name) => example.host.querySelector(`[data-case=${name}]`)
    const matches = () => [...example.host.querySelectorAll(selector)]
    assert.equal(matches().length, 7, 'three linear, two flow, two grid fields')
    for (const name of ['linear', 'flow', 'grid']) {
      assert.equal(
        root(name).querySelectorAll(selector).length,
        name === 'linear' ? 3 : 2,
      )
    }
    for (const name of [
      'depth-stopped',
      'opaque',
      'blocked',
      'reset',
      'region',
      'reference',
    ])
      assert.equal(root(name).querySelectorAll(selector).length, 0, name)
    const checkbox = root('linear').querySelector('input[type=checkbox]')
    checkbox.click()
    checkbox.focus()
    for (const level of [0, 1, undefined, -1]) {
      await example.update(level)
      assert.equal(matches().length, level === -1 ? 7 : 0)
      assert.equal(
        root('linear').querySelector('input[type=checkbox]'),
        checkbox,
      )
      assert.equal(example.checked(), true)
      assert.equal(dom.window.document.activeElement, checkbox)
      assert.ok(
        checkbox.closest('.v-selection-control--density-default'),
        'layout density does not change native control density',
      )
    }
    const last = root('linear').querySelectorAll('input[type=checkbox]')[2]
    assert.match(root('linear').textContent, /A helper remains available/)
    await example.validate()
    assert.equal(last.getAttribute('aria-invalid'), 'true')
    const descriptions = last
      .getAttribute('aria-describedby')
      .split(/\s+/)
      .map((id) => dom.window.document.getElementById(id)?.textContent ?? '')
      .join(' ')
    assert.match(descriptions, /Enable this setting/)
    assert.equal(
      matches().length,
      7,
      'feedback retains the same native checkbox surface',
    )
    await example.update(-1, true)
    assert.ok(
      checkbox.closest('.v-selection-control--density-comfortable'),
      'an explicit control-size strategy remains independent',
    )
    assert.deepEqual(Array.from(example.errors), [])
    example.dispose()
  } finally {
    dom.window.close()
  }
})
