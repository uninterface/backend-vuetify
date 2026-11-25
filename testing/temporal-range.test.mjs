import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { build } from './fixture-build.mjs'
import { installDomEnvironment } from '@uninterface/testing/jsdom'

test('Vuetify native date ranges commit both dates, including same-day ranges, without losing drafts', async () => {
  const result = await build({
    logLevel: 'silent',
    define: { 'process.env.NODE_ENV': '"production"', 'process.env': '{}' },
    build: {
      write: false,
      lib: {
        entry: fileURLToPath(
          new URL('./temporal-presentation-fixture.ts', import.meta.url),
        ),
        formats: ['iife'],
        name: 'Ranges',
      },
    },
  })
  const code = (Array.isArray(result) ? result : [result])
    .flatMap((r) => r.output)
    .find((r) => r.type === 'chunk').code
  const dom = new JSDOM('<!doctype html><body></body>', {
    url: 'http://localhost/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  })
  let demo
  try {
    installDomEnvironment(dom.window)
    dom.window.eval(code)
    demo = await dom.window.Ranges.mount()
    const doc = dom.window.document
    const section = (name) => demo.host.querySelector(`[data-case=${name}]`)
    const range = section('range')
    const control = demo.controls.range.field
    const popup = () => doc.querySelector('[data-temporal-range-popup]')
    const trigger = () => range.querySelector('[data-temporal-range-trigger]')
    const state = () => JSON.stringify(control.state.input)
    const pair = (start, end) =>
      JSON.stringify({ start: `2026-03-${start}`, end: `2026-03-${end}` })
    const open = async () => {
      assert.equal(range.querySelectorAll('[data-temporal-trigger]').length, 1)
      trigger().click()
      await demo.tick()
      assert.ok(popup()?.querySelector('.v-date-picker'))
      assert.ok(range.querySelector('[data-engaged]'))
      assert.equal(popup().querySelector('.v-card-actions'), null)
    }
    const close = async () => {
      popup().dispatchEvent(
        new dom.window.KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
        }),
      )
      await demo.tick()
      assert.equal(popup(), null)
      assert.equal(doc.activeElement, trigger())
    }
    const day = (n) =>
      [
        ...popup().querySelectorAll(
          '.v-date-picker-month__day:not(.v-date-picker-month__day--adjacent) button',
        ),
      ].find((button) => button.textContent.trim() === String(n))
    const choose = async (start, end) => {
      const before = state()
      day(start).click()
      await demo.tick()
      assert.equal(
        state(),
        before,
        'first date is a picker draft, not a partial control update',
      )
      await demo.format('DMY')
      day(end).click()
      await demo.tick()
      assert.equal(popup(), null)
      assert.equal(doc.activeElement, trigger())
    }
    await open()
    assert.ok(
      popup().querySelector('.v-date-picker-month__day--range-middle'),
      'native range highlighting',
    )
    assert.ok(day(16).disabled, 'business eligibility disables native dates')
    await choose(5, 7)
    assert.equal(state(), pair('05', '07'))
    await open()
    await choose(5, 7)
    assert.equal(state(), pair('05', '07'), 'unchanged selection still closes')
    await open()
    await choose(9, 6)
    assert.equal(
      state(),
      pair('06', '09'),
      'native reverse selection is normalized',
    )
    await open()
    await choose(8, 8)
    assert.equal(state(), pair('08', '08'))
    assert.equal(
      await control.validate(),
      true,
      'same-day dates are an inclusive one-day interval',
    )
    await open()
    assert.ok(
      popup().querySelector(
        '.v-date-picker-month__day--range-start.v-date-picker-month__day--range-end',
      ),
    )
    day(10).click()
    await demo.tick()
    await close()
    assert.equal(
      state(),
      pair('08', '08'),
      'dismissal discards only the incomplete picker selection',
    )
    await open()
    day(12).click()
    await demo.tick()
    control.reset()
    await demo.tick()
    await choose(5, 6)
    assert.equal(
      state(),
      pair('05', '06'),
      'external reset replaces the pending native selection',
    )

    const editors = [...range.querySelectorAll('input')]
    editors[0].focus()
    editors[0].value = 'unfinished'
    editors[0].dispatchEvent(new dom.window.Event('input', { bubbles: true }))
    await demo.tick()
    editors[1].dispatchEvent(
      new dom.window.KeyboardEvent('keydown', {
        key: 'ArrowDown',
        altKey: true,
        bubbles: true,
      }),
    )
    await demo.tick()
    assert.ok(popup(), 'either endpoint can open the shared picker')
    await close()
    assert.equal(editors[0].value, 'unfinished')
    assert.equal(control.state.input.start, 'unfinished')
    control.reset()
    await demo.tick()

    await open()
    const outside = doc.createElement('button')
    doc.body.append(outside)
    outside.dispatchEvent(
      new dom.window.MouseEvent('mousedown', { bubbles: true }),
    )
    outside.focus()
    outside.click()
    await demo.tick()
    assert.equal(popup(), null)
    assert.equal(doc.activeElement, outside)
    outside.remove()

    const mode = async (value) => {
      range.querySelector('[data-temporal-mode]').click()
      await demo.tick()
      doc.querySelector(`[data-temporal-mode-value=${value}]`).click()
      await demo.tick()
      assert.equal(
        doc.activeElement,
        range.querySelector('[data-temporal-mode]'),
      )
    }
    await mode('start')
    assert.equal(trigger(), null)
    assert.equal(range.querySelectorAll('[data-temporal-trigger]').length, 1)
    assert.equal(range.querySelectorAll('[data-temporal-infinity]').length, 1)
    await mode('bounded')
    assert.ok(trigger())
    for (const name of ['datetimeRange', 'timeRange']) {
      assert.equal(
        section(name).querySelector('[data-temporal-range-trigger]'),
        null,
      )
      assert.equal(
        section(name).querySelectorAll('[data-temporal-trigger]').length,
        2,
      )
    }
    await open()
    await demo.disabled(true)
    assert.equal(popup(), null)
    assert.ok(trigger().disabled)
    await demo.disabled(false)
    await open()
    await demo.readonly(true)
    assert.equal(popup(), null)
    assert.ok(trigger().disabled)
    assert.deepEqual(Array.from(demo.errors), [])
  } finally {
    demo?.dispose()
    dom.window.close()
  }
})
