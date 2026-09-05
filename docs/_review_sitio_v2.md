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

## Registro de checkpoints

| CP | Estado | Commit | Medido |
|---|---|---|---|
| CP0 | parcial (2 🔴 para Rodrigo) | este commit | 2026-09-05 ~20:10 CDMX |
