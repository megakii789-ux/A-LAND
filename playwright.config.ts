import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'off',
  },
  projects: [
    {
      name: 'Mobile-360',
      use: {
        viewport: { width: 360, height: 800 },
      },
    },
    {
      name: 'Mobile-390',
      use: {
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'Mobile-430',
      use: {
        viewport: { width: 430, height: 932 },
      },
    },
    {
      name: 'Tablet-768',
      use: {
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'Tablet-1024',
      use: {
        viewport: { width: 1024, height: 1366 },
      },
    },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 30000,
  },
});
