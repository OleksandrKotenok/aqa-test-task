import { defineConfig, devices } from '@playwright/test';

// Playwright configuration for the CivicFlow demo test task.
// UI tests run against the production build served by `vite preview`
// on http://127.0.0.1:4173 (this is what CI uses too).
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  // HTML report is published as an artifact / on GitHub Pages.
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  // Build the app and serve the production bundle before the tests start.
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  projects: [
    // --- Desktop browsers (cross-browser coverage) ---
    {
      name: 'chromium-desktop',
      testMatch: /e2e\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox-desktop',
      testMatch: /e2e\/.*\.spec\.ts/,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit-desktop',
      testMatch: /e2e\/.*\.spec\.ts/,
      use: { ...devices['Desktop Safari'] },
    },

    // --- Mobile devices (required by the task) ---
    {
      name: 'iphone-14',
      testMatch: /e2e\/.*\.spec\.ts/,
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'pixel-7',
      testMatch: /e2e\/.*\.spec\.ts/,
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'galaxy-s9-plus',
      testMatch: /e2e\/.*\.spec\.ts/,
      use: { ...devices['Galaxy S9+'] },
    },

    // --- API tests (no browser needed) ---
    {
      name: 'api',
      testMatch: /api\/.*\.spec\.ts/,
    },
  ],
});
