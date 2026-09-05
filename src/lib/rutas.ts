// Rutas por locale.
//
// El español vive en la raíz (`/que-resolvemos/`) y los otros dos idiomas bajo
// su prefijo (`/en/what-we-solve/`, `/pt/o-que-resolvemos/`). El segmento de
// nivel 1 se traduce con la tabla de abajo; todo lo que va después (slugs de
// industria y de herramienta) queda igual en los tres idiomas.
//
// El import de tipo se borra al compilar, así que este módulo corre en Node sin
// cargar el resto del i18n. De eso depende scripts/rutas_check.mjs.

import type { Locale } from '../i18n/index';

export const LOCALES_RUTA: readonly Locale[] = ['es', 'en', 'pt'] as const;
export const LOCALE_RAIZ: Locale = 'es';

/** Segmentos de nivel 1 traducidos. La llave es el segmento canónico en español. */
const SEGMENTOS: Record<string, Record<Locale, string>> = {
  'que-resolvemos': { es: 'que-resolvemos', en: 'what-we-solve', pt: 'o-que-resolvemos' },
  'como-funciona': { es: 'como-funciona', en: 'how-it-works', pt: 'como-funciona' },
  'como-operamos': { es: 'como-operamos', en: 'how-we-operate', pt: 'como-operamos' },
  contacto: { es: 'contacto', en: 'contact', pt: 'contato' },
  catalogo: { es: 'catalogo', en: 'catalog', pt: 'catalogo' },
  industrias: { es: 'industrias', en: 'industries', pt: 'industrias' },
  distribuidores: { es: 'distribuidores', en: 'distributors', pt: 'distribuidores' },
};

function partes(ruta: string): string[] {
  return ruta.split('/').filter(Boolean);
}

function prefijo(locale: Locale): string {
  return locale === LOCALE_RAIZ ? '' : `/${locale}`;
}

/** Arma una URL absoluta del sitio, siempre con barra final. */
function armar(locale: Locale, segmentos: string[]): string {
  const base = prefijo(locale);
  if (segmentos.length === 0) return base === '' ? '/' : `${base}/`;
  return `${base}/${segmentos.join('/')}/`;
}

/**
 * URL de una página en un locale, a partir de su ruta canónica en español.
 *
 *   ruta('es', 'que-resolvemos')            -> '/que-resolvemos/'
 *   ruta('en', 'que-resolvemos')            -> '/en/what-we-solve/'
 *   ruta('pt', 'industrias/retail')         -> '/pt/industrias/retail/'
 *   ruta('en', '')                          -> '/en/'
 */
export function ruta(locale: Locale, segmentoEs: string = ''): string {
  const segs = partes(segmentoEs);
  if (segs.length === 0) return armar(locale, []);
  const traducido = SEGMENTOS[segs[0]]?.[locale] ?? segs[0];
  return armar(locale, [traducido, ...segs.slice(1)]);
}

/** Locale que declara un path, y el resto del path sin ese prefijo. */
function partirPath(pathActual: string): { locale: Locale; segmentos: string[] } {
  const segs = partes(pathActual);
  const primero = segs[0];
  if (primero === 'en' || primero === 'pt') {
    return { locale: primero, segmentos: segs.slice(1) };
  }
  return { locale: LOCALE_RAIZ, segmentos: segs };
}

/** Devuelve el segmento canónico en español de un segmento ya traducido. */
function aEspanol(segmento: string, origen: Locale): string | null {
  if (origen === LOCALE_RAIZ) return segmento in SEGMENTOS ? segmento : null;
  for (const [canonico, formas] of Object.entries(SEGMENTOS)) {
    if (formas[origen] === segmento) return canonico;
  }
  return null;
}

/**
 * La misma página en otro idioma, a partir del path que se está sirviendo.
 * Si el primer segmento no está en la tabla de traducción no hay equivalencia
 * confiable, así que cae a la raíz del locale destino en vez de inventar una URL.
 *
 *   rutaEquivalente('/en/what-we-solve/', 'pt')  -> '/pt/o-que-resolvemos/'
 *   rutaEquivalente('/', 'en')                   -> '/en/'
 *   rutaEquivalente('/en/blog/', 'es')           -> '/'
 */
export function rutaEquivalente(pathActual: string, localeDestino: Locale): string {
  const { locale: origen, segmentos } = partirPath(pathActual);
  if (segmentos.length === 0) return ruta(localeDestino, '');
  const canonico = aEspanol(segmentos[0], origen);
  if (canonico === null) return ruta(localeDestino, '');
  return ruta(localeDestino, [canonico, ...segmentos.slice(1)].join('/'));
}

/** URL absoluta, para canonical y hreflang. */
export function urlAbsoluta(origin: string, path: string): string {
  return `${origin.replace(/\/$/, '')}${path}`;
}
