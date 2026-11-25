import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { build } from './fixture-build.mjs'
import { installDomEnvironment } from '@uninterface/testing/jsdom'

test('Vuetify compound frames own one floating label while retaining field strategies and feedback', async () => {
  const result = await build({
    logLevel: 'silent',
    define: { 'process.env.NODE_ENV': '"production"', 'process.env': '{}' },
    build: {
      write: false,
      lib: {
        entry: fileURLToPath(
          new URL('./fixtures/frame-labels.ts', import.meta.url),
        ),
        formats: ['iife'],
        name: 'FrameLabels',
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
    demo = await dom.window.FrameLabels.mount()
    const doc = dom.window.document
    const section = (name) => demo.host.querySelector(`[data-case=${name}]`)
    const outer = (name) => section(name).querySelector('.vuetify-input-frame')
    const label = (name) =>
      outer(name).querySelector('.v-field-label--floating')
    const external = (name) =>
      section(name).querySelector('.vuetify-field > .v-label')
    const ownsLabel = (name) => {
      assert.ok(
        label(name),
        `${name}: native floating label exists; ${demo.errors.join('; ')}`,
      )
      assert.equal(
        section(name).querySelectorAll('.v-field-label--floating').length,
        1,
      )
      assert.equal(external(name), null)
      assert.ok(outer(name).classList.contains('v-field--active'))
      assert.ok(outer(name).classList.contains('vuetify-required-control'))
      const field = section(name).querySelector('.vuetify-field')
      assert.equal(
        doc
          .getElementById(field.getAttribute('aria-labelledby'))
          .textContent.trim(),
        label(name).textContent.trim(),
      )
    }
    for (const name of ['compound', 'date', 'time', 'datetime']) ownsLabel(name)
    assert.equal(demo.field.dirty.value, false, 'initial baseline is unchanged')
    assert.ok(section('scalar').querySelector('.v-field-label--floating'))
    assert.ok(external('group'), 'ordinary groups retain their external label')
    label('compound').click()
    await demo.tick()
    assert.equal(
      doc.activeElement,
      section('compound').querySelector('input'),
      'native label click focuses an actual part',
    )
    await demo.field.set('')
    doc.activeElement.blur()
    await demo.tick()
    ownsLabel('compound')
    demo.field.reset()
    await demo.tick()
    ownsLabel('compound')
    assert.equal(demo.field.dirty.value, false)
    for (const strategy of ['floating', 'show', 'above', 'hidden', undefined]) {
      demo.labels.value = strategy
      await demo.tick()
      for (const name of ['compound', 'date', 'time', 'datetime']) {
        if (strategy === 'above' || strategy === 'hidden') {
          assert.equal(label(name), null)
          assert.ok(external(name))
          assert.equal(
            external(name).classList.contains('vuetify-sr-only'),
            strategy === 'hidden',
          )
        } else ownsLabel(name)
      }
    }
    demo.required.value = 'prefix'
    await demo.tick()
    assert.ok(outer('compound').classList.contains('vuetify-required-prefix'))
    demo.required.value = 'no'
    await demo.tick()
    assert.ok(!outer('compound').classList.contains('vuetify-required-control'))
    demo.required.value = 'yes'
    demo.label.value = 'Changed compound'
    await demo.tick()
    assert.equal(label('compound').textContent.trim(), 'Changed compound')
    await demo.field.set('bad')
    await demo.field.validate()
    await demo.tick()
    assert.ok(outer('compound').classList.contains('v-field--error'))
    assert.equal(
      section('compound').querySelectorAll(
        '.vuetify-field-feedback .text-error',
      ).length,
      1,
    )
    assert.ok(!section('compound').textContent.includes('Compound help'))
    const part = section('compound').querySelector('input')
    const description =
      part.getAttribute('aria-describedby')?.split(/\s+/) ?? []
    assert.ok(
      description.some(
        (id) =>
          doc.getElementById(id)?.textContent === 'Invalid compound value',
      ),
    )
    demo.failure.value = 'none'
    await demo.tick()
    assert.ok(!outer('compound').classList.contains('v-field--error'))
    assert.ok(section('compound').textContent.includes('Compound help'))
    assert.equal(part.getAttribute('aria-invalid'), 'true')
    demo.field.reset()
    await demo.tick()
    demo.split.value = true
    await demo.tick()
    assert.equal(
      section('compound').querySelectorAll('.v-field-label--floating').length,
      0,
    )
    assert.ok(
      external('compound'),
      'multiple frames share one external group label',
    )
    demo.split.value = false
    await demo.tick()
    ownsLabel('compound')
    for (const mode of ['start', 'unrestricted', 'bounded']) {
      section('date').querySelector('[data-temporal-mode]').click()
      await demo.tick()
      doc.querySelector(`[data-temporal-mode-value=${mode}]`).click()
      await demo.tick()
      ownsLabel('date')
    }
    section('date').querySelector('[data-temporal-range-trigger]').click()
    await demo.tick()
    assert.ok(outer('date').classList.contains('v-field--focused'))
    ownsLabel('date')
    doc.querySelector('[data-temporal-popup]').dispatchEvent(
      new dom.window.KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      }),
    )
    await demo.tick()
    demo.readonly.value = true
    await demo.tick()
    ownsLabel('compound')
    assert.ok(part.readOnly)
    demo.disabled.value = true
    await demo.tick()
    ownsLabel('compound')
    assert.ok(part.disabled)
    const ids = [...demo.host.querySelectorAll('[id]')].map((el) => el.id)
    assert.equal(
      ids.length,
      new Set(ids).size,
      'label handoff does not duplicate IDs',
    )
    assert.deepEqual(Array.from(demo.errors), [])
  } finally {
    demo?.dispose()
    dom.window.close()
  }
})
