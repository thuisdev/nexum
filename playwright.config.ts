import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';
import { defineConfig, devices } from '@playwright/test';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.join(rootDir, 'backend', '.env') });

const databaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://nexum:change_me@localhost:5433/nexum_dev?schema=public';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  globalSetup: './e2e/global-setup.ts',
  webServer: [
    {
      command: 'npm run dev --prefix backend',
      url: 'http://localhost:4000/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        JWT_SECRET: process.env.JWT_SECRET ?? 'test-jwt-secret-for-e2e',
        DATABASE_URL: databaseUrl,
        CORS_ORIGIN: 'http://localhost:5173',
        NODE_ENV: 'test',
      },
    },
    {
      command: 'npm run dev --prefix frontend',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        VITE_API_URL: 'http://localhost:4000/api',
      },
    },
  ],
});
