# Architecture — Simplymation Platform

> **Revised 2026-08-02.** The original design deployed Apps Script into each client's
> Google account. That has been replaced by a backend execution engine. The reason is
> in §8 — read it before proposing a return to the old design.

---

## 1. The governing idea

**One codebase runs every client's automations. Clients differ by configuration, never by code.**

```
Recall Engine  ← ONE implementation, in our repo, forever
      │
      ├── Sharma Tyre House   → config: 6mo alignment, ₹600, Hindi, 9:00am
      ├── Gupta Motors        → config: 4mo alignment, ₹750, Hindi, 8:00am
      └── Dr. Mehta's Clinic  → config: 6mo checkup,   ₹400, English, 10:00am
```

A garage and a dental clinic run the *same code*. That is the entire leverage of the
business: writing an automation once and selling it many times.

Consequences:

- There is no "deploy to client" step. Nothing of ours lives in their account.
- A bug fix is one `git push`. Every client is fixed simultaneously.
- Onboarding a client is filling in a form, not a code deployment.
- We can test automations like normal software, because they are normal software.

## 2. System diagram

```
┌────────────────────┐        ┌────────────────────┐
│  Console (Next.js) │        │  Portal (Next.js)  │
│  operator only     │        │  clients, PWA      │
└─────────┬──────────┘        └─────────┬──────────┘
          └──────────────┬──────────────┘
                         ▼
          ┌──────────────────────────────┐
          │   Supabase                   │
          │   Postgres + RLS · Auth      │
          │   Vault (refresh tokens)     │
          └──────────────┬───────────────┘
                         │
          ┌──────────────▼───────────────┐
          │   EXECUTION ENGINE           │
          │   Vercel Cron → /api/cron/tick│
          │   automations/ registry      │
          └──────────────┬───────────────┘
                         │ Google APIs, as the client, via their token
                         ▼
          ┌──────────────────────────────┐
          │   CLIENT'S GOOGLE ACCOUNT    │
          │   Sheets · Drive · Gmail     │
          │   their data lives here      │
          └──────────────────────────────┘
```

Their data still lives in their Google account. What changed is that the **logic**
lives with us instead of with them.

## 3. The automation registry

An automation is a TypeScript module in our repo implementing one interface:

```typescript
// packages/automations/src/recall-engine/index.ts
export const recallEngine: AutomationDefinition<RecallConfig> = {
  key: 'recall_engine',
  name: 'Recall Engine',
  clientFacingName: 'Customer Reminders',
  industries: ['tyre_garage', 'dental_clinic', 'salon'],
  configSchema: recallConfigSchema,        // Zod — drives the console form
  requiredScopes: ['drive.file'],
  defaultSchedule: '0 9 * * *',

  async run(ctx: RunContext<RecallConfig>): Promise<RunResult> {
    const rows = await ctx.sheets.read(ctx.config.sourceSheetId, 'Customers!A:H');
    const due  = findDue(rows, ctx.config.intervals, ctx.now);
    await ctx.sheets.write(ctx.config.sourceSheetId, 'Due Today!A:D', buildLinks(due));
    return { ok: true, summary: `${due.length} customers due`, counts: { due: due.length } };
  }
};
```

`RunContext` is the only way an automation touches the outside world. It carries the
client's config, a Google client already authenticated as that client, a logger, and
`now`. An automation **cannot** reach another client's data, because it is never given
a way to.

Registry: `packages/automations/src/registry.ts` maps `key → definition`. The database
stores metadata *about* definitions (for the console UI); the code is the source of truth.

## 4. The customisation ladder

Three tiers, in the order they should be attempted:

| Tier | Share | What it means | Where it lives |
|---|---|---|---|
| **Config** | ~90% | Fill a form: intervals, prices, wording, language, schedule | A row in `client_automations` |
| **Variant** | ~8% | Genuinely different logic (km-based instead of month-based). Becomes available to all future clients. | A new definition in the registry |
| **Bespoke** | ~2% | One client, one odd requirement | A definition flagged `bespoke: true` |

**All three live in our repo.** Even bespoke work stays where it can be tested,
versioned and fixed. Nothing is ever written directly into a client's account.

If a request cannot be met by config, that is a signal the config schema is too narrow —
consider widening it before writing a variant.

## 5. Bundles — the industry preset

A bundle is a named set of automations with sensible starting config for an industry.

```
Tyre Garage bundle → recall_engine · job_card · casing_tracker
                     stock_by_size · udhaar_ledger · daily_summary
```

