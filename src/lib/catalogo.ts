// Catálogo: lista blanca + contenido por ficha.
//
// La lista blanca (src/data/catalogo.json) manda: solo sale al sitio lo que
// está ahí. El contenido vive aparte, un JSON por ficha en
// src/i18n/content/catalogo/. Este módulo cruza las dos cosas y REVIENTA el
// build si a un slug de la lista blanca le falta su archivo o una clave.
// Rendir una ficha vacía en silencio es peor que no publicarla.

import catalogoData from '../data/catalogo.json';
import industriasData from '../data/industrias.json';
import type { Locale } from '../i18n/index';
import { ruta } from './rutas';
import { industriasDeHerramienta } from './cruce';

export interface Familia {
  id: string;
  nombre: string;
  verbo_es: string;
  verbo_en: string;
  verbo_pt: string;
}

export interface Herramienta {
  slug: string;
  nombre: string;
  familia?: string;
  seccion?: string;
  pagina_vieja?: string;
}

export interface SeccionExtra {
  id: string;
  titulo_es: string;
  titulo_en: string;
  titulo_pt: string;
}

export const FAMILIAS = catalogoData.familias as Familia[];
export const SECCIONES_EXTRA = catalogoData.secciones_extra as SeccionExtra[];
export const HERRAMIENTAS = catalogoData.herramientas as Herramienta[];
export const FAMILIAS_SIN_FICHA = catalogoData.familias_sin_ficha as Record<
  string,
  { linea_es: string; linea_en: string; linea_pt: string }
>;

const INDUSTRIAS = industriasData.industrias as Array<{
  slug: string;
  titulo_es: string;
  titulo_en: string;
  titulo_pt: string;
}>;

/** Toma el campo `<base>_<locale>` de un registro de datos. */
export function porLocale<T extends Record<string, any>>(
  registro: T,
  base: string,
  locale: Locale
): string {
  const valor = registro[`${base}_${locale}`];
  if (typeof valor !== 'string' || valor.trim() === '') {
    throw new Error(`catálogo: falta "${base}_${locale}" en ${JSON.stringify(registro).slice(0, 90)}`);
  }
  return valor;
}

// ---------------------------------------------------------------- contenido

type Bloque = Record<string, unknown>;
type Archivo = Partial<Record<Locale, Bloque>>;

const LOCALES: readonly Locale[] = ['es', 'en', 'pt'] as const;

const CLAVES_FICHA = [
  '__title',
  'nombre',
  'familia_label',
  'hero_eyebrow',
  'hero_h1',
  'hero_lead',
  'que_hace_h2',
  'que_hace_p',
  'que_hace_items',
  'valor_h2',
  'valor_p',
  'sowhat',
  'industrias_h2',
  'relacion_h2',
  'relacion_p',
  'ctastrip_h2',
  'ctastrip_p',
  'ctastrip_btn',
] as const;

const CLAVES_ARREGLO = new Set(['que_hace_items']);

const CLAVES_INDICE = [
  '__title',
  'hero_eyebrow',
  'hero_h1',
  'hero_lead',
  'familia_intro',
  'seccion_intro',
  'ver_ficha',
] as const;

const crudos = import.meta.glob<Archivo>('../i18n/content/catalogo/*.json', {
  eager: true,
  import: 'default',
});

const ARCHIVOS: Record<string, Archivo> = {};
for (const [rutaArchivo, datos] of Object.entries(crudos)) {
  const nombre = rutaArchivo.slice(rutaArchivo.lastIndexOf('/') + 1, -'.json'.length);
  ARCHIVOS[nombre] = datos;
}

function exigeBloque(nombre: string): Archivo {
  const archivo = ARCHIVOS[nombre];
  if (!archivo) {
    throw new Error(
      `catálogo: falta src/i18n/content/catalogo/${nombre}.json. ` +
        `Está en la lista blanca (src/data/catalogo.json) pero no tiene contenido.`
    );
  }
  return archivo;
}

