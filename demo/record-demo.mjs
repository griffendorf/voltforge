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
    await loc.click({ force: true, timeout: 5000 }).catch((e) =>
      console.log(`CLICK FAIL "${text}":`, e.message.split('\n')[0])
    );
    console.log(`CLICKED "${text}"`);
    return true;
  }
  return false;
};

const listInputs = async (tag) => {
  const ins = await page.evaluate(() =>
    Array.from(document.querySelectorAll('input,textarea')).map((el) => ({
      t: el.getAttribute('type') || el.tagName.toLowerCase(),
      ph: el.getAttribute('placeholder') || '',
    }))
  );
  console.log(tag, JSON.stringify(ins));
  return ins;
};

try {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2500);

  // ---- Login ----
  try {
    await page.fill('input[type="email"]', EMAIL, { timeout: 8000 });
    await page.fill('input[type="password"]', PASS, { timeout: 8000 });
    await page.click('button:has-text("Continue")', { timeout: 8000 });
    console.log('LOGIN: submitted');
  } catch {
    console.log('LOGIN: form not shown (already in?)');
  }
  await page.waitForTimeout(3000);

  // ---- Onboarding survey (Skip) ----
  for (let i = 0; i < 4; i++) {
    if (!(await clickIf('Skip', { timeout: 2000 }))) break;
    await page.waitForTimeout(2000);
  }

  // ---- Tutorial dismiss ----
  await clickIf('Got it');
  await page.waitForTimeout(1500);
  await clickIf('Skip tutorial');
  await page.waitForTimeout(2000);

  // ---- Open Volt-AI ----
  const opened =
    (await clickIf('Volt·AI')) || (await clickIf('AI', { timeout: 3000 }));
  console.log('AI OPENED:', opened);
  await page.waitForTimeout(2500);

  // ---- Find prompt box and submit ----
  await listInputs('AI-INPUTS');
  let box = page.locator('textarea').first();
  if (!(await box.isVisible({ timeout: 3000 }).catch(() => false))) {
    box = page.locator('input[type="text"], input:not([type])').first();
  }
  if (await box.isVisible({ timeout: 3000 }).catch(() => false)) {
    await box.click({ force: true });
    await box.fill(PROMPT);
    console.log('PROMPT: filled');
    let sent = false;
    for (const t of ['Build', 'Send', 'Ask', 'Go', 'Generate', '⚡', '→']) {
      if (await clickIf(t, { timeout: 1500 })) { sent = true; break; }
    }
    if (!sent) { await box.press('Enter'); console.log('PROMPT: sent via Enter'); }
    console.log('PROMPT: submitted, waiting for AI build...');
    await page.waitForTimeout(45000);
  } else {
    console.log('PROMPT BOX NOT FOUND');
  }

  // ---- Run simulation, hold for the money shot ----
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
