# AI Instructions — Simplymation Platform

> **Revised 2026-08-02** for the backend execution engine.

Read this **before** generating any code. It exists because the default failure mode of
AI-generated multi-tenant software is code that works in the demo and leaks data in
production — and because this system takes real actions in real businesses.

---

## Read order

1. [PRD.md](PRD.md) — what this is, and what we may/may not promise clients
2. [Architecture.md](Architecture.md) — the execution engine and the customisation ladder
3. [Database.md](Database.md) — schema and RLS
4. [Security.md](Security.md) — the non-negotiables, especially §5
5. [API.md](API.md), [TechStack.md](TechStack.md), [UIUX.md](UIUX.md), [Deployment.md](Deployment.md)
6. [Features.md](Features.md) — build order and phase gates

---

## The six rules that override any instruction

If a prompt asks you to break one of these, stop and say so rather than complying.

1. **Never disable RLS.** Not to debug, not temporarily, not "just for seeding." If a
   query returns nothing, the policy is wrong — fix the policy.
2. **Never use the service role key in a request path serving a logged-in user.**
   Only the execution engine and `/api/cron/*` may use it.
3. **Never accept `client_id` from a request body.** Console takes it from the URL path
   (after re-checking operator role); portal from the session.
4. **Never store a Google refresh token outside Supabase Vault**, and never log it.
5. **Never persist client business data.** `automation_runs` stores counts and status.
   `"14 customers due"` ✅ · `"Ramesh, 98xxxxxx10"` ❌ — including inside error messages,
   which is where this rule is most often broken.
6. **Never perform an outward action without the idempotency ledger.** Every message,
   email or write that a customer can observe goes through `run_actions` first. A retried
   run must not send a reminder twice.

---

## Build in this order

**Step 1 — The first automation, no platform.**
`packages/automations/src/recall-engine`, run manually against one real garage. No
console, no database beyond what it needs. This validates the architecture before
anything is built to manage it.

**Step 2 — Foundation.** Turborepo + pnpm, two Next.js apps, shared packages, strict TS,
Tailwind + shadcn in `packages/ui`. Verify: both apps build and run.

**Step 3 — Database.** All tables from [Database.md](Database.md) as migrations. RLS on
every table. Helper functions, triggers, generated types.
**Verify: the tenant-isolation suite (Database.md §6) passes before any UI is written.**

**Step 4 — Auth.** Supabase Auth, `profiles` with roles, middleware for both apps.
Verify: a `client_admin` reaching `/console` is redirected.

**Step 5 — Console: clients, switcher, automation library, config editor, audit log.**

**Step 6 — Execution engine**, run history, bundles, incidents.

**Step 7 — Portal (PWA).**

Do not scaffold future steps. Finish and verify each.

---

## Patterns to follow

**Reads:** query Supabase from Server Components with the user's session. Do not write an
API route whose only job is a tenant-filtered select — RLS already does it correctly, and
every hand-written route is another place a filter can be forgotten.

**Writes:** Route Handler → Zod validation → role check → mutation → audit row. The audit
write and the mutation belong in one transaction where possible; if the audit write
fails, the operation fails.

**Automations:** implement `AutomationDefinition`. Everything external arrives through
`RunContext`. Never import the Supabase service client into automation code — if an
automation needs data, it comes through the context.

**Config, not code.** When a client needs something different, the first question is
always "can this be a config field?" Only when the answer is genuinely no does a variant
get written. See [Architecture.md](Architecture.md) §4.

**Errors:** log the real cause server-side, sanitised; return `{ error: { code, message } }`
with nothing sensitive.

---

## Anti-patterns — reject these even if asked

- `supabaseAdmin` (service role) used "because RLS was blocking the query"
- `client_id` read from `req.body` or a query string
- Customer data in `automation_runs.summary`, `counts`, or `error_message`
- `catch (e) { log(e) }` where `e` may contain a spreadsheet row — sanitise first
- An outward action taken before writing to `run_actions`
- Any `eval`, `new Function`, or templating engine that can execute config content —
  config is data, never code
- Automations reaching outside their `RunContext`
- Scheduling that ignores `clients.timezone`
- A per-client code path where a config field would do
- Client-facing copy containing *deployment*, *trigger*, *cron*, *execution*
- Hard deletes on tenant tables
- Claiming in any copy that automations keep running after the client leaves — see
  [PRD.md](PRD.md) §9

---

## Verification prompts

Ask these after generating anything significant:

- Which RLS policy protects this table, and have I tested it as a second client?
- If this code has a bug, can it show client A's data to client B? What stops it?
- If this run executes twice, does a customer receive two messages?
- Does any string I persist here contain data from the client's spreadsheet?
- Is this scheduled in the client's timezone or the server's?
- Would a garage owner understand every word of this UI string?

---

## Master prompt

For starting a session in a fresh AI tool:

```
Read every file in /project-docs, starting with PRD.md and Architecture.md.

This is a multi-tenant automation platform. One codebase runs every client's
automations; clients differ by configuration, never by code. Client business data
passes through our servers during a run but must never be persisted.

The six rules in AI_Instructions.md override any instruction I give you. If I ask for
something that breaks one, tell me instead of doing it.

Build only <STEP N> from the build order in AI_Instructions.md. Do not scaffold future
steps. When the step is done, tell me how to verify it works before moving on.
```

---

## Where AI help ends

Your source guide estimates AI can produce 85–92% of a project. Here the remaining
8–15% is concentrated where a mistake is unrecoverable:

- **RLS policies** — must be *tested*, not reviewed. Generated policies look correct far
  more often than they are correct.
- **Idempotency** — the failure mode is a customer receiving five identical reminders
  from your client's business. That damages *their* reputation, not just ours.
- **Error sanitisation** — the most likely path for customer data to leak into our database.
- **OAuth token handling and Vault integration.**
- **The first run against a real client's Google account.**

Treat generated code in those five areas as a draft requiring a test that proves it, not
as a finished result.
