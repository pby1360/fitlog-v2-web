import process from 'node:process';
import { defineConfig } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4383';

export default defineConfig({
  testDir: './tests',
  outputDir: './node_modules/.tmp/playwright',
  use: {
    baseURL,
    browserName: 'chromium',
    timezoneId: 'UTC',
    serviceWorkers: 'block',
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE },
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4383 --strictPort',
    env: { VITE_API_BASE_URL: 'http://127.0.0.1:8080' },
    url: baseURL,
  },
});
