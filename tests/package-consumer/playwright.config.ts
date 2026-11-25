import { defineConfig } from '@playwright/test'

const developmentUrl = 'http://127.0.0.1:4174'
const productionUrl = 'http://127.0.0.1:4173'

export default defineConfig({
  testMatch: 'consumer.spec.ts',
  use: {
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
    },
  },
  projects: [
    { name: 'development', use: { baseURL: developmentUrl } },
    { name: 'production', use: { baseURL: productionUrl } },
  ],
  webServer: [
    {
      command: 'vite --host 127.0.0.1 --port 4174 --strictPort --force',
      url: developmentUrl,
    },
    {
      command: 'vite preview --host 127.0.0.1 --port 4173 --strictPort',
      url: productionUrl,
    },
  ],
})
