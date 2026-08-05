# Simplymation Platform — Project Docs

Phase 0 specification for the **Simplymation Platform**: an operator console plus a
client portal for configuring and running automations for many small businesses from
one place.

> **These docs specify a separate repository** (`simplymation-platform`). They live in
> the Portfolio repo for now because that is where work is happening. Move them when the
> platform repo is created. Nothing here is imported by the marketing site.
>
> **Revised 2026-08-02.** The architecture changed from deploying Apps Script into
> client Google accounts to a backend execution engine. If you read an earlier version,
> start with [Architecture.md](Architecture.md) §8.

---

## Read in this order

| # | Doc | What it settles |
|---|---|---|
| 1 | [PRD.md](PRD.md) | What we are building, for whom, what is excluded, and what we may/may not promise |
| 2 | [Architecture.md](Architecture.md) | The execution engine, the customisation ladder, and why not Apps Script |
| 3 | [Database.md](Database.md) | Schema, RLS policies, tenant isolation |
| 4 | [Security.md](Security.md) | Non-negotiables, OAuth scopes, data-in-transit discipline |
| 5 | [API.md](API.md) | Routes, the run engine, cron jobs |
| 6 | [TechStack.md](TechStack.md) | Stack choices — and what was rejected, with reasons |
| 7 | [Features.md](Features.md) | Feature list and the phased build order |
| 8 | [UIUX.md](UIUX.md) | Two audiences, two tones, one component library |
| 9 | [Deployment.md](Deployment.md) | Environments, migrations, CI, rollback |
| 10 | [AI_Instructions.md](AI_Instructions.md) | **Read before generating any code** |

---

## The one idea everything follows from

**One codebase runs every client's automations. Clients differ by configuration, never
by code.**

```
Recall Engine  ← ONE implementation, in our repo, forever
      │
      ├── Sharma Tyre House   → config: 6mo alignment, ₹600, Hindi, 9:00am
      ├── Gupta Motors        → config: 4mo alignment, ₹750, Hindi, 8:00am
      └── Dr. Mehta's Clinic  → config: 6mo checkup,   ₹400, English, 10:00am
```

A garage and a dental clinic run the same code. That is the whole leverage of the
business — write an automation once, sell it many times. Every architectural decision in
these docs exists to protect that property.

A useful consequence: **a bug fix is one `git push`**, not thirty deployments.

---

## What we promise clients

**Say this:** your data never leaves your Google account; we store none of it; revoke
access in one click and you keep every record.

**Do not say this:** "fire us and it keeps running." It will not. See
[PRD.md](PRD.md) §9 — the marketing site still carries the old wording and must be
corrected before launch.

---

## Non-negotiables

Full list in [Security.md](Security.md) §1:

1. RLS on every table, always
2. Service role key never in a logged-in user's request path
3. Google refresh tokens in Supabase Vault only, never logged
4. OAuth scopes minimal — start with `drive.file` alone
5. No client business data persisted; counts and status only
6. Every mutating console action writes an audit row

---

## Build phases

| Phase | Contents | Gate before starting |
|---|---|---|
| 0 | These docs | ✅ done |
| 1 | Recall Engine running for one real garage | — start here |
| 2 | Auth, client registry, switcher, config editor, audit log | Phase 1 automation running for a month |
| 3 | Execution engine, run history, bundles, incidents | Two or more clients |
| 4 | Client portal (PWA) | A client asks to see status |
| 5 | Billing, AI-assisted authoring, Expo native app | Revenue exists; clients ask for an app |

Phase 1 is deliberately not a platform feature. **Build the first automation for a real
business before building anything to manage it** — a console managing zero automations
is an expensive empty room.

---

## Open questions

Decide before Phase 3:

- [ ] **Confirm `gmail.send` is sensitive, not restricted** — the single most expensive
      unverified fact here ([Security.md](Security.md) §3)
- [ ] Verify the current serverless function timeout limit for the run engine
- [ ] Domain purchase (`simplymation.com` / `.in`) and trademark check
- [ ] Google Cloud project + OAuth consent screen verification — allow several weeks
- [ ] Supabase region: Mumbai vs Singapore
- [ ] Whether `client_staff` needs its own portal view or shares `client_admin`'s
