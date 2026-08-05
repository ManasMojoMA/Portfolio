# PRD — Simplymation Platform

> Spec for the `simplymation-platform` repository. This is a **separate product** from
> the marketing site in this repo. These docs live here for now because that is where
> work is happening; move them when the platform repo is created.
>
> **Revised 2026-08-02** — architecture changed from deploying Apps Script into client
> accounts to a backend execution engine. See [Architecture.md](Architecture.md) §8 for
> the decision record.

---

## 1. Project name

**Simplymation Platform** — an operator console plus a client portal for building,
configuring and running automations for many small businesses from one place.

## 2. The problem

Simplymation sells AI and automation services to small business owners — garages,
clinics, salons, retailers, small manufacturers. Each business needs roughly the same
handful of automations, tuned to their trade: reminders for repeat customers, digital
job records, simple stock tracking, a daily summary.

Doing this by hand does not survive contact with a third client:

- The same automation gets rebuilt slightly differently for every business.
- A bug found for one client is quietly still broken for the other twelve.
- Nobody knows what a given business actually has running, or whether it ran this morning.
- When something breaks, **the client finds out before we do** — fatal for a trust-led brand.
- Clients have no visibility into the thing they are paying for.

## 3. What we are building

**One codebase that runs every client's automations, where clients differ by
configuration rather than by code.**

**The Console** (internal, operator-only)
Pick a business from a switcher and the whole screen scopes to it: its automations,
their configuration, their run history, its incidents. From here the operator applies a
pre-built automation to a business, tunes it to that business's prices, intervals and
wording, and turns it on. Fixing a bug is a `git push`, not a per-client deployment.

**The Portal** (external, one account per client business)
Each business sees **only their own** automations: what is running, when it last ran,
what it produced. A PWA first, so there is no app-store friction; the same React moves
to a native Expo app later if clients ask.

## 4. Target users

| Role | Who | Primary need |
|---|---|---|
| `operator` | Manas (later, hires) | Serve many businesses without losing track of any |
| `client_admin` | The business owner | Confidence the thing he pays for is working |
| `client_staff` | A mechanic, receptionist, assistant | Day-to-day use; no settings, no billing |

`client_staff` matters more than it looks. In a garage the owner will not be the person
opening this daily — the person filling in job cards will. Their view must be trivial.

## 5. Core features (v1)

1. **Client registry** — every business, industry, contact, plan, status.
2. **Client switcher** — the operator's primary navigation; scopes the whole console.
3. **Automation library** — pre-built automations in the code registry, each with a
   config schema.
4. **Bundles** — an industry preset applying a set of automations at once. Identical to
   the public playbook for that industry.
5. **Per-client configuration** — the customisation surface: intervals, prices, wording,
   language, schedule. This is what "customise per business" means in practice.
6. **Execution engine** — scheduled runs, retries, idempotency, per-client isolation.
7. **Run history and health** — what ran, when, what it produced, what failed.
8. **Client portal** — read-only status for that business.
9. **Audit log** — every operator action that touched client data.

## 6. Explicitly out of scope for v1

Stated plainly to stop scope creep:

- **No natural-language automation builder.** The operator writes automations in the
  repo; the console configures and runs them. Revisit at Phase 5.
- **No billing.** `plan` is a text field until there is revenue to process.
- **No native mobile app.** PWA only.
- **No client self-serve signup.** These are sold relationships, not a funnel.
- **No client-editable configuration.** A business owner changing their own reminder
  interval to "daily" is a support incident, not a feature.
- **No multi-operator permissions model** until there is a second operator.

## 7. User flows

**Operator — onboarding a business**
```
New client (name, industry, contact)
  → send Google connect link → client authorises
  → apply the industry bundle
  → tune config: his prices, his intervals, his wording
  → enable → first run → verify
```

**Operator — fixing a bug for everyone**
```
Edit the automation in the repo → test → git push
  → every client is fixed on their next run
```
No deployment step, no per-client update, no version drift.

**Client — daily reassurance**
```
Open portal on phone → "Customer Reminders — ran today 9:02am, 14 due" → done
```

**Client — something looks wrong**
```
Portal → Report a problem → creates an incident in the operator console
```

## 8. What success looks like

- The operator can answer "what does client X have, and is it working?" in under 10
  seconds, without opening Google.
- A broken automation surfaces in the console **before** the client reports it.
- A bug fix reaches every affected client with one push.
- Adding a client with a known industry takes under an hour, most of it conversation.
- A client can open the portal on their phone and understand, without explanation, that
  their automation ran today.

## 9. The promise we make, and the one we no longer make

**We can honestly say:**
> Your data never leaves your Google account. Your customer list, your job cards, your
> records — all in your own Sheets and Drive. We store none of it. Revoke our access in
> one click and you keep every record.

**We can no longer say:**
> Fire us tomorrow and your automations keep running.

They will not. The logic runs on our servers. If we stop, the automations stop — as with
any software they already pay for. That was the price of being able to fix thirty
clients with one push, and it was worth paying.

**Nobody may claim otherwise in sales copy, on the playbook pages, or in the portal.**
The marketing site currently carries the old wording and must be corrected before launch.

## 10. Constraint that shapes everything

Client data passes **through** our servers during a run but must never come to rest
there. What was previously a structural guarantee is now a discipline enforced by code
review and tests. See [Security.md](Security.md) §5 — it is the most important section
in these documents.
