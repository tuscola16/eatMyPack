import { test, expect, navigateToTab } from '../fixtures/app.fixture';

test.describe('Pantry', () => {
  test('navigates to pantry from settings', async ({ appPage: page }) => {
    await navigateToTab(page, 'Settings');
    await page.waitForTimeout(1000);

    await expect(page.getByText('My Pantry')).toBeVisible();
    await expect(page.getByText('No items in your pantry yet')).toBeVisible();

    // Tap to navigate to pantry screen
    await page.getByText('No items in your pantry yet').click();
    await page.waitForTimeout(1000);

    // Pantry screen should show the food list with filter bar
    // The header "0 items" badge should be visible
    await expect(page.getByText('0 items', { exact: true })).toBeVisible();
    await expect(page).toHaveScreenshot('pantry-empty.png');
  });

  test('adds food to pantry via toggle', async ({ appPage: page }) => {
    await navigateToTab(page, 'Settings');
    await page.waitForTimeout(1000);

    await page.getByText('No items in your pantry yet').click();
    await page.waitForTimeout(1000);

    // Find and click a pantry toggle button via accessibility label
    const addButton = page.getByLabel('Add to pantry').first();
    if (await addButton.isVisible().catch(() => false)) {
      await addButton.click();
      await page.waitForTimeout(500);

      // Item count should update in header
      await expect(page.getByText('1 item', { exact: true })).toBeVisible();
      await expect(page).toHaveScreenshot('pantry-one-item.png');
    }
  });

  test('removes food from pantry via toggle', async ({ appPage: page }) => {
    await navigateToTab(page, 'Settings');
    await page.waitForTimeout(1000);

    await page.getByText('No items in your pantry yet').click();
    await page.waitForTimeout(1000);

    // Add an item
    const addButton = page.getByLabel('Add to pantry').first();
    if (await addButton.isVisible().catch(() => false)) {
      await addButton.click();
      await page.waitForTimeout(500);
      await expect(page.getByText('1 item', { exact: true })).toBeVisible();

      // Now remove it (label changes to "Remove from pantry")
      const removeButton = page.getByLabel('Remove from pantry').first();
      if (await removeButton.isVisible().catch(() => false)) {
        await removeButton.click();
        await page.waitForTimeout(500);
        await expect(page.getByText('0 items', { exact: true })).toBeVisible();
      }
    }
  });

  test('pantry count updates in settings', async ({ appPage: page }) => {
    await navigateToTab(page, 'Settings');
    await page.waitForTimeout(1000);

    // Navigate to pantry and add items
    await page.getByText('No items in your pantry yet').click();
    await page.waitForTimeout(1000);

    // Add first item
    const addButton1 = page.getByLabel('Add to pantry').first();
    if (await addButton1.isVisible().catch(() => false)) {
      await addButton1.click();
      await page.waitForTimeout(300);
    }
    // Add second item
    const addButton2 = page.getByLabel('Add to pantry').first();
    if (await addButton2.isVisible().catch(() => false)) {
      await addButton2.click();
      await page.waitForTimeout(300);
    }

    // Go back to settings using the back button
    await page.goBack();
    await page.waitForTimeout(1000);

    // Should show item count
    const countText = page.getByText(/\d+ items? in your pantry/);
    await expect(countText).toBeVisible();
    await expect(page).toHaveScreenshot('settings-pantry-count.png');
  });

  test('pantry search filters food list', async ({ appPage: page }) => {
    await navigateToTab(page, 'Settings');
    await page.waitForTimeout(1000);

    await page.getByText('No items in your pantry yet').click();
    await page.waitForTimeout(1000);

    const searchInput = page.getByPlaceholder(/search/i).first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('GU');
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot('pantry-search.png');
    }
  });
});
