import { chromium } from 'playwright';
const [out, w='1440', h='900'] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errs=[]; p.on('pageerror', e=>errs.push(e.message));
await p.goto('http://localhost:4391/', { waitUntil: 'networkidle' });
const tops = await p.evaluate(() => [...document.querySelectorAll('[data-ind-paso]')].map(e => e.getBoundingClientRect().top + scrollY + e.offsetHeight/2));
let i=0;
for (const t of tops) { await p.evaluate(y => window.scrollTo(0, y), t - (+h)/2); await p.waitForTimeout(1300); await p.screenshot({ path: `${out}_${i++}.png` }); }
console.log(errs);
await b.close();
