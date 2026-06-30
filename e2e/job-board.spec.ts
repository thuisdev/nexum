import { expect, test } from '@playwright/test';

test.describe('Job board', () => {
  test('lists seeded public projects', async ({ page }) => {
    await page.goto('/jobs');

    await expect(page.getByRole('heading', { name: 'Find work' })).toBeVisible();
    await expect(page.getByText('Public DeFi Dashboard')).toBeVisible();
  });

  test('guest can open a public project and sign up to apply', async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/jobs');
    await page.getByText('Public DeFi Dashboard').click();

    await expect(page).toHaveURL(/\/projects\//);
    await expect(
      page.getByRole('button', { name: 'Sign up to apply' }),
    ).toBeVisible();

    await context.close();
  });
});
