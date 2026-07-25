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

// dispatchEvent('click') reaches React handlers even under overlays
const tap = async (selector, name) => {
  const loc = page.locator(selector).first();
  if (await loc.count().catch(() => 0)) {
    await loc.dispatchEvent('click').catch((e) =>
      console.log(`TAP FAIL ${name}:`, e.message.split('\n')[0])
    );
    console.log(`TAP ${name}`);
    return true;
  }
  return false;
};

const gone = async (selector) =>
  (await page.locator(selector).count().catch(() => 0)) === 0;

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

  // ---- Onboarding quiz: Skip until quiz screens are gone ----
  for (let i = 0; i < 6; i++) {
    const quizSkip = 'button:text-is("Skip")';
    if (await gone(quizSkip)) break;
    await tap(quizSkip, `quiz-skip-${i + 1}`);
    await page.waitForTimeout(2000);
  }

  // ---- Manual modal: scoped dismiss ----
  const modalSkip =
    'div:has(h2:has-text("Welcome to VoltForge")) button:has-text("Skip")';
  for (let i = 0; i < 3; i++) {
    if (await gone(modalSkip)) break;
    await tap(modalSkip, 'manual-modal-skip');
    await page.waitForTimeout(1500);
  }
  console.log('MANUAL MODAL gone:', await gone(modalSkip));

  // ---- Tutorial coach marks ----
  await tap('button:has-text("Got it")', 'tutorial-gotit');
  await page.waitForTimeout(1200);
  await tap('button:has-text("Skip tutorial")', 'tutorial-skip');
  await page.waitForTimeout(1500);
  console.log('TUTORIAL gone:', await gone('button:has-text("Skip tutorial")'));

  // ---- Open AI view ----
  await tap('button:has-text("✦AI")', 'nav-AI');

  // ---- Prompt (matches AIView and FloatingAIWidget placeholders) ----
  const box = page.locator('input[placeholder*="about your circuit"]').first();
  try {
    await box.waitFor({ state: 'visible', timeout: 15000 });
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

  // ---- Show circuit, run sim ----
  const dismissGuide = async (tag) => {
    for (let i = 0; i < 3; i++) {
      if (!(await tap('button:has-text("Got it")', tag + '-gotit'))) break;
      await page.waitForTimeout(1200);
    }
  };
  await tap('button:has-text("CANVAS")', 'nav-canvas');
  await page.waitForTimeout(2000);
  await dismissGuide('canvas-guide');
  await page.waitForTimeout(5000);
  await tap('button:has-text("SIM")', 'nav-sim');
  await page.waitForTimeout(1500);
  await dismissGuide('sim-guide');
  await tap('button:has-text("Run")', 'sim-run');
  await tap('button:has-text("Start")', 'sim-start');
  console.log('SIM: holding 15s');
  await page.waitForTimeout(15000);
} catch (e) {
  console.log('FATAL:', e.message);
} finally {
  await context.close();
  await browser.close();
  console.log('recording flushed');
}
