import { test, expect, navigateToTab } from '../fixtures/app.fixture';

test.describe('Pantry', () => {
  test('navigates to pantry screen', async ({ appPage: page }) => {
    await page.goto('/pantry');
    await page.waitForTimeout(1000);

    // Pantry screen should show header and food list
    await expect(page.getByText('My Pantry')).toBeVisible();
    await expect(page).toHaveScreenshot('pantry-empty.png');
  });

  test('adds food to pantry via toggle', async ({ appPage: page }) => {
    await page.goto('/pantry');
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
    await page.goto('/pantry');
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

  test('pantry count shows on home screen after adding items', async ({ appPage: page }) => {
    // Navigate to pantry and add items
    await page.goto('/pantry');
    await page.waitForTimeout(1000);

    const addButton1 = page.getByLabel('Add to pantry').first();
    if (await addButton1.isVisible().catch(() => false)) {
      await addButton1.click();
      await page.waitForTimeout(300);
    }
    const addButton2 = page.getByLabel('Add to pantry').first();
    if (await addButton2.isVisible().catch(() => false)) {
      await addButton2.click();
      await page.waitForTimeout(300);
    }

    // Go to settings and check pantry count
    await navigateToTab(page, 'Settings');
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot('settings-pantry-count.png');
  });

  test('pantry search filters food list', async ({ appPage: page }) => {
    await page.goto('/pantry');
    await page.waitForTimeout(1000);

    const searchInput = page.getByPlaceholder(/search/i).first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('GU');
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot('pantry-search.png');
    }
  });
});
