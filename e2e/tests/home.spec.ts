import { test, expect, navigateToSetupWizard, navigateToSetupWitch, completeRaceSetup, autoAcceptDialogs } from '../fixtures/app.fixture';

test.describe('Home Screen', () => {
  test('renders hero section with mode buttons', async ({ appPage: page }) => {
    await expect(page.getByText('Add an adventure').first()).toBeVisible();
    await expect(page.getByText('My Plans')).toBeVisible();
    await expect(page).toHaveScreenshot('home-mode-buttons.png');
  });

  test('shows Plans section with empty state', async ({ appPage: page }) => {
    await expect(page.getByText('My Plans')).toBeVisible();
    await expect(page.getByText('No plans yet')).toBeVisible();
  });

  test('shows Pantry section with empty state', async ({ appPage: page }) => {
    await expect(page.getByText('My pantry')).toBeVisible();
    await expect(page.getByText('Pantry is empty')).toBeVisible();
  });

  test('Add an adventure button navigates to race setup', async ({ appPage: page }) => {
    await expect(page.getByText('Add an adventure').first()).toBeVisible();
    await navigateToSetupWizard(page);
    await expect(page.getByText('Choose Your Distance')).toBeVisible();
  });

  test('navigates to complex setup mode', async ({ appPage: page }) => {
    await navigateToSetupWitch(page);
    await expect(page.getByText('Custom Distance')).toBeVisible();
    await expect(page.getByText('Complex', { exact: true })).toBeVisible();
  });

  test('saved plan appears in Plans section', async ({ appPage: page }) => {
    autoAcceptDialogs(page);

    // Create and save a plan with a custom name
    await navigateToSetupWizard(page);
    await completeRaceSetup(page, { distance: '50K', conditions: 'Moderate', planName: 'Seven Sisters' });

    // Navigate back home
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Plan should appear in the Plans list
    await expect(page.getByText('Seven Sisters')).toBeVisible();
    await expect(page).toHaveScreenshot('home-with-plan.png');
  });

  test('full home screen visual', async ({ appPage: page }) => {
    await expect(page).toHaveScreenshot('home-full.png', { fullPage: true });
  });
});
