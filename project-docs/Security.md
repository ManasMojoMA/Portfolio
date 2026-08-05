# Security — Simplymation Platform

> **Revised 2026-08-02** for the backend execution engine. The scope set changed, and
> §5 is new and important: client data now passes *through* our servers, so
> "we never touch their data" became a discipline rather than a structural guarantee.

The threats that matter are not hackers. They are **one client seeing another client's
data**, **losing control of a Google refresh token**, and **accidentally persisting
customer data we promised never to store.** Any of the three would end the business.

---

## 1. Non-negotiables

A PR violating any of these does not merge.

1. RLS enabled on every table. Never disabled, not even to debug.
2. The service role key never appears in a request path serving a logged-in user.
   Only the execution engine and cron jobs may use it.
3. Google refresh tokens live in **Supabase Vault**, encrypted. Never in a plain column,
   never in a log, never in an error message.
4. OAuth scopes stay minimal. Adding one requires re-reading §3 and a deliberate decision.
5. **No client business data persisted.** Counts and status only.
6. Every mutating console action writes an audit row.

---

## 2. Tenant isolation

Four layers, in descending order of how much we rely on them:

1. **Postgres RLS** — the only layer that holds when application code is wrong.
   Policies in [Database.md](Database.md) §4.
2. **`RunContext` scoping** — an automation receives one client's config and one
   client's Google credentials. There is no API on the context for reaching another
   client, so a buggy automation cannot cross tenants even in principle.
3. **Route scoping** — `client_id` from URL (console) or session (portal). **Never from
   a request body.** Body-supplied tenant ids are the classic multi-tenant vulnerability.
4. **Types** — tenant-scoped helpers require `client_id`; omission fails to compile.

Verified by automated test, not inspection — [Database.md](Database.md) §6, run on every migration.

---

## 3. Google OAuth scopes

### Start with the minimum that works

| Phase | Scopes | Why |
|---|---|---|
| **1 (launch)** | `drive.file` | Read/write **only files our app created or the user explicitly picked**. Enough for the Recall Engine and Job Card, whose output is a sheet we create. |
| **Later, only if needed** | `gmail.send` | Send-only. Cannot read a single message. Add only when automated email is genuinely required. |

`drive.file` is the key choice. It is **not** a sensitive scope, and it does not grant
access to the client's existing Drive — only to files we created. For a client's
pre-existing sheet, use the **Google Picker**, which grants `drive.file` access to that
one user-selected file. That avoids the broad `spreadsheets` scope entirely.

**The v1 automations may need no sensitive scope at all**, because the free-tier output
is a sheet of WhatsApp links the owner taps — not automated sending.

### ⚠️ Verify before committing to `gmail.send`

Google classifies scopes as *non-sensitive*, *sensitive*, or *restricted*. Restricted
scopes require an annual third-party **CASA security assessment** costing roughly
$500–$4,500/year, which would break the free tier's economics.

`gmail.send` is generally understood to be **sensitive rather than restricted**, but
**this must be confirmed against Google's current published scope classification before
the product depends on it.** Do not treat this document as authoritative on that point —
it is the single most expensive fact in the architecture.

Never request `gmail.readonly`, `gmail.modify`, `gmail.metadata`, or full `drive`.

Before adding any scope, answer in writing: what breaks without it, is there a narrower
alternative, and does it push us into restricted classification?

### Consent screen

Publishing for external users requires Google verification — a review taking weeks.
Until verified, the app is limited to test users. That is fine for the first client
(add them as a test user), but **start verification early** so it never blocks client #3.

### Token handling

- Refresh token → Supabase Vault immediately. Plaintext never reaches a table, log line
  or error response.
- Access tokens are short-lived, held in memory for one run, never persisted.
- Disconnect calls Google's revoke endpoint, *then* marks locally. Local-only is theatre.
- Daily `token-check` cron finds revoked/expired grants before a run fails.

### If a refresh token leaks

Assume every token is compromised, not one:

