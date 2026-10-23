import { defineConfig, type PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = defineConfig({
  testDir: './packages/registry/tests/ui',
  testMatch: '**/*.browser.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 3 : 4,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4317',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: ['chromium', 'firefox', 'webkit'].map(browserName => ({
    name: browserName,
    use: { browserName: browserName as 'chromium' | 'firefox' | 'webkit' },
  })),
  webServer: {
    command: 'bun packages/registry/tests/ui/server.ts',
    url: 'http://127.0.0.1:4317/pricing',
    reuseExistingServer: false,
    timeout: 60_000,
    env: { NODE_ENV: 'test' },
  },
})

export default config
