# Canal de revisión: sitio v2 (rama `feat/sitio-v2`)

Convención: 🔴 bloqueante · 🟡 sugerencia · ✅ resuelto. Claude (revisor) escribe; Fable (constructor) lee antes de cerrar cada checkpoint y contesta debajo de cada punto. Todo reporte lleva la hora en que se midió.

Contrato: `imberion-brain/.claude/worktrees/sitio-v2-spec/00_imberion/tooling/sitio/_spec_sitio_v2.md` (§7 invariantes, §9 riesgos, §10 checkpoints) y el handoff `_handoff_fable_sitio_v2.md` en la misma carpeta.

> 🔴 **NO MERGEAR ESTA RAMA A `main` ANTES DE CP9.** Hallazgo del verificador fresco (2026-09-05 ~21:50 CDMX): `vercel.json` publica solo `dist/`, y hasta que CP4-CP9 porten todas las rutas, `dist/` es un andamio. Un merge hoy reemplaza imberion.com por tres páginas de "sitio en construcción" con el smoke test en verde, porque el smoke verifica que se sirvió la carpeta correcta, no que se sirvió el sitio completo. CP9 cierra ese hueco con el censo de rutas (cero 404 contra las 13 URLs actuales) dentro del smoke. La descripción del PR debe repetir este aviso.

## Decisiones que necesitan a Rodrigo

### CP0 · Higiene bloqueada por permisos (medido 2026-09-05 ~20:10 CDMX)

