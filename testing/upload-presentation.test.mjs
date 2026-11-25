import { test } from 'node:test'
import assert from 'node:assert/strict'
import { withBuiltDomFixture } from '@uninterface/testing/jsdom'
import { build } from './fixture-build.mjs'

test('upload region uses an interactive native field with an integrated label and independent controls', async () => {
  await withBuiltDomFixture(
    build,
    new URL('./fixtures/upload-presentation.ts', import.meta.url),
    async ({ mountUpload }) => {
      const example = await mountUpload()
      try {
        const { root } = example
        assert.ok(root)
        assert.ok(
          root.matches('.v-field.v-field--variant-filled'),
          'same filled surface as ordinary fields',
        )
        assert.ok(
          root.querySelector('.vuetify-upload-icon .v-icon svg'),
          'native upload artwork',
        )
        assert.ok(
          root.querySelector('[data-upload-choose].v-btn--variant-tonal'),
          'native browse action',
        )
        assert.equal(root.getAttribute('role'), 'group')
        assert.equal(root.querySelectorAll('input[type=file]').length, 1)
        assert.ok(
          !root.closest('.v-input').classList.contains('v-input--readonly'),
        )
        const label = root.querySelector('.v-field-label--floating')
        assert.equal(label.textContent.trim(), 'Image')
        assert.equal(
          root
            .closest('.vuetify-field')
            .querySelector('.vuetify-field > .v-label'),
          null,
          'field label is integrated rather than duplicated above the frame',
        )
        label.click()
        assert.equal(
          root.ownerDocument.activeElement,
          root.querySelector('[data-upload-choose]'),
          'label click focuses the available acquisition control',
        )
        assert.deepEqual(Array.from(example.errors), [])
      } finally {
        example.dispose()
      }
    },
  )
})
