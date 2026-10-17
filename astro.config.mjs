// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.imberion.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    // Sin la opción i18n: empareja alternates por prefijo de ruta y los
    // segmentos EN van traducidos (/en/catalog/ contra /catalogo/), así que
    // emitía hreflang incompletos. Los hreflang correctos salen de Base.astro.
    // Solo el español está publicado (ver LOCALES_PUBLICADOS en src/lib/rutas.ts).
    sitemap({ filter: (url) => !/\/(en|pt)\//.test(new URL(url).pathname) }),
  ],
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en', 'pt'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
