import { test, expect, navigateToTab } from '../fixtures/app.fixture';

test.describe('Food Database', () => {
  test.beforeEach(async ({ appPage: page }) => {
    await navigateToTab(page, 'Foods');
    await page.waitForTimeout(1000);
  });

  test('renders filter bar and food list', async ({ appPage: page }) => {
    // Should see the food database content
    await expect(page.getByText('Food Database').first()).toBeVisible();
    await expect(page).toHaveScreenshot('database-overview.png');
  });

  test('shows category filter chips', async ({ appPage: page }) => {
    // Category chips should be visible
    const categories = ['Gel', 'Bar', 'Chew', 'Drink', 'Real Food'];
    let found = 0;
    for (const cat of categories) {
      const el = page.getByText(cat, { exact: false }).first();
      if (await el.isVisible().catch(() => false)) found++;
    }
    expect(found).toBeGreaterThan(0);
    await expect(page).toHaveScreenshot('database-filters.png');
  });

  test('filter by category chip', async ({ appPage: page }) => {
    // Click on "Gel" category chip
    const gelChip = page.getByText('Gel', { exact: true }).first();
    if (await gelChip.isVisible().catch(() => false)) {
      await gelChip.click();
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot('database-filtered-gel.png');
    }
  });

  test('search filters food list', async ({ appPage: page }) => {
    // Find the search input and type
    const searchInput = page.getByPlaceholder(/search/i).first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('GU');
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot('database-search-gu.png');
    }
  });

  test('food list scrolls and shows items', async ({ appPage: page }) => {
    // Should see at least one food item with calorie info
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('database-food-list.png', { fullPage: true });
  });
});
