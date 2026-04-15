import { test, expect, navigateToTab, navigateToSetupWizard, navigateToSetupWitch } from '../fixtures/app.fixture';

test.describe('Race Setup Wizard', () => {
  test.beforeEach(async ({ appPage: page }) => {
    await navigateToSetupWizard(page);
  });

  test('step 1: shows distance selection cards', async ({ appPage: page }) => {
    await expect(page.getByText('Choose Your Distance')).toBeVisible();
    await expect(page.getByText('What are you racing?')).toBeVisible();

    for (const label of ['50K', '50 mi', '100K', '100 mi', '200 mi', 'Custom']) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
    await expect(page).toHaveScreenshot('setup-step1-distances.png');
  });

  test('step 2: shows duration after selecting distance', async ({ appPage: page }) => {
    await page.getByText('50K', { exact: true }).click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Expected Duration')).toBeVisible();
    await expect(page.getByText('Next', { exact: true })).toBeVisible();
    await expect(page).toHaveScreenshot('setup-step2-duration.png');
  });

  test('step 2: custom distance shows km input', async ({ appPage: page }) => {
    await page.getByText('Custom', { exact: true }).click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Distance (km)')).toBeVisible();
    await expect(page.getByPlaceholder('e.g. 160')).toBeVisible();
    await expect(page).toHaveScreenshot('setup-step2-custom.png');
  });

  test('step 3: shows condition buttons', async ({ appPage: page }) => {
    await page.getByText('100K', { exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByText('Next', { exact: true }).click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Race Conditions')).toBeVisible();
    await expect(page.getByText('Hot', { exact: true })).toBeVisible();
    await expect(page.getByText('Moderate', { exact: true })).toBeVisible();
    await expect(page.getByText('Cool', { exact: true })).toBeVisible();
    await expect(page).toHaveScreenshot('setup-step3-conditions.png');
  });

  test('step 3: Build My Pack disabled until condition selected', async ({ appPage: page }) => {
    await page.getByText('50K', { exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByText('Next', { exact: true }).click();
    await page.waitForTimeout(500);

    const buildButton = page.getByText('Build My Pack', { exact: true });
    await expect(buildButton).toBeVisible();
    await expect(page).toHaveScreenshot('setup-step3-disabled.png');

    await page.getByText('Moderate', { exact: true }).click();
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot('setup-step3-enabled.png');
  });

  test('step 3: pantry toggle hidden when pantry is empty', async ({ appPage: page }) => {
    await page.getByText('50K', { exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByText('Next', { exact: true }).click();
    await page.waitForTimeout(500);

    // Pantry toggle should NOT be visible when pantry is empty
    await expect(page.getByText('Build from My Pantry')).not.toBeVisible();
  });

  test('step 3: pantry toggle visible when pantry has items', async ({ appPage: page }) => {
    // First, add items to pantry via Settings
    await navigateToTab(page, 'Settings');
    await page.waitForTimeout(1000);
    await page.getByText('No items in your pantry yet').click();
    await page.waitForTimeout(1000);

    // Add a food to pantry
    const pantryToggle = page.getByLabel('Add to pantry').first();
    if (await pantryToggle.isVisible().catch(() => false)) {
      await pantryToggle.click();
      await page.waitForTimeout(300);
    }

    // Navigate to race setup via home Wizard button
    await navigateToTab(page, 'Home');
    await page.waitForTimeout(500);
    await navigateToSetupWizard(page);

    await page.getByText('50K', { exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByText('Next', { exact: true }).click();
    await page.waitForTimeout(500);

    // Pantry toggle should be visible
    await expect(page.getByText('Build from My Pantry')).toBeVisible();
    await expect(page.getByText('1 item', { exact: true }).first()).toBeVisible();
    await expect(page).toHaveScreenshot('setup-step3-pantry-toggle.png');
  });
});

test.describe('Race Setup Witch Mode', () => {
  test('shows calories per hour input in step 2', async ({ appPage: page }) => {
    await navigateToSetupWitch(page);

    // Step 1: Select distance
    await page.getByText('50K', { exact: true }).click();
    await page.waitForTimeout(500);

    // Step 2: Should show target calories per hour input
    await expect(page.getByText('Target calories per hour')).toBeVisible();
    await expect(page.getByPlaceholder('e.g. 250')).toBeVisible();
    await expect(page).toHaveScreenshot('setup-witch-step2-cal-input.png');
  });

  test('header shows Manual Setup for witch mode', async ({ appPage: page }) => {
    await navigateToSetupWitch(page);
    await expect(page.getByText('Manual Setup')).toBeVisible();
  });
});
