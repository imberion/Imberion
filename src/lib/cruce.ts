// El cruce industria × herramienta, como dato.
//
// D3 del spec: la industria es la puerta, el catálogo es el menú. Qué
// herramientas aplican en cada industria, y con qué ángulo, vive en
// src/data/cruce.json y en ningún otro lado. Las fichas del catálogo derivan
// de aquí su lista de industrias (src/lib/catalogo.ts): antes esa lista estaba
// escrita a mano en los 26 JSON de contenido, que es la misma información en
// dos lugares.
//
// Este módulo valida al cargar y REVIENTA el build si el cruce nombra un slug
// que no existe, una industria que no está en el roster o deja un ángulo vacío
// en cualquiera de los tres idiomas.

import cruceData from '../data/cruce.json';
import catalogoData from '../data/catalogo.json';
import type { Locale } from '../i18n/index';
import { INDUSTRIAS, ROSTER } from './industrias';
import { ruta } from './rutas';

// No se importa de ./catalogo a propósito: catalogo.ts consume este módulo para
// derivar la lista de industrias de cada ficha, y un import de vuelta cerraría
// el ciclo. El href de una ficha es una línea.
function href(locale: Locale, slug: string): string {
  return `${ruta(locale, 'catalogo')}${slug}/`;
}

type Trilingue = Record<Locale, string>;

interface HerramientaCruce {
  slug: string;
  transversal: boolean;
  angulo?: Trilingue;
  industrias?: Record<string, Trilingue>;
}

const LOCALES: readonly Locale[] = ['es', 'en', 'pt'] as const;

const HERRAMIENTAS = catalogoData.herramientas as Array<{
  slug: string;
  nombre: string;
  familia?: string;
  seccion?: string;
}>;
const FAMILIAS = catalogoData.familias as Array<{
  id: string;
  nombre: string;
  verbo_es: string;
  verbo_en: string;
  verbo_pt: string;
}>;
const SECCIONES = catalogoData.secciones_extra as Array<{
  id: string;
  titulo_es: string;
  titulo_en: string;
  titulo_pt: string;
}>;

const SLUGS_CATALOGO = new Set(HERRAMIENTAS.map((h) => h.slug));
const SLUGS_INDUSTRIA = new Set(INDUSTRIAS.map((i) => i.slug));
const SLUGS_ROSTER = new Set(ROSTER.map((i) => i.slug));

const CRUCE = cruceData.herramientas as HerramientaCruce[];

/* ---------------- validación al cargar ---------------- */

function exigeAngulo(donde: string, valor: unknown): Trilingue {
  if (!valor || typeof valor !== 'object') {
    throw new Error(`cruce: ${donde} no trae ángulo. Se esperan los tres idiomas: ${LOCALES.join(', ')}.`);
  }
  const obj = valor as Record<string, unknown>;
  for (const loc of LOCALES) {
    const t = obj[loc];
    if (typeof t !== 'string' || t.trim() === '') {
      throw new Error(`cruce: ${donde} tiene el ángulo "${loc}" vacío. Un ángulo vacío se ve como un hueco en la página.`);
    }
  }
  return obj as Trilingue;
}

const vistos = new Set<string>();
for (const h of CRUCE) {
  if (!SLUGS_CATALOGO.has(h.slug)) {
    throw new Error(
      `cruce: "${h.slug}" no es una herramienta de la lista blanca (src/data/catalogo.json). ` +
        `Válidas: ${[...SLUGS_CATALOGO].join(', ')}.`
    );
  }
  if (vistos.has(h.slug)) throw new Error(`cruce: "${h.slug}" aparece dos veces.`);
  vistos.add(h.slug);

  if (h.transversal) {
    exigeAngulo(`${h.slug} (transversal)`, h.angulo);
    continue;
  }
  if (!h.industrias || Object.keys(h.industrias).length === 0) {
    throw new Error(`cruce: "${h.slug}" no es transversal y no cruza ninguna industria.`);
  }
  for (const [ind, angulo] of Object.entries(h.industrias)) {
    if (!SLUGS_ROSTER.has(ind)) {
      throw new Error(
        `cruce: "${h.slug}" cruza "${ind}", que no está en el roster de industrias (src/data/industrias.json).`
      );
    }
    exigeAngulo(`${h.slug} × ${ind}`, angulo);
  }
}

