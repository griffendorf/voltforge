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

// Log every top-level document response (catches redirects/challenges)
page.on('response', (r) => {
  if (r.request().resourceType() === 'document') {
    console.log('DOC', r.status(), r.url());
  }
});

console.log('Loading', URL);
let resp;
try {
  resp = await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  console.log('GOTO STATUS:', resp ? resp.status() : '(none)');
  if (resp) {
    const h = resp.headers();
    console.log('SERVER   :', h['server'] || '(none)');
    console.log('CF-RAY   :', h['cf-ray'] || '(none)');
    console.log('CF-MITIG :', h['cf-mitigated'] || '(none)');
    console.log('WWW-AUTH :', h['www-authenticate'] || '(none)');
    console.log('LOCATION :', h['location'] || '(none)');
  }
} catch (e) {
  console.log('GOTO ERROR:', e.message);
}

const title = await page.title().catch(() => '(no title)');
console.log('PAGE TITLE:', title);
const bodyLen = await page
  .evaluate(() => (document.body ? document.body.innerText.length : -1))
  .catch(() => -2);
console.log('BODY TEXT LENGTH:', bodyLen);

await page.waitForTimeout(10000); // keep recording so the .webm shows the real page
await context.close();
await browser.close();
console.log('Recording complete -> demo/videos/');
