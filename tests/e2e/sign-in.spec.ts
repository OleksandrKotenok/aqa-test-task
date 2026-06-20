import { test, expect } from '@playwright/test';
import { openApp, signIn, collectPageErrors, validCredentials } from '../helpers';

test.describe('Sign In', () => {
  // Collected console/network errors for the "logging errors" bonus.
  let pageErrors: string[];

  test.beforeEach(async ({ page }) => {
    pageErrors = collectPageErrors(page);
    await openApp(page);
  });

  test.afterEach(async ({}, testInfo) => {
    // Attach any console/network errors to the report so they are easy to review.
    if (pageErrors.length > 0) {
      await testInfo.attach('page-errors', {
        body: pageErrors.join('\n'),
        contentType: 'text/plain',
      });
    }
  });

  // --- Positive scenarios ---

  test('applicant can sign in with valid credentials and see the dashboard', async ({ page }) => {
    await signIn(page);

    await expect(page.getByRole('heading', { name: 'Applicant dashboard' })).toBeVisible();
    await expect(page.getByTestId('sidebar-projects')).toBeVisible();
  });

  test('applicant can log out and return to the sign-in page', async ({ page }) => {
    await signIn(page);

    await page.getByTestId('logout-button').click();

    await expect(page.getByRole('heading', { name: 'CivicFlow Demo' })).toBeVisible();
    await expect(page.getByTestId('login-email')).toBeVisible();
  });

  // --- Negative scenarios and field validation ---

  test('empty email shows "Email is required."', async ({ page }) => {
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('login-error')).toHaveText('Email is required.');
  });

  test('invalid email format shows "Enter a valid email address."', async ({ page }) => {
    await page.getByTestId('login-email').fill('not-an-email');
    await page.getByTestId('login-password').fill(validCredentials.password);
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('login-error')).toHaveText('Enter a valid email address.');
  });

  test('empty password shows "Password is required."', async ({ page }) => {
    await page.getByTestId('login-email').fill(validCredentials.email);
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('login-error')).toHaveText('Password is required.');
  });

  test('wrong credentials show "Invalid email or password."', async ({ page }) => {
    await page.getByTestId('login-email').fill(validCredentials.email);
    await page.getByTestId('login-password').fill('WrongPassword1!');
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('login-error')).toHaveText('Invalid email or password.');
  });
});
