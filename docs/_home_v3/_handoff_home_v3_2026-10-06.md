# Handoff: home v3 de imberion.com

**Medido:** 2026-10-06 22:48. **Rama:** `sitio/home-v3` (sobre `feat/sitio-v2`), worktree
`/Users/rodrigogarrido/Code/imberion-website/_wt_home_v3`, último commit `f5646c9`.
**Sin push:** el repo `imberion/Imberion` es público. Respaldo incremental en Drive:
`Unidades compartidas/Imberion/04_marca/sitio_web/respaldos/imberion-website_sitio-home-v3_2026-10-05.bundle`
(requiere el bundle base `imberion-website_ramas-sin-subir_2026-10-05.bundle` de la misma carpeta).
Solo el home en español usa el v3 (`src/pages/index.astro`); EN y PT siguen con el home viejo.

## Cómo verlo y medirlo

- Servidor local: `npx astro dev --port 4391` desde el worktree. Abrir http://localhost:4391/.
- Capturas: los scripts de `docs/_home_v3/herramientas/` usan Playwright con el Chromium
  cacheado en `~/Library/Caches/ms-playwright/chromium_headless_shell-1234/`. Necesitan
  `npm i playwright@1` en una carpeta de trabajo (no se instaló en el repo).
  - `v3.mjs <prefijo> <ancho> <alto>`: seis etapas de la apertura y el resto de la página.
  - `film2.mjs`: cinco posiciones del stop motion del Checkup.
  - `ind.mjs`: las cuatro industrias de "Para quién".
  - `sheet.py`: hojas de contacto de cuatro capturas.
- Gates antes de cada commit: `npm run build`, `npm run gate:acentos`, `npm run i18n:gate`.

## Dónde vive cada cosa

- Contenido: `src/i18n/content/home-v3.json` (solo `es`).
- Página: `src/components/HomeV3.astro`. Apertura: `src/components/home/Apertura.astro`.
  Estilos: `src/styles/home-v3.css`.
- Fotos de industria: `src/assets/home/ind-*.jpg` (generadas con Nano Banana, misma mesa del
  stop motion; dos corregidas a mano para quitar texto legible).
- Stop motion del Checkup: secuencia en `public/stop-motion/checkup/1280/` (40 cuadros,
  AVIF y WebP). Material completo en Drive, `Unidades compartidas/Imberion/06_marketing/stop_motion/checkup/`
  (maestro, placa sin tarjetas, `cuadros_v2`, `salida_v2` con MP4 y hoja de contacto). El
  script que compone los cuadros está aquí: `herramientas/componer_stop_motion_checkup.py`.
  La técnica quedó documentada en la skill de stop motion del brain (PR #569).

## Estructura actual del home

1. Apertura amarrada al scroll: portada, 01 Datos, 02 Decisión (ficha de decisión), 03 Valor.
2. Qué decidimos: seis palancas en tabla.
3. Trayectoria: tres resultados anónimos del portafolio de Rodrigo, encabezados por palanca.
4. IA: "Lo que hace la IA / Lo que decide una persona".
5. Qué se contrata: Imberion opera o el equipo del cliente opera.
6. Para quién: escena con cuatro industrias y foto fija que cambia con el scroll.
7. Checkup: dos semanas, entregables, stop motion fijo con cuatro pasos debajo.

## Decisiones de Rodrigo (no volver a proponer)

- Titular grande con una palabra en cursiva: cliché de IA, fuera.
- Etiquetas de sección numeradas en mono ("03 Inteligencia artificial"): cliché de IA, fuera.
- DM Mono aprobada como tercera fuente (PR #565 en el brain).
- Trayectoria anónima del portafolio: aprobada para publicarse así.
- Checkup: alcance sin precio; dos semanas en su versión rápida.
- Simulador de precios: fuera del home (sigue en la ficha de Scenario Engine).
- Cuatro industrias: Retail; Bienes de consumo (alimentos, bebidas, cuidado personal,
  electrónica de consumo); B2B industrial; Servicios (telecomunicaciones, financieros,
  servicios al consumidor).
- Foto de Rodrigo: no en el home hasta que haya más gente en la firma.
- Fotos de IA con personas borrosas: fuera. Objetos sobre la mesa, sin personas, sí.
- Copy multiindustria siempre: nada que hable solo de retail.
- Nada de listas largas: la etapa 02 agrupa los modelos en tres preguntas.
- Stop motion: le gustó que abra con los cuestionarios llegando a la pila.

## Pendiente, en orden (feedback de Rodrigo del 2026-10-06 22:40)

1. **Falta la captura de datos que hoy no existen.** El home no habla de agentes de voz,
   de instrumentar el punto de venta ni de levantar la información con la que el cliente no
   cuenta. Es un diferenciador y está ausente. Material de catálogo para apoyarse:
   Floor Signal (cámaras ya instaladas, recorrido y anaquel), Market Signal (precio y
   discurso del canal en el punto de venta), Concierge (atención por WhatsApp), audio de piso
   con grabadoras, Training Signal. Decidir con Rodrigo si va en la apertura (etapa 01) o
   como sección propia.
2. **La sección "Qué decidimos" se lee condescendiente** ("Revenue Growth Management es la
   disciplina que..."). Rodrigo no está seguro de que le guste la sección. Opciones a
   proponerle: quitarla, o convertirla en las preguntas que el cliente ya se hace sin
   explicar qué es RGM.
3. **Checkup: no se ve lo que va pasando.** Los cuatro pasos están chicos y debajo de la
   imagen; la mirada se queda en la animación. Llevar el texto a donde está la mirada: sobre
   la imagen o al lado, más grande, cambiando con cada paso.
4. Ficha del Checkup en el catálogo (`src/i18n/content/catalogo/checkup.json`): dice
   "costo, retorno y dificultad"; el repo `~/Code/imberion-checkup` dice matriz por impacto
   y esfuerzo, puntaje de madurez y hoja de ruta de 18 a 24 meses.
5. Stop motion para cada página de solución (Rodrigo lo quiere; la técnica está en el PR #569).
6. Traducir el home v3 a EN y PT cuando Rodrigo apruebe el español.
7. Merge de los PR del brain #565 (DM Mono) y #569 (stop motion compuesto).

## Revisión a ciegas (2026-10-06)

Cuatro lectores sin contexto (director comercial y CFO, en Claude y en Sol) sobre la primera
versión. Brief en `revision_ciega_brief.md`; las respuestas de Sol están en esta carpeta; las
de Claude coincidieron. Lo que dijeron los cuatro y ya se atendió: el arco se contaba tres
veces, 13 nombres de producto en inglés se leían como software, fotos de IA repetidas, y
ninguno agendaba sin evidencia, sin saber quién responde y sin un primer paso concreto. Lo
que les funcionó: la ficha de decisión, la tabla de palancas, IA contra persona y "se arranca
con lo que hay".
