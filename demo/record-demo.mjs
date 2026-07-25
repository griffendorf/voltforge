import { chromium } from 'playwright';

const URL = process.env.DEMO_URL || 'https://www.voltforgeai.com';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  recordVideo: { dir: 'videos', size: { width: 1280, height: 720 } },
});
const page = await context.newPage();

await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page
  .waitForLoadState('networkidle', { timeout: 15000 })
  .catch(() => console.log('NOTE: networkidle timed out (ok for PWA)'));
await page.waitForTimeout(4000);

const inv = await page.evaluate(() => {
  const q = (sel) => Array.from(document.querySelectorAll(sel));
  const label = (el) =>
    (el.getAttribute('aria-label') ||
      el.getAttribute('title') ||
      el.textContent ||
      '')
      .trim()
      .slice(0, 40);
  const cls = (el) => {
    const c = el.getAttribute('class') || '';
    return el.id ? '#' + el.id : c ? '.' + c.slice(0, 40) : el.tagName;
  };
  return {
    title: document.title,
    url: location.href,
    hasPassword: !!document.querySelector('input[type="password"]'),
    storageKeys: Object.keys(localStorage),
    canvasCount: q('canvas').length,
    inputs: q('input,textarea').map((el) => ({
      t: el.getAttribute('type') || el.tagName.toLowerCase(),
      ph: el.getAttribute('placeholder') || '',
      al: el.getAttribute('aria-label') || '',
    })),
    buttons: q('button,[role=button]').map(label).filter(Boolean).slice(0, 40),
    voltish: q(
      '[class*="volt" i],[id*="volt" i],[class*="assistant" i],[class*="widget" i],[class*="prompt" i],[class*="chat" i]'
    )
      .map(cls)
      .slice(0, 25),
  };
});

console.log('INV ' + JSON.stringify(inv));

await page.waitForTimeout(2000);
await context.close();
await browser.close();
console.log('probe done');
