/**
 * Takes store screenshots of the eatMyPack web app at phone dimensions.
 * Run with: node scripts/take-screenshots.mjs
 */
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'assets', 'screenshots');

const WIDTH = 390;
const HEIGHT = 844; // iPhone 14 Pro ratio ≈ 9:19.5
const DEVICE_SCALE = 3; // 390*3 = 1170px — over 1080 min for promotions

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
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // Ensure output dir exists
  const fs = await import('fs');
  if (!fs.default.existsSync(OUT_DIR)) {
    fs.default.mkdirSync(OUT_DIR, { recursive: true });
  }

  for (const screen of SCREENS) {
    console.log(`Capturing: ${screen.name}`);
    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: DEVICE_SCALE });

    await page.goto(screen.url, { waitUntil: 'domcontentloaded', timeout: 15000 });

    if (screen.setup) {
      await screen.setup(page);
    }

    await sleep(screen.delay);

    const outPath = path.join(OUT_DIR, `${screen.name}.png`);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`  Saved: ${outPath} (${WIDTH * DEVICE_SCALE}x${HEIGHT * DEVICE_SCALE})`);

    await page.close();
  }

  await browser.close();
  console.log('Done!');
})();
