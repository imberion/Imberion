# imberion.com

## Qué es

El sitio público de Imberion, construido con Astro 7 como sitio estático. Tres idiomas: español, inglés y portugués. El español va en la raíz (`/que-resolvemos/`) y los otros dos bajo prefijo (`/en/what-we-solve/`, `/pt/...`), con slug propio por idioma.

## Cómo correr

```
npm ci
npm run dev       # servidor local de desarrollo
npm run build     # build estático a dist/
npm run preview   # sirve dist/ tal como saldría publicado
```

Node 24.

## Gates

```
npm run i18n:gate     # la migración de textos sigue siendo fiel al sitio viejo
npm run rutas:check   # las rutas construidas coinciden con el censo
```

`i18n:gate` compara `src/i18n/pages/*.json` contra los HTML del sitio viejo congelados en `scripts/i18n_origen/` y falla si cambió un solo string. `rutas:check` cuida que no se caiga ni se renombre una ruta en silencio.

## Dónde vive el contenido

- `src/i18n/pages/` es la migración literal del sitio viejo, protegida por el gate. No se edita a mano.
- `src/i18n/content/` es el contenido nuevo, editable, y el gate no lo toca.
- `src/data/` tiene las listas blancas que gobiernan qué existe: `industrias.json` y `catalogo.json`. Una industria o una solución sin entrada ahí no genera página.
- `scripts/i18n_origen/` guarda el sitio viejo congelado como origen del gate. No se sirve y no se edita.

## Cómo se despliega

Un push a `main` dispara `deploy-production.yml`, que construye y publica en Vercel por CLI. Después corre un smoke test contra cada ruta de `scripts/censo_rutas.txt` y exige 200 más el marcador `data-imberion-site="v2"` en el HTML, porque un deploy que publica la carpeta equivocada también responde 200. Cada PR genera su propio preview con el mismo smoke test y deja la URL comentada.

## Qué no se decide aquí

Este repo implementa el sitio. Qué se publica, con qué mensaje y para quién se decide en el Brain de Imberion, y llega aquí ya resuelto. Un cambio de posicionamiento o de catálogo empieza allá, no en un PR de este repositorio.
