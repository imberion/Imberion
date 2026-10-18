// Gate del cruce industria × herramienta (CP10 punto 10a del spec).
//
// Mide sobre el dist construido, no sobre el código: lo que importa es cuántas
// fichas del catálogo alcanza de verdad la página de cada industria. Antes del
// cruce cada industria enlazaba exactamente 2, y eran casi las mismas.
//
//   node scripts/gate_cruce.mjs [dist]
//
// Rojo si: una industria enlaza menos de MINIMO fichas distintas, retail no
// enlaza market-signal, o una ficha publicada no aparece en ninguna industria.
import fs from 'node:fs';
import path from 'node:path';

const DIST = process.argv[2] ?? 'dist';
const MINIMO = 8;

const catalogo = JSON.parse(fs.readFileSync('src/data/catalogo.json', 'utf8'));
const industrias = JSON.parse(fs.readFileSync('src/data/industrias.json', 'utf8'));

const FICHAS = catalogo.herramientas.map((h) => h.slug);
const PUBLICADAS = industrias.industrias.filter((i) => !i.borrador).map((i) => i.slug);

// Segmentos de nivel 1 por locale, iguales a los de src/lib/rutas.ts.
const RUTAS = {
  es: { base: '', industrias: 'industrias', catalogo: 'catalogo' },
  en: { base: 'en', industrias: 'industries', catalogo: 'catalog' },
  pt: { base: 'pt', industrias: 'industrias', catalogo: 'catalogo' },
};

const fallas = [];
const filas = [];
const alcanzadas = new Set();

for (const [locale, r] of Object.entries(RUTAS)) {
  for (const ind of PUBLICADAS) {
    const archivo = path.join(DIST, r.base, r.industrias, ind, 'index.html');
    if (!fs.existsSync(archivo)) {
      fallas.push(`falta la página ${archivo}`);
      continue;
    }
    const html = fs.readFileSync(archivo, 'utf8');
    const prefijo = `/${[r.base, r.catalogo].filter(Boolean).join('/')}/`;
    const enlazadas = new Set();
    const re = new RegExp(`href="${prefijo.replace(/\//g, '\\/')}([a-z0-9-]+)\\/"`, 'g');
    let m;
    while ((m = re.exec(html))) {
      if (FICHAS.includes(m[1])) {
        enlazadas.add(m[1]);
        alcanzadas.add(m[1]);
      }
    }
    filas.push({ locale, ind, n: enlazadas.size });
    if (enlazadas.size < MINIMO) {
      fallas.push(`${locale}/${ind}: ${enlazadas.size} fichas enlazadas, mínimo ${MINIMO}`);
    }
    if (ind === 'retail' && !enlazadas.has('market-signal')) {
      fallas.push(`${locale}/retail: no enlaza market-signal, la puerta de entrada del assessment`);
    }
  }
}

const huerfanas = FICHAS.filter((f) => !alcanzadas.has(f));
for (const f of huerfanas) fallas.push(`la ficha "${f}" no aparece en ninguna industria`);

console.log(`Gate cruce sobre ${DIST}: ${filas.length} páginas de industria`);
for (const loc of Object.keys(RUTAS)) {
  const l = filas.filter((f) => f.locale === loc);
  if (!l.length) continue;
  console.log(`  [${loc}] ` + l.map((f) => `${f.ind}=${f.n}`).join('  '));
}
console.log(`  fichas alcanzadas: ${alcanzadas.size}/${FICHAS.length}`);

if (fallas.length) {
  fallas.forEach((f) => console.log('  ✗ ' + f));
  console.log('GATE ROJO: el cruce no llega a la página.');
  process.exit(1);
}
console.log('GATE VERDE: cada industria enlaza su corte del catálogo.');
