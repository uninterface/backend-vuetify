import { test } from 'node:test'
import assert from 'node:assert/strict'
import { withBuiltDomFixture } from '@uninterface/testing/jsdom'
import { build } from './fixture-build.mjs'

const entry = new URL('./fixtures/presentation.ts', import.meta.url)

test('vuetify: neutral button retains native treatment and semantic interaction color', async () => {
  await withBuiltDomFixture(build, entry, async (fixture) => {
    const example = await fixture.mountNeutralButton()
    try {
      const button = example.host.querySelector('button')
      assert.ok(button)
      for (const color of example.colors) {
        await example.update({ color })
        const native = color === 'danger' ? 'error' : color
        assert.ok(button.classList.contains('v-btn--variant-outlined'))
        assert.equal(button.classList.contains('text-' + native), false)
        assert.ok(button.querySelector('.v-btn__overlay'))
        assert.equal(
          button.style.getPropertyValue('--vuetify-button-neutral-color'),
          'rgb(var(--v-theme-' + native + '))',
        )
      }
      await example.update({ variant: 'filled' })
      assert.equal(
        button.style.getPropertyValue('--vuetify-button-neutral-color'),
        '',
      )
      assert.deepEqual(Array.from(example.errors), [])
    } finally {
      example.dispose()
    }
  })
})