function exigeClaves(nombre: string, locale: Locale, bloque: Bloque, claves: readonly string[]) {
  for (const clave of claves) {
    const valor = bloque[clave];
    if (valor === undefined || valor === null) {
      throw new Error(`catálogo: ${nombre}.json / ${locale}: falta la clave "${clave}".`);
    }
    if (CLAVES_ARREGLO.has(clave)) {
      if (!Array.isArray(valor) || valor.length === 0) {
        throw new Error(`catálogo: ${nombre}.json / ${locale}: "${clave}" debe ser un arreglo con al menos un elemento.`);
      }
      continue;
    }
    if (clave === 'familia_intro' || clave === 'seccion_intro') continue;
    if (typeof valor !== 'string' || valor.trim() === '') {
      throw new Error(`catálogo: ${nombre}.json / ${locale}: "${clave}" está vacía.`);
    }
  }
}

export interface ItemQueHace {
  titulo: string | null;
  texto: string;
}

export interface ContenidoFicha {
  __title: string;
  nombre: string;
  familia_label: string;
  hero_eyebrow: string;
  hero_h1: string;
  hero_lead: string;
  que_hace_h2: string;
  que_hace_p: string;
  que_hace_items: ItemQueHace[];
  valor_h2: string;
  valor_p: string;
  sowhat: string;
  industrias: Array<{ slug: string; titulo: string; href: string }>;
  industrias_h2: string;
  relacion_h2: string;
  relacion_p: string;
  ctastrip_h2: string;
  ctastrip_p: string;
  ctastrip_btn: string;
}

/** Normaliza un item de "qué hace": acepta texto plano o { t, p }. */
function normalizaItem(nombre: string, locale: Locale, crudo: unknown): ItemQueHace {
  if (typeof crudo === 'string') {
    if (crudo.trim() === '') {
      throw new Error(`catálogo: ${nombre}.json / ${locale}: hay un item vacío en "que_hace_items".`);
    }
    return { titulo: null, texto: crudo };
  }
  if (crudo && typeof crudo === 'object') {
    const obj = crudo as Record<string, unknown>;
    const titulo = typeof obj.t === 'string' ? obj.t : typeof obj.titulo === 'string' ? obj.titulo : null;
    const texto = typeof obj.p === 'string' ? obj.p : typeof obj.texto === 'string' ? obj.texto : null;
    if (texto === null || texto.trim() === '') {
      throw new Error(
        `catálogo: ${nombre}.json / ${locale}: un item de "que_hace_items" no trae texto ("p" o "texto").`
      );
    }
    return { titulo, texto };
  }
  throw new Error(`catálogo: ${nombre}.json / ${locale}: item de "que_hace_items" con forma inesperada.`);
}

export function contenidoFicha(slug: string, locale: Locale): ContenidoFicha {
  const archivo = exigeBloque(slug);
  const bloque = archivo[locale];
  if (!bloque) {
    throw new Error(
      `catálogo: ${slug}.json no trae el bloque "${locale}". Se esperan los tres: ${LOCALES.join(', ')}.`
    );
  }
  exigeClaves(slug, locale, bloque, CLAVES_FICHA);

  // La lista de industrias de una ficha sale del cruce (src/data/cruce.json), que
  // es su única fuente. Antes venía de una clave "industrias" escrita a mano en
  // este mismo JSON: la misma información en dos lugares, y las dos se caían de
  // sincronía en silencio.
  const industrias = industriasDeHerramienta(slug).map((slugInd) => {
    const registro = INDUSTRIAS.find((i) => i.slug === slugInd);
    if (!registro) {
      throw new Error(
        `catálogo: el cruce manda "${slugInd}" para ${slug}, y no es una industria publicada. ` +
          `Válidas: ${INDUSTRIAS.map((i) => i.slug).join(', ')}.`
      );
    }
    return {
      slug: slugInd,
      titulo: porLocale(registro, 'titulo', locale),
      href: `${ruta(locale, 'industrias')}${slugInd}/`,
    };
  });

  return {
    ...(bloque as unknown as ContenidoFicha),
    que_hace_items: (bloque.que_hace_items as unknown[]).map((i) => normalizaItem(slug, locale, i)),
    industrias,
  };
}

