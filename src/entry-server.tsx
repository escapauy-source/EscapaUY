/**
 * entry-server.tsx
 * Entry point for server-side rendering of SEO landing pages.
 * Used by scripts/prerender.mjs during the build process.
 */
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async';

import { ColoniaQuehacerPage } from './pages/seo/ColoniaQuehacerPage';
import { CarmeloBodegasPage } from './pages/seo/CarmeloBodegasPage';
import { EscapadaBuenosAiresPage } from './pages/seo/EscapadaBuenosAiresPage';
import { HotelesColoniaPage } from './pages/seo/HotelesColoniaPage';
import { EnoturismoUruguayPage } from './pages/seo/EnoturismoUruguayPage';

const SEO_PAGES: Record<string, React.ComponentType> = {
  '/colonia/que-hacer': ColoniaQuehacerPage,
  '/carmelo/bodegas': CarmeloBodegasPage,
  '/escapada-desde-buenos-aires': EscapadaBuenosAiresPage,
  '/hoteles/colonia': HotelesColoniaPage,
  '/experiencias/enoturismo-uruguay': EnoturismoUruguayPage,
};

export function render(url: string): { html: string; helmetState: HelmetServerState } {
  const helmetContext: { helmet?: HelmetServerState } = {};
  const PageComponent = SEO_PAGES[url];

  if (!PageComponent) {
    throw new Error(`No SEO page found for route: ${url}`);
  }

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <PageComponent />
      </StaticRouter>
    </HelmetProvider>
  );

  return { html, helmetState: helmetContext.helmet! };
}

export const seoRoutes = Object.keys(SEO_PAGES);
