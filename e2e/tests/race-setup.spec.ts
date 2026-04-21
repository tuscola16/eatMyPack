import { test, expect, navigateToTab, navigateToSetupWizard, navigateToSetupWitch, autoAcceptDialogs } from '../fixtures/app.fixture';

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
    await page.getByText('50K', { exact: true }).first().evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(500);

    await expect(page.getByText('Expected Duration')).toBeVisible();
    await expect(page).toHaveScreenshot('setup-step2-duration.png');
  });

  test('step 2: custom distance shows km input', async ({ appPage: page }) => {
    await page.getByText('Custom', { exact: true }).evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(500);

    await expect(page.getByText('Distance (mi)')).toBeVisible();
    await expect(page.getByPlaceholder('e.g. 100')).toBeVisible();
    await expect(page).toHaveScreenshot('setup-step2-custom.png');
  });

  test('step 1: shows condition buttons', async ({ appPage: page }) => {
    // Conditions are in step 1 alongside distance — always visible
    await expect(page.getByText('Race Conditions')).toBeVisible();
    await expect(page.getByText('Hot', { exact: true })).toBeVisible();
    await expect(page.getByText('Moderate', { exact: true })).toBeVisible();
    await expect(page.getByText('Cool', { exact: true })).toBeVisible();
    await expect(page).toHaveScreenshot('setup-step1-conditions.png');
  });

  test('Build My Pack disabled until distance and condition selected', async ({ appPage: page }) => {
    // Build My Pack is visible but disabled (opacity 0.4) until both are selected
    const buildButton = page.getByText('Build My Pack', { exact: true });
    await expect(buildButton).toBeVisible();
    await expect(page).toHaveScreenshot('setup-build-disabled.png');

    // Select distance to unlock duration step
    await page.getByText('50K', { exact: true }).first().evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(500);
    // Still disabled — no condition selected
    await expect(page).toHaveScreenshot('setup-build-dist-only.png');

    // Select conditions — now enabled
    await page.getByText('Moderate', { exact: true }).evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot('setup-build-enabled.png');
  });

  test('pantry toggle hidden when pantry is empty', async ({ appPage: page }) => {
    // Pantry toggle should NOT be visible when pantry is empty
    await expect(page.getByText('Build from My Pantry')).not.toBeVisible();
  });

  test('pantry toggle visible when pantry has items', async ({ appPage: page }) => {
    // Add an item to pantry via the Foods database tab
    await page.goto('/database');
    await page.waitForTimeout(1000);

    const addButton = page.getByLabel('Add to pantry').first();
    if (await addButton.isVisible().catch(() => false)) {
      await addButton.evaluate((el) => (el as HTMLElement).click());
      await page.waitForTimeout(500);
    }

    // Navigate back to race setup
    await navigateToSetupWizard(page);

    await page.getByText('50K', { exact: true }).first().evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(500);

    // Pantry toggle should be visible
    await expect(page.getByText('Build from My Pantry')).toBeVisible();
    await expect(page.getByText('1 item', { exact: true }).first()).toBeVisible();
    await expect(page).toHaveScreenshot('setup-pantry-toggle.png');
  });
});

test.describe('Custom Distance Display', () => {
  test('custom miles race shown in miles on plan card', async ({ appPage: page }) => {
    autoAcceptDialogs(page);
    await navigateToSetupWizard(page);

    // Select custom distance
    await page.getByText('Custom', { exact: true }).evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(500);

    // Enter 50 miles
    const distInput = page.getByPlaceholder('e.g. 100').first();
    if (await distInput.isVisible().catch(() => false)) {
      await distInput.fill('50');
      await distInput.blur();
      await page.waitForTimeout(300);
    }

    // Select conditions
    await page.getByText('Moderate', { exact: true }).evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(300);

    // Build pack
    await page.getByText('Build My Pack', { exact: true }).evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(500);
    await page.getByText('Create Plan', { exact: true }).evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(2000);

    // Navigate to saved plans list — PlanCard renders distanceLabel directly
    await page.goto('/race/plans');
    await page.waitForTimeout(1000);

    // Should show '50mi', not a km equivalent (exact:true avoids matching '50mi 10h' sibling)
    await expect(page.getByText('50mi', { exact: true }).first()).toBeVisible();
    await expect(page).toHaveScreenshot('plan-card-custom-miles.png');
  });
});

test.describe('Race Setup Complex Mode', () => {
  test('shows calories per hour input in complex mode', async ({ appPage: page }) => {
    await navigateToSetupWitch(page);

    // Complex mode shows distance input (not chips)
    const distInput = page.getByPlaceholder(/e\.g\. 100/i).first();
    if (await distInput.isVisible().catch(() => false)) {
      await distInput.fill('80');
      await page.waitForTimeout(500);
    }

    // Calories Per Hour section should unlock
    await expect(page.getByText('Calories Per Hour')).toBeVisible();
    await expect(page.getByPlaceholder('e.g. 250')).toBeVisible();
    await expect(page).toHaveScreenshot('setup-witch-step2-cal-input.png');
  });

  test('shows Complex mode active for witch mode setup', async ({ appPage: page }) => {
    await navigateToSetupWitch(page);
    await expect(page.getByText('Complex', { exact: true })).toBeVisible();
  });
});
