import assert from 'node:assert/strict'
import { setTimeout as delay } from 'node:timers/promises'
import { withBuiltDomFixture } from '@uninterface/testing/jsdom'

export function withStrategies(build, check) {
  return withBuiltDomFixture(
    build,
    new URL('./fixtures/strategies.ts', import.meta.url),
    async ({ mountStrategies }, window) => {
      const example = await mountStrategies()
      try {
        return await check(example, window)
      } finally {
        example.dispose()
      }
    },
  )
}

export async function settleUntil(tick, predicate, message) {
  const expires = performance.now() + 1500
  await tick()
  while (!predicate() && performance.now() < expires) {
    await delay(16)
    await tick()
  }
  assert.ok(predicate(), message)
}
