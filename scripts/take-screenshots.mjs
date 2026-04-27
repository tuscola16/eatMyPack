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

const SCREENS = [
  {
    name: 'onboarding',
    url: `${BASE_URL}/onboarding`,
    setup: null,
    delay: 1500,
  },
  {
    name: 'home',
    url: `${BASE_URL}/`,
    setup: async (page) => {
      await page.evaluate(() => {
        localStorage.setItem('@AsyncStorage:hasSeenOnboarding_v1', 'true');
      });
      await page.reload({ waitUntil: 'domcontentloaded' });
    },
    delay: 3000,
  },
  {
    name: 'race-setup',
    url: `${BASE_URL}/race/setup`,
    setup: async (page) => {
      await page.evaluate(() => {
        localStorage.setItem('@AsyncStorage:hasSeenOnboarding_v1', 'true');
      });
      await page.reload({ waitUntil: 'domcontentloaded' });
    },
    delay: 3000,
  },
  {
    name: 'food-database',
    url: `${BASE_URL}/database`,
    setup: async (page) => {
      await page.evaluate(() => {
        localStorage.setItem('@AsyncStorage:hasSeenOnboarding_v1', 'true');
      });
      await page.reload({ waitUntil: 'domcontentloaded' });
    },
    delay: 2000,
  },
];

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
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

    for (const screen of SCREENS) {
      console.log(`[${device.dir}] Capturing: ${screen.name}`);
      const page = await browser.newPage();
      await page.setViewport({
        width: device.width,
        height: device.height,
        deviceScaleFactor: device.scale,
      });

      await page.goto(screen.url, { waitUntil: 'domcontentloaded', timeout: 15000 });

      if (screen.setup) {
        await screen.setup(page);
      }

      await sleep(screen.delay);

      const outPath = path.join(deviceDir, `${screen.name}.png`);
      await page.screenshot({ path: outPath, fullPage: false });
      const pw = device.width * device.scale;
      const ph = device.height * device.scale;
      console.log(`  Saved: ${outPath} (${pw}×${ph})`);

      await page.close();
    }
  }

  await browser.close();
  console.log('\nDone! Screenshot sizes:');
  for (const d of DEVICES) {
    console.log(`  ${d.dir}: ${d.width * d.scale}×${d.height * d.scale}px`);
  }
})();
