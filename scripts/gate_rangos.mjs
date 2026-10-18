#!/usr/bin/env node
// Gate de CP10 10c: la franja de indicadores salió del home y no vuelve por
// descuido. Decisión de Rodrigo (spec §8.7): no existe un número propio medido
// y los rangos de benchmark no se rescatan, así que ninguna de las tres páginas
// del home puede volver a publicar un rango de impacto.
//
// Falla si en /, /en/ o /pt/ aparece un rango porcentual ("+2-5 %", "10 a 20%",
// "+40%") o una de las frases con las que la franja se presentaba en los tres
// idiomas. Mira el texto visible: descarta <script>, <style> y las etiquetas.
//
//   node scripts/gate_rangos.mjs [dist]
//
// package.json (línea que hay que agregar en "scripts", no la edito porque otro
// agente tiene el archivo abierto):
//   "gate:rangos": "node scripts/gate_rangos.mjs",

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.resolve(process.argv[2] || path.join(RAIZ, 'dist'));

const PAGINAS = [
  ['es', 'index.html'],
  ['en', path.join('en', 'index.html')],
  ['pt', path.join('pt', 'index.html')],
];

// Rangos porcentuales en cualquiera de sus formas: guion, guion largo, "a"/"to"/
// "até", y el porcentaje suelto con signo.
const PATRONES = [
  { nombre: 'rango porcentual', re: /[+-]?\d+(?:[.,]\d+)?\s*(?:[-–—]|\ba\b|\bto\b|\baté\b)\s*\d+(?:[.,]\d+)?\s*%/gi },
  { nombre: 'porcentaje con signo', re: /[+-]\s?\d+(?:[.,]\d+)?\s*%/g },
  { nombre: 'frase de rango (es)', re: /rangos?\s+de\s+referencia/gi },
  { nombre: 'frase de rango (en)', re: /reference\s+ranges?/gi },
  { nombre: 'frase de rango (pt)', re: /faixas?\s+de\s+refer[eê]ncia/gi },
];

function textoVisible(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
}

let fallas = 0;
let revisadas = 0;

console.log('Gate de rangos de impacto en el home');
console.log(`  dist: ${DIST}`);

for (const [locale, rel] of PAGINAS) {
  const ruta = path.join(DIST, rel);
  if (!fs.existsSync(ruta)) {
    console.log(`  ✗ ${locale}: falta ${rel}`);
    fallas += 1;
    continue;
  }
  revisadas += 1;
  const texto = textoVisible(fs.readFileSync(ruta, 'utf8'));
  const hallazgos = [];
  for (const { nombre, re } of PATRONES) {
    for (const m of texto.matchAll(re)) {
      const desde = Math.max(0, m.index - 60);
      hallazgos.push(`${nombre}: "${m[0]}" … ${texto.slice(desde, m.index + m[0].length + 60).trim()}`);
    }
  }
  if (hallazgos.length) {
    fallas += hallazgos.length;
    console.log(`  ✗ ${locale} (${rel}): ${hallazgos.length}`);
    for (const h of hallazgos) console.log(`      - ${h}`);
  } else {
    console.log(`  ✓ ${locale} (${rel}): 0`);
  }
}

console.log(`  páginas revisadas: ${revisadas} · hallazgos: ${fallas}`);
if (fallas) {
  console.error('\nGate de rangos: FALLA. El home no publica rangos de impacto (spec §8.7).');
  process.exit(1);
}
console.log('\nGate de rangos: en verde.');
