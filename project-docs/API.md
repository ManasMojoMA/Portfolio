# API — Simplymation Platform

> **Revised 2026-08-02.** The telemetry endpoint is gone — automations run on our
> servers, so we already have their logs. Deploy/bulk-update routes are gone — there is
> nothing to deploy. Replaced by config management and the run engine.

Next.js Route Handlers under `app/api/`. Most reads go **directly through the Supabase
client with the user's JWT**, so RLS applies with no API layer in between.

> Design rule: if a route's only job is `select * where client_id = me`, delete it and
> query Supabase from a Server Component. Every hand-written route is another place a
> tenant filter can be forgotten.

---

## 1. Authentication

Supabase Auth. No custom login endpoints.

- Console: `signInWithPassword`, middleware rejects `role !== 'operator'`.
- Portal: `signInWithOtp` (magic link) preferred, password fallback.
- Sessions in httpOnly cookies via `@supabase/ssr`. Never `localStorage`.

| App | Middleware rule |
|---|---|
| `console` | No session → `/login`. Session but not operator → `/portal`. |
| `portal` | No session → `/login`. Operator allowed (support), logged to audit. |

Every handler re-asserts role server-side. Middleware is convenience, not the boundary.

---

## 2. Console — clients

```
POST   /api/clients                    create
PATCH  /api/clients/:clientId          update
DELETE /api/clients/:clientId          soft delete
```

---

## 3. Console — Google connection

```
POST /api/clients/:clientId/google/connect-link
     → { url, expiresAt }
     One-time signed state token + Google consent URL.

GET  /api/google/callback
     OAuth redirect target. Exchanges code → refresh token → Supabase Vault.
     Writes google_connections. Public route, protected by the state token.

POST /api/clients/:clientId/google/disconnect
     Revokes with Google, marks connection revoked,
     disables that client's automations.
```

Revoking **with Google** is the part that matters. A local status flag alone is theatre.

---

## 4. Console — automations and config

This is where "copy and customise" actually happens.

```
GET  /api/definitions
     The registry, from code. Cheap, cacheable.

POST /api/clients/:clientId/automations
     body: { definitionKey, config, schedule?, enabled? }
     - validates config against the definition's Zod schema
     - rejects if a required scope is not granted
     - creates client_automations row + audit entry

PATCH /api/clients/:clientId/automations/:id
     body: { config?, schedule?, enabled? }
     Re-validates. **This is the whole customisation flow** — no deploy step exists.

POST /api/clients/:clientId/automations/:id/run-now
     Queues an immediate run. Same idempotency rules as scheduled runs.
     Rate limited — this is a button an impatient operator will click repeatedly.

POST /api/clients/:clientId/automations/:id/pause | /resume
DELETE /api/clients/:clientId/automations/:id      soft delete

POST /api/clients/:clientId/bundles/:bundleKey/apply
     Creates one client_automations row per bundle item, using default_config,
     all disabled. The operator then tunes and enables each.
     Idempotent — re-applying must not duplicate existing automations.
```

Note what is **absent**: no deploy, no version push, no bulk update, no rollback.
A bug fix reaches every client through `git push`, not through this API.

---

## 5. The run engine

```
GET /api/cron/tick                    every 5 minutes, CRON_SECRET required
```

```
select client_automations
  where enabled and deleted_at is null
    and next_run_at <= now()
    and run_status = 'idle'
  limit N
  for update skip locked
```

For each claimed row:

1. Insert `automation_runs` (`status='running'`, `idempotency_key`). A unique-violation
   means this run already exists — skip, do not re-run.
2. Resolve the definition from the code registry by `definition_key`.
   Unknown key → fail loudly and open an incident; it means a deploy removed a
   definition still in use.
3. Mint a Google client from the client's refresh token. Auth failure → mark connection
   `expired`, open incident, **stop** (do not retry).
4. `definition.run(ctx)`.
5. Record result, compute `next_run_at` **in the client's timezone**, release the lock.

```
GET /api/cron/reap                    every 15 minutes
    Runs stuck in 'running' past their timeout → 'error', release lock, open incident.

GET /api/cron/token-check             daily
    Verifies each refresh token still works. Marks expired, alerts the operator.
```

Rules:

- One client's failure must never block another's. Wrap each in its own try/catch.
- Retries only for transient errors (network, 429, 503), max 3, with backoff.
- Every outward action goes through the `run_actions` ledger first. See
  [Architecture.md](Architecture.md) §6.
- Cron routes require the `CRON_SECRET` header.

---

## 6. Portal routes

Deliberately tiny — the portal is mostly reads, which go straight to Supabase under RLS.

```
POST /api/portal/incidents
     body: { title, description, clientAutomationId? }
     client_id from the session. Never from the body.

POST /api/portal/google/disconnect
     The client's own exit. Must work — it is the proof behind "you are not locked in".
```

Clients cannot edit their own automation config. See [Database.md](Database.md) §4.

---

## 7. Conventions

- Validate every request body with **Zod** at the route boundary. No exceptions.
- **Never accept `client_id` from a request body.** Console takes it from the URL path
  (after re-checking operator role); portal from the session.
- Errors: `{ error: { code, message } }`. Log the real cause server-side; return
  something safe.
- Every mutating console action writes an `audit_log` row, in the same transaction as
  the mutation where possible. **If the audit write fails, the operation fails.**
- No API response ever contains client business data read from Google. Counts and status
  only — the same rule as [Database.md](Database.md) §1.3.
