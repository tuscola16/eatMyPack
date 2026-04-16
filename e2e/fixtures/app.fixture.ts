import { test as base, expect, Page } from '@playwright/test';

/**
 * Custom fixture that provides helpers for testing the eatMyPack Expo web app.
 */
export const test = base.extend<{ appPage: Page }>({
  appPage: async ({ page }, use) => {
    // Clear localStorage to reset AsyncStorage state between tests
    await page.addInitScript(() => {
      localStorage.clear();
    });
    await page.goto('/');
    // Wait for the app to hydrate — look for the Wizard button on the home screen
    await page.waitForSelector('text=Wizard', { timeout: 30_000 });
    await use(page);
  },
});

export { expect };

/** Navigate to a tab by clicking its tab bar button */
export async function navigateToTab(page: Page, tabName: 'Home' | 'Foods' | 'Settings') {
  // Tab bar uses emoji icons + text; click the tab text at the bottom of the page
  await page.getByRole('tab', { name: tabName }).or(page.getByText(tabName, { exact: true })).first().click();
  await page.waitForTimeout(500);
}

/** Navigate to race setup via the Wizard button on the home screen */
export async function navigateToSetupWizard(page: Page) {
  await page.getByText('Wizard', { exact: true }).click();
  await page.waitForTimeout(1000);
}

/** Navigate to race setup via the Witch button on the home screen */
export async function navigateToSetupWitch(page: Page) {
  await page.getByText('Witch', { exact: true }).click();
  await page.waitForTimeout(1000);
}

/** Complete the race setup wizard with sensible defaults */
export async function completeRaceSetup(
  page: Page,
  options: { distance?: string; conditions?: string } = {}
) {
  const { distance = '50K', conditions = 'Moderate' } = options;

  // Step 1: Select distance
  await page.getByText(distance, { exact: true }).click();
  await page.waitForTimeout(500);

  // Step 2: Click Next (use default duration)
  await page.getByText('Next', { exact: true }).click();
  await page.waitForTimeout(500);

  // Step 3: Select conditions and build
  await page.getByText(conditions, { exact: true }).click();
  await page.waitForTimeout(300);
  await page.getByText('Build My Pack', { exact: true }).click();
  await page.waitForTimeout(1000);
}

/** Save the current plan with a name via the naming modal */
export async function savePlanWithName(page: Page, name?: string) {
  await page.getByText('Save Plan', { exact: true }).click();
  await page.waitForTimeout(500);

  // Naming modal should appear
  if (name) {
    const nameInput = page.getByPlaceholder('e.g. Western States 100');
    await nameInput.clear();
    await nameInput.fill(name);
    await page.getByText('Save', { exact: true }).last().click();
  } else {
    // Skip naming
    await page.getByText('Skip', { exact: true }).click();
  }
  await page.waitForTimeout(500);
}

/** Auto-accept browser dialogs (Alert.alert on web) */
export function autoAcceptDialogs(page: Page) {
  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });
}

/** Auto-dismiss browser dialogs */
export function autoDismissDialogs(page: Page) {
  page.on('dialog', async (dialog) => {
    await dialog.dismiss();
  });
}