1. Revoke all tokens with Google immediately.
2. Rotate the OAuth client secret.
3. Mark every connection revoked; automations stop until re-consented.
4. Tell every affected client, in plain language, the same day.

Point 4 is not optional. A brand built on "your data stays yours" does not survive a
quietly handled breach.

---

## 4. The execution engine

The engine runs with the service role and holds every client's credentials. It is the
highest-privilege code in the system.

- Each run is wrapped so one client's failure cannot affect another.
- An automation only ever receives its own client's `RunContext`. Never pass the raw
  Supabase service client into automation code.
- Automations are ordinary reviewed code in our repo. **There is no path by which a
  client can supply code that we execute** — config is data, validated by Zod, never
  evaluated. No `eval`, no dynamic `Function`, no templating engine that can execute.
- Cron routes require `CRON_SECRET`.
- Idempotency ledger before every outward action ([Architecture.md](Architecture.md) §6) —
  a security control as much as a correctness one, since duplicate messages to a
  client's customers damage *their* reputation.

---

## 5. Client data in transit — the new discipline

Previously, client data never touched our infrastructure. It now passes through memory
during a run. That is a real reduction in guarantee, and it is compensated by rules that
must be enforced, not assumed:

1. **Read → transform → write back. Never persist.** No caching between runs, no temp
   tables, no files.
2. **`automation_runs` stores counts and status only.**
   `"14 customers due"` ✅ · `"Ramesh, 98xxxxxx10, due 12 Aug"` ❌
3. **Sanitise errors before logging.** This is the most likely leak point in the whole
   system, because dumping the failing row into the error message is the natural
   debugging instinct. Catch, extract the message, strip payloads.
4. **`run_actions.action_key` uses stable identifiers, not personal data** — a vehicle
   registration and a period, not a name or phone number. Hash if unsure.
5. **No client data in API responses.** The portal shows counts, not customer lists.

Enforcement: a CI check that greps for obvious leaks is worth having, but the real
control is code review with this section open. Add a test that asserts a failing run
records a sanitised error rather than the raw exception.

---

## 6. Application security

- **Input validation** — Zod at every route boundary.
- **SQL injection** — parameterised via the Supabase client. Raw SQL must bind
  parameters; never string interpolation.
- **Rate limiting** — login, magic links, incident creation, and `run-now`.
- **Secrets** — Vercel env vars only. Never committed. Never `NEXT_PUBLIC_*` unless
  genuinely public. The anon key is public by design; the service role key is not and
  must never reach the browser.
- **Headers** — CSP, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.
- **Dependencies** — pinned, Dependabot on, review anything in an auth or data path.
- **Passwords** — entirely Supabase Auth. We never hash, store, or see one.

---

## 7. Audit logging

Actor, client affected, action, target, before/after, timestamp.

- Append-only. No UPDATE or DELETE policy exists.
- Clients have no access — it contains cross-client operator activity.
- **If the audit write fails, the operation fails.**

---

## 8. Data retention

| Data | Retention |
|---|---|
| `automation_runs` | 90 days raw, then daily rollups |
| `run_actions` | 13 months (must outlive the longest reminder cycle) |
| `audit_log` | Indefinite |
| Churned clients | Soft-deleted, retained; Google connection revoked immediately |
| Google tokens | Deleted from Vault on disconnect or churn |

---

## 9. Pre-launch checklist

Before the **first real client**:

- [ ] Tenant-isolation tests passing (two clients, cross-read and cross-write attempts)
- [ ] RLS confirmed enabled on every table via `pg_tables` query, not by eye
- [ ] Service role key absent from both client bundles (grep the build output in CI)
- [ ] Refresh tokens confirmed in Vault, absent from logs
- [ ] **`gmail.send` classification confirmed against Google's current docs** (§3)
- [ ] OAuth consent screen submitted for verification
- [ ] Client-facing disconnect tested end to end, including Google-side revocation
- [ ] Idempotency verified: run the same automation twice, confirm no duplicate actions
- [ ] Error sanitisation verified: force a failure, confirm no customer data in the log
- [ ] Audit log writing on every mutating action
- [ ] Security headers verified on both apps
