/**
 * texturas_optimizar.mjs — recomprime las texturas de fondo del sitio.
 *
 * Uso:
 *   npm run texturas:optimizar
 *   node scripts/texturas_optimizar.mjs --dry              (mide, no escribe)
 *   node scripts/texturas_optimizar.mjs --desde=<carpeta>  (otro origen)
 *
 * Qué hace: toma cada PNG fuente, lo reduce a ANCHO_MAX px de ancho
 * conservando la proporción (nunca deforma) y escribe <mismo nombre>.webp en
 * public/texturas/, que es lo que sirve el sitio.
 *
 * De dónde salen los PNG: public/texturas/ ya no los guarda, justamente
 * porque pesaban 11.3 MB y todo lo que vive en public/ se publica. Los
 * originales son los del sitio anterior, versionados en el repo en
 * Imberion/assets/textures/ (rama que todavía los tiene). Para regenerar:
 *
 *   node scripts/texturas_optimizar.mjs --desde=../Imberion/assets/textures
 *
 * Sin --desde el script busca en public/texturas/ y, si no encuentra PNG,
 * no hace nada: los .webp ya generados se quedan como están.
 *
 * Por qué WebP: las ocho texturas son degradados suaves con grano. En PNG eso
 * pesa 1-3 MB cada una porque el grano es ruido y el PNG lo guarda píxel por
 * píxel. WebP con pérdida baja el total de 11.3 MB a ~1.0 MB.
 *
 * Por qué la calidad es alta y por textura: el grano ES el diseño, y es lo
 * primero que tira un códec con pérdida porque lo lee como ruido. A calidad
 * 68 las texturas de grano fino quedan planas (conservan 7-15% del grano) y
 * el fondo se ve como color liso con manchas. La calidad de cada archivo se
 * eligió midiendo cuánto grano sobrevive, no a ojo ni por peso:
 *
 *   grano = desviación estándar de (imagen - imagen desenfocada), o sea la
 *   energía de alta frecuencia. Se buscó la calidad más baja que conserva
 *   >=80% del grano del PNG original.
 *
 * Resultado de esa medición (grano conservado / peso):
 *   01_hero_dust_navy            q80   84%    74 KB
 *   02_paper_grain_visible       q88   88%   120 KB
 *   03_white_editorial_grain     q90   85%   121 KB
 *   04_directional_signal_light  q94   91%   150 KB
 *   06_dark_editorial_flow       q95   88%   145 KB
 *   07_dark_signal_field         q97   87%   142 KB
 *   10_gridless_data_haze        q92   82%   125 KB
 *   11_cta_dust_navy             q68   94%   149 KB
 *
 * Los dos extremos explican el rango: 11_cta_dust_navy tiene grano grueso y
 * marcado, que el códec conserva casi entero hasta en calidad baja; en cambio
 * 07_dark_signal_field lo tiene tan tenue que hay que llegar a 97 para que no
 * lo borre. No uniformar estas calidades: subir las bajas solo agrega peso y
 * bajar las altas aplana la textura.
 *
 * Se probó AVIF en las dos texturas más caras y no compensa: en 04 da 225 KB
 * por 96% de grano contra 150 KB por 91% en WebP, y en 07 empata. WebP queda.
 *
 * Todas se consumen con `background-size: cover` en secciones a ancho completo
 * (ver src/styles/texturas.css), así que 1920 px cubre el caso común y escala
 * limpio en pantallas de 2560.
 */
import sharp from 'sharp';
import { readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DESTINO = path.join(RAIZ, 'public', 'texturas');
const argDesde = process.argv.find((a) => a.startsWith('--desde='));
const ORIGEN = argDesde ? path.resolve(RAIZ, argDesde.slice('--desde='.length)) : DESTINO;
const ANCHO_MAX = 1920;
const CALIDAD_DEFAULT = 90;

// Calidad por archivo (base sin extensión). Ver el encabezado: cada número
// es la calidad más baja que conserva >=80% del grano de ese PNG.
const CALIDAD = {
  '01_hero_dust_navy': 80,
  '02_paper_grain_visible': 88,
  '03_white_editorial_grain': 90,
  '04_directional_signal_light': 94,
  '06_dark_editorial_flow': 95,
  '07_dark_signal_field': 97,
  '10_gridless_data_haze': 92,
  '11_cta_dust_navy': 68,
};

const seco = process.argv.includes('--dry');
const kb = (n) => (n / 1024).toFixed(0).padStart(6) + ' KB';

const fuentes = (await readdir(ORIGEN))
  .filter((f) => /\.(png|jpe?g)$/i.test(f))
  // Solo las ocho que usa el sistema de texturas; assets/textures trae otras
  // (divisor diagonal, paneles) que ningún selector consume.
  .filter((f) => path.parse(f).name in CALIDAD)
  .sort();

if (fuentes.length === 0) {
  console.log(`No hay PNG de textura en ${path.relative(RAIZ, ORIGEN) || '.'}.`);
  console.log('Los .webp ya generados se quedan como están. Para regenerar desde el origen:');
  console.log('  node scripts/texturas_optimizar.mjs --desde=../Imberion/assets/textures');
  process.exit(0);
}

let antes = 0;
let despues = 0;

for (const archivo of fuentes) {
  const base = path.parse(archivo).name;
  const origen = path.join(ORIGEN, archivo);
  const destino = path.join(DESTINO, `${base}.webp`);
  const q = CALIDAD[base] ?? CALIDAD_DEFAULT;

  const pesoOrigen = (await stat(origen)).size;
  const img = sharp(origen);
  const meta = await img.metadata();

  const buf = await img
    .resize({ width: Math.min(ANCHO_MAX, meta.width), withoutEnlargement: true })
    .webp({ quality: q, effort: 6, smartSubsample: true })
    .toBuffer();

  const metaSalida = await sharp(buf).metadata();
  if (!seco) await writeFile(destino, buf);

  antes += pesoOrigen;
  despues += buf.length;

  console.log(
    `${base.padEnd(30)} ${meta.width}x${meta.height} ${kb(pesoOrigen)}` +
      `  ->  ${metaSalida.width}x${metaSalida.height} ${kb(buf.length)}  q=${q}` +
      `  (-${(100 - (buf.length / pesoOrigen) * 100).toFixed(1)}%)`
  );
}

console.log('-'.repeat(96));
console.log(
  `TOTAL${' '.repeat(25)} ${kb(antes)}  ->  ${kb(despues)}` +
    `  (-${(100 - (despues / antes) * 100).toFixed(1)}%)`
);
if (seco) console.log('\n(--dry: no se escribio nada)');
else console.log(`\nListo: ${fuentes.length} texturas en public/texturas/. El CSS las apunta en src/styles/texturas.css.`);
