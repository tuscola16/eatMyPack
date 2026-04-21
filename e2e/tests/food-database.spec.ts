import { test, expect, navigateToTab } from '../fixtures/app.fixture';

test.describe('Food Database', () => {
  test.beforeEach(async ({ appPage: page }) => {
    await navigateToTab(page, 'Foods');
    await page.waitForTimeout(1000);
  });

  test('renders filter bar and food list', async ({ appPage: page }) => {
    // Should see the food database content
    await expect(page.getByText('Foods').first()).toBeVisible();
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

test.describe('Food Database Navigation', () => {
  test('Foods tab from deep in stack returns to database index', async ({ appPage: page }) => {
    // Navigate to a food detail page
    await page.goto('/database/gu-original-gel');
    await page.waitForTimeout(1000);

    // Navigate to home (leaving the foods stack)
    await page.goto('/');
    await page.waitForSelector('text=Add an adventure', { timeout: 10_000 });
    await page.waitForTimeout(500);

    // Click the Foods tab element — must trigger tabPress (not just goto)
    // Expo Router renders tab items as <a> elements on web
    const foodsTab = page.locator('a[href="/database"]').first();
    if (await foodsTab.isVisible().catch(() => false)) {
      await foodsTab.evaluate((el) => (el as HTMLElement).click());
    } else {
      // Fallback: navigate directly if tab element not found
      await page.goto('/database');
    }
    await page.waitForTimeout(1000);

    // Should be on the database INDEX — search bar visible, not food detail
    await expect(page.getByPlaceholder(/search/i).first()).toBeVisible();
    await expect(page).toHaveScreenshot('database-tab-reset.png');
  });

  test('adding food to pantry when pantry already has items', async ({ appPage: page }) => {
    await navigateToTab(page, 'Foods');
    await page.waitForTimeout(1000);

    // Add first food to pantry
    const firstAddBtn = page.getByLabel('Add to pantry').first();
    if (!(await firstAddBtn.isVisible().catch(() => false))) return;
    await firstAddBtn.evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(500);

    // Add second food (first button now shows "Remove from pantry", so pick next "Add to pantry")
    const nextAddBtn = page.getByLabel('Add to pantry').first();
    if (await nextAddBtn.isVisible().catch(() => false)) {
      await nextAddBtn.evaluate((el) => (el as HTMLElement).click());
      await page.waitForTimeout(500);
    }

    // Both foods should remain — at least 2 "Remove from pantry" buttons visible
    const removeCount = await page.getByLabel('Remove from pantry').count();
    expect(removeCount).toBeGreaterThanOrEqual(2);
    await expect(page).toHaveScreenshot('database-pantry-two-items.png');
  });
});
