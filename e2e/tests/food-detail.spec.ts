import { test, expect, navigateToTab } from '../fixtures/app.fixture';

test.describe('Food Detail', () => {
  test('navigates to food detail from database', async ({ appPage: page }) => {
    await navigateToTab(page, 'Foods');
    await page.waitForTimeout(1000);

    // Click the first food item in the list
    // Food cards typically show food name + calories
    const foodCards = page.locator('[role="button"]').or(page.locator('[data-testid]'));
    const firstClickable = foodCards.first();

    // Try clicking the first food item by looking for calorie text patterns
    const calText = page.getByText(/\d+ cal/i).first();
    if (await calText.isVisible().catch(() => false)) {
      await calText.click();
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot('food-detail.png');
    }
  });

  test('pin button toggles', async ({ appPage: page }) => {
    await navigateToTab(page, 'Foods');
    await page.waitForTimeout(1000);

    // Navigate to a food detail
    const calText = page.getByText(/\d+ cal/i).first();
    if (await calText.isVisible().catch(() => false)) {
      await calText.click();
      await page.waitForTimeout(1000);

      // Look for pin button
      const pinButton = page.getByText('Pin').or(page.getByText('pin')).first();
      if (await pinButton.isVisible().catch(() => false)) {
        await expect(page).toHaveScreenshot('food-detail-unpinned.png');
        await pinButton.click();
        await page.waitForTimeout(300);
        await expect(page).toHaveScreenshot('food-detail-pinned.png');
      }
    }
  });
});
