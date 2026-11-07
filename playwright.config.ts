import { defineConfig } from '@playwright/test';

if (!process.env.TEST_DATABASE_URL || process.env.RELAYOS_DISPOSABLE_TEST_DB !== 'yes') {
  throw new Error('Browser tests require TEST_DATABASE_URL and RELAYOS_DISPOSABLE_TEST_DB=yes pointing to a disposable migrated PostgreSQL database.');
}
const apiPort = 3301;
const webPort = 3300;
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:${webPort}`,
    browserName: 'chromium',
    headless: true,
    launchOptions: {
      ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}),
      args: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? ['--no-sandbox', '--disable-dev-shm-usage'] : [],
    },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {command: 'npm run dev:api', port: apiPort, reuseExistingServer: false, timeout: 60_000, env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL, API_PORT: String(apiPort) }},
    {command: `npx next dev apps/web -H 0.0.0.0 -p ${webPort}`, url: `http://127.0.0.1:${webPort}`, reuseExistingServer: false, timeout: 60_000, env: { ...process.env, RELAYOS_API_ORIGIN: `http://127.0.0.1:${apiPort}`, NEXT_TELEMETRY_DISABLED: '1' }},
  ],
});
