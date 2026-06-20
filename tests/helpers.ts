import type { Page } from '@playwright/test';

// Valid demo account from the task description.
export const validCredentials = {
  email: 'applicant@example.com',
  password: 'Password123!',
};

// Projects that the app seeds into localStorage on first load.
export const seededProjectNames = [
  'Garage Addition',
  'Retail Renovation',
  'Site Improvement',
];

// Open the app on a clean state (empty localStorage) so every test
// starts the same way.
export async function openApp(page: Page) {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/');
}

// Helper that signs in with the valid demo account and waits for
// the dashboard to appear.
export async function signIn(page: Page) {
  await page.getByTestId('login-email').fill(validCredentials.email);
  await page.getByTestId('login-password').fill(validCredentials.password);
  await page.getByTestId('login-submit').click();
  await page.getByTestId('sidebar-projects').waitFor();
}

// Collects console errors and failed network requests during a test
// (used for the "logging errors" bonus). Returns an array that fills
// up while the test runs.
export function collectPageErrors(page: Page) {
  const errors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(`Console error: ${message.text()}`);
    }
  });

  page.on('pageerror', (error) => {
    errors.push(`Page error: ${error.message}`);
  });

  page.on('requestfailed', (request) => {
    errors.push(
      `Network error: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`,
    );
  });

  return errors;
}
