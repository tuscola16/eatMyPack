import { test, expect, navigateToSetupWizard, navigateToSetupWitch, completeRaceSetup, savePlanWithName, autoAcceptDialogs } from '../fixtures/app.fixture';

test.describe('Home Screen', () => {
  test('renders Wizard and Witch mode buttons', async ({ appPage: page }) => {
    await expect(page.getByText('Wizard', { exact: true })).toBeVisible();
    await expect(page.getByText('Help me do it')).toBeVisible();
    await expect(page.getByText('Witch', { exact: true })).toBeVisible();
    await expect(page.getByText("I know what I'm doing")).toBeVisible();
    await expect(page).toHaveScreenshot('home-mode-buttons.png');
  });

  test('shows Plans section with empty state', async ({ appPage: page }) => {
    await expect(page.getByText('Plans', { exact: true })).toBeVisible();
    await expect(page.getByText('No plans yet')).toBeVisible();
  });

  test('shows Pantry section with empty state', async ({ appPage: page }) => {
    await expect(page.getByText('Pantry', { exact: true })).toBeVisible();
    await expect(page.getByText('No pantry items yet')).toBeVisible();
  });

  test('Wizard button navigates to race setup', async ({ appPage: page }) => {
    await navigateToSetupWizard(page);
    await expect(page.getByText('Choose Your Distance')).toBeVisible();
    await expect(page.getByText('Plan Your Race')).toBeVisible();
  });

  test('Witch button navigates to manual setup', async ({ appPage: page }) => {
    await navigateToSetupWitch(page);
    await expect(page.getByText('Choose Your Distance')).toBeVisible();
    await expect(page.getByText('Manual Setup')).toBeVisible();
  });

  test('saved plan appears in Plans section', async ({ appPage: page }) => {
    autoAcceptDialogs(page);

    // Create and save a plan
    await navigateToSetupWizard(page);
    await completeRaceSetup(page, { distance: '50K', conditions: 'Moderate' });
    await savePlanWithName(page, 'Seven Sisters');

    // Navigate back home
    const homeTab = page.getByRole('tab', { name: 'Home' }).or(page.getByText('Home', { exact: true })).first();
    await homeTab.click();
    await page.waitForTimeout(1000);

    // Plan should appear in the Plans list
    await expect(page.getByText('Seven Sisters')).toBeVisible();
    await expect(page).toHaveScreenshot('home-with-plan.png');
  });

  test('full home screen visual', async ({ appPage: page }) => {
    await expect(page).toHaveScreenshot('home-full.png', { fullPage: true });
  });
});