This is deliberately identical to the six automations on the tyre-garage playbook page.
**The playbook and the bundle are the same object** — writing a playbook for a new
industry simultaneously produces the sales page and the console preset. Keep them in sync.

Bundles handle the "I don't know what I need" client: apply the bundle for their
industry, then tune config.

## 6. The run loop

```
Vercel Cron → /api/cron/tick   (every 5 minutes)
   │
   ├─ select client_automations where enabled and next_run_at <= now
   ├─ for each, in a claimed lock:
   │     create automation_runs row (status 'running', idempotency_key)
   │     load definition from registry by key
   │     mint Google client from the client's refresh token
   │     definition.run(ctx)
   │     record result, compute next_run_at
   └─ anything still 'running' past its timeout → mark 'failed', open incident
```

### Idempotency — the rule that stops us spamming customers

A retried run must never re-send a message a customer already received.

Every run has an `idempotency_key` (`clientAutomationId:scheduledFor`). Before any
outward action, the automation records intent; on retry, already-actioned items are
skipped. **Assume every run can execute twice** — serverless retries, cron overlap and
manual "Run now" all make this real.

Getting this wrong means a garage customer receives the same reminder five times, which
is worse than the automation not running at all.

### Locking

Claim rows with `UPDATE ... WHERE status = 'idle' RETURNING` so two overlapping ticks
cannot run the same automation twice. Cheap, and correct.

### Timeouts — a real constraint

Serverless functions have a hard maximum duration (Vercel's limit differs by plan;
**verify the current figure before relying on it**). Design every run to finish in
well under it:

- Process in chunks; save progress; resume next tick.
- A run over ~200 records should page rather than loop to completion.
- If an automation genuinely cannot fit, it needs a queue and a worker — not a longer
  timeout.

### Failure handling

- Transient (network, 429, 503) → retry with backoff, up to 3 attempts.
- Auth failure → mark the client's connection `expired`, open an incident, stop retrying.
- Logic error → record it, open an incident, do not retry (it will fail identically).
- **A failed run never blocks other clients.** One bad config must not stall the tick.

## 7. Data handling — the discipline that replaces the old promise

Client business data now passes **through** our servers. It must never come to rest there.

1. Read from their Sheets into memory, transform, write back. Do not persist.
2. `automation_runs` stores **counts and status, never content.**
   `"14 customers due"` ✅ · `"Ramesh, 98xxxxxx10, due 12 Aug"` ❌
3. Errors are sanitised before logging. A stack trace containing a customer row must
   be scrubbed.
4. No caching of client data between runs.

This is now a *discipline*, where previously it was a structural guarantee. That is a
genuine loss and the reason for §7's prominence — it must be enforced in code review
and tested, not assumed. See [Security.md](Security.md) §5.

## 8. Why not Apps Script (the decision record)

The original design pushed Apps Script into each client's account so automations would
survive us leaving. It was rejected for these reasons:

| | Apps Script per client | Backend engine |
|---|---|---|
| Fix a bug for 30 clients | 30 API calls, partial failures, version drift | one `git push` |
| Onboard a client | OAuth + code push + verify | fill a form |
| Change message wording | push new code | edit a text field |
| Testing | very hard | ordinary tests |
| Observability | build telemetry, heartbeats, silence detection | our own logs |
| Blocking constraint | Apps Script API does not support service accounts | — |

What we gave up: *"fire us tomorrow and it keeps running."* What we kept, and can still
say honestly: **their data never leaves their Google account, we store none of it, and
one click revokes our access and they keep every record.**

If someone proposes returning to Apps Script, the question to answer first is: how will
you fix a bug across thirty accounts without a version-drift problem?

## 9. Tenant isolation

Unchanged in principle, and now simpler:

1. **Postgres RLS** — the layer that holds when application code is wrong. Primary.
2. **`RunContext` scoping** — an automation is handed exactly one client's config and
   one client's Google credentials. It has no API for reaching another.
3. **Route scoping** — console takes `client_id` from the URL, portal from the session.
   Never from a request body.
4. **Types** — tenant-scoped helpers require `client_id`, so omission fails to compile.

## 10. Scaling notes

- `automation_runs` grows fastest. Index `(client_automation_id, created_at desc)`;
  roll up to daily summaries past ~10M rows.
- The tick is the bottleneck at scale. Dispatch is O(due automations); once that no
  longer fits in one function, move to a queue with workers.
- Google API quotas are largely **per end user**, so they scale with clients rather than
  against us. Project-level Sheets quotas still apply — batch reads and writes.
- Supabase region: closest to India (Mumbai/Singapore).
