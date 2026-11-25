import { test } from 'node:test'
import assert from 'node:assert/strict'
import { withBuiltDomFixture } from '@uninterface/testing/jsdom'
import { build } from './fixture-build.mjs'

test('native single-line labels respect explicit floating strategy', async () => {
  await withBuiltDomFixture(
    build,
    new URL('./fixtures/strategy-native-defaults.ts', import.meta.url),
    async ({ mount }) => {
      const example = await mount()
      try {
        const input = (attribute) => {
          const surface = example.host.querySelector(`[${attribute}]`)
          return surface.matches('input')
            ? surface
            : surface.querySelector('input')
        }
        const ordinary = input('data-native-default')

        assert.ok(
          ordinary.closest('.v-field--single-line'),
          'omission preserves native single-line configuration',
        )
        assert.ok(
          input('data-native-show').closest('.v-field--single-line'),
          'show preserves configured native label behavior',
        )
        const floating = input('data-native-floating')
        assert.equal(
          floating.closest('.v-field--single-line'),
          null,
          'explicit floating overrides native single-line configuration',
        )
        assert.ok(
          floating
            .closest('.v-field')
            .querySelector('.v-field-label--floating'),
        )
      } finally {
        example.dispose()
      }
    },
  )
})
