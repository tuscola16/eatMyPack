import { test, expect, navigateToTab } from '../fixtures/app.fixture';

test.describe('Settings Screen', () => {
  test.beforeEach(async ({ appPage: page }) => {
    await navigateToTab(page, 'Settings');
    await page.waitForTimeout(1000);
  });

  test('shows guest account state', async ({ appPage: page }) => {
    await expect(page.getByText('Account', { exact: true })).toBeVisible();
    await expect(page.getByText('Sign in to sync your plans across devices')).toBeVisible();
    await expect(page.getByText('Sign In', { exact: true })).toBeVisible();
    await expect(page).toHaveScreenshot('settings-guest.png');
  });

  test('shows category preferences section', async ({ appPage: page }) => {
    await expect(page.getByText('Never use')).toBeVisible();
    await expect(page.getByText('Prefer', { exact: true })).toBeVisible();
  });

  test('shows about section', async ({ appPage: page }) => {
    await expect(page.getByText('About', { exact: true })).toBeVisible();
    await expect(page.getByText('eatMyPack', { exact: true })).toBeVisible();
    await expect(
      page.getByText('Plan your race nutrition down to each phase', { exact: false })
    ).toBeVisible();
  });

  test('shows data management section', async ({ appPage: page }) => {
    await expect(page.getByText('Clear All Saved Plans')).toBeVisible();
    await expect(page).toHaveScreenshot('settings-data.png');
  });

  test('shows version info', async ({ appPage: page }) => {
    await expect(page.getByText('Version 1.0.0', { exact: false })).toBeVisible();
  });

  test('shows footer', async ({ appPage: page }) => {
    await expect(page.getByText('Made for ultra trail runners')).toBeVisible();
    await expect(page).toHaveScreenshot('settings-full.png', { fullPage: true });
  });
});
