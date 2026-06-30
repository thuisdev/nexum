import { expect, test } from '@playwright/test';

const PASSWORD = '12345678';
const PRIVATE_PROJECT_ID = '00000000-0000-4000-8000-000000000002';
const PROJECT_URL = `/projects/${PRIVATE_PROJECT_ID}`;

const SUBMIT_NOTE =
  'Delivered the milestone scope with documentation, tests, and a handoff walkthrough for the client team.';

async function loginAs(
  page: import('@playwright/test').Page,
  email: string,
) {
  await page.goto('/login');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.waitForURL(/\/dashboard\//, { timeout: 15_000 });
}

test.describe('Private project lifecycle', () => {
  test('invite accept, fund, submit, approve through completion', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await loginAs(page, 'freelancer@example.com');
    await expect(page).toHaveURL(/\/dashboard\/freelancer/);

    await page.goto(PROJECT_URL);
    await page.getByRole('button', { name: 'Accept invite' }).click();
    await expect(page.getByRole('button', { name: 'Accept invite' })).toHaveCount(0);

    await loginAs(page, 'client@example.com');
    await expect(page).toHaveURL(/\/dashboard\/client/);

    await page.goto(PROJECT_URL);
    const fundButton = page.getByRole('button', { name: 'Fund project' });
    await expect(fundButton).toBeVisible();
    await fundButton.click();
    await expect(fundButton).toHaveCount(0);
    await expect(page.getByText('IN PROGRESS').first()).toBeVisible();

    for (let milestone = 0; milestone < 2; milestone += 1) {
      await loginAs(page, 'freelancer@example.com');
      await page.goto(PROJECT_URL);
      await page.getByRole('button', { name: 'Submit work' }).first().click();
      await page
        .getByPlaceholder(
          'Describe what you delivered, include links, or paste your handoff notes…',
        )
        .fill(`${SUBMIT_NOTE} Milestone ${milestone + 1}.`);
      await page
        .getByRole('button', { name: 'Submit', exact: true })
        .click();
      await expect(page.getByRole('button', { name: 'Submit work' })).toHaveCount(
        0,
      );

      await loginAs(page, 'client@example.com');
      await page.goto(PROJECT_URL);
      await page.getByRole('button', { name: 'Approve' }).first().click();
      await page.getByRole('button', { name: 'Approve & release' }).click();
    }

    await expect(page.getByText('COMPLETED')).toBeVisible();

    await loginAs(page, 'freelancer@example.com');
    await page.goto('/settings');
    await page.getByRole('link', { name: 'View public profile →' }).click();
    await expect(page.getByText('Recent work')).toBeVisible();
    await expect(page.getByText('Private API Integration')).toBeVisible();
    await expect(page.getByText('Completed projects')).toBeVisible();
  });
});
