import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration (TypeScript).
 *  - Starts the tiny static server so tests run against http://localhost:4173
 *  - "chromium"      → desktop, runs ALL specs (PDF export needs Chromium's page.pdf())
 *  - "mobile-chrome" → phone viewport, runs only the language-switch spec
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry'
  },

  // tsx runs the TypeScript server directly (no separate build step)
  webServer: {
    command: 'npx tsx tests/helpers/static-server.ts',
    url: 'http://localhost:4173/index.html',
    reuseExistingServer: !process.env.CI
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile-chrome',
      testMatch: /language-switch\.spec\.ts/,
      use: { ...devices['Pixel 7'] }
    }
  ]
});
