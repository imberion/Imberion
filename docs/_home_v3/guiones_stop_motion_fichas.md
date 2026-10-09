# Guiones de stop motion para las fichas de solución

**Medido:** 2026-10-09. **Estado:** Rodrigo los aprobó el 2026-10-08; revisados el 2026-10-09
contra el copy nuevo del home. Se generan cuando él dé la orden.

## Ajustes del 2026-10-09 contra el copy nuevo del home

- **Perfil de cliente.** El home dice que las decisiones se arman por perfil de cliente. En
  Floor Signal y Concierge los objetos llevan uno de tres tonos (gris claro, gris medio y
  navy), uno por perfil, para que se vea sin texto.
- **Cámaras en tienda, las que ya existen o nuevas.** Rodrigo corrigió "las cámaras ya
  instaladas" (2026-10-07). Se corrigió también la ficha de Floor Signal en los tres
  idiomas.
- **Vendedores humanos.** Training Signal graba a los asesores en piso, no solo a
  agentes.
- **Una persona en el circuito.** Concierge cierra con el paso a una persona.
- **Sin compromisos largos.** Ninguna pieza muestra calendarios ni hojas de ruta.

## Decisiones comunes a las cuatro piezas

- **Destino:** el bloque "Lo que hace" de cada ficha (`src/components/FichaCatalogo.astro`),
  en loop, junto al texto. La pieza visual de la portada y las mini-demos se quedan donde
  están.
- **Formato:** MP4 sin audio más póster, 16:9, 36 a 40 cuadros a 12 por segundo (unos 3 a
  4 segundos). La acción va al centro para que el recorte a 4:3 en celular no la corte.
