import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createUiDomTest } from '@uninterface/testing/dom'
import {
  withStrategies,
  settleUntil,
} from '../../../tests/strategy-dom-fixture.mjs'
import { build } from './fixture-build.mjs'
import { uiDomTestAdapter } from './dom.mjs'
test('strategies retain native sizing, labels, annotations and feedback', () =>
  withStrategies(build, async (example, window) => {
    const ui = createUiDomTest(uiDomTestAdapter)
    const target = example.host.querySelector('[data-strategy-target="text"]')
    const input = target.matches('input')
      ? target
      : target.querySelector('input')
    input.focus()
    const button = example.host.querySelector('[data-strategy-target="button"]')
    {
      assert.ok(input.closest('.v-input--density-comfortable'))
      assert.ok(button.classList.contains('v-btn--size-small'))
    }
    {
      assert.ok(
        input.closest('.v-input').querySelector('.v-messages'),
        'native widget details remain in use',
      )
      assert.equal(
        input
          .closest('.vuetify-field')
          .querySelector(':scope > .vuetify-field-feedback'),
        null,
        'label/requiredAnnotations preferences alone do not replace native details',
      )
    }
    const backendPrefix = 'vuetify'
    const originalLabels = example.state.labels
    for (const labels of [originalLabels, undefined]) {
      example.state.labels = labels
      for (const mode of ['prefix', 'suffix', 'no', 'yes']) {
        example.state.requiredAnnotations = mode
        await example.tick()
        for (const controlName of [
          'text',
          'form-editor',
          'checkbox',
          'switch',
          'select',
        ]) {
          const control = example.host.querySelector(
            `[data-strategy-target="${controlName}"]`,
          )
          const field = control.closest(`.${backendPrefix}-field`)
          assert.ok(field, `${controlName} has a field`)
          const markers = field.querySelectorAll(
            `.${backendPrefix}-required, .vuetify-required-control, .vuetify-required-checkbox`,
          )
          if (mode === 'no') {
            assert.equal(
              markers.length,
              0,
              `${controlName}: no visible required annotation`,
            )
          } else {
            assert.equal(
              markers.length,
              1,
              `${controlName}: one annotated label or control`,
            )
            assert.equal(
              markers[0].classList.contains(`${backendPrefix}-required-prefix`),
              mode === 'prefix',
            )
          }
        }
        const group = example.host.querySelector('[data-strategy-group]')
        assert.equal(
          group.querySelector(`.${backendPrefix}-required`),
          null,
          'query barrier preserves local no annotation',
        )
      }
    }
    example.state.blockRequiredGroup = false
    const groupField = example.host.querySelector('[data-strategy-group]')
    assert.ok(
      ui.fieldGroup(groupField).label?.textContent.includes('Required group'),
    )
    assert.ok(ui.fieldGroup(groupField).controlArea)
    for (const mode of ['prefix', 'suffix', 'yes', 'no']) {
      example.state.requiredAnnotations = mode
      await example.tick()
      const marker = groupField.querySelector(`.${backendPrefix}-required`)
      assert.equal(
        Boolean(marker),
        mode !== 'no',
        'group annotation follows its own strategy query',
      )
      if (marker) {
        assert.equal(
          marker.classList.contains(`${backendPrefix}-required-prefix`),
          mode === 'prefix',
        )
      }
      const requiredDescription = groupField.querySelector(
        `[id$="-required"], .plain-strategy-hidden`,
      )
      if (mode === 'no')
        assert.ok(
          requiredDescription,
          'group retains semantic required description',
        )
      const optionalField = example.host
        .querySelector('[data-strategy-target="blocked-editor"]')
        .closest(`.${backendPrefix}-field`)
      assert.equal(
        optionalField.querySelector(`.${backendPrefix}-required`),
        null,
        'optional field receives no annotation',
      )
    }
    example.state.blockRequiredGroup = true
    example.state.labels = originalLabels
    example.state.requiredAnnotations = 'yes'
    await example.tick()
    for (const [level, index] of [
      [-2, 0],
      [-1, 1],
      [0, 2],
      [1, 3],
      [2, 4],
    ]) {
      example.state.size = level
      await example.tick()
      {
        assert.equal(
          Boolean(input.closest('.v-input--density-compact')),
          level === -2,
        )
        assert.equal(
          Boolean(input.closest('.v-input--density-comfortable')),
          level === -1,
        )
        assert.ok(
          button.classList.contains(
            `v-btn--size-${['x-small', 'small', 'default', 'large', 'x-large'][index]}`,
          ),
        )
      }
    }
    example.state.size = -1
    for (const limit of ['fieldOnly', 'sizeDepth']) {
      example.state[limit] = limit === 'fieldOnly' ? true : 1
      await example.tick()
      {
        assert.ok(input.closest('.v-input--density-default'))
      }
      example.state[limit] = limit === 'fieldOnly' ? false : undefined
    }
    await example.tick()
    for (const [name, control] of [
      ['text', example.text],
      ['checkbox', example.checkbox],
      ['select', example.selected],
    ]) {
      const surface = example.host.querySelector(
        `[data-strategy-target="${name}"]`,
      )
      const editor = surface.matches(
        'input,select,[role=checkbox],[role=combobox]',
      )
        ? surface
        : surface.querySelector(
            'input:not([type=hidden]),select,[role=checkbox],[role=combobox]',
          )
      control.state.issue = `Failure for ${name}`
      for (const mode of ['none', 'show-tooltip']) {
        example.state.failure = mode
        await example.tick()
        await settleUntil(
          example.tick,
          () =>
            mode === 'none'
              ? !ui.fieldFeedback(editor).message
              : ui.fieldFeedback(editor).tooltip,
          `native validation for ${name}/${mode}`,
        )
        const { message } = ui.fieldFeedback(editor)
        if (mode === 'none') {
          assert.ok(
            editor.closest('.v-input--error'),
            `${name}: none retains native visual invalidity`,
          )
        } else {
          {
            assert.ok(
              message.className.includes('tooltip-description'),
              'stable accessible error description survives portal lifecycle',
            )
          }
        }
      }
      control.state.issue = null
      await control.validate()
      await example.tick()
    }
    for (const position of ['above', 'beside', 'beside-far', 'beside-near']) {
      example.state.labels = position
      await example.tick()
      {
        assert.equal(example.host.querySelector('.vuetify-labels-beside'), null)
        const field = input.closest('.vuetify-field')
        assert.equal(
          Boolean(field.querySelector(':scope > .v-label')),
          position === 'above',
          'unsupported beside requests preserve integrated native labels',
        )
      }
    }
    const checkableFields = [
      ...example.host.querySelectorAll('.vuetify-field'),
    ].filter((field) =>
      ['Strategy checkbox', 'Strategy switch'].some((label) =>
        field.textContent.includes(label),
      ),
    )
    for (const position of [
      undefined,
      'show',
      'above',
      'beside',
      'beside-far',
      'beside-near',
      'floating',
    ]) {
      example.state.labels = position
      await example.tick()
      for (const field of checkableFields) {
        {
          assert.equal(field.querySelector(':scope > .v-label'), null)
          assert.ok(field.querySelector('.v-selection-control .v-label'))
        }
      }
    }
    for (const position of ['show', 'floating', 'hidden', undefined]) {
      example.state.labels = position
      await example.tick()
      for (const name of ['text', 'select', 'checkbox', 'switch']) {
        const surface = example.host.querySelector(
          `[data-strategy-target="${name}"]`,
        )
        const editor = surface.matches(
          'input,select,[role=checkbox],[role=switch],[role=combobox]',
        )
          ? surface
          : surface.querySelector(
              'input:not([type=hidden]),select,[role=checkbox],[role=switch],[role=combobox]',
            )
        if (position === 'hidden' && !['checkbox', 'switch'].includes(name)) {
          const field = editor.closest('.vuetify-field')
          assert.ok(
            field.querySelector('.v-label.vuetify-sr-only'),
            `${name}: hidden retains the native visually hidden label`,
          )
        }
      }
      {
        const field = input.closest('.vuetify-field')
        assert.equal(
          Boolean(field.querySelector('.v-field-label--floating')),
          position !== 'hidden',
          'floating and omission retain native floating labels',
        )
      }
    }
  }))
