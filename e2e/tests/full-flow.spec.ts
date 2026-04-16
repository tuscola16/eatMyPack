import { test, expect, autoAcceptDialogs, navigateToTab, navigateToSetupWizard, navigateToSetupWitch, completeRaceSetup, savePlanWithName } from '../fixtures/app.fixture';

test.describe('Full User Flows', () => {
  test('plan creation: home -> wizard -> plan -> save -> home', async ({ appPage: page }) => {
    autoAcceptDialogs(page);

    // 1. Home screen — verify mode buttons
    await expect(page.getByText('Wizard', { exact: true })).toBeVisible();
    await expect(page.getByText('Witch', { exact: true })).toBeVisible();
    await expect(page).toHaveScreenshot('flow-plan-01-home.png');

    // 2. Navigate to race setup via Wizard
    await navigateToSetupWizard(page);
    await expect(page.getByText('Choose Your Distance')).toBeVisible();
    await expect(page).toHaveScreenshot('flow-plan-02-step1.png');

    // 3. Select 50K
    await page.getByText('50K', { exact: true }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Expected Duration')).toBeVisible();
    await expect(page).toHaveScreenshot('flow-plan-03-step2.png');

    // 4. Click Next
    await page.getByText('Next', { exact: true }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Race Conditions')).toBeVisible();
    await expect(page).toHaveScreenshot('flow-plan-04-step3.png');

    // 5. Select Moderate and Build
    await page.getByText('Moderate', { exact: true }).click();
    await page.waitForTimeout(300);
    await page.getByText('Build My Pack', { exact: true }).click();
    await page.waitForTimeout(2000);

    // 6. Plan view
    await expect(page.getByText('Total Cal').or(page.getByText('total cal'))).toBeVisible();
    await expect(page.getByText('Save Plan', { exact: true })).toBeVisible();
    await expect(page).toHaveScreenshot('flow-plan-05-plan-view.png');

    // 7. Save the plan with a name
    await savePlanWithName(page, 'Seven Sisters');

    // 8. Navigate back to home
    await navigateToTab(page, 'Home');
    await page.waitForTimeout(1000);

    // Saved plan should now appear in the Plans section
    await expect(page.getByText('Seven Sisters')).toBeVisible();
    await expect(page).toHaveScreenshot('flow-plan-06-home-with-plan.png');
  });

  test('witch mode: manual cal/hr -> plan', async ({ appPage: page }) => {
    autoAcceptDialogs(page);

    // 1. Navigate via Witch button
    await navigateToSetupWitch(page);
    await expect(page.getByText('Manual Setup')).toBeVisible();

    // 2. Select distance
    await page.getByText('50K', { exact: true }).click();
    await page.waitForTimeout(500);

    // 3. Enter custom cal/hr target
    const calInput = page.getByPlaceholder('e.g. 250');
    await expect(calInput).toBeVisible();
    await calInput.fill('300');
    await expect(page).toHaveScreenshot('flow-witch-01-cal-input.png');

    // 4. Complete setup
    await page.getByText('Next', { exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByText('Moderate', { exact: true }).click();
    await page.waitForTimeout(300);
    await page.getByText('Build My Pack', { exact: true }).click();
    await page.waitForTimeout(2000);

    // 5. Plan should be generated
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
      await calText.click();
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot('flow-food-03-detail.png');

      // 4. Pin the food
      const pinButton = page.getByText('Pin', { exact: true }).first();
      if (await pinButton.isVisible().catch(() => false)) {
        await pinButton.click();
        await page.waitForTimeout(300);
        await expect(page).toHaveScreenshot('flow-food-04-pinned.png');
      }
    }
  });

  test('pantry flow: add to pantry -> build from pantry', async ({ appPage: page }) => {
    autoAcceptDialogs(page);

    // 1. Go to Settings > My Pantry
    await navigateToTab(page, 'Settings');
    await page.waitForTimeout(1000);
    await page.getByText('No items in your pantry yet').click();
    await page.waitForTimeout(1000);

    // 2. Add several foods to pantry
    for (let i = 0; i < 5; i++) {
      const addButton = page.getByLabel('Add to pantry').first();
      if (await addButton.isVisible().catch(() => false)) {
        await addButton.click();
        await page.waitForTimeout(200);
      }
    }
    await expect(page).toHaveScreenshot('flow-pantry-01-items-added.png');

    // 3. Go back from pantry screen, then navigate to Home
    await page.goBack();
    await page.waitForTimeout(500);
    await navigateToTab(page, 'Home');
    await page.waitForTimeout(500);

    // 4. Navigate to setup via Wizard button
    await navigateToSetupWizard(page);

    // 5. Select 50K
    await page.getByText('50K', { exact: true }).click();
    await page.waitForTimeout(500);

    // 6. Click Next
    await page.getByText('Next', { exact: true }).click();
    await page.waitForTimeout(500);

    // 7. Select conditions and verify pantry toggle is visible
    await page.getByText('Moderate', { exact: true }).click();
    await page.waitForTimeout(300);
    await expect(page.getByText('Build from My Pantry')).toBeVisible();
    await expect(page).toHaveScreenshot('flow-pantry-02-toggle-visible.png');

    // 8. Enable "Build from My Pantry" and build
    const pantrySwitch = page.locator('input[role="switch"]').or(page.locator('[role="switch"]')).first();
    if (await pantrySwitch.isVisible().catch(() => false)) {
      await pantrySwitch.click();
      await page.waitForTimeout(300);
    }
    await page.getByText('Build My Pack', { exact: true }).click();
    await page.waitForTimeout(2000);

    // 9. Plan should be generated (using only pantry foods)
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
    await gelsChips.first().click();
    await page.waitForTimeout(300);

    // 3. Prefer real food (second "Real Food" chip is in "Prefer" row)
    const realFoodChips = page.getByText('Real Food', { exact: true });
    const rfCount = await realFoodChips.count();
    if (rfCount >= 2) {
      await realFoodChips.nth(1).click();
      await page.waitForTimeout(300);
    }
    await expect(page).toHaveScreenshot('flow-prefs-01-settings.png');

    // 4. Navigate to Home and build a plan via Wizard
    await navigateToTab(page, 'Home');
    await page.waitForTimeout(500);
    await navigateToSetupWizard(page);

    // 5. Complete setup
    await page.getByText('50K', { exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByText('Next', { exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByText('Moderate', { exact: true }).click();
    await page.waitForTimeout(300);
    await page.getByText('Build My Pack', { exact: true }).click();
    await page.waitForTimeout(2000);

    // 6. Plan should not contain any gels
    await expect(page.getByText('Total Cal').or(page.getByText('total cal'))).toBeVisible();
    await expect(page).toHaveScreenshot('flow-prefs-02-plan-no-gels.png', { fullPage: true });
  });

  test('100mi plan with hot conditions', async ({ appPage: page }) => {
    autoAcceptDialogs(page);

    // Navigate to setup via Wizard
    await navigateToSetupWizard(page);

    // Complete with 100mi + Hot
    await page.getByText('100 mi', { exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByText('Next', { exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByText('Hot', { exact: true }).click();
    await page.waitForTimeout(300);
    await page.getByText('Build My Pack', { exact: true }).click();
    await page.waitForTimeout(2000);

    // Should have more phases for 100mi (early, mid, late, night, final push)
    await expect(page.getByText('Total Cal').or(page.getByText('total cal'))).toBeVisible();
    await expect(page).toHaveScreenshot('flow-100mi-hot-plan.png', { fullPage: true });
  });

  test('plans list navigation from home', async ({ appPage: page }) => {
    autoAcceptDialogs(page);

    // Create a plan first
    await navigateToSetupWizard(page);
    await completeRaceSetup(page, { distance: '50K', conditions: 'Moderate' });
    await savePlanWithName(page, 'Test Plan');
    await navigateToTab(page, 'Home');
    await page.waitForTimeout(1000);

    // Tap "Plans >" to navigate to full plans list
    await page.getByText('Plans', { exact: true }).click();
    await page.waitForTimeout(1000);

    await expect(page.getByText('Saved Plans')).toBeVisible();
    await expect(page).toHaveScreenshot('flow-plans-list.png');
  });
});
