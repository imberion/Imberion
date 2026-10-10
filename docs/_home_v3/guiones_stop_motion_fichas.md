# Guiones de stop motion para las fichas de solución

**Medido:** 2026-10-09. **Estado:** SM4 (Training Signal) generado el 2026-10-10 y puesto en su ficha junto a la
mini-demo interactiva, para que Rodrigo decida si se quedan los dos. SM1 a SM3 esperan esa
decisión. Todo se genera con Codex (plan de ChatGPT, sin costo por imagen).

## Cómo leer cada guion

Cada pieza se lee en tres tiempos:

1. **El problema**, en los primeros cuadros.
2. **Lo que Imberion hace**, en los cuadros de en medio. Es el mecanismo, pero se ve con
   objetos y dura poco.
3. **El resultado para el cliente**, en los últimos cuadros, con una pausa larga. Es lo que
   se queda en la cabeza. Sigue la regla de Rodrigo del 2026-10-09: al cliente le interesa
   qué le resuelve, no cómo funciona.

## Decisiones comunes a las cuatro piezas

- **Destino:** la sección "Lo que resuelve" de cada ficha (`src/components/FichaCatalogo.astro`),
  en loop, junto al texto. La pieza visual de la portada y las mini-demos se quedan donde
  están.
- **Formato:** MP4 sin audio más póster, 16:9, unos 44 cuadros a 12 por segundo (casi 4
  segundos más las pausas). La acción va al centro para que el recorte a 4:3 en celular no
  la corte.