export interface ContenidoIndice {
  __title: string;
  hero_eyebrow: string;
  hero_h1: string;
  hero_lead: string;
  familia_intro: Record<string, string>;
  seccion_intro: Record<string, string>;
  ver_ficha: string;
}

export function contenidoIndice(locale: Locale): ContenidoIndice {
  const archivo = exigeBloque('_indice');
  const bloque = archivo[locale];
  if (!bloque) {
    throw new Error(`catálogo: _indice.json no trae el bloque "${locale}".`);
  }
  exigeClaves('_indice', locale, bloque, CLAVES_INDICE);

  const familia_intro = bloque.familia_intro as Record<string, string>;
  for (const f of FAMILIAS) {
    if (typeof familia_intro?.[f.id] !== 'string' || familia_intro[f.id].trim() === '') {
      throw new Error(`catálogo: _indice.json / ${locale}: falta "familia_intro.${f.id}".`);
    }
  }
  const seccion_intro = bloque.seccion_intro as Record<string, string>;
  for (const s of SECCIONES_EXTRA) {
    if (typeof seccion_intro?.[s.id] !== 'string' || seccion_intro[s.id].trim() === '') {
      throw new Error(`catálogo: _indice.json / ${locale}: falta "seccion_intro.${s.id}".`);
    }
  }

  return bloque as unknown as ContenidoIndice;
}

// ------------------------------------------------------------------ helpers

export function hrefFicha(locale: Locale, slug: string): string {
  return `${ruta(locale, 'catalogo')}${slug}/`;
}

export function herramientasDeFamilia(id: string): Herramienta[] {
  return HERRAMIENTAS.filter((h) => h.familia === id);
}

export function herramientasDeSeccion(id: string): Herramienta[] {
  return HERRAMIENTAS.filter((h) => h.seccion === id);
}

/**
 * Enlaza en un texto los nombres de otras fichas de la lista blanca.
 *
 * Sustituye primero por un marcador para no volver a buscar dentro del <a>
 * que se acaba de insertar. Solo la primera aparición de cada ficha.
 */
export function enlazarFichas(texto: string, locale: Locale, slugActual: string): string {
  const candidatos: Array<{ etiqueta: string; slug: string }> = [];
  for (const h of HERRAMIENTAS) {
    if (h.slug === slugActual) continue;
    candidatos.push({ etiqueta: h.nombre, slug: h.slug });
    const sinPrefijo = h.nombre.replace(/^Imberion\s+/, '');
    if (sinPrefijo !== h.nombre) candidatos.push({ etiqueta: sinPrefijo, slug: h.slug });
  }
  candidatos.sort((a, b) => b.etiqueta.length - a.etiqueta.length);

  const insertados: string[] = [];
  const yaEnlazados = new Set<string>();
  let salida = texto;

  for (const { etiqueta, slug } of candidatos) {
    if (yaEnlazados.has(slug)) continue;
    const escapada = etiqueta.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(^|[^\\p{L}\\p{N}_-])(${escapada})(?![\\p{L}\\p{N}_-])`, 'u');
    if (!re.test(salida)) continue;
    const marcador = `\u0000${insertados.length}\u0000`;
    salida = salida.replace(re, `$1${marcador}`);
    insertados.push(`<a href="${hrefFicha(locale, slug)}">${etiqueta}</a>`);
    yaEnlazados.add(slug);
  }

  return salida.replace(/\u0000(\d+)\u0000/g, (_, i) => insertados[Number(i)]);
}