- **Técnica:** la misma del Checkup (PR #569 del brain, "Paso 3b"). Se genera un maestro
  con Nano Banana, una placa limpia sin objetos móviles con Codex, y los objetos que se
  mueven se componen con código. Así no cambian de forma entre cuadros.
- **Dirección de arte:** la mesa de las fotos de industria y del Checkup. Vista cenital,
  papel frío, luz de ventana a la izquierda, objetos sin marca, navy como color fuerte y
  petróleo solo en el último elemento, el que marca la decisión.
- **Sin manos y sin texto generado.** Cualquier etiqueta legible va como HTML encima del
  video, igual que los ejes del Checkup.
- **Costo por pieza:** cerca de US$0.30 en Nano Banana (cuatro borradores y el final). La
  placa limpia va con Codex y la composición no cuesta.

## SM1. Floor Signal

- **Mecanismo**, de la ficha: "instrumenta el piso con cámaras en tienda, las que ya
  existen o nuevas, e inteligencia artificial que corre en el propio sitio: tráfico,
  recorrido, atención al anaquel, prueba de producto...". El modelo emite atributos y
  trayectorias, nunca imágenes.
- **Escena:** un plano impreso de una tienda (contorno, anaqueles en bloques grises, una
  puerta) sobre la mesa. A la derecha, cinco tarjetas en columna que forman el embudo.
- **Guion de cuadros:**
  - 1 a 6: el plano vacío, con las cinco tarjetas en blanco.
  - 7 a 18: entran fichas redondas por la puerta, de una en una, y avanzan por el
    pasillo. Cada ficha deja un trazo fino de lápiz. Las fichas vienen en tres tonos, uno
    por perfil de cliente.
  - 19 a 28: las fichas se reparten entre anaqueles. En cada tarjeta del embudo aparece
    una pila de fichas que se achica de arriba abajo (pasa, entra, se acerca, prueba,
    compra). Cada pila conserva los tres tonos, así que se ve qué perfil se cae en qué paso.
  - 29 a 36: la tarjeta de "prueba" se vuelve petróleo. Es la caída que dispara la
    decisión: exposición alta y prueba baja en un anaquel.
- **Zona que se mueve:** `0.15,0.1,0.75,0.8`.
- **Pausas:** 1 s al inicio y 1.5 s al final.

## SM2. Market Signal

- **Mecanismo**, de la ficha: "lee el punto de venta real: precios y promociones en piso,
  el discurso con el que el canal recomienda, competidores y entrantes".
- **Escena:** un mapa regional impreso, solo contorno y sin nombres, con tarjetas chicas
  tipo etiqueta de precio en una pila a un lado.
- **Guion de cuadros:**
  - 1 a 6: el mapa limpio y la pila de etiquetas.
  - 7 a 22: las etiquetas salen de la pila y se fijan en puntos del mapa, unas 14.
  - 23 a 30: cuatro etiquetas de una misma zona se voltean y muestran una marca de lápiz.
    Es el precio de piso que se alejó de la lista. Junto a dos de ellas aparece una tira con
    renglones ilegibles: el argumento con el que el mostrador recomienda otra marca.
  - 31 a 38: un círculo petróleo rodea esa zona y una tarjeta de briefing entra desde la
    derecha.
- **Zona que se mueve:** `0.1,0.05,0.8,0.9`.
- **Pausas:** 1 s al inicio y 1.5 s al final.

## SM3. Imberion Concierge

- **Mecanismo**, de la ficha: "reconoce al cliente, recupera su historia y su valor... toma
  pedidos... cuando la conversación excede lo que puede resolver, escala a una persona con
  el contexto completo".
- **Escena:** un teléfono negro boca arriba (el mismo de la foto de Servicios), una ficha
  de cliente en blanco a la izquierda y una nota de pedido a la derecha.
- **Guion de cuadros:**
  - 1 a 6: el teléfono con la pantalla apagada.
  - 7 a 18: globos de papel recortado se apilan sobre la pantalla, alternando izquierda y
    derecha. Es la conversación.
  - 19 a 26: la ficha de cliente se llena con renglones de lápiz y una marca de color con
    su perfil. Es la memoria: historia, valor y perfil.
  - 27 a 34: la nota de pedido se llena renglón por renglón.
  - 35 a 40: un último globo en petróleo sale del teléfono hacia el borde de la mesa. Es
    el paso a una persona del equipo, con la ficha y el pedido detrás.
- **Zona que se mueve:** `0.1,0.1,0.8,0.8`.
- **Pausas:** 1 s al inicio y 1.5 s al final.

## SM4. Training Signal

- **Mecanismo**, de la ficha: "La base son los diálogos de valor: cómo abren, argumentan,
  manejan objeciones y cierran los mejores vendedores, capturados y anonimizados... se
  escanea un SKU y el agente entrega tecnicismos y argumentos de valor".
- **Escena:** una grabadora chica a la izquierda, una caja de producto sin marca con
  código de barras a la derecha y tres charolas de papel al centro.
- **Guion de cuadros:**
  - 1 a 6: la mesa con la grabadora, la caja y las charolas vacías.
  - 7 a 18: de la grabadora salen tiras de papel con renglones ilegibles, una por cuadro.
    Son las conversaciones de los mejores asesores en piso, grabadas con su consentimiento.
  - 19 a 28: las tiras se ordenan en las tres charolas. Las etiquetas "Apertura",
    "Objeción" y "Cierre" van como HTML encima.
  - 29 a 36: tres tiras, una por charola, se juntan en una tarjeta de argumento que se
    desliza junto a la caja. El borde de la tarjeta queda en petróleo.
- **Zona que se mueve:** `0.1,0.15,0.8,0.7`.
- **Pausas:** 1 s al inicio y 1.5 s al final.

## Pendiente

- Orden de producción propuesto: Floor Signal, Training Signal, Concierge, Market Signal
  (los dos primeros están en los deals de Flexi y Workplay).
- Servicio Memorable vive dentro de Training Signal (nota de diseño en
  `imberion-concierge/docs/_nota_servicio_memorable.md`) y todavía no está construido.
  Cuando lo esté, SM4 puede sumar una cuarta charola de servicio.
