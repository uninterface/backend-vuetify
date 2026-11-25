import { existsSync } from 'node:fs'
import { defineConfig } from '@playwright/test'

const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ??
  (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined)

export default defineConfig({
  testDir: '.',
  outputDir: '../var/playwright',
  workers: 2,
  timeout: 60_000,
  use: { launchOptions: { executablePath } },
})
