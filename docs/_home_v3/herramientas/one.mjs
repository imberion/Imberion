import { chromium } from 'playwright';
const [sel, out, w='1440', h='900'] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto('http://localhost:4391/', { waitUntil: 'networkidle' });
await p.evaluate(s => { const el=document.querySelector(s); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 60); }, sel);
await p.waitForTimeout(2200);
await p.screenshot({ path: out });
await b.close();
