# Deployment — Simplymation Platform

> **Revised 2026-08-02.** The Apps Script publishing section is gone — there is no
> per-client deployment. Shipping an automation change is an ordinary code deploy.

---

## Environments

| Env | Console | Portal | Supabase |
|---|---|---|---|
| Local | `localhost:3000` | `localhost:3001` | local (`supabase start`) or a dev project |
| Preview | Vercel preview URL | Vercel preview URL | **staging project** |
| Production | `console.simplymation.com` | `app.simplymation.com` | production project |

Until a domain is bought, `*.vercel.app` subdomains are fine.

**Preview deploys must never point at the production database**, and preview must never
hold real Google refresh tokens. A preview branch running the cron tick against live
client credentials would send real messages to real customers. Separate Supabase
projects, separate OAuth clients, enforced by env var scoping in Vercel.

> **Disable cron on preview deployments.** This is the single most dangerous difference
> between this project and an ordinary web app: a stray deploy can take real-world
> actions in someone else's business.

---

## Vercel setup

Two projects from the same repository:

| Setting | console | portal |
|---|---|---|
| Root directory | `apps/console` | `apps/portal` |
| Build command | `pnpm turbo build --filter=console` | `pnpm turbo build --filter=portal` |
| Node | 20.x | 20.x |

The run engine lives in the **console** app. The portal never executes automations and
must not hold the service role key.

Enable Vercel's monorepo skip-if-unchanged so a portal-only change does not rebuild the
console — but note that a change in `packages/automations` **must** rebuild the console.

---

## Environment variables

```bash
# Both apps
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=        # public by design — RLS is the protection

# Console only. Server-side. NEVER prefixed NEXT_PUBLIC_.
SUPABASE_SERVICE_ROLE_KEY=            # execution engine + cron only
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REDIRECT_URI=
CRON_SECRET=
CRON_ENABLED=                         # false on preview. Non-negotiable.
```

Rules:

- `NEXT_PUBLIC_*` is compiled into the browser bundle. Anything secret with that prefix
  is already leaked.
- The portal has no legitimate use for the service role key. Do not add it there.
- After any change, grep the production build output for the service role key before
  shipping. Automate this in CI.

---

## Database migrations

Migrations live in `packages/database/migrations`, applied via the Supabase CLI.

```bash
supabase migration new add_client_automations
supabase db push --project-ref <staging>     # staging first, always
supabase gen types typescript > packages/database/types.generated.ts
```

- Forward-only and reviewed. Never edit an applied migration.
- **Staging first, always.** Production only after staging is verified.
- Regenerate types in the same commit, so both apps fail to compile until updated.
- After any migration touching a tenant table, **re-run the isolation tests**
  ([Database.md](Database.md) §6) before promoting.
- After any change to an automation's config schema, **check existing `client_automations.config`
  rows still validate.** A schema change that invalidates live config silently breaks
  every client using it. Write a migration that fixes the data, not just the schema.

---

## Shipping an automation change

This is now an ordinary deploy, which is the whole point:

```
edit packages/automations/src/recall-engine/
  → pnpm test
  → open PR, review
  → merge → Vercel builds → live
  → every client picks it up on their next run
```

No per-client deployment, no version tracking, no rollback queue. If the change is
risky, ship it disabled behind a config flag and enable it for one client first.

**Before shipping any change that sends messages**, verify against a scratch Google
account with a scratch sheet. Never test message-sending logic against a real client's data.

---

## CI (GitHub Actions)

On every PR:

1. `pnpm install --frozen-lockfile`
2. `pnpm turbo lint typecheck`
3. `pnpm turbo test` — includes tenant-isolation and idempotency tests
4. `pnpm turbo build`
5. Grep build output for `SUPABASE_SERVICE_ROLE_KEY` → fail if present
6. Assert every `automation_definitions.key` in seed data resolves in the registry

Block merge on any failure. The isolation and idempotency tests are the two that must
never be skipped "just to get a fix out."

---

## Cron

Configured in `apps/console/vercel.json`:

```json
{
  "crons": [
    { "path": "/api/cron/tick",        "schedule": "*/5 * * * *" },
    { "path": "/api/cron/reap",        "schedule": "*/15 * * * *" },
    { "path": "/api/cron/token-check", "schedule": "0 3 * * *" }
  ]
}
```

Vercel's plan tier limits cron frequency — **verify the current limit** before relying
on a 5-minute tick. If only hourly is available, automations must schedule accordingly;
a daily 9am reminder tolerates an hourly tick, a 15-minute one does not.

Every cron handler checks `CRON_SECRET` **and** `CRON_ENABLED`.

---

## Rollback

| Failure | Action |
|---|---|
| Bad frontend deploy | Vercel instant rollback |
| Bad automation logic | Vercel rollback, or disable that automation for all clients from the console |
| Bad migration | Forward-fix migration. Never `db reset` in production. |
| Bad config for one client | Edit the config field. No deploy involved. |
| Leaked secret | Rotate in Vercel, redeploy, revoke at source, audit access logs |

Note the asymmetry: a **config** mistake affects one client and is fixed in seconds; a
**code** mistake affects everyone and needs a rollback. That is the trade for one-push
bug fixes, and it is why automations need real tests.

---

## Monitoring

Phase 2–3 honest minimum: Vercel logs, Supabase logs, and the platform's own run history.

Add when there is revenue to protect: Sentry for application errors, uptime monitoring,
and an alert if the tick stops producing runs — a sudden silence across all clients means
the engine broke, not that every client's automation stopped at once.
