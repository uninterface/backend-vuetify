import { test } from 'node:test'
import assert from 'node:assert/strict'
import { withBuiltDomFixture } from '@uninterface/testing/jsdom'
import { build } from './fixture-build.mjs'

test('vuetify: native pagination is used for bounded numbered sources', async () => {
  await withBuiltDomFixture(
    build,
    new URL('./fixtures/paginator-presentation.ts', import.meta.url),
    async ({ mountNumberedPaginator }) => {
      const fixture = await mountNumberedPaginator()
      try {
        const nav = fixture.host.querySelector('nav[aria-label="Pages"]')
        assert.ok(nav)
        assert.ok(nav.querySelector('.v-pagination .v-pagination__list'))
        assert.ok(
          nav.querySelectorAll('.v-pagination__item').length <= 7,
          'native bounded page window includes ellipses without expanding to the viewport width',
        )
        assert.equal(
          nav.querySelector('input[type="number"]'),
          null,
          'native page buttons replace the custom page input',
        )
        assert.deepEqual(Array.from(fixture.errors), [])
      } finally {
        fixture.dispose()
      }
    },
  )
})
