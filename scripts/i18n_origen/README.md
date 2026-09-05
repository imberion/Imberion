# Origen congelado de la migración de i18n

## Qué es

Los 13 HTML del sitio viejo de imberion.com, tal como estaban en `origin/main` al corte `72edbde`. Cada uno lleva embebido su diccionario de traducciones (`const T = {...}` o `window.IMB_I18N = {...}`) con los tres locales.

Son el origen contra el que `scripts/i18n_extraer.mjs` y `scripts/i18n_gate.mjs` comprueban que `src/i18n/pages/*.json` es una migración literal: 3261 strings hoja, byte a byte, incluido el HTML inline y las entidades. Sin esta copia el gate no tendría contra qué comparar, porque el sitio viejo se retiró del root del repo en CP9b.

## Qué no es

No se sirve. Astro solo publica `dist/`, y esta carpeta vive bajo `scripts/`, fuera de `public/` y fuera de `src/pages/`. Nada de aquí llega al sitio.

No se edita. Cambiar un archivo de esta carpeta no cambia el sitio: mueve el origen y vuelve verde un gate que debería estar rojo. Si una traducción tiene que cambiar, se cambia en `src/i18n/pages/` o en `src/i18n/content/`, y si el gate se pone rojo por eso, la discusión es si esa clave sigue siendo migración literal o ya es contenido nuevo.

## Enlaces rotos

Estos HTML apuntan a `assets/`, que se borró del repo en el mismo CP9b. Los enlaces a CSS, JS e imágenes están rotos y abrir uno de estos archivos en el navegador se ve mal. Es aceptable y no se arregla: lo único que se lee de ellos es el bloque de traducciones, y el gate lo extrae del texto sin resolver ninguna ruta.
