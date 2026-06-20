import { test, expect } from '@playwright/test';
import { openApp, signIn, collectPageErrors, seededProjectNames } from '../helpers';

test.describe('Projects', () => {
  let pageErrors: string[];

  test.beforeEach(async ({ page }) => {
    pageErrors = collectPageErrors(page);
    await openApp(page);
    await signIn(page);
    // Go to the Projects page using the left-side menu.
    await page.getByTestId('sidebar-projects').click();
  });

  test.afterEach(async ({}, testInfo) => {
    if (pageErrors.length > 0) {
      await testInfo.attach('page-errors', {
        body: pageErrors.join('\n'),
        contentType: 'text/plain',
      });
    }
  });

  // --- Navigation and seeded data ---

  test('Projects page is visible after navigation', async ({ page }) => {
    await expect(page.getByTestId('projects-page')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'My Project Templates' })).toBeVisible();
  });

  test('seeded project cards are shown', async ({ page }) => {
    await expect(page.getByTestId('project-card')).toHaveCount(3);

    for (const name of seededProjectNames) {
      await expect(page.getByRole('heading', { name })).toBeVisible();
    }
  });

  // --- Custom project creation: validation errors ---

  test('missing project name shows a validation error', async ({ page }) => {
    await page.getByTestId('create-project-button').click();
    await page.getByTestId('project-submit').click();

    await expect(page.getByTestId('project-form-error')).toHaveText('Project name is required.');
  });

  test('missing jurisdiction shows a validation error', async ({ page }) => {
    await page.getByTestId('create-project-button').click();
    await page.getByTestId('project-name').fill('Backyard Studio');
    await page.getByTestId('project-submit').click();

    await expect(page.getByTestId('project-form-error')).toHaveText('Jurisdiction is required.');
  });

  test('missing address line shows a validation error', async ({ page }) => {
    await page.getByTestId('create-project-button').click();
    await page.getByTestId('project-name').fill('Backyard Studio');
    await page.getByTestId('project-jurisdiction').selectOption('Sample City');
    await page.getByTestId('project-submit').click();

    await expect(page.getByTestId('project-form-error')).toHaveText('Address line is required.');
  });

  test('duplicate project name shows a validation error', async ({ page }) => {
    await page.getByTestId('create-project-button').click();
    await page.getByTestId('project-name').fill('Garage Addition'); // already seeded
    await page.getByTestId('project-jurisdiction').selectOption('Sample City');
    await page.getByTestId('project-address').fill('100 Example Ave');
    await page.getByTestId('project-submit').click();

    await expect(page.getByTestId('project-form-error')).toHaveText('Project name already exists.');
  });

  // --- Custom project creation: successful flow ---

  test('create a custom project with required and optional fields', async ({ page }) => {
    const projectName = 'Backyard Studio';
    const jurisdiction = 'Example County';
    const address = '42 Sample Street';
    const unit = 'Unit 9';
    const description = 'Small backyard studio conversion.';

    // The created date the app stores, e.g. "Jun 20, 2026".
    const expectedDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    await page.getByTestId('create-project-button').click();

    // Required fields.
    await page.getByTestId('project-name').fill(projectName);
    await page.getByTestId('project-jurisdiction').selectOption(jurisdiction);
    await page.getByTestId('project-address').fill(address);
    // Optional fields.
    await page.getByTestId('project-unit').fill(unit);
    await page.getByTestId('project-description').fill(description);

    await page.getByTestId('project-submit').click();

    // We should be back on the Projects list.
    await expect(page.getByTestId('projects-page')).toBeVisible();
    await expect(page.getByTestId('project-card')).toHaveCount(4);

    // The new card should show all the saved details.
    const newCard = page.getByTestId('project-card').filter({ hasText: projectName });
    await expect(newCard).toBeVisible();
    await expect(newCard.getByRole('heading', { name: projectName })).toBeVisible();
    await expect(newCard).toContainText(jurisdiction);
    await expect(newCard).toContainText(`${address}, ${unit}`);
    await expect(newCard).toContainText(description);
    await expect(newCard).toContainText('Draft'); // new projects start as Draft
    await expect(newCard).toContainText('0%'); // progress starts at 0
    await expect(newCard).toContainText(`Created ${expectedDate}`);
  });
});