- **Técnica:** la misma del Checkup (PR #569 del brain, "Paso 3b"). Se genera un maestro con
  Nano Banana, una placa limpia sin objetos móviles con Codex, y los objetos que se mueven se
  componen con código. Así no cambian de forma entre cuadros.
- **Dirección de arte:** la mesa de las fotos de industria y del Checkup. Vista cenital,
  papel frío, luz de ventana a la izquierda, objetos sin marca, navy como color fuerte y
  petróleo solo en el resultado final.
- **Perfil de cliente:** donde aparecen clientes, las fichas vienen en tres tonos (gris
  claro, gris medio y navy), uno por perfil, para que se vea sin texto que todo se decide
  por perfil.
- **Sin manos y sin texto generado.** Cualquier etiqueta legible va como HTML encima del
  video, igual que los ejes del Checkup.
- **Póster:** el último cuadro, el del resultado. Es lo que se ve si el video no carga.
- **Costo por pieza:** cerca de US$0.30 en Nano Banana (cuatro borradores y el final). La
  placa limpia va con Codex y la composición no cuesta.

## SM1. Floor Signal

- **Lo que resuelve:** saber por qué el que entra a la tienda no compra, y en qué tienda y a
  qué hora corregirlo.
- **Escena:** un plano impreso de una tienda (contorno, anaqueles en bloques grises, una
  puerta y una caja) sobre la mesa.
- **Guion de cuadros:**
  - 1 a 8, **el problema:** entran fichas redondas de tres tonos por la puerta y avanzan
    por el pasillo, cada una con un trazo fino de lápiz. Casi todas salen de vuelta por la
    puerta. Solo dos llegan a la caja.
  - 9 a 22, **lo que hace Imberion:** junto al plano aparecen cinco tarjetas en columna
    (pasa, entra, se acerca, prueba, compra) con pilas de fichas que se achican hacia abajo.
    La tarjeta de "prueba" se marca: ahí se cae la mayoría, frente a un anaquel.
  - 23 a 30: el anaquel marcado cambia de acomodo (sus bloques grises se reordenan).
  - 31 a 44, **el resultado:** vuelven a entrar fichas. Ahora más de la mitad llega a la
    caja y se apila junto a ella. La pila de la caja queda en petróleo.
- **Zona que se mueve:** `0.15,0.1,0.75,0.8`.
- **Pausas:** 1 s al inicio y 2 s al final.

## SM2. Market Signal

- **Lo que resuelve:** saber en qué zona y en qué producto el precio de piso se alejó de la
  lista, y quién está recomendando a la competencia, antes de perder participación.
- **Escena:** un mapa regional impreso, solo contorno y sin nombres, con tarjetas chicas
  tipo etiqueta de precio en una pila a un lado.
- **Guion de cuadros:**
  - 1 a 8, **el problema:** el mapa limpio. Nadie sabe qué pasa en el piso.
  - 9 a 22, **lo que hace Imberion:** las etiquetas salen de la pila y se fijan en unos 14
    puntos del mapa.
  - 23 a 30: cuatro etiquetas de una misma zona se voltean y muestran una marca de lápiz:
    ahí el precio se alejó de la lista. Junto a dos aparece una tira con renglones
    ilegibles, el argumento con el que el mostrador recomienda otra marca.
  - 31 a 44, **el resultado:** las cuatro etiquetas de esa zona se vuelven a voltear, ya
    alineadas, y un círculo petróleo rodea la zona. El ajuste se hizo solo ahí, sin tocar
    el resto del mapa.
- **Zona que se mueve:** `0.1,0.05,0.8,0.9`.
- **Pausas:** 1 s al inicio y 2 s al final.

## SM3. Imberion Concierge

- **Lo que resuelve:** que ningún cliente se quede sin respuesta ni sin pedido, a cualquier
  hora y en el canal donde escribe, y que regrese.
- **Escena:** un teléfono negro boca arriba (el mismo de la foto de Servicios), una ficha de
  cliente en blanco a la izquierda y una nota de pedido a la derecha. Un reloj de mesa
  chico marca de noche.
- **Guion de cuadros:**
  - 1 a 8, **el problema:** llega un globo de papel al teléfono, fuera de horario, y se
    queda sin respuesta.
  - 9 a 20, **lo que hace Imberion:** los globos se contestan y se apilan alternando
    izquierda y derecha. La ficha de cliente se llena con renglones de lápiz y una marca de
    color con su perfil.
  - 21 a 30: la nota de pedido se llena renglón por renglón. Un globo pasa a una persona del
    equipo, hacia el borde de la mesa, y regresa resuelto.
  - 31 a 44, **el resultado:** la nota de pedido queda sellada con una marca petróleo. Llega
    un globo nuevo del mismo cliente, días después: volvió a comprar.
- **Zona que se mueve:** `0.1,0.1,0.8,0.8`.
- **Pausas:** 1 s al inicio y 2 s al final.

## SM4. Training Signal

- **Lo que resuelve:** que todo el piso venda con el argumento del mejor asesor, y que el
  asesor nuevo venda bien desde su primera semana aunque el catálogo cambie.
- **Escena:** una grabadora chica a la izquierda, una caja de producto sin marca con código
  de barras a la derecha, tres charolas de papel al centro y una bolsa de compra doblada.
- **Guion de cuadros:**
  - 1 a 8, **el problema:** la caja sola sobre la mesa y la bolsa vacía.
  - 9 a 20, **lo que hace Imberion:** de la grabadora salen tiras de papel con renglones
    ilegibles. Son las conversaciones de los mejores asesores humanos en piso, grabadas con
    su consentimiento. Las tiras se ordenan en las tres charolas (las etiquetas "Apertura",
    "Objeción" y "Cierre" van como HTML encima).
  - 21 a 30: tres tiras, una por charola, se juntan en una tarjeta de argumento que se
    desliza junto a la caja.
  - 31 a 44, **el resultado:** la tarjeta del argumento se acomoda junto a la caja y sale
    el ticket de venta con una línea petróleo: venta cerrada. (Hecho el 2026-10-10 con
    Codex; se cambió la bolsa por el ticket porque se compone con código sin deformarse.)
- **Zona que se mueve:** `0.1,0.15,0.8,0.7`.
- **Pausas:** 1 s al inicio y 2 s al final.

## Pendiente

- Que Rodrigo revise los cuatro guiones.
- Orden de producción propuesto: Floor Signal, Training Signal, Concierge y Market Signal
  (los dos primeros están en los deals de Flexi y Workplay).
- Servicio Memorable vive dentro de Training Signal (nota de diseño en
  `imberion-concierge/docs/_nota_servicio_memorable.md`) y todavía no está construido.
  Cuando lo esté, SM4 puede mostrar también al cliente que regresa.
