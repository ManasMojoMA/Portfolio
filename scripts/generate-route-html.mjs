// ============================================
// POST-BUILD: static HTML per route + sitemap
//
// Vite emits a single dist/index.html. That is fine for the browser, because the
// router takes over — but link-preview crawlers (WhatsApp, LinkedIn, Slack, X) and
// Google's first pass do not run JavaScript. They read the HTML they are served and
// nothing else.
//
// So for every route we write dist/<path>/index.html: the same app shell, same
// script tags, but with that route's <title>, description and OG tags baked in.
// Vercel checks the filesystem before applying the SPA rewrite in vercel.json, so
// these files win for their exact paths and everything else still falls through.
// ============================================

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

const { routes, SITE_URL, OG_IMAGE } = await import('../src/routes.meta.js');

/** Escape for use inside a double-quoted HTML attribute. */
const attr = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function buildHead(route) {
  // Trailing slash on root, matching the sitemap exactly. Google treats the two as
  // equivalent, but a canonical that disagrees with the sitemap is a needless signal
  // to reconcile.
  const url = `${SITE_URL}${route.path === '/' ? '/' : route.path}`;
  const tags = [
    `<title>${escapeHtml(route.title)}</title>`,
    `<meta name="description" content="${attr(route.description)}" />`,
    `<link rel="canonical" href="${attr(url)}" />`,

    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${attr(url)}" />`,
    `<meta property="og:title" content="${attr(route.ogTitle ?? route.title)}" />`,
    `<meta property="og:description" content="${attr(route.ogDescription ?? route.description)}" />`,
    `<meta property="og:site_name" content="Simplymation" />`,

    // summary_large_image needs an image to be worth anything; without one, the
    // plain summary card renders better.
    `<meta name="twitter:card" content="${OG_IMAGE ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="twitter:title" content="${attr(route.ogTitle ?? route.title)}" />`,
    `<meta name="twitter:description" content="${attr(route.ogDescription ?? route.description)}" />`,
  ];

  if (OG_IMAGE) {
    tags.push(
      `<meta property="og:image" content="${attr(OG_IMAGE)}" />`,
      `<meta property="og:image:width" content="1200" />`,
      `<meta property="og:image:height" content="630" />`,
      `<meta name="twitter:image" content="${attr(OG_IMAGE)}" />`
    );
  }

  return tags.map((t) => `    ${t}`).join('\n');
}

/**
 * Replace the placeholder block in the built HTML.
 * Fails loudly rather than emitting pages with wrong meta — a silent miss here
 * means every shared link shows the wrong title, and nobody would notice for weeks.
 */
function render(shell, route) {
  const START = '<!--ROUTE_META_START-->';
  const END = '<!--ROUTE_META_END-->';
  const start = shell.indexOf(START);
  const end = shell.indexOf(END);

  if (start === -1 || end === -1) {
    throw new Error(
      `index.html is missing the ${START} / ${END} markers. ` +
        'Route meta cannot be injected — check index.html.'
    );
  }

  return shell.slice(0, start) + buildHead(route) + '\n  ' + shell.slice(end + END.length);
}

function buildSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = routes
    .map((r) => {
      const loc = `${SITE_URL}${r.path === '/' ? '/' : r.path}`;
      return [
        '  <url>',
        `    <loc>${escapeHtml(loc)}</loc>`,
        `    <lastmod>${today}</lastmod>`,
        `    <changefreq>${r.changefreq}</changefreq>`,
        `    <priority>${r.priority}</priority>`,
        '  </url>',
      ].join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

const shell = await readFile(join(dist, 'index.html'), 'utf8');

for (const route of routes) {
  const html = render(shell, route);

  if (route.path === '/') {
    await writeFile(join(dist, 'index.html'), html, 'utf8');
  } else {
    const dir = join(dist, route.path);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'index.html'), html, 'utf8');
  }
  console.log(`  meta → ${route.path}`);
}

await writeFile(join(dist, 'sitemap.xml'), buildSitemap(), 'utf8');
console.log('  sitemap.xml');
console.log(`  site url: ${SITE_URL}${OG_IMAGE ? '' : '  (no og:image set)'}`);

// ---------------------------------------------------------------------------
// vercel.json guard rails. Two separate failures this catches:
//
// 1. A route without an explicit rewrite. An extensionless URL like
//    /playbooks/tyre-garage falls through to the SPA catch-all, so the page still
//    works for humans while every crawler sees index.html's meta — invisible until
//    someone notices a shared link looks wrong.
//
// 2. An unknown property inside a rewrite. Vercel validates vercel.json strictly and
//    FAILS THE DEPLOY. JSON has no comment syntax, so a "_comment" key looks
//    harmless locally and breaks production. Checked here so it surfaces in seconds
//    rather than after a push.
// ---------------------------------------------------------------------------
const REWRITE_KEYS = new Set(['source', 'destination', 'has', 'missing', 'statusCode']);

try {
  const vercelConfig = JSON.parse(await readFile(join(root, 'vercel.json'), 'utf8'));
  const rewrites = vercelConfig.rewrites ?? [];

  const badKeys = [];
  rewrites.forEach((rule, i) => {
    for (const key of Object.keys(rule)) {
      if (!REWRITE_KEYS.has(key)) badKeys.push(`rewrites[${i}].${key}`);
    }
  });

  if (badKeys.length > 0) {
    console.error('\n✗ vercel.json has properties Vercel will reject at deploy time:\n');
    for (const k of badKeys) console.error(`    ${k}`);
    console.error(
      `\n  Allowed in a rewrite: ${[...REWRITE_KEYS].join(', ')}.` +
        '\n  JSON has no comments — put explanations in code, not in vercel.json.\n'
    );
    process.exit(1);
  }

  const sources = new Set(rewrites.map((r) => r.source));
  const missing = routes.filter((r) => r.path !== '/' && !sources.has(r.path));

  if (missing.length > 0) {
    console.error('\n✗ vercel.json is missing rewrites for these routes:\n');
    for (const r of missing) {
      console.error(`    { "source": "${r.path}", "destination": "${r.path}/index.html" },`);
    }
    console.error('\n  Add them ABOVE the "/(.*)" catch-all, then rebuild.\n');
    process.exit(1);
  }

  console.log(`  vercel.json ok (${rewrites.length} rewrites)`);
} catch (err) {
  if (err.code !== 'ENOENT') throw err;
  console.warn('  (no vercel.json — skipping rewrite check)');
}
