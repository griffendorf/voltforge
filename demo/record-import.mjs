import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

// Records a REAL Volt·AI import: board photo, then schematic image.
// Pass 1 (not recorded): log in + clear onboarding, save storage state.
// Pass 2 (recorded): PARTS -> Import -> upload -> auto-advance Volt's steps -> canvas -> sim -> views.
// Captions are drawn on-page and logged to videos/captions.json for narrate.py.
// Every checkpoint logs the visible buttons ("BUTTONS@...") so selectors can be tuned from the run log.
const URL = (process.env.DEMO_URL || 'https://www.voltforgeai.com').replace(/\/$/, '');
const EMAIL = process.env.DEMO_EMAIL || '';
const PASS = process.env.DEMO_PASSWORD || '';
const PHONE = (process.env.DEMO_VIEW || 'desktop') === 'phone';
const IMAGES = (process.env.DEMO_IMAGES || 'board.jpg,schematic.png').split(',').map((s) => s.trim()).filter(Boolean);
const STEP_MAX = parseInt(process.env.DEMO_STEP_MAX || '150', 10) * 1000; // max wait per import

const size = PHONE ? { width: 390, height: 844 } : { width: 1280, height: 720 };
const ua = PHONE
  ? 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'
  : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const base = { viewport: size, userAgent: ua, isMobile: PHONE, hasTouch: PHONE, deviceScaleFactor: 1 };

const browser = await chromium.launch();
fs.mkdirSync('videos', { recursive: true });

const mkTap = (page) => async (selector, name) => {
  const loc = page.locator(selector).first();
  if (await loc.count().catch(() => 0)) {
    await loc.dispatchEvent('click').catch((e) => console.log(`TAP FAIL ${name}:`, e.message.split('\n')[0]));
    console.log(`TAP ${name}`);
    return true;
  }
  console.log(`TAP MISS ${name} (${selector})`);
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
  if (!(await gone('button:has-text("Skip tutorial")'))) await tap('button:has-text("Skip tutorial")', `${tag}-tutorial-skip`);
  for (let i = 0; i < 3; i++) {
    if (await gone('button:has-text("Got it")')) break;
    await tap('button:has-text("Got it")', `${tag}-gotit`);
    await page.waitForTimeout(800);
  }
};

const visibleButtons = (page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('button, [role="button"]'))
      .filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !b.disabled; })
      .map((b) => (b.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40))
      .filter(Boolean)
  ).catch(() => []);
const pageText = (page) => page.evaluate(() => (document.body.innerText || '').slice(0, 4000)).catch(() => '');
const logButtons = async (page, tag) => console.log(`BUTTONS@${tag}:`, JSON.stringify((await visibleButtons(page)).slice(0, 50)));

