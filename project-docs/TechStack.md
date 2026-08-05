# Tech Stack — Simplymation Platform

> **Revised 2026-08-02** for the backend execution engine. Removed the Apps Script
> control plane and the `automations-sdk`/`scripts/` layout that existed to support it.

Every choice below is justified against one of: *we already know it*, *it is free or
near-free at our scale*, or *the alternative fails specifically for this workload*.

---

## Decided

| Layer | Choice | Why this and not the obvious alternative |
|---|---|---|
| Framework | **Next.js 16 (App Router) + React 19** | Already used in ChalkZone and the appraisal portal. Server Components keep client-specific data off the client bundle by default. |
| Language | **TypeScript, strict** | Multi-tenant code where a missing `client_id` filter is a data leak. Types are a cheap second line of defence behind RLS. |
| Styling | **Tailwind CSS 4 + shadcn/ui** | Same as existing projects. shadcn is copy-in, not a dependency. |
| Database | **Supabase (Postgres) + Row Level Security** | See "Postgres vs Firestore" below. |
| Auth | **Supabase Auth** | Same instance as the DB, so RLS policies read `auth.uid()` with no token plumbing. |
| Secret storage | **Supabase Vault** (`pgsodium`) | Google refresh tokens are the crown jewels — encrypted at rest, never a plain column. |
| Google access | **`googleapis` Node client**, per-client OAuth | Runs as the client, using their token. See [Architecture.md](Architecture.md) §3. |
| Config validation | **Zod** | One schema drives runtime validation *and* the generated console form. |
| Scheduling | **Vercel Cron → dispatch tick** | One cron dispatches all due automations; not one cron per automation. |
| Monorepo | **Turborepo + pnpm workspaces** | Console, portal and the automation registry share schema, types and UI. |
| Hosting | **Vercel** | Already the deployment target for everything else. |
| Client app | **PWA first (`next-pwa`), Expo later** | PWA ships faster and skips app-store friction; Expo reuses the same React later without a rewrite. |
| AI in client automations | **Google Gemini** | Free tier; used inside automations that need parsing or generation. |
| AI for platform features (Phase 5) | **Claude** — `claude-sonnet-5` routine, `claude-opus-5` where quality matters | Phase 5 only. Do not build against it before then. |

## Rejected, and why

**Apps Script deployed into client accounts.** The original design. Rejected because a
bug fix meant pushing code to N accounts with partial failures and version drift, and
because the Apps Script API does not support service accounts. Full decision record in
[Architecture.md](Architecture.md) §8.

**Firestore instead of Postgres.** The console's value is cross-tenant queries — "every
automation that failed this week", "every client on the free plan whose runs are empty".
In Postgres that is a `WHERE` clause; in Firestore it is denormalisation and composite
indexes for every question you did not anticipate. This is a reporting-shaped problem,
so it gets a relational database.

**A separate Express/FastAPI backend.** Next.js Route Handlers cover everything. A second
service to deploy, secure and pay for, with no workload that needs it. Reconsider only
if run durations start exceeding serverless limits — at which point the answer is a
queue and a worker, not a monolith.

**Prisma or Drizzle as the primary access path.** Supabase's client applies RLS
automatically because it passes the user's JWT. An ORM connecting with the service role
bypasses RLS and puts tenant isolation back into application code — the exact mistake
this architecture prevents. Use the Supabase client for anything request-scoped; an ORM
may be used for migrations only.

**A paid SaaS boilerplate.** MakerKit and supastarter are worth reading for their RLS and
multi-tenancy patterns. But they ship billing, teams, i18n and CMS we do not need, whose
assumptions would have to be unpicked. Borrow the patterns; do not adopt wholesale.

## Repository layout

```
simplymation-platform/
├── apps/
│   ├── console/                  # Next.js — operator only. Hosts the run engine.
│   └── portal/                   # Next.js — clients, PWA-enabled
├── packages/
│   ├── automations/              # THE PRODUCT — one module per automation
│   │   ├── src/
│   │   │   ├── recall-engine/
│   │   │   │   ├── index.ts      # AutomationDefinition
│   │   │   │   ├── config.ts     # Zod schema
│   │   │   │   └── index.test.ts
│   │   │   ├── job-card/
│   │   │   ├── _lib/             # google clients, dates, message templating
│   │   │   └── registry.ts       # key → definition
│   ├── database/                 # migrations, RLS policies, generated types
│   │   ├── migrations/
│   │   ├── policies/
│   │   └── types.generated.ts    # `supabase gen types` — never hand-edited
│   ├── ui/                       # shadcn components shared by both apps
│   └── config/                   # eslint, tsconfig, tailwind presets
└── turbo.json
```

`packages/automations` is the actual product. Everything else exists to configure, run
and observe it.

`packages/database` is the single source of truth for the schema. Both apps import
generated types from it; neither declares its own. When a table changes, types regenerate
once and both apps fail to compile until updated — which is the point.

## Versions to pin

Next.js 16, React 19, TypeScript 5.x strict, Tailwind 4, pnpm 9+, Node 20 LTS.

Pin exact versions in the root `package.json` and let Dependabot propose upgrades rather
than floating ranges. A silent minor bump in an auth or data path is not a risk worth
taking for convenience.
