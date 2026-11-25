import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'
import { build } from './fixture-build.mjs'
import { installDomEnvironment } from '@uninterface/testing/jsdom'

test('Vuetify navigation keeps native layer precedence and list presentation', async () => {
  const result = await build({
    logLevel: 'silent',
    define: { 'process.env.NODE_ENV': '"production"', 'process.env': '{}' },
    build: {
      write: false,
      lib: {
        entry: fileURLToPath(
          new URL('./fixtures/navigation.ts', import.meta.url),
        ),
        formats: ['iife'],
        name: 'Navigation',
      },
    },
  })
  const output = (Array.isArray(result) ? result : [result]).flatMap(
    (r) => r.output,
  )
  const css = output
    .filter((r) => r.type === 'asset' && r.fileName.endsWith('.css'))
    .map((r) => String(r.source))
    .join('\n')
  const firstLayer = /@layer\s+([^;{]+)/.exec(css)?.[1].replace(/\s/g, '')
  assert.equal(
    firstLayer,
    'vuetify-core,vuetify-components,vuetify-overrides,vuetify-utilities,vuetify-final',
    'built CSS establishes native precedence before hoisted component layer declarations',
  )
  assert.match(
    css,
    /text-decoration:\s*underline/,
    'ordinary prose links retain their baseline',
  )
  assert.match(
    css,
    /\.v-list-item\s*\{[^}]*text-decoration:\s*none/,
    'native menu links retain their toolkit treatment in the higher layer',
  )
  const dom = new JSDOM('<!doctype html><body></body>', {
    url: 'http://localhost/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  })
  let fixture
  try {
    installDomEnvironment(dom.window)
    dom.window.eval(output.find((r) => r.type === 'chunk').code)
    fixture = await dom.window.Navigation.mountNavigation()
    const doc = dom.window.document
    // JSDOM cannot evaluate CSS cascade layers. Verify the unlayered list reset
    // on real native markup, separately from the bundled layer precedence above.
    const style = doc.createElement('style')
    const source = readFileSync(
      new URL('../src/style.css', import.meta.url),
      'utf8',
    )
    style.textContent = source
      .replace(/^@import[^;]+;/gm, '')
      .replace(/^@layer[^;{]+;/gm, '')
    doc.head.append(style)
    const trigger = fixture.host.querySelector('[data-entry-key=examples]')
    trigger.click()
    await fixture.tick()
    const popup = doc.querySelector('.v-list[data-parent=examples]')
    assert.ok(popup, 'submenu uses native VList')
    const destination = popup.querySelector('[data-entry-key=dates]')
    assert.ok(destination.matches('a.v-list-item[href="#dates"]'))
    assert.equal(destination.getAttribute('aria-current'), 'page')
    for (const list of doc.querySelectorAll('.vuetify-entry-list')) {
      assert.equal(dom.window.getComputedStyle(list).listStyle, 'none')
      assert.equal(dom.window.getComputedStyle(list).margin, '0px')
    }
    assert.notEqual(
      dom.window.getComputedStyle(doc.querySelector('[data-prose]')).listStyle,
      'none',
    )
    assert.equal(
      popup.querySelector('[data-entry-key=disabled]').getAttribute('href'),
      null,
    )
    popup.dispatchEvent(
      new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    )
    await fixture.tick()
    assert.equal(trigger.getAttribute('aria-expanded'), 'false')
    assert.equal(doc.activeElement, trigger)
    trigger.click()
    await fixture.tick()
    doc.querySelector('[data-entry-key=cards]').click()
    await fixture.tick()
    assert.deepEqual(Array.from(fixture.activated), ['cards'])
    assert.equal(trigger.getAttribute('aria-expanded'), 'false')
    assert.deepEqual(Array.from(fixture.errors), [])
    fixture.dispose()
    fixture = await dom.window.Navigation.mountTravel()
    const preview = fixture.host.querySelector(
      '[data-testid="navigation-preview"]',
    )
    const item = (key) =>
      [...doc.querySelectorAll(`[data-entry-key="${key}"]`)].find(
        (el) => !el.closest('[hidden], [style*="display: none"]'),
      )
    const nativeIcon = (key) => {
      const icon = item(key).querySelector(
        ':scope > .v-list-item__prepend > .vuetify-entry-icon',
      )
      assert.ok(
        icon?.matches('.v-icon'),
        `${key}: native icon activates Vuetify's prepend spacer`,
      )
      assert.ok(icon.nextElementSibling.matches('.v-list-item__spacer'))
      assert.equal(icon.getAttribute('aria-hidden'), 'true')
    }
    for (const mode of ['vertical-tree', 'vertical-popup', 'icon-popup']) {
      await fixture.setPresentation(mode)
      for (const key of ['overview', 'destinations', 'travelJournal']) {
        nativeIcon(key)
        assert.equal(
          dom.window.getComputedStyle(item(key)).width,
          '100%',
          `${mode}: leaf and branch buttons fill their level`,
        )
      }
      if (mode === 'icon-popup') {
        const root = item('destinations')
        assert.equal(
          dom.window.getComputedStyle(
            root.querySelector(':scope > .v-list-item__content'),
          ).minWidth,
          '0',
        )
        assert.equal(
          dom.window.getComputedStyle(
            root.querySelector(
              ':scope > .v-list-item__prepend > .v-list-item__spacer',
            ),
          ).display,
          'none',
        )
      }
      if (item('destinations').getAttribute('aria-expanded') !== 'true')
        item('destinations').click()
      await fixture.tick()
      nativeIcon('asia')
      nativeIcon('allDestinations')
      assert.equal(
        item('allDestinations')
          .querySelector('.vuetify-entry-icon')
          .textContent.trim(),
        '',
        'missing icon reserves the native square without artwork',
      )
      assert.notEqual(
        dom.window.getComputedStyle(
          item('asia').querySelector(
            ':scope > .v-list-item__prepend > .v-list-item__spacer',
          ),
        ).display,
        'none',
        'rail adaptation does not suppress flyout spacing',
      )
      if (item('asia').getAttribute('aria-expanded') !== 'true')
        item('asia').click()
      await fixture.tick()
      nativeIcon('singapore')
      if (mode === 'vertical-tree') {
        const tree = item('destinations').closest('.v-list')
        assert.ok(tree.matches('.vuetify-navigation-tree'))
        assert.equal(
          tree.querySelectorAll('.v-list').length,
          0,
          'nested branches must not restart the native list or indentation',
        )
        assert.equal(item('asia').closest('.v-list'), tree)
        assert.equal(item('singapore').closest('.v-list'), tree)
        const parentItems = item('asia').closest('.v-list-group__items')
        const childItems = item('singapore').closest('.v-list-group__items')
        assert.equal(
          parentItems.parentElement.querySelector(':scope > [data-entry-key]')
            .dataset.entryKey,
          'destinations',
        )
        assert.equal(
          childItems.parentElement.querySelector(':scope > [data-entry-key]')
            .dataset.entryKey,
          'asia',
        )
        item('europe').click()
        await fixture.tick()
        assert.equal(
          item('asia').getAttribute('aria-expanded'),
          'true',
          'opening a sibling preserves an independently expanded branch',
        )
        assert.equal(item('europe').getAttribute('aria-expanded'), 'true')
        item('asia').click()
        await fixture.tick()
        assert.equal(item('asia').getAttribute('aria-expanded'), 'false')
        assert.equal(item('europe').getAttribute('aria-expanded'), 'true')
        item('asia').click()
        await fixture.tick()
      }
      item('singapore').click()
      await fixture.tick()
      assert.equal(
        preview
          .querySelector('[data-testid="navigation-content"] h3')
          .textContent.trim(),
        'Singapore',
      )
    }
    assert.deepEqual(Array.from(fixture.errors), [])
  } finally {
    fixture?.dispose()
    dom.window.close()
  }
})
