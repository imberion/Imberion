// Resolución de contenido de las páginas de industria.
//
// Las 9 industrias leen su contenido de src/i18n/content/industrias/<slug>.json.
// Las 5 que ya tenían página en el sitio viejo arrancaron como copia literal de
// src/i18n/pages/<pagina_vieja>.json (ese archivo lo custodia el gate de i18n y
// no se toca) y desde ahí se corrigen los strings que la revisión editorial
// rechace, igual que hace el home con src/i18n/content/home.json.
//
// El único contrato es el esquema de claves. Este módulo lo valida y REVIENTA el
// build con el slug, el locale y la clave exacta cuando falta algo: una página de
// industria con un hueco silencioso es peor que un build rojo.

import type { Locale } from '../i18n/index';
import { DEFAULT_LOCALE } from '../i18n/index';
import datos from '../data/industrias.json';

export interface Industria {
  borrador?: boolean;
  slug: string;
  brain: string;
  icono: string;
  pagina_vieja?: string;
  titulo_es: string;
  titulo_en: string;
  titulo_pt: string;
}

// Roster completo, incluidas las que están en borrador. Una industria en borrador
// tiene su JSON con el esquema completo pero sin material: no se sirve, no entra al
// índice ni al sitemap (el sitemap sale de las rutas construidas). Publicar es
// poner borrador en false en src/data/industrias.json.
export const ROSTER: Industria[] = datos.industrias as Industria[];
export const INDUSTRIAS: Industria[] = ROSTER.filter((i) => !i.borrador);

export function titulo(ind: Industria, locale: Locale): string {
  return ind[`titulo_${locale}` as const];
}

/* ---------------- contenido ---------------- */

type Dicc = Record<string, string>;

const CONTENIDO = import.meta.glob<Record<string, Dicc>>('../i18n/content/industrias/*.json', {
  eager: true,
  import: 'default',
});

function contenidoIndustria(slug: string, locale: Locale): Dicc {
  const clave = `../i18n/content/industrias/${slug}.json`;
  const archivo = CONTENIDO[clave];
  if (!archivo) {
    throw new Error(
      `industrias: falta el contenido de "${slug}". Se esperaba src/i18n/content/industrias/${slug}.json ` +
        `(disponibles: ${Object.keys(CONTENIDO).map((k) => k.split('/').pop()).join(', ') || 'ninguno'}).`
    );
  }
  const base = archivo[DEFAULT_LOCALE];
  if (!base) {
    throw new Error(`industrias: ${slug}.json no trae el bloque "${DEFAULT_LOCALE}".`);
  }
  if (locale === DEFAULT_LOCALE) return base;
  // Fallback clave por clave al español, igual que t().
  const encima = archivo[locale] ?? {};
  const salida: Dicc = {};
  for (const [k, v] of Object.entries(base)) {
    const propio = encima[k];
    salida[k] = typeof propio === 'string' && propio !== '' ? propio : v;
  }
  return salida;
}

/* ---------------- validación del esquema ---------------- */

const CLAVES_BASE = [
  '__title',
  'back',
  'hero_eyebrow',
  'hero_h1',
  'hero_lead',
  's1_eyebrow',
  's1_h2',
  's1_lead',
  'diag_corner',
  'diag_note',
  'diag_count_l',
  'diag_cta',
  's2_eyebrow',
  's2_h2',
  's2_lead',
  'ctastrip_h2',
  'ctastrip_p',
  'ctastrip_btn',
  'lvl1',
  'lvl1_d',
  'lvl2',
  'lvl2_d',
  'lvl3',
  'lvl3_d',
  'lvl4',
  'lvl4_d',
] as const;

const CAPS = [1, 2, 3, 4, 5, 6] as const;

