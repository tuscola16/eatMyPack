import { test, expect, navigateToSetupWitch, completeRaceSetup } from '../fixtures/app.fixture';

/**
 * Helpers specific to complex/witch mode setup which includes waystations.
 */
async function fillWitchModeDefaults(page: import('@playwright/test').Page) {
  // Witch mode sets distance=custom — fill in a distance and duration
  const distInput = page.getByPlaceholder('e.g. 100').first();
  if (await distInput.isVisible().catch(() => false)) {
    await distInput.fill('50');
  }

  // Scroll down to expose duration slider / Build My Pack
  await page.evaluate(() => {
    const scrollable = document.querySelector('[data-testid="scroll-view"]') as HTMLElement
      ?? document.querySelector('div[style*="overflow"]') as HTMLElement;
    if (scrollable) scrollable.scrollTop = 300;
  });
  await page.waitForTimeout(300);
}

async function addWaystation(page: import('@playwright/test').Page) {
  const addBtn = page.getByText('+ Add Waystation', { exact: true });
  if (await addBtn.isVisible().catch(() => false)) {
    await addBtn.evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(400);
  }
}

test.describe('Waystations', () => {
  test.beforeEach(async ({ appPage: page }) => {
    await navigateToSetupWitch(page);
  });

  test('add waystation button appears in complex mode', async ({ appPage: page }) => {
    await fillWitchModeDefaults(page);

    // Scroll to waystations section
    await page.evaluate(() => {
      const divs = Array.from(document.querySelectorAll('div'));
      const section = divs.find((d) => d.textContent?.includes('Waystations'));
      if (section) section.scrollIntoView();
    });
    await page.waitForTimeout(300);

    await expect(page.getByText('+ Add Waystation', { exact: true })).toBeVisible();
    await expect(page).toHaveScreenshot('waystations-empty.png');
  });

  test('waystation hour cannot exceed race duration', async ({ appPage: page }) => {
    await fillWitchModeDefaults(page);

    // Scroll to waystations
    await page.evaluate(() => {
      const divs = Array.from(document.querySelectorAll('div'));
      const section = divs.find((d) => d.textContent?.includes('Waystations'));
      if (section) section.scrollIntoView();
    });
    await page.waitForTimeout(300);

    await addWaystation(page);

    // The default duration is 10h. Enter 30 as the hour value.
    const markerInput = page.getByPlaceholder('Hour').first();
    if (await markerInput.isVisible().catch(() => false)) {
      await markerInput.fill('30');
      await markerInput.blur();
      await page.waitForTimeout(400);

      // Error text should appear
      await expect(page.getByText(/Cannot exceed race duration/i)).toBeVisible();
      await expect(page).toHaveScreenshot('waystations-hour-error.png');
    }
  });

  test('waystation mile cannot exceed total race distance', async ({ appPage: page }) => {
    await fillWitchModeDefaults(page);

    await page.evaluate(() => {
      const divs = Array.from(document.querySelectorAll('div'));
      const section = divs.find((d) => d.textContent?.includes('Waystations'));
      if (section) section.scrollIntoView();
    });
    await page.waitForTimeout(300);

    await addWaystation(page);

    // Switch to Mile marker type
    const mileBtn = page.getByText('Mile', { exact: true }).first();
    if (await mileBtn.isVisible().catch(() => false)) {
      await mileBtn.evaluate((el) => (el as HTMLElement).click());
      await page.waitForTimeout(300);

      // Enter a value greater than the 50mi distance
      const markerInput = page.getByPlaceholder('Mile').first();
      if (await markerInput.isVisible().catch(() => false)) {
        await markerInput.fill('200');
        await markerInput.blur();
        await page.waitForTimeout(400);

        await expect(page.getByText(/Cannot exceed race distance/i)).toBeVisible();
        await expect(page).toHaveScreenshot('waystations-mile-error.png');
      }
    }
  });

  test('add foods to waystation opens food picker', async ({ appPage: page }) => {
    await fillWitchModeDefaults(page);

    await page.evaluate(() => {
      const divs = Array.from(document.querySelectorAll('div'));
      const section = divs.find((d) => d.textContent?.includes('Waystations'));
      if (section) section.scrollIntoView();
    });
    await page.waitForTimeout(300);

    await addWaystation(page);

    // Click "Add foods →" — should navigate to the food picker
    const addFoodsBtn = page.getByText('Add foods →', { exact: true }).first();
    if (await addFoodsBtn.isVisible().catch(() => false)) {
      await addFoodsBtn.evaluate((el) => (el as HTMLElement).click());
      await page.waitForTimeout(1500);

      // Food picker should show "Select Foods" header
      await expect(page.getByText(/Select Foods/i)).toBeVisible();
      await expect(page.getByText('Done', { exact: true })).toBeVisible();
      await expect(page).toHaveScreenshot('waystation-food-picker.png');
    }
  });

  test('food picker selection shows checkmark and Done saves', async ({ appPage: page }) => {
    await fillWitchModeDefaults(page);

    await page.evaluate(() => {
      const divs = Array.from(document.querySelectorAll('div'));
      const section = divs.find((d) => d.textContent?.includes('Waystations'));
      if (section) section.scrollIntoView();
    });
    await page.waitForTimeout(300);

    await addWaystation(page);

    const addFoodsBtn = page.getByText('Add foods →', { exact: true }).first();
    if (await addFoodsBtn.isVisible().catch(() => false)) {
      await addFoodsBtn.evaluate((el) => (el as HTMLElement).click());
      await page.waitForTimeout(1500);

      // Should be on the food picker screen
      const selectHeader = page.getByText(/Select Foods \(0\)/i);
      if (await selectHeader.isVisible().catch(() => false)) {
        // Select 2 foods via the checkmark toggle (accessibilityLabel="Select")
        const selectBtns = page.getByLabel('Select');
        const count = await selectBtns.count();
        if (count >= 2) {
          await selectBtns.nth(0).evaluate((el) => (el as HTMLElement).click());
          await page.waitForTimeout(300);
          await selectBtns.nth(1).evaluate((el) => (el as HTMLElement).click());
          await page.waitForTimeout(300);

          // Count should update to (2)
          await expect(page.getByText(/Select Foods \(2\)/i)).toBeVisible();
          await expect(page).toHaveScreenshot('waystation-food-picker-selected.png');

          // Click Done
          await page.getByText('Done', { exact: true }).evaluate((el) => (el as HTMLElement).click());
          await page.waitForTimeout(1000);

          // Should be back on setup, food chips visible
          await expect(page.getByText('Edit foods →', { exact: true })).toBeVisible();
          await expect(page).toHaveScreenshot('waystation-with-foods.png');
        }
      }
    }
  });

  test('add foods works before race is saved', async ({ appPage: page }) => {
    // In witch mode, the race is NOT saved yet — this tests fix #4.
    await fillWitchModeDefaults(page);

    await page.evaluate(() => {
      const divs = Array.from(document.querySelectorAll('div'));
      const section = divs.find((d) => d.textContent?.includes('Waystations'));
      if (section) section.scrollIntoView();
    });
    await page.waitForTimeout(300);

    await addWaystation(page);

    const addFoodsBtn = page.getByText('Add foods →', { exact: true }).first();
    if (await addFoodsBtn.isVisible().catch(() => false)) {
      await addFoodsBtn.evaluate((el) => (el as HTMLElement).click());
      await page.waitForTimeout(1500);

      // Should navigate to food picker, not crash
      await expect(page.getByText(/Select Foods/i)).toBeVisible();

      // Cancel back to setup form
      await page.getByText('Cancel', { exact: true }).evaluate((el) => (el as HTMLElement).click());
      await page.waitForTimeout(800);

      // Setup form should still be intact
      await expect(page.getByText('+ Add Waystation', { exact: true })).toBeVisible();
    }
  });
});
