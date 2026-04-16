import { test, expect, navigateToTab } from '../fixtures/app.fixture';

test.describe('Category Preferences', () => {
  test.beforeEach(async ({ appPage: page }) => {
    await navigateToTab(page, 'Settings');
    await page.waitForTimeout(1000);
  });

  test('shows category preferences section', async ({ appPage: page }) => {
    await expect(page.getByText('Category Preferences')).toBeVisible();
    await expect(page.getByText('Never use')).toBeVisible();
    await expect(page.getByText('Prefer', { exact: true })).toBeVisible();
    await expect(page).toHaveScreenshot('category-prefs-section.png');
  });

  test('shows all category chips in both rows', async ({ appPage: page }) => {
    const categories = ['Gels', 'Bars', 'Chews', 'Drink Mix', 'Real Food', 'Nut Butter', 'Freeze-Dried'];
    for (const cat of categories) {
      // Each category appears twice (once in "Never use", once in "Prefer")
      const chips = page.getByText(cat, { exact: true });
      const count = await chips.count();
      expect(count).toBeGreaterThanOrEqual(2);
    }
  });

  test('toggle excluded category', async ({ appPage: page }) => {
    // Click "Gels" in the "Never use" row (first occurrence)
    const gelsChips = page.getByText('Gels', { exact: true });
    await gelsChips.first().click();
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('category-prefs-gel-excluded.png');
  });

  test('toggle preferred category', async ({ appPage: page }) => {
    // Click "Real Food" in the "Prefer" row (second occurrence)
    const realFoodChips = page.getByText('Real Food', { exact: true });
    const count = await realFoodChips.count();
    if (count >= 2) {
      await realFoodChips.nth(1).click();
      await page.waitForTimeout(300);
    }

    await expect(page).toHaveScreenshot('category-prefs-realfood-preferred.png');
  });

  test('excluding a category removes it from preferred', async ({ appPage: page }) => {
    // First, prefer "Gels" (click second occurrence = Prefer row)
    const gelsChips = page.getByText('Gels', { exact: true });
    const count = await gelsChips.count();
    if (count >= 2) {
      await gelsChips.nth(1).click();
      await page.waitForTimeout(300);
    }

    // Now exclude "Gels" (click first occurrence = Never use row)
    await gelsChips.first().click();
    await page.waitForTimeout(300);

    // The preferred state should be cleared automatically
    await expect(page).toHaveScreenshot('category-prefs-mutual-exclusion.png');
  });

  test('multiple categories can be excluded', async ({ appPage: page }) => {
    const gelsChips = page.getByText('Gels', { exact: true });
    const chewsChips = page.getByText('Chews', { exact: true });

    await gelsChips.first().click();
    await page.waitForTimeout(200);
    await chewsChips.first().click();
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('category-prefs-multi-excluded.png');
  });

  test('multiple categories can be preferred', async ({ appPage: page }) => {
    const realFoodChips = page.getByText('Real Food', { exact: true });
    const barsChips = page.getByText('Bars', { exact: true });

    const rfCount = await realFoodChips.count();
    const barsCount = await barsChips.count();

    if (rfCount >= 2) {
      await realFoodChips.nth(1).click();
      await page.waitForTimeout(200);
    }
    if (barsCount >= 2) {
      await barsChips.nth(1).click();
      await page.waitForTimeout(300);
    }

    await expect(page).toHaveScreenshot('category-prefs-multi-preferred.png');
  });
});
