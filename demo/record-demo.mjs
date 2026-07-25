import { chromium } from 'playwright';

const URL = process.env.DEMO_URL || 'https://www.voltforgeai.com';
const EMAIL = process.env.DEMO_EMAIL || '';
const PASS = process.env.DEMO_PASSWORD || '';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  recordVideo: { dir: 'videos', size: { width: 1280, height: 720 } },
});
const page = await context.newPage();

const canvasCount = () =>
  page.evaluate(() => document.querySelectorAll('canvas').length).catch(() => 0);

try {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2500);

  // ---- Login ----
  try {
    await page.fill('input[type="email"]', EMAIL, { timeout: 10000 });
    await page.fill('input[type="password"]', PASS, { timeout: 10000 });
    await page.click('button:has-text("Continue")', { timeout: 10000 });
    console.log('LOGIN: submitted');
  } catch (e) {
    console.log('LOGIN: form not found (maybe already in?):', e.message.split('\n')[0]);
  }
  await page.waitForTimeout(3000);

  // ---- Onboarding / tutorial skip loop ----
  for (let i = 0; i < 8; i++) {
    const n = await canvasCount();
    const skip = page.locator('button:has-text("Skip")').first();
    const skipVisible = await skip.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`ROUND ${i + 1}: canvases=${n} skipVisible=${skipVisible}`);
    if (n > 0 && !skipVisible) {
      console.log('IN EDITOR (canvas present, no overlays)');
      break;
    }
    if (skipVisible) {
      try {
        await skip.click({ force: true, timeout: 5000 });
        console.log(`ROUND ${i + 1}: force-clicked Skip`);
      } catch (e) {
        console.log(`ROUND ${i + 1}: click failed, pressing Escape`);
        await page.keyboard.press('Escape').catch(() => {});
      }
    }
    await page.waitForTimeout(2500);
  }

  // ---- Inventory editor DOM ----
  await page.waitForTimeout(2000);
  const inv = await page.evaluate(() => {
    const q = (sel) => Array.from(document.querySelectorAll(sel));
    const label = (el) =>
      (el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || '')
        .trim()
        .slice(0, 40);
    const cls = (el) => {
      const c = el.getAttribute('class') || '';
      return el.id ? '#' + el.id : c ? '.' + c.slice(0, 40) : el.tagName;
    };
    return {
      canvasCount: q('canvas').length,
      inputs: q('input,textarea').map((el) => ({
        t: el.getAttribute('type') || el.tagName.toLowerCase(),
        ph: el.getAttribute('placeholder') || '',
        al: el.getAttribute('aria-label') || '',
      })),
      buttons: q('button,[role=button]').map(label).filter(Boolean).slice(0, 60),
      voltish: q(
        '[class*="volt" i],[id*="volt" i],[class*="assistant" i],[class*="widget" i],[class*="prompt" i],[class*="chat" i],[class*="float" i]'
      )
        .map(cls)
        .slice(0, 30),
    };
  });
  console.log('INV ' + JSON.stringify(inv));

  await page.waitForTimeout(4000);
} catch (e) {
  console.log('FATAL:', e.message);
} finally {
  await context.close(); // always flush the video
  await browser.close();
  console.log('recording flushed');
}
