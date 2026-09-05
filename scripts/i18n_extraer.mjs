#!/usr/bin/env node
// Extrae las traducciones ES/EN/PT embebidas en los HTML del sitio viejo
// y las escribe como JSON en src/i18n/pages/<slug>.json.
//
// Dos mecanismos conviven en el sitio viejo:
//   const T = { es: {...}, en: {...}, pt: {...} }        (index, how-it-works, how-we-operate)
//   window.IMB_I18N = { es: {...}, en: {...}, pt: {...} } (las otras 10 páginas)
//
// La migración es literal: claves, orden y valores se preservan byte a byte,
// incluido el HTML inline (<em>, <br>) y las entidades.

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DESTINO = path.join(RAIZ, 'src', 'i18n', 'pages');

const MECANISMOS = [
  ['T', /const\s+T\s*=\s*\{/],
  ['IMB_I18N', /window\.IMB_I18N\s*=\s*\{/],
];

// Las 3 one-pagers son artefactos sueltos, no páginas del sitio.
export function paginas() {
  return fs
    .readdirSync(RAIZ)
    .filter((f) => f.endsWith('.html') && !f.startsWith('imberion-one-pager'))
    .sort();
}

// Recorta el literal de objeto que empieza en `inicio` (índice de la primera '{'),
// contando llaves y respetando comillas simples, dobles y template strings.
function recortarObjeto(s, inicio) {
  let profundidad = 0;
  let comilla = null;
  for (let i = inicio; i < s.length; i++) {
    const c = s[i];
    if (comilla) {
      if (c === '\\') { i++; continue; }
      if (c === comilla) comilla = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { comilla = c; continue; }
    if (c === '{') profundidad++;
    else if (c === '}') {
      profundidad--;
      if (profundidad === 0) return s.slice(inicio, i + 1);
    }
  }
  throw new Error(`objeto sin cerrar a partir del índice ${inicio}`);
}

// Devuelve { slug, mecanismo, datos } para un archivo HTML del root.
export function extraerArchivo(archivo) {
  const s = fs.readFileSync(path.join(RAIZ, archivo), 'utf8');
  let mecanismo = null;
  let inicio = -1;
  for (const [nombre, re] of MECANISMOS) {
    const m = s.match(re);
    if (m) {
      mecanismo = nombre;
      inicio = m.index + m[0].length - 1;
      break;
    }
  }
  if (inicio < 0) return null;
  const literal = recortarObjeto(s, inicio);
  const datos = vm.runInNewContext('(' + literal + ')');
  return { slug: archivo.replace(/\.html$/, ''), mecanismo, datos };
}

// Extrae las 13 páginas en memoria: Map<slug, datos>.
export function extraerTodo() {
  const salida = new Map();
  for (const archivo of paginas()) {
    const r = extraerArchivo(archivo);
    if (!r) continue;
    salida.set(r.slug, { mecanismo: r.mecanismo, datos: r.datos });
  }
  return salida;
}

// Cuenta hojas (strings) de una estructura anidada.
export function contarHojas(v) {
  if (typeof v === 'string') return 1;
  if (Array.isArray(v)) return v.reduce((a, x) => a + contarHojas(x), 0);
  if (v && typeof v === 'object') return Object.values(v).reduce((a, x) => a + contarHojas(x), 0);
  return 0;
}

// Aplana a Map<ruta, valor> con índices de array en la ruta.
export function aplanar(v, prefijo = '', destino = new Map()) {
  if (typeof v === 'string') {
    destino.set(prefijo, v);
    return destino;
  }
  if (Array.isArray(v)) {
    v.forEach((x, i) => aplanar(x, `${prefijo}[${i}]`, destino));
    return destino;
  }
  if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v)) aplanar(x, prefijo ? `${prefijo}.${k}` : k, destino);
    return destino;
  }
  return destino;
}

function main() {
  fs.mkdirSync(DESTINO, { recursive: true });
  const todo = extraerTodo();
  let total = 0;
  for (const [slug, { mecanismo, datos }] of todo) {
    const porLocale = {};
    for (const loc of Object.keys(datos)) porLocale[loc] = contarHojas(datos[loc]);
    const n = Object.values(porLocale).reduce((a, b) => a + b, 0);
    total += n;
    fs.writeFileSync(
      path.join(DESTINO, `${slug}.json`),
      JSON.stringify(datos, null, 2) + '\n',
      'utf8'
    );
    console.log(
      `${slug.padEnd(18)} ${mecanismo.padEnd(9)} ${JSON.stringify(porLocale)} total=${n}`
    );
  }
  console.log(`\n${todo.size} páginas, ${total} strings hoja escritos en src/i18n/pages/`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
