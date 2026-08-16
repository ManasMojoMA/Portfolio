// ============================================
// ROUTE METADATA — single source of truth
//
// Consumed by two very different callers:
//   1. scripts/generate-route-html.mjs at BUILD time, to write a static HTML file
//      per route with the right <title> and OG tags.
//   2. The React app at RUNTIME, to update document.title on client-side navigation.
//
// Why build time matters: this is a client-rendered SPA. WhatsApp, LinkedIn, Slack
// and Google's crawler do NOT execute JavaScript. Anything set by react-helmet or a
// useEffect is invisible to them — the link preview would show whatever is in the
// single index.html, for every route. So the meta must exist in the served HTML.
//
// Adding a route here also requires a rewrite in vercel.json. The build fails if you
// forget, because otherwise the page works for humans while crawlers silently get
// the homepage's tags.
//
// Keep this file plain JS with no imports: the Node build script loads it directly.
// ============================================

// Absolute origin, needed for og:url, canonical and the sitemap.
// Override at build time:  SITE_URL=https://simplymation.com npm run build
//
// `typeof process` is deliberate. This module is imported by BOTH the Node build
// script (where `process` exists) and the browser (where it does not). Writing
// `process.env?.SITE_URL` throws ReferenceError in the browser — optional chaining
// guards against a null value, not an undeclared identifier — which crashes the app
// before React mounts. `typeof` on an undeclared name is the one safe way to ask.
const envSiteUrl =
  typeof process !== 'undefined' && process.env ? process.env.SITE_URL : undefined;

export const SITE_URL = (envSiteUrl || 'https://portfolio-ai-manas.vercel.app').replace(/\/$/, '');

// Social card images live in public/ and are referenced per route below as a
// root-relative path. The build resolves them to absolute URLs (required by every
// platform), reads real dimensions off the PNG, and FAILS if the file is missing —
// a dead og:image renders a worse card than no og:image at all.
//
// Source templates are in og/og-cards.html.

export const routes = [
  {
    path: '/',
    title: 'Simplymation | Automation for small businesses',
    description:
      "You're doing work a computer should be doing. Practical AI and automation for garages, clinics, salons and small businesses — the first one is free.",
    ogTitle: "You're doing work a computer should be doing.",
    ogDescription:
      'Practical AI and automation for small businesses that were told it was not for them. First automation free, built in your own Google account.',
    ogImage: '/og-home.png',
    changefreq: 'monthly',
    priority: '1.0',
  },
  {
    path: '/playbooks',
    title: 'Industry Playbooks | Simplymation',
    description:
      'What automation actually looks like in your trade — the specific work a computer should be doing, what it saves, and where the free version stops. No jargon.',
    ogTitle: 'What automation actually looks like in your trade.',
    ogDescription:
      'Walkthroughs written for people who have never bought software before. Every number is either measured or labelled as an assumption you can change.',
    ogImage: '/og-home.png',
    changefreq: 'monthly',
    priority: '0.9',
  },
  {
    path: '/playbooks/tyre-garage',
    title: 'Tyre Shop & Garage Automation Playbook | Simplymation',
    // This description is what appears under the link in a WhatsApp chat. It has one
    // job: make a garage owner curious enough to tap, in the buyer's own language.
    description:
      'Six things a tyre shop can stop doing by hand — customer recall reminders, digital job cards, retread casing tracking, live stock by size, udhaar ledger and a daily closing summary. Free to start.',
    ogTitle: 'Your garage already has the money. It just walks out and never comes back.',
    ogDescription:
      'Alignment is due every six months. Tyres every three years. Your customer forgot the day they drove out — and nobody calls them. Six automations for a tyre shop, free to start.',
    ogImage: '/og-tyre-garage.png',
    changefreq: 'monthly',
    priority: '0.9',
  },
  {
    path: '/portfolio',
    title: 'Manas Arora | Full-Stack & AI Engineering Portfolio',
    description:
      'Eight shipped products across ERP, HR tech, AI/RAG and workflow automation — Next.js, React, TypeScript, Supabase and Gemini. Three are live and clickable.',
    ogTitle: 'Manas Arora — full-stack and AI engineering',
    ogDescription:
      'Eight shipped products across enterprise software, HR tech and AI. Three deployed and clickable right now.',
    ogImage: '/og-home.png',
    changefreq: 'monthly',
    priority: '0.7',
  },
];

/** Look up metadata for a pathname, falling back to the home route. */
/**
 * Whether this path is a real route.
 *
 * metaForPath falls back to the home entry for anything unrecognised, which is
 * right for rendering but hides the distinction the meta hook needs: an unknown
 * URL still renders the home page, and must not be indexed as a second copy of it.
 */
export function isKnownPath(pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/';
  return routes.some((r) => r.path === clean);
}

export function metaForPath(pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/';
  return routes.find((r) => r.path === clean) ?? routes[0];
}
