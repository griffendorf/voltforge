import { chromium } from 'playwright';

// Records a DemoPlayer timeline (?demo=<name>) with no login/onboarding in the clip.
// Pass 1 (not recorded): log in + clear onboarding, save storage state.
// Pass 2 (recorded): load /?demo=<name> with that state, hold DEMO_SECONDS.
const URL = (process.env.DEMO_URL || 'https://www.voltforgeai.com').replace(/\/$/, '');
const EMAIL = process.env.DEMO_EMAIL || '';
const PASS = process.env.DEMO_PASSWORD || '';
const DEMO = process.env.DEMO_NAME || '555-blinker';
const SECONDS = parseInt(process.env.DEMO_SECONDS || '45', 10);
const PHONE = (process.env.DEMO_VIEW || 'phone') === 'phone';

const size = PHONE ? { width: 390, height: 844 } : { width: 1280, height: 720 };
const ua = PHONE
  ? 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'
  : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const base = { viewport: size, userAgent: ua, isMobile: PHONE, hasTouch: PHONE, deviceScaleFactor: 1 };

const browser = await chromium.launch();

const mkTap = (page) => async (selector, name) => {
  const loc = page.locator(selector).first();
  if (await loc.count().catch(() => 0)) {
    await loc.dispatchEvent('click').catch((e) => console.log(`TAP FAIL ${name}:`, e.message.split('\n')[0]));
    console.log(`TAP ${name}`);
    return true;
  }
  return false;
};
const mkGone = (page) => async (sel) => (await page.locator(sel).count().catch(() => 0)) === 0;

const clearOverlays = async (page, tag) => {
  const tap = mkTap(page), gone = mkGone(page);
  for (let i = 0; i < 6; i++) {
    if (await gone('button:text-is("Skip")')) break;
    await tap('button:text-is("Skip")', `${tag}-quiz-skip-${i + 1}`);
    await page.waitForTimeout(1500);
  }
  const modalSkip = 'div:has(h2:has-text("Welcome to VoltForge")) button:has-text("Skip")';
  for (let i = 0; i < 3; i++) {
    if (await gone(modalSkip)) break;
    await tap(modalSkip, `${tag}-manual-skip`);
    await page.waitForTimeout(1200);
  }
  await tap('button:has-text("Skip tutorial")', `${tag}-tutorial-skip`);
  for (let i = 0; i < 3; i++) {
    if (await gone('button:has-text("Got it")')) break;
    await tap('button:has-text("Got it")', `${tag}-gotit`);
    await page.waitForTimeout(800);
  }
};

let state;
try {
  // ---- Pass 1: login, not recorded ----
  const ctx1 = await browser.newContext(base);
  const p1 = await ctx1.newPage();
  await p1.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p1.waitForTimeout(2500);
  if (EMAIL && PASS) {
    try {
      await p1.fill('input[type="email"]', EMAIL, { timeout: 8000 });
      await p1.fill('input[type="password"]', PASS, { timeout: 8000 });
      await p1.click('button:has-text("Continue")', { timeout: 8000 });
      console.log('LOGIN: submitted');
    } catch { console.log('LOGIN: form not shown'); }
    await p1.waitForTimeout(3500);
  } else console.log('LOGIN: no creds, skipping');
  await clearOverlays(p1, 'p1');
  await p1.waitForTimeout(1500);
  state = await ctx1.storageState();
  await ctx1.close();
  console.log('STATE saved: origins', state.origins.length, 'cookies', state.cookies.length);

  // ---- Pass 2: recorded ----
  const ctx2 = await browser.newContext({ ...base, storageState: state, recordVideo: { dir: 'videos', size } });
  const p2 = await ctx2.newPage();
  const demoUrl = `${URL}/?demo=${encodeURIComponent(DEMO)}`;
  console.log('DEMO URL:', demoUrl);
  await p2.goto(demoUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p2.waitForTimeout(1500);
  await clearOverlays(p2, 'p2');
  const btns = await p2.evaluate(() => Array.from(document.querySelectorAll('button')).map((b) => (b.textContent || '').trim().slice(0, 25)));
  console.log('BUTTONS:', JSON.stringify(btns.slice(0, 30)));
  console.log(`HOLDING ${SECONDS}s for timeline`);
  await p2.waitForTimeout(SECONDS * 1000);
  await p2.screenshot({ path: 'videos/last-frame.png' });
  await ctx2.close();
} catch (e) {
  console.log('FATAL:', e.message);
  process.exitCode = 1;
} finally {
  await browser.close();
  console.log('recording flushed');
}
