/**
 * Takes store screenshots of the eatMyPack web app.
 * Run with: node scripts/take-screenshots.mjs
 * Requires the Expo web server running on port 8082: npm run web
 *
 * Output sizes:
 *   ios-67  — 1290×2796  (iPhone 14 Pro Max, required for App Store 6.7")
 *   ios-55  — 1242×2208  (iPhone 8 Plus, required for App Store 5.5")
 *   android — 1080×2400  (Pixel 7, satisfies Play Store 1080×1920 min)
 */
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'assets', 'screenshots');

const DEVICES = [
  { dir: 'ios-67',  width: 430, height: 932,  scale: 3 },  // 1290×2796
  { dir: 'ios-55',  width: 414, height: 736,  scale: 3 },  // 1242×2208
  { dir: 'android', width: 360, height: 800,  scale: 3 },  // 1080×2400
];

const BASE_URL = 'http://localhost:8082';

// Seed plans shown on the home screen
const SEED_PLANS = [
  {
    id: 'seed-plan-jigger-100',
    name: 'Jigger Johnson 100',
    created_at: '2026-04-20T08:00:00.000Z',
    race_date: '2026-09-12',
    race_config: {
      distance: '100mi',
      expected_duration_hours: 26,
      conditions: 'moderate',
    },
    phases: [],
    total_calories: 9200,
    total_weight_g: 1850,
    total_volume_ml: 3200,
    total_items: 48,
    rejected_food_ids: [],
    pinned_food_ids: [],
  },
  {
    id: 'seed-plan-seven-sisters',
    name: 'Seven Sisters Race',
    created_at: '2026-04-15T10:00:00.000Z',
    race_date: '2026-08-03',
    race_config: {
      distance: '50K',
      expected_duration_hours: 8,
      conditions: 'cool',
    },
    phases: [],
    total_calories: 2400,
    total_weight_g: 580,
    total_volume_ml: 1200,
    total_items: 18,
    rejected_food_ids: [],
    pinned_food_ids: [],
  },
];

// Pantry: variety of gels, bars, chews, real food, freeze-dried, nut butters
const SEED_PANTRY = [
  'gu-original-gel',
  'maurten-gel-100',
  'huma-chia-gel',
  'clif-bar',
  'rxbar',
  'honey-stinger-waffle',
  'clif-bloks',
  'honey-stinger-chews',
  'rice-cakes-homemade',
  'trail-mix-1oz',
  'peanut-butter-packet',
  'mh-mac-and-cheese',
];

const SCREENS = [
  {
    name: 'onboarding',
    url: `${BASE_URL}/onboarding`,
    clearOnboardingFlag: true, // temporarily remove so onboarding screen renders
    delay: 1500,
  },
  {
    name: 'home',
    url: `${BASE_URL}/`,
    delay: 3000,
  },
  {
    name: 'race-setup',
    url: `${BASE_URL}/race/setup`,
    delay: 3000,
  },
  {
    name: 'food-database',
    url: `${BASE_URL}/database`,
    delay: 2000,
  },
];

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function seedStorage(page, plans, pantry) {
  await page.evaluate((p, pt) => {
    localStorage.setItem('hasSeenOnboarding_v1', 'true');
    localStorage.setItem('@eatmypack:saved_plans', JSON.stringify(p));
    localStorage.setItem('@eatmypack:pantry_food_ids', JSON.stringify(pt));
  }, plans, pantry);
}

(async () => {
  const fs = await import('fs');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  for (const device of DEVICES) {
    const deviceDir = path.join(OUT_DIR, device.dir);
    if (!fs.default.existsSync(deviceDir)) {
      fs.default.mkdirSync(deviceDir, { recursive: true });
    }

    // One page per device so localStorage persists across screen navigations
    const page = await browser.newPage();
    await page.setViewport({
      width: device.width,
      height: device.height,
      deviceScaleFactor: device.scale,
    });

    // Navigate to a non-redirecting page first to establish the origin,
    // then seed localStorage before visiting any screen that checks onboarding.
    await page.goto(`${BASE_URL}/race/setup`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await seedStorage(page, SEED_PLANS, SEED_PANTRY);

    for (const screen of SCREENS) {
      console.log(`[${device.dir}] Capturing: ${screen.name}`);

      if (screen.clearOnboardingFlag) {
        await page.evaluate(() => localStorage.removeItem('hasSeenOnboarding_v1'));
      }

      await page.goto(screen.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await sleep(screen.delay);

      const outPath = path.join(deviceDir, `${screen.name}.png`);
      await page.screenshot({ path: outPath, fullPage: false });
      const pw = device.width * device.scale;
      const ph = device.height * device.scale;
      console.log(`  Saved: ${outPath} (${pw}×${ph})`);

      // Restore the flag after onboarding so subsequent screens don't redirect
      if (screen.clearOnboardingFlag) {
        await page.evaluate(() => localStorage.setItem('hasSeenOnboarding_v1', 'true'));
      }
    }

    await page.close();
  }

  await browser.close();
  console.log('\nDone! Screenshot sizes:');
  for (const d of DEVICES) {
    console.log(`  ${d.dir}: ${d.width * d.scale}×${d.height * d.scale}px`);
  }
})();