for (const h of HERRAMIENTAS) {
  if (!vistos.has(h.slug)) {
    throw new Error(
      `cruce: la ficha "${h.slug}" está publicada y no aparece en src/data/cruce.json. ` +
        `Una ficha que no cruza ninguna industria no se alcanza desde ninguna puerta.`
    );
  }
}

for (const ind of INDUSTRIAS) {
  const tiene = CRUCE.some((h) => h.transversal || Boolean(h.industrias?.[ind.slug]));
  if (!tiene) throw new Error(`cruce: la industria publicada "${ind.slug}" no cruza ninguna herramienta.`);
}

/* ---------------- consultas ---------------- */

export interface EntradaCruce {
  slug: string;
  nombre: string;
  href: string;
  angulo: string;
  transversal: boolean;
}

export interface GrupoCruce {
  id: string;
  tipo: 'familia' | 'seccion' | 'transversal';
  nombre: string;
  /** Verbo de la familia. Null en secciones y en la fila transversal. */
  verbo: string | null;
  herramientas: EntradaCruce[];
}

/** Industrias publicadas donde aplica una herramienta, en el orden del roster. */
export function industriasDeHerramienta(slug: string): string[] {
  const h = CRUCE.find((x) => x.slug === slug);
  if (!h) {
    throw new Error(`cruce: no hay cruce para la herramienta "${slug}".`);
  }
  if (h.transversal) return INDUSTRIAS.map((i) => i.slug);
  const marcadas = new Set(Object.keys(h.industrias ?? {}));
  return INDUSTRIAS.filter((i) => marcadas.has(i.slug)).map((i) => i.slug);
}

/** ¿La herramienta es oferta transversal (aplica igual en las nueve)? */
export function esTransversal(slug: string): boolean {
  return CRUCE.find((x) => x.slug === slug)?.transversal ?? false;
}

/**
 * Herramientas que aplican en una industria, agrupadas por familia y sección en
 * el orden de catalogo.json, con la fila transversal al final.
 */
export function herramientasDeIndustria(slug: string, locale: Locale = 'es'): GrupoCruce[] {
  if (!SLUGS_INDUSTRIA.has(slug)) {
    throw new Error(
      `cruce: "${slug}" no es una industria publicada. Válidas: ${[...SLUGS_INDUSTRIA].join(', ')}.`
    );
  }

  const entrada = (h: HerramientaCruce, angulo: string): EntradaCruce => {
    const ficha = HERRAMIENTAS.find((x) => x.slug === h.slug)!;
    return {
      slug: h.slug,
      nombre: ficha.nombre,
      href: href(locale, h.slug),
      angulo,
      transversal: h.transversal,
    };
  };

  const porGrupo = new Map<string, EntradaCruce[]>();
  const transversales: EntradaCruce[] = [];

  for (const h of CRUCE) {
    if (h.transversal) {
      transversales.push(entrada(h, h.angulo![locale]));
      continue;
    }
    const angulo = h.industrias?.[slug];
    if (!angulo) continue;
    const ficha = HERRAMIENTAS.find((x) => x.slug === h.slug)!;
    const id = ficha.familia ?? ficha.seccion!;
    if (!porGrupo.has(id)) porGrupo.set(id, []);
    porGrupo.get(id)!.push(entrada(h, angulo[locale]));
  }

  const grupos: GrupoCruce[] = [];
  for (const f of FAMILIAS) {
    const items = porGrupo.get(f.id);
    if (!items?.length) continue;
    grupos.push({
      id: f.id,
      tipo: 'familia',
      nombre: f.nombre,
      verbo: f[`verbo_${locale}` as const],
      herramientas: items,
    });
  }
  for (const s of SECCIONES) {
    const items = porGrupo.get(s.id);
    if (!items?.length) continue;
    grupos.push({
      id: s.id,
      tipo: 'seccion',
      nombre: s[`titulo_${locale}` as const],
      verbo: null,
      herramientas: items,
    });
  }
  if (transversales.length) {
    grupos.push({ id: 'oferta-transversal', tipo: 'transversal', nombre: '', verbo: null, herramientas: transversales });
  }
  return grupos;
}

/** Cuántas fichas distintas del catálogo alcanza una industria. Lo usa el gate. */
export function conteoDeIndustria(slug: string): number {
  return herramientasDeIndustria(slug).reduce((a, g) => a + g.herramientas.length, 0);
}
