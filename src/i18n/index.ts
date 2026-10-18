// Cargador de las traducciones migradas del sitio viejo.
//
// Los JSON de pages/ son la copia literal de las traducciones que vivían
// embebidas en los HTML del root. El gate (npm run i18n:gate) verifica que
// sigan siendo idénticas al origen.

export type Locale = 'es' | 'en' | 'pt';

export const LOCALES: readonly Locale[] = ['es', 'en', 'pt'] as const;
export const DEFAULT_LOCALE: Locale = 'es';

export type Nodo = string | Nodo[] | { [clave: string]: Nodo };
export type Diccionario = Record<string, Nodo>;
export type PaginaI18n = Partial<Record<Locale, Diccionario>>;

const modulos = import.meta.glob<PaginaI18n>('./pages/*.json', {
  eager: true,
  import: 'default',
});

const PAGINAS: Record<string, PaginaI18n> = {};
for (const [ruta, datos] of Object.entries(modulos)) {
  const slug = ruta.slice(ruta.lastIndexOf('/') + 1, -'.json'.length);
  PAGINAS[slug] = datos;
}

export const PAGINAS_DISPONIBLES = Object.keys(PAGINAS).sort();

export function esLocale(valor: string): valor is Locale {
  return (LOCALES as readonly string[]).includes(valor);
}

const cache = new Map<string, Diccionario>();

// Fusiona el diccionario del locale sobre el de español, clave por clave.
// Donde el locale no trae valor se usa el español y se registra la ruta,
// para poder avisar en desarrollo qué texto quedaría en el idioma equivocado.
function fusionar(base: Nodo, encima: Nodo | undefined, ruta: string, caidas: string[]): Nodo {
  if (encima === undefined) {
    caidas.push(ruta);
    return base;
  }
  if (typeof base === 'string') {
    return typeof encima === 'string' ? encima : base;
  }
  if (Array.isArray(base)) {
    if (!Array.isArray(encima)) return base;
    return base.map((item, i) => fusionar(item, encima[i], `${ruta}[${i}]`, caidas));
  }
  if (Array.isArray(encima) || typeof encima !== 'object' || encima === null) return base;
  const salida: { [clave: string]: Nodo } = {};
  for (const [clave, valor] of Object.entries(base)) {
    const sub = ruta ? `${ruta}.${clave}` : clave;
    salida[clave] = fusionar(valor, (encima as { [k: string]: Nodo })[clave], sub, caidas);
  }
  // Claves que solo existen en el locale (no deberían existir tras el gate).
  for (const [clave, valor] of Object.entries(encima as { [k: string]: Nodo })) {
    if (!(clave in salida)) salida[clave] = valor;
  }
  return salida;
}

/**
 * Devuelve el diccionario de una página en un locale, con fallback a español
 * clave por clave (no por página entera).
 */
export function t(page: string, locale: Locale): Diccionario {
  const llave = `${page}::${locale}`;
  const enCache = cache.get(llave);
  if (enCache) return enCache;

  const pagina = PAGINAS[page];
  if (!pagina) {
    throw new Error(
      `i18n: no existe la página "${page}". Disponibles: ${PAGINAS_DISPONIBLES.join(', ')}`
    );
  }

  const base = pagina[DEFAULT_LOCALE] ?? {};
  const propio = pagina[locale];
  let resultado: Diccionario;

  if (locale === DEFAULT_LOCALE) {
    resultado = base;
  } else {
    const caidas: string[] = [];
    resultado = fusionar(base, propio, '', caidas) as Diccionario;
    if (import.meta.env.DEV) {
      for (const clave of caidas) {
        console.warn(`[i18n] ${page}/${locale}: "${clave}" cae al fallback en español.`);
      }
    }
  }

  cache.set(llave, resultado);
  return resultado;
}