let state;
const caps = [];
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
      await p1.locator('button', { hasText: /^\s*(Sign in|Continue|Log in)/ }).first().click({ timeout: 8000 })
        .catch(() => p1.press('input[type="password"]', 'Enter'));
      console.log('LOGIN: submitted');
    } catch { console.log('LOGIN: form not shown'); }
    await p1.waitForTimeout(4000);
  } else console.log('LOGIN: no creds, skipping');
  await clearOverlays(p1, 'p1');
  await p1.waitForTimeout(1500);
  state = await ctx1.storageState();
  await ctx1.close();
  console.log('STATE saved: origins', state.origins.length, 'cookies', state.cookies.length);

  // ---- Pass 2: recorded ----
  const ctx2 = await browser.newContext({ ...base, storageState: state, recordVideo: { dir: 'videos', size } });
  const page = await ctx2.newPage();
  const tap = mkTap(page);
  const t0 = Date.now();

  const caption = async (text, say = '') => {
    const t = (Date.now() - t0) / 1000;
    caps.push({ i: caps.length, t, caption: text, say });
    console.log(`CAP ${caps.length - 1} @${t.toFixed(2)}s ${text}`);
    await page.evaluate((txt) => {
      let el = document.getElementById('__vfcap');
      if (!el) {
        el = document.createElement('div');
        el.id = '__vfcap';
        Object.assign(el.style, {
          position: 'fixed', top: '72px', left: '50%', transform: 'translateX(-50%)', zIndex: 99999,
          padding: '10px 18px', borderRadius: '999px', background: 'rgba(8,12,20,0.88)', color: '#e8f2ff',
          fontSize: '15px', fontWeight: '600', letterSpacing: '0.2px', pointerEvents: 'none',
          boxShadow: '0 4px 24px rgba(0,0,0,0.45)', maxWidth: '86vw', textAlign: 'center',
          fontFamily: 'system-ui, sans-serif', transition: 'opacity .2s',
        });
        document.body.appendChild(el);
      }
      el.textContent = txt;
      el.style.opacity = txt ? '1' : '0';
    }, text).catch(() => {});
  };

  // Show the uploaded image full-screen for a moment so viewers see the input.
  const showImage = async (file, secs) => {
    const b64 = fs.readFileSync(file).toString('base64');
    const mime = file.endsWith('.png') ? 'image/png' : 'image/jpeg';
    await page.evaluate(({ src }) => {
      const o = document.createElement('div');
      o.id = '__vfimg';
      Object.assign(o.style, { position: 'fixed', inset: '0', zIndex: 99998, background: 'rgba(5,8,14,0.94)',
        display: 'flex', alignItems: 'center', justifyContent: 'center' });
      const im = document.createElement('img');
      im.src = src;
      Object.assign(im.style, { maxWidth: '92vw', maxHeight: '78vh', borderRadius: '10px', background: '#fff',
        boxShadow: '0 8px 40px rgba(0,0,0,.6)' });
      o.appendChild(im);
      document.body.appendChild(o);
    }, { src: `data:${mime};base64,${b64}` }).catch(() => {});
    await page.waitForTimeout(secs * 1000);
    await page.evaluate(() => document.getElementById('__vfimg')?.remove()).catch(() => {});
  };

  // Click through Volt's import steps until the circuit lands on the canvas.
  const ADVANCE = /^(analy[sz]e|start|scan|read|import|next|continue|confirm|looks good|accept|approve|apply|build|place|add( all)?( to canvas)?|wire|connect|done|finish|use these|yes)/i;
  const AVOID = /(cancel|retry|back|close|skip|delete|remove|clear|upgrade|plans|sign|google|account|save|share)/i;
  const autoAdvance = async (tag) => {
    const start = Date.now();
    const clicked = new Map();
    let sawParts = false, sawWires = false, lastAct = Date.now(), finished = false;
    while (Date.now() - start < STEP_MAX) {
      const txt = (await pageText(page)).toLowerCase();
      if (!sawParts && /component|parts? (found|detected|identified)|identif/.test(txt)) {
        sawParts = true;
        await caption('Step 1: Volt·AI identifies every component', 'First, Volt A I picks out every component on the board.');
      }
      if (!sawWires && /wire|connection|trace|net(s)? /.test(txt) && sawParts) {
        sawWires = true;
        await caption('Step 2: tracing the wires between them', 'Then it traces the wires that connect them.');
      }
      const btns = await visibleButtons(page);
      const pick = btns.find((b) => ADVANCE.test(b) && !AVOID.test(b) && (clicked.get(b) || 0) < 2);
      if (pick) {
        console.log(`ADVANCE[${tag}] -> "${pick}"`);
        await logButtons(page, `${tag}-before-${pick}`);
        clicked.set(pick, (clicked.get(pick) || 0) + 1);
        await page.locator('button, [role="button"]', { hasText: pick }).first().dispatchEvent('click').catch(() => {});
        lastAct = Date.now();
        if (/build|place|add|done|finish|apply/i.test(pick)) finished = true;
        await page.waitForTimeout(2500);
        continue;
      }
      // after a final-ish click, stop once nothing new appears for 8s
      if (finished && Date.now() - lastAct > 8000) break;
      // no buttons at all for a long time -> import probably auto-placed onto canvas
      if (!finished && Date.now() - lastAct > 45000) break;
      await page.waitForTimeout(1500);
    }
    await logButtons(page, `${tag}-end`);
    await page.screenshot({ path: `videos/step-${tag.replace(/[^a-z0-9]/gi, '_')}.png` }).catch(() => {});
    console.log(`AUTOADVANCE[${tag}] done after ${((Date.now() - start) / 1000).toFixed(0)}s parts=${sawParts} wires=${sawWires}`);
  };

  const openImport = async (tag) => {
    await tap('button:has-text("PARTS")', `${tag}-nav-parts`);
    await page.waitForTimeout(1500);
    await clearOverlays(page, tag);
    const ok = await tap('text=Import from image / PDF', `${tag}-import-btn`);
    await page.waitForTimeout(2000);
    await logButtons(page, `${tag}-import-open`);
    return ok;
  };

  const upload = async (file, tag) => {
    const input = page.locator('input[type="file"][accept*="image"]').first();
    try {
      await input.waitFor({ state: 'attached', timeout: 15000 });
      await input.setInputFiles(file);
      console.log(`UPLOAD[${tag}]: ${file}`);
      return true;
    } catch (e) {
      console.log(`UPLOAD FAIL[${tag}]:`, e.message.split('\n')[0]);
      return false;
    }
  };

  const toCanvas = async (tag) => {
    await tap('button:has-text("CANVAS")', `${tag}-nav-canvas`);
    await page.waitForTimeout(1500);
    for (let i = 0; i < 3; i++) {
      if (await mkGone(page)('button:has-text("Got it")')) break;
      await tap('button:has-text("Got it")', `${tag}-gotit`);
      await page.waitForTimeout(700);
    }
  };

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2500);
  await clearOverlays(page, 'p2');
  await logButtons(page, 'home');

  await caption('Can AI rebuild a circuit from a photo?', 'Can A I rebuild a real circuit, just from a photo? Let’s find out.');
  await page.waitForTimeout(3500);

  const SCRIPT = {
    'board.jpg': {
      intro: ['Photo of a real circuit board', 'Here’s a photo of a real circuit board.'],
      done: ['Rebuilt on the canvas from a photo', 'And there it is, rebuilt on the canvas, from nothing but a photo.'],
    },
    'schematic.png': {
      intro: ['Now a schematic: 555 + CD4017 LED chaser', 'Now a schematic. A 555 timer driving a 4017 counter, chasing five LEDs.'],
      done: ['Schematic → working circuit', 'Every chip, resistor and LED, placed and wired.'],
    },
  };

  for (const img of IMAGES) {
    const file = path.resolve(img);
    if (!fs.existsSync(file)) { console.log('MISSING IMAGE', file); continue; }
    const s = SCRIPT[path.basename(img)] || { intro: ['Importing ' + path.basename(img), ''], done: ['Imported', ''] };
    await caption(s.intro[0], s.intro[1]);
    await showImage(file, 4);
    await openImport(img);
    await caption('Uploading to Volt·AI…', 'Upload it to Volt A I.');
    if (await upload(file, img)) {
      await page.waitForTimeout(1500);
      await logButtons(page, `${img}-uploaded`);
      await autoAdvance(img);
    }
    await toCanvas(img);
    await caption(s.done[0], s.done[1]);
    await page.waitForTimeout(6000);
  }

  // ---- Simulate ----
  await caption('Run the simulation', 'Now let’s run it.');
  await tap('button:has-text("SIM")', 'nav-sim');
  await page.waitForTimeout(1500);
  for (let i = 0; i < 3; i++) {
    if (await mkGone(page)('button:has-text("Got it")')) break;
    await tap('button:has-text("Got it")', 'sim-gotit');
    await page.waitForTimeout(700);
  }
  await logButtons(page, 'sim');
  (await tap('button:has-text("Run")', 'sim-run')) || (await tap('button:has-text("Start")', 'sim-start'));
  await page.waitForTimeout(6000);

  // ---- Views (best effort; logged so names can be tuned) ----
  await toCanvas('views');
  await logButtons(page, 'views');
  await caption('One circuit, four views', 'One circuit. Four views.');
  for (const [label, re] of [['3D', /^3D$/], ['Schematic', /^(SCH|Schematic|SCHEM)/i], ['Breadboard', /^(BB|Breadboard|BREAD)/i], ['2D', /^2D$/]]) {
    const btns = await visibleButtons(page);
    const hit = btns.find((b) => re.test(b));
    if (hit) {
      await page.locator('button, [role="button"]', { hasText: hit }).first().dispatchEvent('click').catch(() => {});
      console.log(`VIEW ${label} -> "${hit}"`);
      await page.waitForTimeout(3500);
    } else console.log(`VIEW MISS ${label}`);
  }

  await caption('Snap it. Simulate it. voltforgeai.com', 'Snap it. Simulate it. Try it free at Volt Forge A I dot com.');
  await page.waitForTimeout(6000);
  await caption('');
  await page.screenshot({ path: 'videos/last-frame.png' });
  await ctx2.close();
  fs.writeFileSync('videos/captions.json', JSON.stringify(caps.filter((c) => c.caption), null, 1));
  console.log('CAPTIONS logged:', caps.length);
} catch (e) {
  console.log('FATAL:', e.message);
  process.exitCode = 1;
} finally {
  await browser.close();
  console.log('recording flushed');
}
