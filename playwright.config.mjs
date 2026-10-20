import { defineConfig } from 'playwright/test';
export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://127.0.0.1:4173', launchOptions: process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {} },
  webServer: { command: 'node scripts/serve.mjs --dist', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI },
});
