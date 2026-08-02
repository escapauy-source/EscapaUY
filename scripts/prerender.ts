/**
 * prerender.ts — SSG pre-render para las 5 páginas SEO de EscapaUY
 *
 * Compilar y ejecutar:
 *   npx esbuild scripts/prerender.ts --bundle --platform=node --format=cjs
 *     --jsx=automatic --alias:@=./src --outfile=.prerender-tmp.cjs --log-level=error
 *   PROJECT_ROOT=$(pwd) node .prerender-tmp.cjs && rm .prerender-tmp.cjs
 *
 * Ver "prerender" en package.json para el one-liner.
 */

import fs from 'node:fs';
import path from 'node:path';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import { StaticRouter } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';

import { ColoniaQuehacerPage }       from '@/pages/seo/ColoniaQuehacerPage';
import { CarmeloBodegasPage }         from '@/pages/seo/CarmeloBodegasPage';
import { EscapadaBuenosAiresPage }    from '@/pages/seo/EscapadaBuenosAiresPage';
import { HotelesColoniaPage }         from '@/pages/seo/HotelesColoniaPage';
import { EnoturismoUruguayPage }      from '@/pages/seo/EnoturismoUruguayPage';

// ── Rutas y sus meta tags estáticos ──────────────────────────────────────────
interface RouteMeta {
  component: React.ComponentType;
  title: string;
  description: string;
  canonical: string;
  schema?: object;
}

