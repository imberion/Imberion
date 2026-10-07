import { chromium } from 'playwright';
const [out, w='1440', h='900'] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto('http://localhost:4391/', { waitUntil: 'networkidle' });
const r = await p.evaluate(() => { const w=document.querySelector('[data-film-wrap]'); return {top: w.getBoundingClientRect().top + scrollY, h: w.offsetHeight, fh: document.querySelector('[data-film-fijo]').offsetHeight}; });
console.log(JSON.stringify(r));
let i=0;
for (const q of [-0.6, 0, 0.33, 0.66, 1]) {
  const y = r.top - 80 + q * (r.h - r.fh) + (q<0 ? q*(+h) : 0);
  await p.evaluate(y => window.scrollTo(0, y), y);
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${out}_${i++}.png` });
}
await b.close();
