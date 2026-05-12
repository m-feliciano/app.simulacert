import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import {join} from 'node:path';

type ExamSitemapItem = {
  slug?: string;
  incoming?: boolean;
};

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

function getOrigin(req: express.Request): string {
  const envOrigin = (process.env['APP_ORIGIN'] || '').trim().replace(/\/$/, '');
  if (envOrigin) return envOrigin;

  const proto = (req.header('x-forwarded-proto') || req.protocol || 'https').split(',')[0].trim();
  const host = (req.header('x-forwarded-host') || req.get('host') || '').split(',')[0].trim();
  return host ? `${proto}://${host}` : 'https://app.simulacert.com';
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&apos;');
}

function buildSitemapXml(origin: string, urls: {loc: string; changefreq?: string; priority?: string; lastmod?: string}[]): string {
  const now = new Date().toISOString().slice(0, 10);
  const body = urls
    .map((u) => {
      const lastmod = u.lastmod || now;
      return [
        '  <url>',
        `    <loc>${escapeXml(u.loc)}</loc>`,
        `    <lastmod>${escapeXml(lastmod)}</lastmod>`,
        u.changefreq ? `    <changefreq>${escapeXml(u.changefreq)}</changefreq>` : '',
        u.priority ? `    <priority>${escapeXml(u.priority)}</priority>` : '',
        '  </url>',
      ].filter(Boolean).join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    body +
    `\n</urlset>\n`;
}

async function fetchExamsForSitemap(): Promise<ExamSitemapItem[]> {
  const apiBase = (process.env['API_BASE_URL'] || 'https://api.simulacert.com').replace(/\/$/, '');
  const url = `${apiBase}/exams`;
  const res = await fetch(url, {headers: {'accept': 'application/json'}});
  if (!res.ok) throw new Error(`Sitemap exams fetch failed: ${res.status}`);
  return await res.json();
}

app.get('/sitemap.xml', async (req, res) => {
  try {
    const origin = getOrigin(req);
    const staticUrls = [
      {loc: `${origin}/`, changefreq: 'weekly', priority: '0.9'},
      {loc: `${origin}/exams`, changefreq: 'weekly', priority: '0.8'},
      {loc: `${origin}/how-it-works`, changefreq: 'monthly', priority: '0.7'},
      {loc: `${origin}/termos-de-uso`, changefreq: 'yearly', priority: '0.3'},
      {loc: `${origin}/politica-de-privacidade`, changefreq: 'yearly', priority: '0.3'},
      {loc: `${origin}/contato`, changefreq: 'yearly', priority: '0.3'},
    ];

    let exams: ExamSitemapItem[] = [];
    try {
      exams = await fetchExamsForSitemap();
    } catch {
    }

    const dynamicExamUrls = exams
      .filter((e) => !!e?.slug && !e?.incoming)
      .map((e) => ({
        loc: `${origin}/exams/${String(e.slug)}`,
        changefreq: 'weekly',
        priority: '1.0',
      }));

    const xml = buildSitemapXml(origin, [...dynamicExamUrls, ...staticUrls]);

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(xml);
  } catch (e) {
    res.status(500).send('');
  }
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    immutable: true,
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.info(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
