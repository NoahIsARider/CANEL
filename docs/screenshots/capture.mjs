/**
 * Screenshot capture for the README.
 *
 * Prerequisites:
 *   pnpm install          # app deps
 *   pnpm build            # produce dist/ + dist-server/
 *   COZE_PROJECT_ENV=PROD PORT=5199 node dist-server/server.js &
 *   npx playwright install chromium
 *
 * Run:
 *   node docs/screenshots/capture.mjs
 *
 * Env overrides: BASE_URL (default http://127.0.0.1:5199),
 * PLAYWRIGHT_MODULE (default "playwright"), CHROME_PATH (executable path override).
 */
import { mkdir } from 'fs/promises';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const OUT = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE_URL || 'http://127.0.0.1:5199';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const errors = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text()}`);
});

const shot = async (name) => {
  const file = resolve(OUT, `${name}.png`);
  await page.screenshot({ path: file });
  console.log('shot ->', file);
};

// 1) Login (demo sign-in notice)
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForSelector('text=Connect · Assemble · Navigate');
await shot('login');

// 2) Sign in -> template market
await page.fill('input[type=email]', 'noah@canel.dev');
await page.getByRole('button', { name: 'Continue', exact: true }).click();
await page.waitForSelector('text=Choose a template to get started');
await shot('template-market');

// 3) "Use Template" -> populated dashboard
await page.getByRole('button', { name: 'Use Template' }).first().click();
await page.waitForSelector('text=CANEL');
await page.waitForTimeout(7000); // let weather + RSS settle
await shot('dashboard');

// 4) Add a Note card, type Markdown (including hostile HTML), verify rendering
await page.getByRole('button', { name: 'Add Card' }).click();
await page.getByRole('button', { name: 'Note', exact: true }).click();
await page.waitForSelector('text=Configure Card');
await page.fill('input[placeholder="Card title"]', 'Weekly Notes');
await page.getByRole('button', { name: 'Save', exact: true }).click();
await page.waitForSelector('.note-markdown');
await page.click('.note-markdown');
await page.fill(
  'textarea[placeholder="Write your note in Markdown..."]',
  [
    '# Weekly Review',
    '',
    'Shipped **CANEL** with the review fixes applied.',
    '',
    '- [x] dev middleware',
    '- [ ] docs',
    '',
    '> Sanitized by whitelist, not by hope.',
    '',
    '<img src=x onerror="window.__xss=1">',
    '<script>window.__xss=1</script>',
    '',
    '`inline code` and [a link](https://example.com).',
  ].join('\n')
);
await page.click('h1, header');
await page.waitForTimeout(600);
await shot('note-card-markdown');

const audit = await page.evaluate(() => {
  const el = document.querySelector('.note-markdown');
  return {
    xssFired: Boolean(window.__xss),
    hasScript: Boolean(el && el.querySelector('script')),
    hasImg: Boolean(el && el.querySelector('img')),
    hasOnerror: Boolean(el && el.innerHTML.includes('onerror')),
    linkRel: el?.querySelector('a')?.getAttribute('rel') ?? null,
  };
});
console.log('sanitizer audit:', audit);

// 5) Add Card panel
await page.getByRole('button', { name: 'Add Card' }).click();
await page.waitForSelector('text=Add Card');
await shot('add-card');

await browser.close();

if (errors.length) {
  console.error('page errors:', errors);
  process.exitCode = 1;
} else {
  console.log('no page errors');
}
