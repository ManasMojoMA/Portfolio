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

import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

// ---------------------------------------------------------------------------
// routes.meta.js is imported by BOTH this Node script and the browser. Anything
// Node-only that leaks into it (`process`, `__dirname`, `require`) throws at module
// evaluation in the browser and the whole app fails to mount — a blank white page
// with no clue in the build output, because the build itself succeeds.
//
// So evaluate the module in a context with none of those bindings, which is exactly
// what the browser gives it.
// ---------------------------------------------------------------------------
{
  const { createContext, runInContext } = await import('node:vm');
  const source = (await readFile(join(root, 'src/routes.meta.js'), 'utf8')).replace(
    /^export /gm,
    ''
  );
  try {
    runInContext(source, createContext({}));
  } catch (err) {
    console.error('\n✗ src/routes.meta.js cannot run in a browser:\n');
    console.error(`    ${err.message}`);
    console.error(
      '\n  It is imported by the app as well as this script, so it must not touch' +
        '\n  Node-only globals. Guard them with `typeof process !== "undefined"`.\n'
    );
    process.exit(1);
  }
}

const { routes, SITE_URL } = await import('../src/routes.meta.js');

/** Escape for use inside a double-quoted HTML attribute. */
const attr = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Read a PNG's real pixel dimensions from its IHDR header.
 *
 * Declared dimensions are read straight off the file rather than hardcoded, because
 * a screenshot taken at browser zoom comes out scaled (a "1200x630" capture at 1.2x
 * is really 1440x756). Ratio still renders fine, but advertising dimensions that do
 * not match the file is the kind of small lie that makes a card lay out wrong on one
 * platform and nowhere else.
 *
 * PNG layout: 8-byte signature, 4-byte chunk length, 4-byte "IHDR",
 * then width and height as big-endian uint32 at offsets 16 and 20.
 */
async function readPngSize(absPath) {
  const buf = await readFile(absPath);
  if (buf.length < 24 || buf.toString('ascii', 12, 16) !== 'IHDR') return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

/** Cache so each image is read once, not once per route. */
const imageSizes = new Map();

function buildHead(route) {
  // Trailing slash on root, matching the sitemap exactly. Google treats the two as
  // equivalent, but a canonical that disagrees with the sitemap is a needless signal
  // to reconcile.
  const url = `${SITE_URL}${route.path === '/' ? '/' : route.path}`;
  const image = route.ogImage ? `${SITE_URL}${route.ogImage}` : null;
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
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="twitter:title" content="${attr(route.ogTitle ?? route.title)}" />`,
    `<meta name="twitter:description" content="${attr(route.ogDescription ?? route.description)}" />`,
  ];

  if (image) {
    const size = imageSizes.get(route.ogImage);
    tags.push(
      `<meta property="og:image" content="${attr(image)}" />`,
      `<meta property="og:image:type" content="image/png" />`
    );
    if (size) {
      tags.push(
        `<meta property="og:image:width" content="${size.width}" />`,
        `<meta property="og:image:height" content="${size.height}" />`
      );
    }
    tags.push(
      // Read aloud by screen readers on some platforms, and shown if the image fails.
      `<meta property="og:image:alt" content="${attr(route.ogTitle ?? route.title)}" />`,
      `<meta name="twitter:image" content="${attr(image)}" />`
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

// A declared-but-missing og:image is worse than none: platforms show a broken or
// blank card and there is no error anywhere to notice. Vite has already copied
// public/ into dist/, so check the built output rather than the source.
const missingImages = [];
for (const route of routes) {
  if (!route.ogImage || imageSizes.has(route.ogImage)) continue;
  const abs = join(dist, route.ogImage);
  try {
    await access(abs);
    const size = await readPngSize(abs);
    imageSizes.set(route.ogImage, size);

    if (size) {
      // 1.91:1 is what every major platform crops to. Drifting far from it means
      // the card gets letterboxed or cropped through the headline.
      const ratio = size.width / size.height;
      if (Math.abs(ratio - 1.91) > 0.08) {
        console.warn(
          `  ⚠ ${route.ogImage} is ${size.width}x${size.height} (${ratio.toFixed(2)}:1)` +
            ' — platforms crop to 1.91:1, so expect this to be trimmed.'
        );
      }
    }
  } catch {
    missingImages.push({ path: route.path, image: route.ogImage });
  }
}

if (missingImages.length > 0) {
  console.error('\n✗ Routes declare an og:image that does not exist in public/:\n');
  for (const m of missingImages) {
    console.error(`    ${m.path}  →  public${m.image}`);
  }
  console.error(
    '\n  Export them from og/og-cards.html (open in Chrome, see instructions at top),' +
      '\n  or remove `ogImage` from that route in src/routes.meta.js.\n'
  );
  process.exit(1);
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
const withImages = routes.filter((r) => r.ogImage).length;
console.log(
  `  site url: ${SITE_URL}` +
    `  (og:image on ${withImages}/${routes.length} routes)`
);

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
