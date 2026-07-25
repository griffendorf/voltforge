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

if (!EMAIL || !PASS) console.log('WARN: DEMO_EMAIL / DEMO_PASSWORD not set as secrets');

await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(2500);

// ---- Login ----
try {
  await page.fill('input[type="email"]', EMAIL, { timeout: 10000 });
  await page.fill('input[type="password"]', PASS, { timeout: 10000 });
  await page.click('button:has-text("Continue")', { timeout: 10000 });
  console.log('LOGIN: submitted');
  await page.waitForSelector('canvas', { timeout: 25000 });
  console.log('LOGIN: canvas appeared -> SUCCESS');
} catch (e) {
  console.log('LOGIN ERROR:', e.message);
  const err = await page
    .evaluate(() => (document.body ? document.body.innerText.slice(0, 200) : ''))
    .catch(() => '');
  console.log('PAGE TEXT:', err.replace(/\s+/g, ' '));
}

await page.waitForTimeout(3500);

// ---- Inventory the (now authenticated) editor DOM ----
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
    url: location.href,
    canvasCount: q('canvas').length,
    inputs: q('input,textarea').map((el) => ({
      t: el.getAttribute('type') || el.tagName.toLowerCase(),
      ph: el.getAttribute('placeholder') || '',
      al: el.getAttribute('aria-label') || '',
    })),
    buttons: q('button,[role=button]').map(label).filter(Boolean).slice(0, 50),
    voltish: q(
      '[class*="volt" i],[id*="volt" i],[class*="assistant" i],[class*="widget" i],[class*="prompt" i],[class*="chat" i],[class*="float" i]'
    )
      .map(cls)
      .slice(0, 30),
  };
});
console.log('INV ' + JSON.stringify(inv));

await page.waitForTimeout(2000);
await context.close();
await browser.close();
console.log('probe done');
