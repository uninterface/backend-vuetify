import { test } from 'node:test'
import assert from 'node:assert/strict'
import { withBuiltDomFixture } from '@uninterface/testing/jsdom'
import { build } from './fixture-build.mjs'

const entry = new URL('./fixtures/presentation.ts', import.meta.url)

test('collapsible uses native presentation and indicator', async () => {
  await withBuiltDomFixture(build, entry, async (fixture) => {
    const example = await fixture.mountExpandedCollapsible()
    try {
      const root = example.host.querySelector('[data-fixture="collapsible"]')
      assert.ok(root)
      assert.ok(root.classList.contains('v-expansion-panels'))
      assert.ok(root.querySelector('.v-expansion-panel--active'))
      assert.ok(root.querySelector('.v-expansion-panel-title__icon .v-icon'))
      assert.ok(root.querySelector('.v-expansion-panel-text__wrapper'))
      const title = root.querySelector('.v-expansion-panel-title')
      const panel = root.querySelector('.v-expansion-panel')
      for (const color of [
        'primary',
        'success',
        'danger',
        'warning',
        'info',
        'secondary',
      ]) {
        await example.update({ color })
        const nativeColor = color === 'danger' ? 'error' : color
        assert.ok(title.classList.contains(`bg-${nativeColor}`))
        assert.equal(
          panel.classList.contains(`bg-${nativeColor}`),
          false,
          'body surface is independent',
        )
      }
      await example.update({ expanded: false })
      assert.ok(
        title.classList.contains('bg-secondary'),
        'native title color persists while collapsed',
      )
      await example.update({ color: undefined })
      assert.equal(
        [...title.classList].some((value) => value.startsWith('bg-')),
        false,
      )
      assert.deepEqual(Array.from(example.errors), [])
    } finally {
      example.dispose()
    }
  })
})
