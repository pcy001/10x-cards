import { defineConfig, devices } from "@playwright/test";
import * as path from "node:path";
import * as dotenv from "dotenv";
import * as fs from "node:fs";

// Załaduj zmienne środowiskowe z pliku .env.test
const envFile = path.resolve(process.cwd(), ".env.test");
dotenv.config({ path: envFile });

// Wyświetl informację o istnieniu pliku .env.test
console.log("Checking .env.test file:", fs.existsSync(envFile) ? "exists" : "missing");

// Zaloguj załadowane zmienne środowiskowe do celów debugowania
console.log("Loaded env variables from .env.test:");
console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? "present" : "missing");
console.log("SUPABASE_KEY:", process.env.SUPABASE_KEY ? "present" : "missing");
console.log("E2E_USERNAME:", process.env.E2E_USERNAME);
console.log("E2E_PASSWORD:", process.env.E2E_PASSWORD ? "********" : "missing");

/**
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./src/e2e",
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     */
    timeout: 5000,
  },
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:4321",
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    /* Take screenshot on test failure */
    screenshot: "only-on-failure",
    /* Hide browser during tests */
    headless: true,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chrome",
      use: {
        channel: "chrome", // Use installed Chrome
        ...devices["Desktop Chrome"],
      },
    },
    // Uncomment to enable more browsers for your tests
    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },
    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },
  ],

  // Usuwamy tę sekcję, ponieważ teraz uruchamiamy serwer ręcznie w skrypcie npm
  // webServer: {
  //   command: "NODE_ENV=test npm run dev:test",
  //   url: "http://localhost:3000",
  //   reuseExistingServer: !process.env.CI,
  // },
});