const SEO_ROUTES: RouteMeta[] = [
  {
    component: ColoniaQuehacerPage,
    title: 'Qué hacer en Colonia del Sacramento, Uruguay 2026 | EscapaUY',
    description: 'Descubrí las mejores actividades en Colonia del Sacramento: Barrio Histórico UNESCO, enoturismo en Carmelo, gastronomía local y experiencias personalizadas.',
    canonical: '/colonia/que-hacer',
    schema: { '@context': 'https://schema.org', '@type': 'TouristDestination', name: 'Colonia del Sacramento', url: 'https://www.escapauy.com/colonia/que-hacer' },
  },
  {
    component: CarmeloBodegasPage,
    title: 'Bodegas en Carmelo Uruguay 2026: Guía de Enoturismo | EscapaUY',
    description: 'Descubrí las mejores bodegas de Carmelo, Uruguay: Narbona, Irurtia, Finca Nómade y más. Tours con degustación de Tannat, Albariño y gastronomía local.',
    canonical: '/carmelo/bodegas',
    schema: { '@context': 'https://schema.org', '@type': 'TouristDestination', name: 'Carmelo - Enoturismo Uruguay', url: 'https://www.escapauy.com/carmelo/bodegas' },
  },
  {
    component: EscapadaBuenosAiresPage,
    title: 'Escapada desde Buenos Aires a Colonia Uruguay 2026 | EscapaUY',
    description: 'El viaje perfecto desde Buenos Aires: 1 hora en barco a Colonia del Sacramento, Uruguay. Fin de semana con historia UNESCO, enoturismo y gastronomía local.',
    canonical: '/escapada-desde-buenos-aires',
    schema: { '@context': 'https://schema.org', '@type': 'TouristTrip', name: 'Escapada de fin de semana desde Buenos Aires a Colonia', url: 'https://www.escapauy.com/escapada-desde-buenos-aires' },
  },
  {
    component: HotelesColoniaPage,
    title: 'Hoteles Boutique en Colonia del Sacramento Uruguay 2026 | EscapaUY',
    description: 'Los mejores hoteles boutique y alojamientos en Colonia del Sacramento: Charco Hotel, Posada Plaza Mayor, El Capullo y más. Reservá con EscapaUY.',
    canonical: '/hoteles/colonia',
    schema: { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Mejores hoteles boutique en Colonia del Sacramento', url: 'https://www.escapauy.com/hoteles/colonia' },
  },
  {
    component: EnoturismoUruguayPage,
    title: 'Enoturismo en Uruguay 2026: Regiones, Bodegas y Experiencias | EscapaUY',
    description: 'Uruguay, el país del Tannat. Guía completa de enoturismo: regiones de Carmelo, Canelones y Costa de Oro. Bodegas boutique, degustaciones y maridajes.',
    canonical: '/experiencias/enoturismo-uruguay',
    schema: { '@context': 'https://schema.org', '@type': 'TouristAttraction', name: 'Enoturismo Uruguay', url: 'https://www.escapauy.com/experiencias/enoturismo-uruguay' },
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const BASE_URL = 'https://www.escapauy.com';

function buildHeadTags(meta: RouteMeta): string {
  const og = (prop: string, content: string) =>
    `<meta property="${prop}" content="${content}"/>`;
  const tw = (name: string, content: string) =>
    `<meta name="${name}" content="${content}"/>`;

  return [
    `<title>${meta.title}</title>`,
    `<meta name="description" content="${meta.description}"/>`,
    `<link rel="canonical" href="${BASE_URL}${meta.canonical}"/>`,
    og('og:title', meta.title),
    og('og:description', meta.description),
    og('og:url', `${BASE_URL}${meta.canonical}`),
    og('og:type', 'website'),
    og('og:locale', 'es_UY'),
    og('og:site_name', 'EscapaUY'),
    tw('twitter:card', 'summary_large_image'),
    tw('twitter:title', meta.title),
    tw('twitter:description', meta.description),
    meta.schema
      ? `<script type="application/ld+json">${JSON.stringify(meta.schema)}</script>`
      : '',
  ]
    .filter(Boolean)
    .join('\n    ');
}

/**
 * react-helmet-async v3 renders <title>, <meta>, <link>, <script> tags at the
 * very START of the appHtml when using renderToString. Strip them so they don't
 * appear twice (once in <head>, once in <div id="root">).
 */
function stripHelmetTagsFromHtml(html: string): string {
  // Remove leading head tags that helmet injects into the render output
  return html.replace(
    /^(<(title|meta|link|script)[^>]*>([\s\S]*?<\/\2>)?[\s\S]*?(?=>(?!<\/(title|meta|link|script)>)))+/,
    '',
  ).replace(
    // More targeted: strip any <title>, <meta/>, <link/>, <script type="application/ld+json">
    // appearing before the first real layout element (header, div with class, etc.)
    /^((<title[^>]*>[\s\S]*?<\/title>|<meta[^>]*\/?>|<link[^>]*\/?>|<script type="application\/ld\+json">[\s\S]*?<\/script>)\s*)*/,
    '',
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

// ── Sitemap generator ─────────────────────────────────────────────────────────

const STATIC_URLS = [
  { loc: '/',                                    priority: '1.0', changefreq: 'weekly'  },
  { loc: '/explore',                             priority: '0.8', changefreq: 'weekly'  },
  { loc: '/blog',                                priority: '0.7', changefreq: 'weekly'  },
  { loc: '/colonia/que-hacer',                   priority: '0.9', changefreq: 'monthly' },
  { loc: '/carmelo/bodegas',                     priority: '0.9', changefreq: 'monthly' },
  { loc: '/escapada-desde-buenos-aires',         priority: '0.9', changefreq: 'monthly' },
  { loc: '/hoteles/colonia',                     priority: '0.8', changefreq: 'monthly' },
  { loc: '/experiencias/enoturismo-uruguay',     priority: '0.8', changefreq: 'monthly' },
  { loc: '/legal/terminos',                      priority: '0.3', changefreq: 'yearly'  },
  { loc: '/legal/privacidad',                    priority: '0.3', changefreq: 'yearly'  },
  { loc: '/legal/consumidor',                    priority: '0.3', changefreq: 'yearly'  },
];

function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  const urls  = STATIC_URLS.map(({ loc, priority, changefreq }) => `
  <url>
    <loc>${BASE_URL}${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>\n`;

  // Write to both public/ (source) and dist/ (output)
  const publicDir = path.resolve(rootDir, 'public');
  fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf-8');

  const distSitemap = path.join(distDir, 'sitemap.xml');
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(distSitemap, xml, 'utf-8');
  }

  console.log(`🗺️   sitemap.xml  →  ${STATIC_URLS.length} URLs  (lastmod: ${today})\n`);
}

// ── Config ────────────────────────────────────────────────────────────────────

const rootDir  = process.env.PROJECT_ROOT ?? process.argv[2] ?? path.resolve(__dirname, '..');
const distDir  = path.resolve(rootDir, 'dist');
const tmplPath = path.resolve(distDir, 'index.html');

function main() {
  if (!fs.existsSync(tmplPath)) {
    console.error('❌  dist/index.html not found. Run `npm run build` first.');
    process.exit(1);
  }

  const template = fs.readFileSync(tmplPath, 'utf-8');
  console.log('\n🔨  Pre-rendering SEO pages...\n');

  for (const route of SEO_ROUTES) {
    try {
      // 1. Render component to HTML string
      const rawHtml = renderToString(
        createElement(
          HelmetProvider,
          { context: {} },
          createElement(StaticRouter, { location: route.canonical },
            createElement(route.component)
          )
        )
      );

      // 2. Strip helmet-injected head tags from the beginning of appHtml
      const appHtml = stripHelmetTagsFromHtml(rawHtml);

      // 3. Build <head> tags from static metadata
      const headTags = buildHeadTags(route);

      // 4. Inject into template
      const pageHtml = template
        // Replace existing <title> with page-specific one
        .replace(/<title[^>]*>[\s\S]*?<\/title>/, `<title>${route.title}</title>`)
        // Inject SEO meta tags before </head>
        .replace('</head>', `    ${headTags}\n  </head>`)
        // Inject pre-rendered HTML into root div
        .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

      // 5. Write output file
      const segments = route.canonical.split('/').filter(Boolean);
      const outDir  = path.join(distDir, ...segments);
      fs.mkdirSync(outDir, { recursive: true });
      const outFile = path.join(outDir, 'index.html');
      fs.writeFileSync(outFile, pageHtml, 'utf-8');

      // Verify content was injected
      const hasH1     = pageHtml.includes('<h1');
      const hasSchema = pageHtml.includes('application/ld+json');
      const status    = hasH1 && hasSchema ? '✅' : '⚠️ ';
      console.log(`  ${status}  ${route.canonical}`);
      console.log(`        title:   ${route.title.slice(0, 60)}...`);
      console.log(`        h1:      ${hasH1 ? 'yes' : 'MISSING'}`);
      console.log(`        schema:  ${hasSchema ? 'yes' : 'MISSING'}`);
      console.log(`        output:  ${path.relative(rootDir, outFile)}`);
      console.log();
    } catch (err: any) {
      console.error(`  ❌  ${route.canonical}: ${err.message}\n`);
    }
  }

  console.log('🎉  Pre-rendering complete!\n');
}

main();
generateSitemap();
