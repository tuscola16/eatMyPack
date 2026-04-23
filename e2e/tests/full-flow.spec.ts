import { test, expect, autoAcceptDialogs, navigateToTab, navigateToSetupWizard, navigateToSetupWitch, completeRaceSetup } from '../fixtures/app.fixture';

test.describe('Full User Flows', () => {
  test('plan creation: home -> setup -> plan -> home', async ({ appPage: page }) => {
    autoAcceptDialogs(page);

    // 1. Home screen — verify hero and plans section
    await expect(page.getByText('Add an adventure').first()).toBeVisible();
    await expect(page.getByText('My Plans')).toBeVisible();
    await expect(page).toHaveScreenshot('flow-plan-01-home.png');

    // 2. Navigate to race setup
    await navigateToSetupWizard(page);
    await expect(page.getByText('Choose Your Distance')).toBeVisible();
    await expect(page).toHaveScreenshot('flow-plan-02-step1.png');

    // 3. Select 50K
    await page.getByText('50K', { exact: true }).first().evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(500);
    await expect(page.getByText('Expected Duration')).toBeVisible();
    await expect(page).toHaveScreenshot('flow-plan-03-step2.png');

    // 4. Select Moderate
    await page.getByText('Moderate', { exact: true }).evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot('flow-plan-04-conditions.png');

    // 5. Build My Pack → naming modal
    await page.getByText('Build My Pack', { exact: true }).evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(500);
    await expect(page.getByText('Name Your Plan')).toBeVisible();

    // 6. Set plan name and create
    await page.getByPlaceholder('e.g. Western States 100').clear();
    await page.getByPlaceholder('e.g. Western States 100').fill('Seven Sisters');
    await page.getByText('Create Plan', { exact: true }).evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(2000);

    // 7. Plan view
    await expect(page.getByText('Total Cal').or(page.getByText('total cal'))).toBeVisible();
    await expect(page).toHaveScreenshot('flow-plan-05-plan-view.png');

    // 8. Navigate back to home
    await navigateToTab(page, 'Home');
    await page.waitForTimeout(1000);

    // Saved plan should now appear in the Plans section
    await expect(page.getByText('Seven Sisters')).toBeVisible();
    await expect(page).toHaveScreenshot('flow-plan-06-home-with-plan.png');
  });

  test('complex mode: manual distance entry -> plan', async ({ appPage: page }) => {
    autoAcceptDialogs(page);

    // 1. Navigate via complex mode URL
    await navigateToSetupWitch(page);
    await expect(page.getByText('Complex', { exact: true })).toBeVisible();

    // 2. Enter distance
    const distInput = page.getByPlaceholder(/e\.g\. 100/i).first();
    if (await distInput.isVisible().catch(() => false)) {
      await distInput.fill('80');
      await page.waitForTimeout(500);
    }
    await expect(page).toHaveScreenshot('flow-witch-01-cal-input.png');

    // 3. Select conditions and build
    await page.getByText('Moderate', { exact: true }).evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(300);
    await page.getByText('Build My Pack', { exact: true }).evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(500);

    // Submit naming modal
    await page.getByText('Create Plan', { exact: true }).evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(2000);

    // 4. Plan should be generated
    await expect(page.getByText('Total Cal').or(page.getByText('total cal'))).toBeVisible();
    await expect(page).toHaveScreenshot('flow-witch-02-plan.png');
  });

  test('food browse and pin: Foods tab -> search -> detail -> pin', async ({ appPage: page }) => {
    // 1. Navigate to Foods tab
    await navigateToTab(page, 'Foods');
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot('flow-food-01-database.png');

    // 2. Search for a food
    const searchInput = page.getByPlaceholder(/search/i).first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('Maurten');
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot('flow-food-02-search.png');
    }

    // 3. Try to tap a food item to get to detail
    const calText = page.getByText(/\d+ cal/i).first();
    if (await calText.isVisible().catch(() => false)) {
      await calText.evaluate((el) => (el as HTMLElement).click());
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot('flow-food-03-detail.png');

      // 4. Pin the food
      const pinButton = page.getByText('Pin', { exact: true }).first();
      if (await pinButton.isVisible().catch(() => false)) {
        await pinButton.evaluate((el) => (el as HTMLElement).click());
        await page.waitForTimeout(300);
        await expect(page).toHaveScreenshot('flow-food-04-pinned.png');
      }
    }
  });

  test('pantry flow: add to pantry -> build from pantry', async ({ appPage: page }) => {
    autoAcceptDialogs(page);

    // 1. Add several foods to pantry via the Foods database tab
    await page.goto('/database');
    await page.waitForTimeout(1000);

    for (let i = 0; i < 5; i++) {
      const addButton = page.getByLabel('Add to pantry').first();
      if (await addButton.isVisible().catch(() => false)) {
        await addButton.evaluate((el) => (el as HTMLElement).click());
        await page.waitForTimeout(200);
      }
    }
    await expect(page).toHaveScreenshot('flow-pantry-01-items-added.png');

    // 3. Navigate to Home then setup
    await navigateToTab(page, 'Home');
    await page.waitForTimeout(500);
    await navigateToSetupWizard(page);

    // 4. Select 50K
    await page.getByText('50K', { exact: true }).first().evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(500);

    // 5. Select conditions and verify pantry toggle is visible
    await page.getByText('Moderate', { exact: true }).evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(300);
    await expect(page.getByText('Build from My Pantry')).toBeVisible();
    await expect(page).toHaveScreenshot('flow-pantry-02-toggle-visible.png');

    // 6. Enable "Build from My Pantry" and build
    const pantrySwitch = page.locator('input[role="switch"]').or(page.locator('[role="switch"]')).first();
    if (await pantrySwitch.isVisible().catch(() => false)) {
      await pantrySwitch.evaluate((el) => (el as HTMLElement).click());
      await page.waitForTimeout(300);
    }
    await page.getByText('Build My Pack', { exact: true }).evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(500);

    // Submit naming modal
    await page.getByText('Create Plan', { exact: true }).evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(2000);

    // 7. Plan should be generated
    await expect(page.getByText('Total Cal').or(page.getByText('total cal'))).toBeVisible();
    await expect(page).toHaveScreenshot('flow-pantry-03-plan.png');
  });

  test('category prefs flow: exclude gels -> prefer real food -> build', async ({ appPage: page }) => {
    autoAcceptDialogs(page);

    // 1. Go to Settings and set category preferences
    await navigateToTab(page, 'Settings');
    await page.waitForTimeout(1000);

    // 2. Exclude gels (first "Gels" chip is in "Never use" row)
    const gelsChips = page.getByText('Gels', { exact: true });
    await gelsChips.first().evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(300);

    // 3. Prefer real food (second "Real Food" chip is in "Prefer" row)
    const realFoodChips = page.getByText('Real Food', { exact: true });
    const rfCount = await realFoodChips.count();
    if (rfCount >= 2) {
      await realFoodChips.nth(1).evaluate((el) => (el as HTMLElement).click());
      await page.waitForTimeout(300);
    }
    await expect(page).toHaveScreenshot('flow-prefs-01-settings.png');

    // 4. Navigate to Home and build a plan
    await navigateToTab(page, 'Home');
    await page.waitForTimeout(500);
    await navigateToSetupWizard(page);

    // 5. Complete setup
    await page.getByText('50K', { exact: true }).first().evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(500);
    await page.getByText('Moderate', { exact: true }).evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(300);
    await page.getByText('Build My Pack', { exact: true }).evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(500);

    // Submit naming modal
    await page.getByText('Create Plan', { exact: true }).evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(2000);

    // 6. Plan should not contain any gels
    await expect(page.getByText('Total Cal').or(page.getByText('total cal'))).toBeVisible();
    await expect(page).toHaveScreenshot('flow-prefs-02-plan-no-gels.png', { fullPage: true });
  });

  test('100mi plan with hot conditions', async ({ appPage: page }) => {
    autoAcceptDialogs(page);

    await navigateToSetupWizard(page);
    await completeRaceSetup(page, { distance: '100 mi', conditions: 'Hot' });

    // Should have more phases for 100mi
    await expect(page.getByText('Total Cal').or(page.getByText('total cal'))).toBeVisible();
    await expect(page).toHaveScreenshot('flow-100mi-hot-plan.png', { fullPage: true });
  });

  test('plans list navigation from home', async ({ appPage: page }) => {
    autoAcceptDialogs(page);

    // Create a plan first
    await navigateToSetupWizard(page);
    await completeRaceSetup(page, { distance: '50K', conditions: 'Moderate', planName: 'Test Plan' });
    await navigateToTab(page, 'Home');
    await page.waitForTimeout(1000);

    // Plan should appear on home
    await expect(page.getByText('Test Plan')).toBeVisible();

    // Tap "My Plans" to navigate to full plans list
    await page.getByText('My Plans').first().evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(1500);

    await expect(page.getByText('Saved Plans').first()).toBeVisible();
    await expect(page).toHaveScreenshot('flow-plans-list.png');
  });
});
