import { test } from 'node:test'
import { verifyNativeLocale } from '@uninterface/testing/fixtures/locale-dom'
import { build } from './fixture-build.mjs'

test('native translations and locale aliases update in isolated applications', () =>
  verifyNativeLocale(
    build,
    new URL('./fixtures/native-locale.ts', import.meta.url),
    'zh-Hant',
  ))
