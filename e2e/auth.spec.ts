import { expect, test } from '@playwright/test';

test.describe('Authentication', () => {
  test('client can log in and reach the dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('client@example.com');
    await page.getByLabel('Password').fill('12345678');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL(/\/dashboard\/client/);
    await expect(page.getByRole('heading', { name: 'Your projects' })).toBeVisible();
  });

  test('freelancer can log in and reach the dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('freelancer@example.com');
    await page.getByLabel('Password').fill('12345678');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL(/\/dashboard\/freelancer/);
    await expect(page.getByRole('heading', { name: 'Your work' })).toBeVisible();
  });
});
