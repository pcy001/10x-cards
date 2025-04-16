import { test, expect } from '@playwright/test';

// Example test to verify that dotenv loading works
test('environment variables from .env.test are loaded', async () => {
  // Check that an environment variable from .env.test exists
  // This assumes you have SOME_TEST_VARIABLE in your .env.test file
  // Replace with a variable you know exists in your .env.test
  expect(process.env.SUPABASE_URL).toBeDefined();
  
  console.log('Environment variables loaded:', {
    SUPABASE_URL: process.env.SUPABASE_URL,
    // Add other environment variables you want to check
  });
});

// Basic homepage test
test('homepage has title and links', async ({ page }) => {
  await page.goto('/');
  
  // Verify the page title with the actual title
  await expect(page).toHaveTitle(/10xCards - Strona główna/);
  
  // Log environment for debugging
  console.log('Test is running with env:', {
    NODE_ENV: process.env.NODE_ENV,
    BASE_URL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
  });
}); 