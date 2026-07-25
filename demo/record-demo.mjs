import { chromium } from 'playwright';

const URL = 'https://www.voltforgeai.com';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: 'videos', size: { width: 1280, height: 720 } },
});
const page = await context.newPage();

console.log('Loading', URL);
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(10000);

await context.close();   // closing the context flushes the .webm
await browser.close();
console.log('Recording complete -> demo/videos/');
