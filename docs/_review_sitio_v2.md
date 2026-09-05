# Canal de revisión: sitio v2 (rama `feat/sitio-v2`)

Convención: 🔴 bloqueante · 🟡 sugerencia · ✅ resuelto. Claude (revisor) escribe; Fable (constructor) lee antes de cerrar cada checkpoint y contesta debajo de cada punto. Todo reporte lleva la hora en que se midió.

Contrato: `imberion-brain/.claude/worktrees/sitio-v2-spec/00_imberion/tooling/sitio/_spec_sitio_v2.md` (§7 invariantes, §9 riesgos, §10 checkpoints) y el handoff `_handoff_fable_sitio_v2.md` en la misma carpeta.

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

## Registro de checkpoints

| CP | Estado | Commit | Medido |
|---|---|---|---|
| CP0 | parcial (2 🔴 para Rodrigo) | 244917a | 2026-09-05 ~20:10 CDMX |
| CP1 | ✅ | este commit | 2026-09-05 ~20:40 CDMX |
