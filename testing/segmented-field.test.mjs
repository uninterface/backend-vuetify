import { test } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { installDomEnvironment } from '@uninterface/testing/jsdom'
import { buildSegmentedField } from './segmented-field-build.mjs'

test('Vuetify segmented fields integrate floating labels, native field states and radio interaction', async () => {
  const fixture = await buildSegmentedField()
  const dom = new JSDOM('<!doctype html><body></body>', {
    url: 'http://localhost/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  })
  let example
  try {
    installDomEnvironment(dom.window)
    dom.window.eval(fixture.script)
    example = await dom.window.SegmentedField.mountSegmentedField()
    const doc = dom.window.document
    const host = example.host.querySelector('[data-case=segmented]')
    const surface = () => host.querySelector('.segmented-field')
    const group = host.querySelector('[role=radiogroup]')
    const radios = () => [...group.querySelectorAll('[role=radio]')]
    const floating = () => surface().querySelector('.v-field-label--floating')
    const external = () => host.querySelector(':scope > .v-label')
    const checkLabel = () => {
      assert.ok(floating())
      assert.equal(floating().textContent.trim(), example.state.label)
      assert.equal(external(), null)
      assert.ok(surface().classList.contains('v-field--active'))
      assert.ok(
        !surface().classList.contains('v-field--single-line'),
        'always-visible choices cannot be covered by an inline label',
      )
      assert.equal(host.getAttribute('role'), null, 'ordinary field wrapper')
      assert.equal(host.getAttribute('aria-labelledby'), null)
      assert.equal(group.getAttribute('aria-label'), example.state.label)
    }
    checkLabel()
    assert.equal(example.field.state.input, undefined)
    assert.equal(example.field.dirty.value, false)
    assert.equal(group.querySelectorAll('[aria-checked=true]').length, 0)
    assert.ok(
      radios().every((radio) =>
        radio.classList.contains('v-btn--variant-text'),
      ),
    )
    assert.ok(!group.querySelector('.v-btn-group--divided'))
    for (const radio of radios()) {
      assert.equal(radio.style.height, 'auto')
      assert.equal(radio.style.minHeight, 'var(--vuetify-segment-min-height)')
    }
    assert.match(fixture.styles, /--vuetify-segment-min-height/)

    assert.ok(host.querySelector('.vuetify-required-control'))
    assert.ok(
      example.host.querySelector('[data-case=text] .v-field--single-line'),
      'native application defaults still apply to unrelated fields',
    )
    floating().click()
    await example.tick()
    assert.equal(doc.activeElement, radios()[0])
    assert.ok(surface().classList.contains('v-field--focused'))
    const click = new dom.window.MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    })
    radios()[0].querySelector('.v-btn__content').dispatchEvent(click)
    await example.tick()
    assert.equal(
      click.defaultPrevented,
      false,
      'VField does not cancel embedded activation',
    )
    assert.equal(example.field.state.input, '')
    radios()[0].dispatchEvent(
      new dom.window.KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
      }),
    )
    await example.tick()
    assert.equal(example.field.state.input, 'week')
    assert.equal(doc.activeElement, radios()[1])
    assert.ok(surface().classList.contains('v-field--focused'))
    radios()[1].dispatchEvent(
      new dom.window.KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
      }),
    )
    await example.tick()
    assert.equal(example.field.state.input, 'month', 'skip disabled option')
    example.host.querySelector('[data-case=outside]').focus()
    await example.tick()
    assert.ok(!surface().classList.contains('v-field--focused'))
    example.field.reset()
    await example.field.validate()
    await example.tick()
    checkLabel()
    assert.ok(surface().classList.contains('v-field--error'))
    assert.equal(
      host.querySelectorAll('.vuetify-field-feedback .text-error').length,
      1,
    )
    assert.equal(
      host.querySelectorAll('.v-input__details').length,
      0,
      'field feedback has one owner',
    )
    assert.match(
      group
        .getAttribute('aria-describedby')
        .split(/\s+/)
        .map((id) => doc.getElementById(id)?.textContent)
        .join(' '),
      /Choose a period/,
    )
    example.state.failure = 'none'
    await example.tick()
    assert.ok(!surface().classList.contains('v-field--error'))
    assert.equal(group.getAttribute('aria-invalid'), 'true')
    assert.match(
      host.querySelector('.vuetify-field-feedback').textContent,
      /Select a period/,
    )
    example.state.help = ''
    await example.tick()
    assert.equal(
      host.querySelector('.vuetify-field-feedback'),
      null,
      'suppressed error without help leaves no feedback margin',
    )
    example.state.failure = 'show-tooltip'
    await example.tick()
    assert.equal(
      host.querySelector('.vuetify-field-feedback'),
      null,
      'tooltip does not reserve inline feedback space',
    )
    const tooltipDescription = group
      .getAttribute('aria-describedby')
      .split(/\s+/)
      .map((id) => doc.getElementById(id)?.textContent)
      .join(' ')
    assert.match(
      tooltipDescription,
      /Choose a period/,
      'tooltip description remains associated',
    )
    example.state.failure = 'show'
    await example.tick()
    assert.match(
      host.querySelector('.vuetify-field-feedback').textContent,
      /Choose a period/,
    )
    await example.field.set('week')
    await example.field.validate()
    await example.tick()
    assert.equal(
      host.querySelector('.vuetify-field-feedback'),
      null,
      'correction removes empty feedback and margin',
    )
    example.state.help = 'Select a period'
    await example.tick()
    assert.match(
      host.querySelector('.vuetify-field-feedback').textContent,
      /Select a period/,
    )

    for (const labels of ['above', 'hidden', 'floating', 'show', undefined]) {
      example.state.labels = labels
      await example.tick()
      if (labels === 'above' || labels === 'hidden') {
        assert.equal(floating(), null)
        assert.ok(external())
        assert.equal(
          external().classList.contains('vuetify-sr-only'),
          labels === 'hidden',
        )
      } else checkLabel()
      assert.equal(group.getAttribute('aria-label'), example.state.label)
      if (external()) {
        assert.equal(
          external().htmlFor,
          host.querySelector('[data-uninterface-segmented-select]').id,
        )
        external().click()
        await example.tick()
        assert.equal(doc.activeElement, radios()[1])
        assert.equal(example.field.state.input, 'week')
      }
    }
    example.state.variant = 'outlined'
    example.state.label = 'Changed period'
    example.state.required = 'prefix'
    example.state.orientation = 'vertical'
    example.state.size = -1
    await example.tick()
    checkLabel()
    assert.ok(surface().classList.contains('v-field--variant-outlined'))
    assert.ok(surface().classList.contains('vuetify-required-prefix'))
    assert.ok(host.querySelector('.v-input--density-comfortable'))
    assert.ok(host.querySelector('.v-btn-group--vertical'))
    example.state.required = 'no'
    example.state.disabled = true
    await example.tick()
    assert.ok(!surface().classList.contains('vuetify-required-control'))
    assert.ok(surface().classList.contains('v-field--disabled'))
    assert.ok(radios().every((radio) => radio.disabled))
    assert.equal(await example.focus(), false)
    const ids = [...example.host.querySelectorAll('[id]')].map((el) => el.id)
    assert.equal(new Set(ids).size, ids.length)
    assert.deepEqual(Array.from(example.errors), [])
  } finally {
    example?.dispose()
    dom.window.close()
  }
})
