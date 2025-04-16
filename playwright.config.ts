import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Załaduj zmienne środowiskowe z pliku .env.test
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

// Zaloguj załadowane zmienne środowiskowe do celów debugowania
console.log('Loaded env variables from .env.test:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'present' : 'missing');
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'present' : 'missing');
console.log('E2E_USERNAME:', process.env.E2E_USERNAME);
console.log('E2E_PASSWORD:', process.env.E2E_PASSWORD ? '********' : 'missing');

/**
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './src/e2e',
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     */
    timeout: 5000
  },
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Take screenshot on test failure */
    screenshot: 'only-on-failure',
    /* Hide browser during tests */
    headless: true,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chrome',
      use: { 
        channel: 'chrome', // Use installed Chrome
        ...devices['Desktop Chrome']
      },
    },
    // Uncomment to enable more browsers for your tests
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'NODE_ENV=test astro dev --env-file=.env.test',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    env: {
      // Ustawienie wszystkich zmiennych z .env.test explicite
      SUPABASE_URL: process.env.SUPABASE_URL || '',
      SUPABASE_KEY: process.env.SUPABASE_KEY || '',
      PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL || '',
      PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_KEY || '',
      E2E_USERNAME: process.env.E2E_USERNAME || '',
      E2E_PASSWORD: process.env.E2E_PASSWORD || '',
      
      // Wymuś tryb testowy dla Astro
      NODE_ENV: 'test'
    }
  },
}); 