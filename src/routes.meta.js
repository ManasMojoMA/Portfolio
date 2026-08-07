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
// Keep this file plain JS with no imports: the Node build script loads it directly.
// ============================================

// Absolute origin, needed for og:url, canonical and the sitemap.
// Override at build time:  SITE_URL=https://simplymation.com npm run build
export const SITE_URL = (process.env?.SITE_URL || 'https://portfolio-ai-manas.vercel.app').replace(
  /\/$/,
  ''
);

// Social card images live in public/ and are referenced per route below as a
// root-relative path. The build resolves them to absolute URLs (required by every
// platform) and FAILS if the file is missing — a dead og:image renders a worse card
// than no og:image at all, and it fails silently otherwise.
//
// Source templates are in og/og-cards.html; open it in Chrome and follow the
// instructions to export at exactly 1200x630.

export const routes = [
  {
    path: '/',
    title: 'Manas Arora | AI & Automation for Small Businesses',
    description:
      'I build AI and automation that removes the work a computer should be doing — for garages, clinics, salons and small businesses. First automation free.',
    ogTitle: 'Simplymation — automation for small businesses',
    ogDescription:
      'Practical AI and automation for businesses that were told it was not for them. See a real playbook for your industry.',
    // Uncomment once public/og-home.png exists — export it from og/og-cards.html.
    // The build fails if this points at a missing file, by design.
    // ogImage: '/og-home.png',
    changefreq: 'monthly',
    priority: '1.0',
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
    // Uncomment once public/og-tyre-garage.png exists — export it from og/og-cards.html.
    // ogImage: '/og-tyre-garage.png',
    changefreq: 'monthly',
    priority: '0.9',
  },
];

/** Look up metadata for a pathname, falling back to the home route. */
export function metaForPath(pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/';
  return routes.find((r) => r.path === clean) ?? routes[0];
}
