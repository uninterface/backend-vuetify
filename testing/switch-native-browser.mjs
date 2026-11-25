import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from '@playwright/test'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { build } from './fixture-build.mjs'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/switch-native-browser.ts', import.meta.url),
)
const reportRoot =
  process.env.UNINTERFACE_SWITCH_REPORT_ROOT ?? 'var/switch-state'
const directory = join(reportRoot, 'vuetify', 'native-options')
mkdirSync(directory, { recursive: true })

const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? '/usr/bin/chromium',
})
const records = []
try {
  const page = await browser.newPage({ viewport: { width: 760, height: 700 } })
  const errors = []
  page.on('pageerror', (error) => errors.push(String(error)))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const mode of ['light', 'dark']) {
    await openFixture(page, { mode })
    const variants = page.locator('[data-variant]')
    await variants.nth(4).waitFor()
    for (const variant of await variants.all()) {
      const states = await variant.locator('.v-switch').evaluateAll((nodes) => {
        const paint = (element) => {
          const style = getComputedStyle(element)
          const bounds = element.getBoundingClientRect()
          return {
            background: style.backgroundColor,
            color: style.color,
            opacity: style.opacity,
            transform: style.transform,
            width: bounds.width,
            height: bounds.height,
            x: bounds.x,
          }
        }
        return nodes.map((node) => ({
          checked: node.querySelector('input').checked,
          track: paint(node.querySelector('.v-switch__track')),
          thumb: paint(node.querySelector('.v-switch__thumb')),
        }))
      })
      assert.deepEqual(
        states.map(({ checked }) => checked),
        [false, true],
      )
      const [off, on] = states
      records.push({
        mode,
        name: await variant.getAttribute('data-variant'),
        off,
        on,
      })
    }
    await page.locator('main').screenshot({
      path: join(directory, `native-options-${mode}.png`),
    })
  }
  assert.deepEqual(errors, [])
  assert.equal(records.length, 10)
  writeFileSync(
    join(directory, 'results.json'),
    JSON.stringify({ browser: browser.version(), records }, null, 2) + '\n',
  )
  console.log('Vuetify native switch comparison recorded 10 on/off pairs.')
} finally {
  await browser.close()
}
