import { chromium } from 'playwright';
const [prefix, w='1440', h='900'] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errs=[]; p.on('pageerror', e=>errs.push(e.message)); p.on('console', m=>{ if(m.type()==='error') errs.push(m.text()); });
await p.goto('http://localhost:4391/', { waitUntil: 'networkidle' });
await p.waitForTimeout(1200);
const apH = await p.evaluate(() => document.querySelector('[data-ap]').offsetHeight - innerHeight);
let i=0;
for (const q of [0, 0.28, 0.5, 0.62, 0.8, 0.99]) {
  await p.evaluate(y => window.scrollTo(0, y), Math.round(q*apH));
  await p.waitForTimeout(1300);
  await p.screenshot({ path: `${prefix}_ap${i++}.png` });
}
const H = await p.evaluate(() => document.documentElement.scrollHeight);
let k=0;
for (let y = apH + +h; y < H; y += Math.round(+h*0.9)) {
  await p.evaluate(y => window.scrollTo(0, y), y);
  await p.waitForTimeout(700);
  await p.screenshot({ path: `${prefix}_s${String(k++).padStart(2,'0')}.png` });
}
console.log('H', H, 'apH', apH, 'shots', k, 'errs', JSON.stringify(errs));
await b.close();
