#!/usr/bin/env node
// Gate de CP3: verifica que src/i18n/pages/*.json sea una copia byte a byte
// de las traducciones embebidas en los HTML del sitio viejo.
//
// Re-extrae desde los HTML en memoria y compara hoja por hoja (ruta de clave
// completa, con índices de array). Falla si hay una sola hoja faltante o distinta.
// Aparte, reporta sin fallar las claves que existen en ES y no en EN o PT:
// en Astro esa clave rendiría español bajo /en/ con lang="en".

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extraerTodo, aplanar } from './i18n_extraer.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DESTINO = path.join(RAIZ, 'src', 'i18n', 'pages');

const origen = extraerTodo();

let hojasOrigen = 0;
let hojasDestino = 0;
const faltantes = [];
const distintas = [];
const sinArchivo = [];
const huecosLocale = [];

for (const [slug, { datos }] of origen) {
  const ruta = path.join(DESTINO, `${slug}.json`);
  if (!fs.existsSync(ruta)) {
    sinArchivo.push(slug);
    for (const loc of Object.keys(datos)) hojasOrigen += aplanar(datos[loc]).size;
    continue;
  }
  const migrado = JSON.parse(fs.readFileSync(ruta, 'utf8'));

  for (const loc of Object.keys(datos)) {
    const planoOrigen = aplanar(datos[loc]);
    const planoDestino = migrado[loc] === undefined ? new Map() : aplanar(migrado[loc]);
    hojasOrigen += planoOrigen.size;
    hojasDestino += planoDestino.size;
    for (const [clave, valor] of planoOrigen) {
      if (!planoDestino.has(clave)) faltantes.push(`${slug}/${loc}: ${clave}`);
      else if (planoDestino.get(clave) !== valor) distintas.push(`${slug}/${loc}: ${clave}`);
    }
    for (const clave of planoDestino.keys()) {
      if (!planoOrigen.has(clave)) distintas.push(`${slug}/${loc}: ${clave} (sobra en destino)`);
    }
  }

  // Cobertura de locale: claves de ES ausentes en EN o PT.
  const claves = {};
  for (const loc of ['es', 'en', 'pt']) {
    claves[loc] = datos[loc] ? new Set(aplanar(datos[loc]).keys()) : new Set();
  }
  for (const loc of ['en', 'pt']) {
    for (const clave of claves.es) {
      if (!claves[loc].has(clave)) huecosLocale.push(`${slug}/${loc}: ${clave}`);
    }
  }
}

// Archivos en destino que no corresponden a ninguna página viva.
const huerfanos = fs.existsSync(DESTINO)
  ? fs.readdirSync(DESTINO).filter((f) => f.endsWith('.json') && !origen.has(f.replace(/\.json$/, '')))
  : [];

function listar(titulo, items, tope = 20) {
  console.log(`\n${titulo} (${items.length})`);
  for (const x of items.slice(0, tope)) console.log(`  - ${x}`);
  if (items.length > tope) console.log(`  ... y ${items.length - tope} más`);
}

console.log('Gate i18n CP3');
console.log(`  páginas en origen:   ${origen.size}`);
console.log(`  hojas en origen:     ${hojasOrigen}`);
console.log(`  hojas en destino:    ${hojasDestino}`);
console.log(`  faltantes:           ${faltantes.length}`);
console.log(`  distintas:           ${distintas.length}`);
console.log(`  sin archivo JSON:    ${sinArchivo.length}`);
console.log(`  JSON huérfanos:      ${huerfanos.length}`);

if (sinArchivo.length) listar('Páginas sin JSON', sinArchivo);
if (huerfanos.length) listar('JSON sin página de origen', huerfanos);
if (faltantes.length) listar('Hojas faltantes', faltantes);
if (distintas.length) listar('Hojas con valor distinto', distintas);

console.log(`\nCobertura de locale (informativo, no falla): ${huecosLocale.length} claves de ES sin equivalente en EN o PT`);
if (huecosLocale.length) listar('Claves que caerían al fallback en español', huecosLocale);

const roto = faltantes.length + distintas.length + sinArchivo.length + huerfanos.length;
if (roto > 0) {
  console.error('\nGATE ROJO: la migración de i18n no es fiel al origen.');
  process.exit(1);
}
console.log('\nGATE VERDE: las 13 páginas migradas coinciden byte a byte con el origen.');
