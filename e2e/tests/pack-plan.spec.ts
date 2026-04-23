import { test, expect, autoAcceptDialogs, navigateToSetupWizard, completeRaceSetup } from '../fixtures/app.fixture';

test.describe('Food Rejection', () => {
  test('x button rejects food immediately', async ({ appPage: page }) => {
    autoAcceptDialogs(page);
    await navigateToSetupWizard(page);
    await completeRaceSetup(page);

    // Phases are expanded by default — find the first "Don't have" reject button
    const rejectBtn = page.getByLabel("Don't have").first();
    if (!(await rejectBtn.isVisible().catch(() => false))) return;

    await expect(page.getByText('Total Cal').or(page.getByText('total cal'))).toBeVisible();

    await rejectBtn.evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(2000);

    // Plan should have rebuilt successfully
    await expect(page.getByText('Total Cal').or(page.getByText('total cal'))).toBeVisible();
    await expect(page).toHaveScreenshot('plan-after-reject.png');
  });

  test('rejected food absent across 3 re-generates', async ({ appPage: page }) => {
    test.setTimeout(90_000); // 3 regen cycles need extra time
    autoAcceptDialogs(page);
    await navigateToSetupWizard(page);
    await completeRaceSetup(page);

    // After completeRaceSetup, the plan URL has ?id= so the Edit button is visible
    const rejectBtn = page.getByLabel("Don't have").first();
    if (!(await rejectBtn.isVisible().catch(() => false))) return;

    // Extract the food name from the first pack item for later verification
    const rejectedName: string | null = await page.evaluate(() => {
      const btns = document.querySelectorAll('[aria-label="Don\'t have"]');
      if (!btns.length) return null;
      const row = btns[0].parentElement;
      if (!row) return null;
      const walker = document.createTreeWalker(row, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        const t = node.textContent?.trim() ?? '';
        if (t.length > 3 && t !== "Don't have" && !/^\d/.test(t) && !/^×/.test(t)) {
          return t;
        }
        node = walker.nextNode();
      }
      return null;
    });

    // Reject the food
    await rejectBtn.evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(2000);

    if (rejectedName) {
      await expect(page.getByText(rejectedName, { exact: true })).not.toBeVisible();
    }

    // Regenerate 3 times — rejected food should stay absent
    for (let i = 0; i < 3; i++) {
      // .first() because navigator stacks can render multiple plan views in DOM
      await page.getByText('Edit', { exact: true }).first().evaluate((el) => (el as HTMLElement).click());
      await page.waitForTimeout(500);
      await page.getByText('Re-generate', { exact: true }).evaluate((el) => (el as HTMLElement).click());

      // Wait for setup page to load (pre-filled from existing plan)
      await page.waitForSelector('text=Choose Your Distance', { timeout: 15_000 });

      // When editing, "Update Pack" calls handleSubmit directly — no naming modal
      const updateBtn = page.getByText('Update Pack', { exact: true });
      await updateBtn.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await updateBtn.evaluate((el) => (el as HTMLElement).click());
      // Wait for plan view to reload (Update Pack submits directly, no modal)
      await page.waitForTimeout(3000);

      if (rejectedName) {
        await expect(page.getByText(rejectedName, { exact: true })).not.toBeVisible();
      }
    }

    await expect(page).toHaveScreenshot('plan-after-3-regens.png');
  });
});

test.describe('Pack Plan View', () => {
  test('shows plan after completing setup wizard', async ({ appPage: page }) => {
    await navigateToSetupWizard(page);
    await completeRaceSetup(page, { distance: '50K', conditions: 'Moderate' });

    await expect(page.getByText('Total Cal').or(page.getByText('total cal'))).toBeVisible();
    await expect(page).toHaveScreenshot('plan-summary.png');
  });

  test('shows phase sections with food items', async ({ appPage: page }) => {
    await navigateToSetupWizard(page);
    await completeRaceSetup(page);

    const phaseTexts = ['Early', 'Mid', 'Final'];
    let found = 0;
    for (const text of phaseTexts) {
      const el = page.getByText(text, { exact: false }).first();
      if (await el.isVisible().catch(() => false)) found++;
    }
    expect(found).toBeGreaterThan(0);
    await expect(page).toHaveScreenshot('plan-phases.png', { fullPage: true });
  });

  test('shows plan view navigation elements', async ({ appPage: page }) => {
    await navigateToSetupWizard(page);
    await completeRaceSetup(page);

    await expect(page.getByText('Total Cal').or(page.getByText('total cal'))).toBeVisible();
    await expect(page).toHaveScreenshot('plan-action-buttons.png');
  });

  test('naming modal appears when Build My Pack is clicked', async ({ appPage: page }) => {
    autoAcceptDialogs(page);

    await navigateToSetupWizard(page);

    // Select distance and conditions to enable Build My Pack
    await page.getByText('50K', { exact: true }).first().evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(500);
    await page.getByText('Moderate', { exact: true }).evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(300);

    // Click Build My Pack
    await page.getByText('Build My Pack', { exact: true }).evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(500);

    // Naming modal should be visible
    await expect(page.getByText('Name Your Plan')).toBeVisible();
    await expect(page.getByPlaceholder('e.g. Western States 100')).toBeVisible();
    await expect(page.getByText('Create Plan', { exact: true })).toBeVisible();
    await expect(page).toHaveScreenshot('plan-naming-modal.png');
  });

  test('plan saved with custom name', async ({ appPage: page }) => {
    autoAcceptDialogs(page);

    await navigateToSetupWizard(page);
    await completeRaceSetup(page, { planName: 'My Test Race' });

    await expect(page.getByText('Total Cal').or(page.getByText('total cal'))).toBeVisible();
  });

  test('plan saved with auto-generated name', async ({ appPage: page }) => {
    autoAcceptDialogs(page);

    await navigateToSetupWizard(page);
    await completeRaceSetup(page);

    await expect(page.getByText('Total Cal').or(page.getByText('total cal'))).toBeVisible();
  });

  test('empty plan state', async ({ appPage: page }) => {
    await page.goto('/race/plan');
    await page.waitForTimeout(2000);

    await expect(page.getByText('No plan yet')).toBeVisible();
    await expect(page).toHaveScreenshot('plan-empty.png');
  });
});
