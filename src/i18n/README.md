# i18n del sitio

## De dónde salen los JSON

`pages/<slug>.json` es la migración literal de las traducciones que el sitio
viejo llevaba embebidas en cada HTML, con dos mecanismos:

- `const T = { ... }` en `index.html`, `how-it-works.html` y `how-we-operate.html`.
- `window.IMB_I18N = { ... }` en las otras 10 páginas.

El slug es el nombre del archivo sin `.html`. Cada JSON tiene la forma
`{ "es": {...}, "en": {...}, "pt": {...} }` y preserva claves, orden y valores
byte a byte, incluido el HTML inline (`<em>`, `<br>`) y las entidades.

Total migrado: 13 páginas, 3261 strings hoja.

## Cómo regenerarlos

```
npm run i18n:extraer
```

`scripts/i18n_extraer.mjs` vuelve a leer los HTML congelados en
`scripts/i18n_origen/` y reescribe los 13 JSON. Es determinista: dos corridas
seguidas producen el mismo output.

## Qué hace el gate

```
npm run i18n:gate
```

`scripts/i18n_gate.mjs` re-extrae las traducciones desde los HTML congelados
en `scripts/i18n_origen/`, en memoria, y las compara contra `pages/*.json`. Por página y locale, cada hoja
(ruta de clave completa, con índices de array) tiene que existir con el mismo
valor. Reporta hojas en origen, hojas en destino, faltantes y distintas, y sale
con código 1 si aparece una sola. Perder strings en esta migración es el peor
destrozo posible, así que el umbral es cero.

Aparte, y sin hacer fallar el gate, reporta las claves que existen en español y
faltan en inglés o portugués: una clave así rendiría texto en español bajo
`/en/` con `lang="en"`. Hoy son cero.

## Regla de edición

Los JSON de `pages/` no se editan a mano. Son la copia fiel del sitio viejo y
solo cambian regenerándolos desde `scripts/i18n_origen/`. El gate protege esa
equivalencia y una edición manual lo pone en rojo.

CP9b retiró el sitio viejo del root del repo. Los 13 HTML sobreviven congelados
en `scripts/i18n_origen/` para que el gate siga teniendo contra qué comparar,
con su propio README: no se sirven y no se editan.

El contenido nuevo vive en `content/`, carpeta que el gate no toca.

## Cargador

`index.ts` expone `Locale`, `LOCALES`, `DEFAULT_LOCALE` y `t(page, locale)`.
`t` devuelve el diccionario de esa página en ese locale con fallback a español
clave por clave, no por página entera, y en desarrollo emite un `console.warn`
por cada clave que cayó al fallback.
