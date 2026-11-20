/**
 * Screenshots every section (plus the door intro and its opening state)
 * at phone and desktop sizes, for visual QA.
 *
 *   npm run build && npm run preview      # in one terminal
 *   npm run screenshots                   # in another
 *
 * Options (env): URL (default http://localhost:4173/), OUT (default
 * screenshots/), CHROME_PATH (use an already-installed Chromium instead of
 * Playwright's own, e.g. /opt/pw-browsers/chromium).
 */
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const URL = process.env.URL || 'http://localhost:4173/';
const OUT = process.env.OUT || 'screenshots';
const SIZES = [
  [390, 844],
  [1440, 900],
];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});

for (const [width, height] of SIZES) {
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const name = (n, id) => `${OUT}/${width}-${String(n).padStart(2, '0')}-${id}.png`;

  if (await page.$('.doors')) {
    await page.screenshot({ path: name(0, 'doors') });
    await page.click('.doors__open');
    await page.waitForTimeout(650);
    await page.screenshot({ path: name(1, 'doors-opening') });
    await page.waitForTimeout(1800);
  }
  await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });

  const sections = await page.evaluate(() =>
    [...document.querySelectorAll('main > section, main > footer')].map((el, i) => {
      const r = el.getBoundingClientRect();
      return { id: el.id || el.className.split(' ')[0] || `section-${i}`, top: r.top + scrollY, height: r.height };
    }),
  );
  let n = 2;
  for (const s of sections) {
    const shots = Math.min(4, Math.max(1, Math.ceil((s.height - 40) / height)));
    for (let k = 0; k < shots; k++) {
      await page.evaluate((y) => window.scrollTo(0, y), s.top + k * height * 0.92);
      await page.waitForTimeout(1800);
      await page.screenshot({ path: name(n++, shots > 1 ? `${s.id}-${k + 1}` : s.id) });
    }
  }
  const m = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth }));
  console.log(`${width}×${height}: ${n} shots, horizontal overflow: ${m.scrollWidth > m.innerWidth ? 'YES' : 'none'}${errors.length ? `, errors: ${errors.join(' | ')}` : ''}`);
  await page.close();
}
await browser.close();
