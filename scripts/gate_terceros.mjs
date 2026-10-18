// Gate del invariante 17 del spec: cero firmas de consultoría y cero frameworks de
// terceros nombrados en el sitio. Corre sobre dist/ (lo que de verdad se sirve) y
// sobre src/i18n/content/ (lo que se escribe), y sale con 1 ante un solo hit.
// Instrucción de Rodrigo (2026-09-06): el método externo se rebrandea como propio;
// nombrar al competidor regala autoridad y, en el caso de MOCA, es marca registrada.
import fs from 'node:fs';
import path from 'node:path';

const RE = /simon.?kucher|\bMOCA\b|mckinsey|\bbain\b|boston consulting|\bBCG\b|kearney|accenture|deloitte|nielsen/i;
const raices = process.argv.slice(2).length ? process.argv.slice(2) : ['dist', 'src/i18n/content'];
const hits = [];

function walk(d) {
  if (!fs.existsSync(d)) return;
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.(html|json|md|astro|ts|mjs|css)$/.test(f)) {
      const lineas = fs.readFileSync(p, 'utf8').split('\n');
      lineas.forEach((l, i) => { const m = l.match(RE); if (m) hits.push(`${p}:${i + 1}: ${m[0]}`); });
    }
  }
}
raices.forEach(walk);

console.log(`Gate terceros (invariante 17) sobre ${raices.join(', ')}`);
if (hits.length) {
  console.log(`  hits: ${hits.length}`);
  hits.slice(0, 40).forEach((h) => console.log('  ' + h));
  console.log('GATE ROJO: hay firmas o frameworks de terceros nombrados.');
  process.exit(1);
}
console.log('  hits: 0\nGATE VERDE: sin firmas ni frameworks de terceros.');
