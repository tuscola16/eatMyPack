import { test, expect, autoAcceptDialogs, navigateToSetupWizard, completeRaceSetup, savePlanWithName } from '../fixtures/app.fixture';

test.describe('Pack Plan View', () => {
  test('shows plan after completing setup wizard', async ({ appPage: page }) => {
    await navigateToSetupWizard(page);
    await completeRaceSetup(page, { distance: '50K', conditions: 'Moderate' });

    await expect(page.getByText('Total Cal').or(page.getByText('total cal'))).toBeVisible();
    await expect(page).toHaveScreenshot('plan-summary.png');
  });

  test('shows phase sections with food items', async ({ appPage: page }) => {
    await navigateToSetupWizard(page);
    await completeRaceSetup(page);

    const phaseTexts = ['Early', 'Mid', 'Final'];
    let found = 0;
    for (const text of phaseTexts) {
      const el = page.getByText(text, { exact: false }).first();
      if (await el.isVisible().catch(() => false)) found++;
    }
    expect(found).toBeGreaterThan(0);
    await expect(page).toHaveScreenshot('plan-phases.png', { fullPage: true });
  });

  test('shows Start Over and Save Plan buttons', async ({ appPage: page }) => {
    await navigateToSetupWizard(page);
    await completeRaceSetup(page);

    await expect(page.getByText('Start Over', { exact: true })).toBeVisible();
    await expect(page.getByText('Save Plan', { exact: true })).toBeVisible();
    await expect(page).toHaveScreenshot('plan-action-buttons.png');
  });

  test('Save Plan shows naming modal', async ({ appPage: page }) => {
    autoAcceptDialogs(page);

    await navigateToSetupWizard(page);
    await completeRaceSetup(page);

    await page.getByText('Save Plan', { exact: true }).click();
    await page.waitForTimeout(500);

    // Naming modal should be visible
    await expect(page.getByText('Name Your Plan')).toBeVisible();
    await expect(page.getByPlaceholder('e.g. Western States 100')).toBeVisible();
    await expect(page.getByText('Skip', { exact: true })).toBeVisible();
    await expect(page).toHaveScreenshot('plan-naming-modal.png');
  });

  test('Save Plan with custom name', async ({ appPage: page }) => {
    autoAcceptDialogs(page);

    await navigateToSetupWizard(page);
    await completeRaceSetup(page);
    await savePlanWithName(page, 'My Test Race');

    // After save, alert should have fired (auto-accepted)
    // Plan should still be visible
    await expect(page.getByText('Total Cal').or(page.getByText('total cal'))).toBeVisible();
  });

  test('Save Plan with skip (auto-generated name)', async ({ appPage: page }) => {
    autoAcceptDialogs(page);

    await navigateToSetupWizard(page);
    await completeRaceSetup(page);
    await savePlanWithName(page); // no name = skip
  });

  test('empty plan state', async ({ appPage: page }) => {
    await page.goto('/race/plan');
    await page.waitForTimeout(2000);

    await expect(page.getByText('No plan yet')).toBeVisible();
    await expect(page).toHaveScreenshot('plan-empty.png');
  });
});
