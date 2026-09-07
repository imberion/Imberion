# Piezas visuales de las fichas del catálogo

Una imagen por ficha, nombrada por su slug (`<slug>.png`). La ficha la rinde
`FichaCatalogo.astro` solo si el JSON de contenido trae la clave `pieza`
(`alt` y `pie` en los tres locales); imagen sin `pieza` o `pieza` sin imagen
tumban el build.

Regla (spec §7.8 y CP11d): captura real o pieza del material del producto.
Nunca un gráfico conceptual ni una captura inventada. Sin ochre ni verde
(invariantes 7 y 13 del sitio).

## Procedencia (2026-09-07)

Recortes a 2x, con Chrome headless, de los decks de producto que viven en Drive
`Imberion/05_soluciones/<producto>/imberion_<producto>_deck.html` (fuente en el
Brain: `00_imberion/comercial/<producto>/_build.py`). Al capturar se inyectó una
hoja que apaga los acentos que el sitio no usa: `--status-green` y
`--status-yellow` a navy, `--pdv-comp` a gris azulado. Nada más se tocó.

| Archivo | Deck · lámina | Elemento |
|---|---|---|
| `floor-signal.png` | Floor Signal · 03 "El e-commerce en la vida real" | `.dash` (tablero: embudo, composición del tráfico, lecturas) |
| `training-signal.png` | Floor Signal · 05 "Oídos para aprender del mejor vendedor" | `.voz-app` (panel de Training Signal) |
| `concierge.png` | Concierge · 03 "Conoce a cada cliente" | `.c360` (memoria del cliente) |
| `market-signal.png` | Market Signal · 06 "Pregúntale a tu mercado" | `.comp-chat` (Companion) |

Los datos que aparecen en las piezas son ilustrativos: el material del producto
se construyó con datos ficticios y el pie de cada ficha lo declara.

Las demás fichas no tienen material visual propio todavía (pendiente 🔴 de
CP8 en el spec: qué producto se puede enseñar sin quemar cliente).