El sandbox de la sesión bloqueó `git worktree remove` y `git branch -D`. Verifiqué antes que las cuatro ramas squash-mergeadas coinciden por `patch-id` con commits de `origin/main` (#1, #2, #3, #4) y que `site/activar-senal` va 0 commits adelante. Borrarlas no pierde nada. Comandos pendientes, desde `~/Code/imberion-website/Imberion`:

```
git worktree remove ../_wt_contraste
git worktree remove ../_wt_site_senal
git branch -D site/contraste-cuerpo site/accent-tokens site/remove-orphan-colors feat/embellecimiento-impeccable site/activar-senal
```

### CP0 · Trabajo sin commitear rescatado de `_wt_site_senal`

El worktree `_wt_site_senal` tenía 26 líneas sin commitear en `index.html`: una pasada que prende la señal en petróleo (`--signal`, `--signal-line`, `--signal-ink` sobre nav, progress bar, hover de CTA). Contradice el invariante 7 del spec (sitio monocromo por decisión). No lo apliqué ni lo destruí: quedó en `git stash` del repo con el mensaje "WIP site/activar-senal: senal en petrol, rescatado en CP0 de sitio-v2". Decisión: `git stash drop` si se descarta, o se recupera como referencia si CP7 decide adoptar petróleo como acento del sitio.

### CP0 · Línea base de Analytics: dos pasos que solo Rodrigo puede dar

Web Analytics sigue apagado en el proyecto de Vercel (`get_web_analytics` devuelve 404 el 2026-09-05 ~20:05 CDMX). Encenderlo toca el proyecto de Vercel y producción, fuera de mi mandato. Dejé listo lo que sí puedo:

- Rama local `chore/analytics-baseline` (worktree `../_wt_analytics_baseline`, sobre `origin/main`) con el script de Web Analytics en las 13 páginas vivas del sitio actual. Los 3 one-pagers no lo llevan porque nadie los enlaza.
- Pasos de Rodrigo: (1) Vercel → proyecto `imberion` → Analytics → Enable. (2) `git push -u origin chore/analytics-baseline` y abrir PR; el merge a `main` dispara el deploy del sitio actual con el script. Sin el paso 1 el script devuelve 404 en silencio y no rompe nada; sin el paso 2 no hay datos.

El orden importa: la línea base debe correr sobre el sitio actual antes de que salga el v2.

## CP0 · Higiene y línea base

Estado (2026-09-05 ~20:10 CDMX):

- ✅ `main` local en `72edbde`, al día con `origin/main` (fast-forward de 3 commits).
- ✅ Worktree `../_wt_sitio_v2` creado, rama `feat/sitio-v2` sobre `origin/main`.
- ✅ Nada automático apunta a los worktrees viejos (`grep` en `~/Library/LaunchAgents/` y `~/.imberion/` sin resultados); ningún worktree con lock.
- 🔴 Borrado de 5 ramas y 2 worktrees: bloqueado por permisos, ver arriba.
- 🔴 Analytics: preparado, no encendido, ver arriba.

Hallazgos que ajustan el plan de CP1:

- El sitio actual no carga el brand kit desde jsDelivr: cero referencias a `cdn.jsdelivr.net` en los 16 HTML y en `assets/`. El CSS vive inline y en `assets/css/`. El riesgo 🟡 de §9 sobre `@main` aplica a cómo v2 consumirá el kit, no a algo que ya esté roto. `imberion-brand` no tiene ningún tag hoy, así que "clavar a un tag" implica crear el tag desde `_publish_kit.sh` del Brain (invariante 6), o vendorizar el CSS en el repo del sitio. Recomendación: vendorizar lo mínimo que se use y dejar el CDN fuera del path crítico.
- `assets/` pesa 42 MB; 21 MB son texturas sin optimizar y 5.8 MB un `.pptx` que no debería vivir en un repo público. Entra en CP8/CP9.
- Node 26 y npm 11 disponibles en la Mac. El proyecto de Vercel corre Node 24.x; el andamio de CP1 fija `engines` a 24.

## CP1 · Andamio Astro

Estado (2026-09-05 ~20:40 CDMX):

- ✅ Astro `^7.3.1` (estable más reciente; el ejecutor había clavado 5.18.2 y lo subí: build limpio en 7 y `npm audit` en cero, contra 3 vulnerabilidades en el árbol de 5). `engines.node 24.x` como el proyecto de Vercel.
- ✅ Rutas por locale: `/` (ES canónico), `/en/`, `/pt/`, con `prefixDefaultLocale: false`. Los tres `dist/**/index.html` salen con `lang` correcto y el marcador `data-imberion-site="v2"` en `<html>`.
- ✅ `vercel.json` = `{"framework":"astro","buildCommand":"astro build","outputDirectory":"dist"}`. `public/` solo tiene `favicon.png`.
- ✅ `npm run build` sin warnings ni errores; `git diff --check` limpio; screenshots de las tres rutas vistos (fondo papel, Cormorant navy, acentos correctos).
- ✅ Smoke test post-deploy en `deploy-production.yml`: 200 **y** marcador en `/`, `/en/`, `/pt/`, con 6 reintentos. Si Vercel sirviera `public/`, falla con el mensaje que apunta a `outputDirectory`.
- ✅ `preview.yml`: deploy de preview por PR + mismo smoke + comentario único en el PR. Ningún workflow se ejecutó en esta sesión (sin push).
- ✅ CSS del sitio vendorizado literal en `src/styles/site.css` (diff vacío contra `assets/css/imberion-site.css`; conserva la contención monocroma del invariante 7). Entra por `import` en `Base.astro`, que es como Astro emite el bundle.

Decisiones tomadas en CP1, por si el revisor las quiere voltear:

- **Brand kit: vendorizar, no CDN.** El sitio actual no usa jsDelivr y `imberion-brand` no tiene tags. Clavar a un tag exigiría crear el tag desde `_publish_kit.sh` del Brain. Mientras, el CSS propio del sitio vive en el repo y el CDN queda fuera del path crítico. Si CP7 necesita `imberion_charts.css` o `anim_noise_to_signal.html`, se vendoriza la pieza con su commit de origen anotado.
- **El smoke de producción exige el marcador v2.** Consecuencia: el workflow modificado no debe mergearse a `main` antes que el sitio v2, o tumba el deploy del sitio actual. Los dos viajan en esta misma rama, así que no hay ventana de riesgo mientras nadie los separe.

🟡 Para Rodrigo (no bloquea): el proyecto tiene Deployment Protection en modo "Vercel Authentication, todo menos dominios custom" (medido 2026-09-05 ~20:20 CDMX). El smoke del preview recibirá 401 hasta que exista el secret `VERCEL_AUTOMATION_BYPASS_SECRET` en GitHub (se genera en Vercel → Settings → Deployment Protection → Protection Bypass for Automation). El workflow ya manda el header si el secret existe.

Medición para el gate de CP3: extraje los dos mecanismos de i18n de las 13 páginas vivas (`const T` en `index`, `how-it-works`, `how-we-operate`; `window.IMB_I18N` en las otras 10). **3,261 strings hoja** (ES+EN+PT), no 2,799 como dice el spec; la diferencia es de método de conteo (el spec contó claves, aquí cuento hojas dentro de arrays anidados). El gate de CP3 diffea contra esta extracción, guardada como JSON por página.

## CP2 · Artefactos de decisión (propuesta, NO aprobada)

Estado (2026-09-05 ~22:00 CDMX). Los tres documentos viven en el Brain porque su razonamiento nombra clientes; en este repo solo entra la lista blanca resultante (`src/data/catalogo.json`, sin estados internos ni nombres). Rama `worktree-sitio-v2-spec` del Brain, carpeta `00_imberion/tooling/sitio/`:

- `_proyeccion_publica_sitio_v2.md`: 32 decisiones. 19 salen, 4 salen con corte, 4 quedan como línea de familia sin ficha, 5 no salen. Resultado: 23 fichas (la primera versión decía 19 por error de suma; corregido 2026-09-05 ~22:20 CDMX; queda arriba del rango 18-20 del spec porque el censo dejó menos fail-closed que el `Estado:` sugería). Seis decisiones para Rodrigo al final (Twin sin fichas, Training Signal, Price Value Compass y Scenario Engine, el MOCA, `distribuidores`, `logistics`).
- `_cruce_industria_herramienta_sitio_v2.md`: 9 industrias × 19 herramientas del motor RGM (las 4 de estrategia van como fila transversal). 113 celdas con evidencia `archivo:línea` en los frameworks, 18 celdas marcadas como propuesta del arquitecto. Cinco decisiones para Rodrigo.
- `_slugs_sitio_v2.md`: vocabulario canónico (Brain, icono, sitio actual, URL v2), rutas del núcleo por locale y el censo de redirects que CP9 debe cubrir.

Gate del spec: ninguna herramienta sin decisión (32 de 32) y cero nombre de cliente ni estado interno en lo que entra al repo del sitio (grep en `src/data/catalogo.json`: 0). Hasta que Rodrigo apruebe, CP4 construye el template y las fichas sobre esta lista como borrador; quitar una ficha es borrar una entrada del JSON.

Hallazgos del verificador fresco sobre CP0+CP1 que quedan registrados:

- ✅ Reprodujo build desde el commit limpio, el smoke test contra `public/` (falla) y contra `dist/` (pasa), e invariantes 5, 7, 14 y 15.
- 🔴 El aviso de no mergear, arriba.
- 🟡 "Brand kit clavado a un tag" se sustituyó por vendorizar; queda como desviación del gate de CP1 para que Rodrigo la ratifique.
- 🟡 `src/styles/site.css` y `assets/css/imberion-site.css` conviven sin sincronía hasta CP9, que retira la vieja.
- 🟡 `npm ci` avisa `EBADENGINE` en la Mac (Node 26 contra `engines 24.x`); en CI corre Node 24.
- 🟡 Este canal mete IDs de Vercel en un repo cuyo root se sirve público; la protección hoy es el propio `vercel.json` que acota a `dist/`. Ubicación dictada por el handoff.

## CP5 · Template de industria

Estado (2026-09-05 ~23:40 CDMX):

- ✅ `/industrias` + 9 industrias × 3 locales (30 rutas). Las 5 migradas rinden su contenido literal de `src/i18n/pages`; las 4 nuevas (automotriz, telco, servicios-b2b, servicios-b2c) tienen JSON con el esquema exacto de `b2b.json` (81 claves), redactadas desde los frameworks del Brain sin proveedores, cifras ni clientes. Commit verificado en checkout detached: 105 páginas.
- ✅ Mini-diagnóstico portado del sitio actual: 7 dimensiones en retail y 8 en el resto, con celdas `<button>` accesibles por teclado y `prefers-reduced-motion`. Prueba estructural sobre `dist/`: filas y celdas correctas en retail y b2b, motor inline.
- ✅ Gate de esquema: `src/lib/industrias.ts` tumba el build ante un slug sin JSON o una clave faltante (probado en los dos casos). Gate i18n verde. Grep interno (`temisa|flexi|axo|presales|Estado:|manhattan`) sobre las rutas de industria: 0.
- ✅ Fidelidad contra `retail.html` comparada en screenshot: misma retícula y tipografía. Una desviación deliberada: la nota bajo la matriz era casi invisible en el original (blanco al 65% sobre papel) y ahora va en navy.
- ✅ Corregido en el shell el lead del hero navy sobre navy (una regla en `shell.css`), que afectaba a industrias, catálogo y núcleo.
- 🟡 Los destinos de las tarjetas con enlace (`capN_l`) no vienen en el JSON viejo; viven en un mapa dentro de `src/lib/industrias.ts` leído de los HTML originales. Si una tarjeta nueva trae etiqueta sin destino, el build falla.

## CP4 · Template de catálogo y fichas

Estado (2026-09-05 ~23:15 CDMX):

- ✅ `/catalogo` + 23 fichas × 3 locales (72 rutas) construyen limpio; verificado en un checkout detached del commit, sin el trabajo en curso de otros agentes: 75 páginas.
- ✅ Shell compartido (CP4a): nav y pie portados con las mismas clases, selector de idioma que navega a la página equivalente, canonical y hreflang por locale, helper de rutas con 9 casos verdes.
- ✅ Gate de la lista blanca: `src/lib/catalogo.ts` tumba el build si a un slug le falta JSON o clave (probado borrando `promociones.json`). Gate i18n verde sin cambios. Grep de `temisa|flexi|axo|presales|Estado:|04_skills` sobre `dist/`: 0.
- ✅ Copy de las 23 fichas redactado desde el catálogo canónico con el filtro del §7.1 y sin cifras (las fichas viejas de Market Signal, Floor Signal y Concierge traían números de ejemplo; se sustituyeron por el mecanismo). Segunda persona: 0 en 24 archivos × 3 locales. Screenshots vistos: índice completo, ficha ES/EN/PT.
- 🟡 Defecto del shell hallado por el agente de catálogo: `.lead` sale navy sobre navy en cualquier `page-hero` (el CSS vendorizado lo pinta en `navy-72` y los HTML viejos lo corregían por página). El catálogo lo corrige localmente; el arreglo de fondo va en `shell.css` y se aplica al cerrar CP5/CP6, cuando nadie más edite ese archivo.
- 🟡 La intro de la familia Twin y la línea de familia sin ficha son idénticas; el índice omite la repetición con un guardia. Al aprobar CP2, decidir si se diferencian.
- 🟡 Growth Hacking y Marketing & ROMI solo aplican a retail según el cruce; en la ficha se ven con un solo chip de industria. Es dato del cruce, no error de template.

Decisión tomada: cada template lleva su CSS con scope de Astro (secciones, franja CTA, rejillas) en vez de crecer `shell.css`, para no chocar entre agentes en paralelo. CP7 puede consolidarlo.

## CP3 · Migración del i18n existente

Estado (2026-09-05 ~21:45 CDMX):

- ✅ Los dos mecanismos (`const T` en 3 páginas, `window.IMB_I18N` en 10) extraídos a `src/i18n/pages/<slug>.json` con claves, orden y valores byte a byte (HTML inline y entidades incluidos).
- ✅ Gate `npm run i18n:gate` reproducido en esta sesión: 3,261 hojas en origen, 3,261 en destino, 0 faltantes, 0 distintas, 0 páginas sin JSON, 0 JSON huérfanos. El gate re-extrae desde los HTML viejos (que siguen en el root hasta CP9) y compara; falla con código 1 ante una sola diferencia.
- ✅ Riesgo 🟡 §9 (clave faltante rinde español bajo `/en/`): 0 claves de ES sin equivalente en EN o PT en las 13 páginas. El cargador `t(page, locale)` hace fallback a ES **por clave** y avisa en DEV con la ruta exacta, para que un hueco futuro no pase en silencio.
- ✅ Extractor determinista (mismo SHA agregado en dos corridas); el gate importa el mismo parser en vez de duplicarlo. `npm run build` limpio.
- 🟡 `astro check` no corrió: pide `@astrojs/check` y `typescript`, que no se instalaron para no ampliar el árbol. `index.ts` compila dentro del build. Se puede agregar en CP4 si el template lo necesita.

Regla registrada en `src/i18n/README.md`: los JSON de `pages/` son la migración literal y no se editan a mano mientras existan los HTML de origen; el contenido nuevo (CP4-CP6) va en `src/i18n/content/`.

Nota de orden: CP3 cerró antes que CP2 porque no depende de él. CP2 (dos artefactos de decisión) está redactado como propuesta en el Brain y se registra abajo cuando cierre.

## Registro de checkpoints

| CP | Estado | Commit | Medido |
|---|---|---|---|
| CP0 | parcial (2 🔴 para Rodrigo) | 244917a | 2026-09-05 ~20:10 CDMX |
| CP1 | ✅ | 1563849 | 2026-09-05 ~20:40 CDMX |
| CP2 | propuesta, pendiente de Rodrigo | este commit (sitio) + Brain `worktree-sitio-v2-spec` | 2026-09-05 ~22:00 CDMX |
| CP3 | ✅ | 46c2965 | 2026-09-05 ~21:45 CDMX |
| CP4 | ✅ | f10459e (shell) + f402414 (catálogo) | 2026-09-05 ~23:15 CDMX |
| CP5 | ✅ | 8f514e7 | 2026-09-05 ~23:40 CDMX |
