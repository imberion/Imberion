// Check del helper de rutas por locale. Corre con `node scripts/rutas_check.mjs`
// (Node 24 borra los tipos de rutas.ts al importarlo). Sale con 1 al primer fallo.

import { ruta, rutaEquivalente } from '../src/lib/rutas.ts';

const casos = [
  // ES vive en la raíz, sin prefijo.
  ['ruta es raíz', ruta('es', ''), '/'],
  ['ruta es segmento', ruta('es', 'que-resolvemos'), '/que-resolvemos/'],
  // Los otros idiomas traducen el segmento de nivel 1 y llevan prefijo.
  ['ruta en traducida', ruta('en', 'que-resolvemos'), '/en/what-we-solve/'],
  ['ruta pt traducida', ruta('pt', 'contacto'), '/pt/contato/'],
  // El slug de industria no se traduce; el segmento de nivel 1 sí.
  ['ruta en slug intacto', ruta('en', 'industrias/retail'), '/en/industries/retail/'],
  // Equivalencia entre idiomas para el selector.
  ['equivalente en->pt', rutaEquivalente('/en/what-we-solve/', 'pt'), '/pt/o-que-resolvemos/'],
  ['equivalente es->en con slug', rutaEquivalente('/industrias/retail/', 'en'), '/en/industries/retail/'],
  ['equivalente raíz', rutaEquivalente('/', 'en'), '/en/'],
  // Sin mapeo confiable cae a la raíz del locale destino.
  ['equivalente sin mapeo', rutaEquivalente('/en/blog/', 'es'), '/'],
];

let fallos = 0;
for (const [nombre, obtenido, esperado] of casos) {
  const ok = obtenido === esperado;
  if (!ok) fallos++;
  console.log(`${ok ? 'ok  ' : 'FALLA'} ${nombre}: ${JSON.stringify(obtenido)}${ok ? '' : ` (esperado ${JSON.stringify(esperado)})`}`);
}

console.log(`\n${casos.length - fallos}/${casos.length} casos correctos.`);
if (fallos) process.exit(1);
