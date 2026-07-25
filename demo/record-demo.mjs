import { chromium } from 'playwright';

const URL = process.env.DEMO_URL || 'https://www.voltforgeai.com';
const EMAIL = process.env.DEMO_EMAIL || '';
const PASS = process.env.DEMO_PASSWORD || '';
const PROMPT =
  process.env.DEMO_PROMPT ||
  'Build a 555 timer LED blinker circuit with a 9V battery';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  recordVideo: { dir: 'videos', size: { width: 1280, height: 720 } },
});
const page = await context.newPage();

const clickIf = async (text, opts = {}) => {
  const loc = page.locator(`button:has-text("${text}")`).first();
  if (await loc.isVisible({ timeout: opts.timeout || 2500 }).catch(() => false)) {
    try {
      await loc.click({ timeout: 4000 });
    } catch {
      await loc.click({ force: true, timeout: 4000 }).catch((e) =>
        console.log(`CLICK FAIL "${text}":`, e.message.split('\n')[0])
      );
    }
    console.log(`CLICKED "${text}"`);
    return true;
  }
  return false;
};

try {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2500);

  try {
    await page.fill('input[type="email"]', EMAIL, { timeout: 8000 });
    await page.fill('input[type="password"]', PASS, { timeout: 8000 });
    await page.click('button:has-text("Continue")', { timeout: 8000 });
    console.log('LOGIN: submitted');
  } catch {
    console.log('LOGIN: form not shown (already in?)');
  }
  await page.waitForTimeout(3000);

  for (let i = 0; i < 4; i++) {
    if (!(await clickIf('Skip', { timeout: 2000 }))) break;
    await page.waitForTimeout(2000);
  }

  await clickIf('Got it');
  await page.waitForTimeout(1500);
  await clickIf('Skip tutorial');
  await page.waitForTimeout(2000);

  // ---- Open the AI view via the exact nav button ----
  const opened = await clickIf('✦AI', { timeout: 4000 });
  console.log('AI NAV CLICKED:', opened);

  // ---- Wait for the real prompt input from AIView.jsx ----
  const box = page.locator('input[placeholder*="Ask about"]').first();
  try {
    await box.waitFor({ state: 'visible', timeout: 12000 });
    console.log('PROMPT BOX: visible');
    await box.click();
    await box.fill(PROMPT);
    console.log('PROMPT: filled');
    await box.press('Enter');
    console.log('PROMPT: sent via Enter, waiting for AI build...');
    await page.waitForTimeout(50000);
  } catch (e) {
    console.log('PROMPT BOX NOT FOUND:', e.message.split('\n')[0]);
    const btns = await page.evaluate(() =>
      Array.from(document.querySelectorAll('button')).map((b) =>
        (b.textContent || '').trim().slice(0, 30)
      )
    );
    console.log('BUTTONS NOW:', JSON.stringify(btns.slice(0, 40)));
  }

  // ---- Switch to canvas to show the built circuit, then run sim ----
  await clickIf('CANVAS', { timeout: 3000 });
  await page.waitForTimeout(4000);
  await clickIf('SIM');
  await page.waitForTimeout(1500);
  await clickIf('Run', { timeout: 3000 });
  await clickIf('Start', { timeout: 2000 });
  console.log('SIM: holding 15s');
  await page.waitForTimeout(15000);
} catch (e) {
  console.log('FATAL:', e.message);
} finally {
  await context.close();
  await browser.close();
  console.log('recording flushed');
}
