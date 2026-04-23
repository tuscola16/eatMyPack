import { test as base, expect, Page } from '@playwright/test';

/**
 * Custom fixture that provides helpers for testing the eatMyPack Expo web app.
 */
export const test = base.extend<{ appPage: Page }>({
  appPage: async ({ page }, use) => {
    // Clear localStorage only on the very first page load per test (sessionStorage is fresh each
    // test's page). Subsequent page.goto() calls within the same test keep accumulated state so
    // that saved plans / pantry items survive navigation back to home.
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('_testInitialized')) {
        localStorage.clear();
        sessionStorage.setItem('_testInitialized', '1');
      }
      // Always keep the onboarding key so we land on the home screen.
      localStorage.setItem('@AsyncStorage:hasSeenOnboarding_v1', 'true');
    });
    await page.goto('/');
    // Wait for the app to hydrate — look for the hero CTA on the home screen
    await page.waitForSelector('text=Add an adventure', { timeout: 30_000 });
    await use(page);
  },
});

export { expect };

/** Navigate to a tab by URL — more reliable than clicking icon-only tabs */
export async function navigateToTab(page: Page, tabName: 'Home' | 'Foods' | 'Settings') {
  const routes: Record<string, string> = { Home: '/', Foods: '/database', Settings: '/settings' };
  await page.goto(routes[tabName]);
  await page.waitForTimeout(500);
}

/** Navigate to race setup (simple/wizard mode) */
export async function navigateToSetupWizard(page: Page) {
  await page.goto('/race/setup?mode=simple');
  // Wait for the form to be interactive before continuing
  await page.waitForSelector('text=Choose Your Distance', { timeout: 15_000 });
}

/** Navigate to race setup in complex/witch mode */
export async function navigateToSetupWitch(page: Page) {
  await page.goto('/race/setup?mode=witch');
  await page.waitForSelector('text=Custom Distance', { timeout: 15_000 });
}

/**
 * Complete the race setup form and submit through the naming modal.
 *
 * The form is a single scrollview: distance chips + conditions + Build My Pack.
 * Clicking Build My Pack shows a naming modal; clicking Create Plan navigates to the plan view.
 * Uses element.click() via evaluate to reliably trigger React Native web Pressable handlers.
 */
export async function completeRaceSetup(
  page: Page,
  options: { distance?: string; conditions?: string; planName?: string } = {}
) {
  const { distance = '50K', conditions = 'Moderate', planName } = options;

  // Select distance chip
  await page.getByText(distance, { exact: true }).first().evaluate((el) => (el as HTMLElement).click());
  await page.waitForTimeout(500);

  // Select conditions pill
  await page.getByText(conditions, { exact: true }).evaluate((el) => (el as HTMLElement).click());
  await page.waitForTimeout(300);

  // Click Build My Pack — opens the naming modal
  await page.getByText('Build My Pack', { exact: true }).evaluate((el) => (el as HTMLElement).click());
  await page.waitForTimeout(500);

  // Naming modal: optionally change the name
  if (planName) {
    const nameInput = page.getByPlaceholder('e.g. Western States 100');
    await nameInput.clear();
    await nameInput.fill(planName);
  }

  // Submit the modal to navigate to plan view
  await page.getByText('Create Plan', { exact: true }).evaluate((el) => (el as HTMLElement).click());
  await page.waitForTimeout(2000);
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
