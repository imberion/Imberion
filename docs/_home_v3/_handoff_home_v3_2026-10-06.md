# Handoff: home v3 de imberion.com

**Medido:** 2026-10-06 23:00. **Rama:** `sitio/home-v3` (sobre `feat/sitio-v2`), worktree
`/Users/rodrigogarrido/Code/imberion-website/_wt_home_v3`, ver `git log -1`.
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

1. Apertura amarrada al scroll: portada, 01 Datos (lo que ya está y lo que se levanta),
   02 Decisión (ficha de decisión), 03 Valor.
2. Trayectoria (fondo blanco): tres resultados anónimos del portafolio de Rodrigo.
3. IA: "Lo que hace la IA / Lo que decide una persona".
4. Qué se contrata: Imberion opera o el equipo del cliente opera.
5. Para quién: escena con cuatro industrias y foto fija que cambia con el scroll.
6. Checkup: stop motion fijo con el paso actual en grande a su izquierda (arriba en
   celular), entregables y botones.

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
- Foto y nombre de Rodrigo: no en el home. La firma tiene que leerse como empresa grande,
  no como one-man show (2026-10-09).
- Servicio Memorable: metodología basada en los estándares de Ritz-Carlton, pero la marca
  Ritz-Carlton no se nombra sin licencia (nota en `imberion-concierge/docs/_nota_servicio_memorable.md`).
- Cifras de los casos: basta con que sean coherentes, factibles y sin abuso (2026-10-09).
- Resultado antes que mecanismo (2026-10-09): cada entrada dice qué resuelve; el cómo
  funciona solo donde importa (Checkup) o como lo que se requiere del cliente. Las
  industrias dicen "Lo que resolvemos". Decir "humanos", no "de carne y hueso".
- Fotos de IA con personas borrosas: fuera. Objetos sobre la mesa, sin personas, sí.
- Copy multiindustria siempre: nada que hable solo de retail.
- Nada de listas largas: la etapa 02 agrupa los modelos en tres preguntas.
- Stop motion: le gustó que abra con los cuestionarios llegando a la pila.
- "Qué decidimos" (tabla de seis palancas y la definición de RGM): fuera del home
  (2026-10-06). El ancla `#estrategia` ahora cae en Trayectoria.
- La captura de datos que hoy no existen va desde el principio: titular, lead y etapa 01.
- Industrias (2026-10-07): sin "Decisión típica" (no se entendía). Cada industria trae el
  problema, los indicadores que se mueven y seis frentes de trabajo tomados de su marco en
  el brain (`00_imberion/comercial/framework_*/Marco_Capacidades_*.md`). Retail incluye
  lo que se le ofrece a Flexi y a Workplay (Samsung): surtido, diálogos de valor, conversión,
  attachment rate, tráfico.

## Pendiente, en orden (actualizado 2026-10-08)

Segunda revisión a ciegas (2026-10-08, Sol como CFO de distribuidor B2B, director
comercial de consumo y director de operaciones de 60 tiendas de electrónica). Respuestas en
`revision2_sol_*.md`. Ya se corrigió el vocabulario que los tres no entendieron (trade-off,
compradores sintéticos, cadencia, "se puede aprobar") y la llamada de 30 minutos ya dice
para qué es.

Hecho el 2026-10-08 con las respuestas de Rodrigo: "Para quién" sube justo después de la
apertura; bajo el titular van los cuatro problemas, uno por industria; la llamada menciona
el modelo de madurez; el Checkup dice que usa datos del cliente y modelos analíticos, con
versión rápida (dos semanas) y completa (con entrevistas). La versión solo de entrevistas,
que no cuesta, no se menciona nunca (decisión de Rodrigo). Telecom y confitería ganaron
escala, método y plazo, tomados de `00_imberion/identidad/portfolio_proyectos.md`.

Hecho el 2026-10-09: el Checkup contrasta cada palanca con mejores prácticas de distintas
industrias (como Rodrigo se lo explicó a Santiago Andino de Prime Power, 2026-07-16); la
hoja de ruta de 18 a 24 meses sale (espanta) y entra "Siguientes pasos claros y quick wins
con retorno inmediato", también en la ficha del catálogo. Trayectoria: sale lácteos y entra
la política comercial de materiales de construcción (+2 pts de EBITDA en el caso de
negocio, cifra que Rodrigo dio de memoria). Abajo, aparte, tres casos de la tecnología de
Floor Signal tomados de la propuesta a Workplay, con la nota de la regla del 2026-09-24.

Lo que falta:

1. Cerrar el copy en español con Rodrigo (él dice cuándo).
2. Generar los stop motion de las fichas cuando Rodrigo dé la orden; guiones revisados el
   2026-10-09 en `guiones_stop_motion_fichas.md`.
3. Traducir el home v3 a EN y PT después del punto 1.
4. Merge de los PR del brain #565 (DM Mono) y #569 (stop motion compuesto).

## Revisión a ciegas (2026-10-06)

Cuatro lectores sin contexto (director comercial y CFO, en Claude y en Sol) sobre la primera
versión. Brief en `revision_ciega_brief.md`; las respuestas de Sol están en esta carpeta; las
de Claude coincidieron. Lo que dijeron los cuatro y ya se atendió: el arco se contaba tres
veces, 13 nombres de producto en inglés se leían como software, fotos de IA repetidas, y
ninguno agendaba sin evidencia, sin saber quién responde y sin un primer paso concreto. Lo
que les funcionó: la ficha de decisión, la tabla de palancas, IA contra persona y "se arranca
con lo que hay".
