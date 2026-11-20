// Скриншот страницы: node scripts/shoot.mjs <url> <out.jpg> [width=1440] [full=1]
// Нужен Playwright: путь к пакету можно задать в PW_PATH, иначе ищется установленный `playwright`.
// Прокручивает страницу, чтобы сработали анимации появления, печатает ошибки консоли и горизонтальный скролл.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const candidates = [process.env.PW_PATH, 'playwright', `${process.env.HOME}/.local/lib/playwright-mcp/node_modules/playwright`].filter(Boolean);
let chromium;
for (const c of candidates) { try { ({ chromium } = require(c)); break; } catch {} }
if (!chromium) { console.error('Не найден Playwright: npm i -D playwright && npx playwright install chromium, или укажите путь в PW_PATH'); process.exit(1); }
const [, , url, out, w = '1440', full = '1'] = process.argv;
const width = Number(w);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 }, isMobile: width < 600, hasTouch: width < 600, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
await page.evaluate(async () => {
  for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.6) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 250)); }
  scrollTo(0, 0); await new Promise((r) => setTimeout(r, 800));
});
const info = await page.evaluate(() => ({
  height: document.documentElement.scrollHeight,
  hScroll: document.documentElement.scrollWidth > innerWidth,
  invisible: [...document.querySelectorAll('section *')].filter((e) => getComputedStyle(e).opacity === '0' && e.getBoundingClientRect().height > 20).length,
}));
await page.screenshot({ path: out, type: 'jpeg', quality: 70, fullPage: full === '1' });
console.log(JSON.stringify({ ...info, errors }));
await browser.close();
