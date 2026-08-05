# Features — Simplymation Platform

> **Revised 2026-08-02.** Removed: deploy pipeline, bulk update, version rollback,
> telemetry endpoint, silence detection. Added: config editor, bundles, run engine,
> run-now. All because automations now run on our servers.

Grouped by surface, then by build phase. Phase gates at the bottom.

---

## CONSOLE (operator only)

### Authentication
Supabase Auth, restricted to `role = 'operator'`. No public signup route for the console.
A non-operator reaching `/console/*` is redirected to the portal.

### Client switcher — *the primary navigation object*
A searchable dropdown pinned in the console header. Selecting a business writes it into
the URL (`/console/clients/[clientId]/...`), not into global state.

Why URL and not state: the page stays bookmarkable, survives refresh, is safe to share,
and every query on the page derives its filter from one route param. There is no
client-selection state that can drift out of sync with what is on screen.

- Opens with `Cmd/Ctrl + K`, type-to-filter (must stay usable at 100+ clients — tabs do not)
- Each row: business name · industry · status dot
- Remembers last selection across sessions
- The active business name stays visible on every screen, not just in the dropdown.
  **Acting on the wrong client is the worst usability failure this console can have.**

### Client registry
- List: name, industry, plan, automation count, health, last activity
- Create / edit: legal name, display name, industry, contact, phone, email, city,
  **timezone**, plan, status
- Client detail — everything about one business on one screen
- Soft delete only. Churned clients are history, not garbage.

> Timezone is not optional. A reminder scheduled for 9am is meaningless without it.

### Google connection
- Generate a one-time connect link to send the client
- Status: connected / expired / revoked / never
- Show granted scopes in plain language
- Re-request consent when a refresh token goes bad
- **Disconnect** — revokes with Google and disables that client's automations

### Automation library
Read from the code registry, not hand-maintained.
- List: name, industries, how many clients use it, whether bespoke
- Detail: description, config schema, required scopes, default schedule
- Filter by the selected client's industry

### Bundles — the industry preset
- Apply a bundle to a client: creates one automation per bundle item with sensible
  starting config, **all disabled**, ready to tune
- Idempotent — re-applying must not duplicate what already exists
- Each bundle links to its public playbook page. **They are the same product** —
  keep them in sync.

### Per-client configuration — *this is "customise per business"*
A form generated from the automation's config schema:
- Intervals (6 months / 4 months / 5,000 km)
- Prices (₹600 alignment, ₹9,000 tyre set)
- Message wording and language
- Schedule and send time, in the client's timezone
- Which sheet / which columns

Validated against the schema on save. **No deploy step exists** — the next run picks up
the new config. Changing a client's reminder wording is editing a text field.

### Run control
- Enable / pause / disable per automation
- **Run now** — queue an immediate run, same idempotency rules. Rate limited; an
  impatient operator will click it repeatedly.
- Next scheduled run, shown in the client's timezone

### Run history and health
- Cross-client view: every automation, last run, status, what it produced
- Triage list, worst first — failures and stale automations at the top
- Per-run detail: duration, counts, sanitised error
- Per-client health rollup feeding the switcher's status dot

### Incidents
- Auto-created from repeated failures or auth expiry
- Manually created by the operator, or raised by a client from the portal
- `open` / `investigating` / `resolved`, with notes

### Audit log
Every action touching client data: who, what, which client, when, before/after.
Read-only, append-only.

---

## PORTAL (client-facing, PWA)

Design rule for every screen: **the user is not technical and is possibly skeptical.**

### Authentication
Magic link preferred (one less thing to forget), password as fallback.
Roles `client_admin` and `client_staff`. A user belongs to exactly one business.

### My automations
Cards naming each automation **in the client's words**, with when it last ran and what
it produced:

> ✅ Customer Reminders — ran today 9:02am — 14 customers due
> ❌ recall_engine — exit 0

Read-only. Clients cannot edit their own config — see [PRD.md](PRD.md) §6.

### Activity
Reverse-chronological list of what the automations did. Filterable by automation.
No log levels, no stack traces, **no customer data** — counts only.

### Report a problem
One button, one text box, optional photo. Creates an incident in the console and
confirms receipt.

### Account (client_admin only)
Business details, plan, Google connection status, and a clearly visible disconnect.

> Showing a working disconnect button is deliberate. "You are not locked in" is only
> credible if the exit is visible and actually works.

---

## PLATFORM

### Execution engine
Cron tick → claim due automations → run → record. Retries for transient errors,
idempotency ledger before every outward action, per-client isolation so one failure
cannot block another. See [Architecture.md](Architecture.md) §6.

### Notifications
- Operator: email when an automation fails repeatedly or a token expires
- Client: optional weekly "here is what your automations did" summary

---

## BUILD ORDER

| Phase | Contents | Gate before starting |
|---|---|---|
| **0** | These docs | ✅ done |
| **1** | **Recall Engine running for one real garage.** Hand-configured, no console. | — start here |
| **2** | Auth, client registry, switcher, automation library, config editor, audit log | Phase 1 running a month, with a measured result |
| **3** | Execution engine, run history, bundles, incidents | Two or more clients |
| **4** | Client portal (PWA) | A client asks to see status |
| **5** | Billing, AI-assisted authoring, Expo native app | Revenue exists; clients ask for an app |

**Phase 1 is not a platform feature, and that is the point.** Build one automation for
one real business, by hand, before building anything to manage it. It validates the
whole architecture against reality at the cost of a week — and it is the only phase that
produces a testimonial.

Do not start a phase before its gate.
