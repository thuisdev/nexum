import { expect, test } from '@playwright/test';

test.describe('Public project apply flow', () => {
  test('freelancer with a pending application sees the pending state', async ({
    page,
  }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('freelancer2@example.com');
    await page.getByLabel('Password').fill('12345678');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page).toHaveURL(/\/dashboard\/freelancer/);

    await page.goto('/projects/00000000-0000-4000-8000-000000000001');

    await expect(
      page.getByRole('button', { name: 'Withdraw application' }),
    ).toBeVisible();
  });

  test('freelancer can submit a new application', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('freelancer@example.com');
    await page.getByLabel('Password').fill('12345678');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page).toHaveURL(/\/dashboard\/freelancer/);

    await page.goto('/projects/00000000-0000-4000-8000-000000000001');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const applyButton = page.getByRole('button', { name: 'Apply to project' });
    await expect(applyButton).toBeVisible();
    await applyButton.click();

    await page
      .getByPlaceholder("Tell them why you're a fit…")
      .fill('I have shipped similar dashboards and can start immediately.');
    await page.getByRole('button', { name: 'Send application' }).click();

    await expect(
      page.getByRole('button', { name: 'Withdraw application' }),
    ).toBeVisible();
  });
});
