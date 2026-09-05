// Título y descripción de las cinco rutas del núcleo.
//
// Vive aquí y no en cada archivo de ruta porque son quince rutas para cinco
// páginas: repetir la derivación quince veces es quince lugares donde se
// desincroniza. Los JSON de contenido traen el título; la descripción sale del
// lead del hero, que es la frase que ya resume la página.

import type { Locale } from '../i18n/index';
import home from '../i18n/content/home.json';
import queResolvemos from '../i18n/content/que-resolvemos.json';
import comoFunciona from '../i18n/content/como-funciona.json';
import comoOperamos from '../i18n/content/como-operamos.json';
import contacto from '../i18n/content/contacto.json';

export type Pagina = 'home' | 'que-resolvemos' | 'como-funciona' | 'como-operamos' | 'contacto';

type Bloque = Record<string, any>;
type Archivo = Record<string, Bloque>;

const ARCHIVOS: Record<Pagina, Archivo> = {
  home: home as Archivo,
  'que-resolvemos': queResolvemos as Archivo,
  'como-funciona': comoFunciona as Archivo,
  'como-operamos': comoOperamos as Archivo,
  contacto: contacto as Archivo,
};

// Los JSON de contenido salieron de HTML, así que traen entidades ya escritas
// ("Execution &amp; Value Capture"). Al pintarlas como texto, Astro vuelve a
// escapar el & y en pantalla sale "&amp;". Se decodifican al leer, una sola vez,
// en vez de marcar cada clave con set:html.
const ENTIDADES: Record<string, string> = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': '\u00A0',
};

function decodifica<T>(valor: T): T {
  if (typeof valor === 'string') {
    return valor.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (m) => ENTIDADES[m] ?? m) as unknown as T;
  }
  if (Array.isArray(valor)) return valor.map(decodifica) as unknown as T;
  if (valor && typeof valor === 'object') {
    const salida: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(valor as Record<string, unknown>)) salida[k] = decodifica(v);
    return salida as unknown as T;
  }
  return valor;
}

/** Contenido de una página en un locale, con caída a español clave por clave. */
export function contenido(pagina: Pagina, locale: Locale): Bloque {
  const archivo = ARCHIVOS[pagina];
  return decodifica({ ...archivo.es, ...(archivo[locale] ?? {}) });
}

/** Quita las etiquetas que el copy trae embebidas (<br>, <em>, <a>). */
function plano(texto: string): string {
  return texto.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

const DESCRIPCION: Record<Pagina, (c: Bloque) => string> = {
  home: (c) => `${plano(c.hero_eyebrow)}. ${plano(c.hero_close)}`,
  'que-resolvemos': (c) => plano(c.hero_lead),
  'como-funciona': (c) => plano(c.hero_lead),
  'como-operamos': (c) => plano(c.hero_sub),
  contacto: (c) => plano(c.hero_lead),
};

export function meta(pagina: Pagina, locale: Locale): { title: string; description: string } {
  const c = contenido(pagina, locale);
  const title = c.__title ?? c.page_title;
  if (typeof title !== 'string' || title.trim() === '') {
    throw new Error(`meta: ${pagina}/${locale} no trae "__title" ni "page_title".`);
  }
  return { title, description: DESCRIPCION[pagina](c) };
}