/** Destino en el catálogo de cada tarjeta de capacidad que lleva enlace. */
const ENLACE_CAP: Record<string, Record<number, string>> = {
  retail: { 1: 'floor-signal', 6: 'concierge' },
  cpg: { 5: 'market-signal', 6: 'concierge' },
  farma: { 4: 'market-signal', 5: 'concierge' },
  b2b: { 5: 'market-signal', 6: 'concierge' },
  construccion: { 1: 'market-signal', 5: 'concierge' },
  automotriz: { 5: 'market-signal', 6: 'concierge' },
  telco: { 5: 'market-signal', 6: 'concierge' },
  'servicios-b2b': { 5: 'market-signal', 6: 'concierge' },
  'servicios-b2c': { 5: 'market-signal', 6: 'concierge' },
};

export interface Nivel {
  n: number;
  titulo: string;
  descripcion: string;
}

export interface Dimension {
  n: number;
  nombre: string;
  celdas: { nivel: number; texto: string }[];
}

export interface Capacidad {
  titulo: string;
  parrafo: string;
  enlace?: { texto: string; slugCatalogo: string };
}

export interface ContenidoIndustria {
  txt: Dicc;
  niveles: Nivel[];
  dimensiones: Dimension[];
  capacidades: Capacidad[];
}

function exigir(txt: Dicc, clave: string, slug: string, locale: Locale): string {
  const v = txt[clave];
  if (typeof v !== 'string' || v.trim() === '') {
    throw new Error(
      `industrias: ${slug} (${locale}) no tiene la clave "${clave}". ` +
        `El esquema de una página de industria es el de src/i18n/pages/b2b.json.`
    );
  }
  return v;
}

export function contenido(ind: Industria, locale: Locale): ContenidoIndustria {
  const { slug } = ind;
  const txt = contenidoIndustria(slug, locale);

  for (const k of CLAVES_BASE) exigir(txt, k, slug, locale);

  const niveles: Nivel[] = [1, 2, 3, 4].map((n) => ({
    n,
    titulo: exigir(txt, `lvl${n}`, slug, locale),
    descripcion: exigir(txt, `lvl${n}_d`, slug, locale),
  }));

  // Las dimensiones son contiguas desde dim1. retail trae 7; el resto, 8.
  const dimensiones: Dimension[] = [];
  for (let d = 1; typeof txt[`dim${d}`] === 'string'; d++) {
    dimensiones.push({
      n: d,
      nombre: exigir(txt, `dim${d}`, slug, locale),
      celdas: [1, 2, 3, 4].map((n) => ({
        nivel: n,
        texto: exigir(txt, `cell_${d}_${n}`, slug, locale),
      })),
    });
  }
  if (dimensiones.length === 0) {
    throw new Error(`industrias: ${slug} (${locale}) no tiene ninguna dimensión (dim1...).`);
  }

  const destinos = ENLACE_CAP[slug];
  if (!destinos) {
    throw new Error(
      `industrias: ${slug} no está en el mapa de enlaces de capacidad de src/lib/industrias.ts. ` +
        `Cada industria declara a qué ficha del catálogo apunta cada tarjeta con enlace.`
    );
  }

  const capacidades: Capacidad[] = CAPS.map((c) => {
    const cap: Capacidad = {
      titulo: exigir(txt, `cap${c}_t`, slug, locale),
      parrafo: exigir(txt, `cap${c}_p`, slug, locale),
    };
    const etiqueta = txt[`cap${c}_l`];
    if (typeof etiqueta === 'string' && etiqueta.trim() !== '') {
      const destino = destinos[c];
      if (!destino) {
        throw new Error(
          `industrias: ${slug} (${locale}) trae "cap${c}_l" ("${etiqueta}") pero el mapa de enlaces ` +
            `de src/lib/industrias.ts no dice a qué ficha del catálogo apunta.`
        );
      }
      cap.enlace = { texto: etiqueta, slugCatalogo: destino };
    }
    return cap;
  });

  return { txt, niveles, dimensiones, capacidades };
}
