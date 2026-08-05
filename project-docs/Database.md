# Database — Simplymation Platform

> **Revised 2026-08-02** for the backend execution engine. Removed: `google_script_id`,
> `telemetry_token_hash`, `template_versions.source_files`. Automation code now lives in
> the repo, not the database.

Postgres via Supabase. Every table holding tenant data carries a `client_id` and is
protected by Row Level Security.

---

## 1. Design rules

1. **Every tenant table has a non-null `client_id`.** No exceptions.
2. **RLS enabled on every table.** A table with RLS off is a bug, not a shortcut.
3. **Never store client business data.** Customer names, phone numbers, invoices and job
   cards live in the client's own Sheets. We store counts and status, never content.
   If a column would hold a garage customer's phone number, the design is wrong.
4. **Automation code is not in the database.** `automation_definitions` holds metadata
   *about* code that lives in `packages/automations`. The registry is the source of truth.
5. Soft delete via `deleted_at`. Nothing tenant-owned is hard-deleted.
6. `created_at` / `updated_at` everywhere, `timestamptz`, default `now()`.
7. UUID primary keys (`gen_random_uuid()`).

---

## 2. Schema

### `clients`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `display_name` | text not null | "Sharma Tyre House" |
| `legal_name` | text | for invoices |
| `industry` | text not null | `tyre_garage`, `dental_clinic`, … — drives bundle suggestions |
| `contact_name`, `contact_phone`, `contact_email` | text | |
| `city` | text | |
| `country` | text default `'IN'` | |
| `timezone` | text default `'Asia/Kolkata'` | **schedules are meaningless without this** |
| `plan` | text default `'free'` | `free` \| `starter` \| `growth` |
| `status` | text default `'prospect'` | `prospect` \| `active` \| `paused` \| `churned` |
| `notes` | text | operator's private notes |
| `created_at`, `updated_at`, `deleted_at` | timestamptz | |

### `profiles` — extends `auth.users`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK → `auth.users.id` | |
| `role` | text not null | `operator` \| `client_admin` \| `client_staff` |
| `client_id` | uuid FK → clients | **null for operators**, required otherwise |
| `full_name` | text | |

CHECK: `(role = 'operator' AND client_id IS NULL) OR (role <> 'operator' AND client_id IS NOT NULL)`

### `google_connections` — one per client
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `client_id` | uuid FK not null, **unique** | |
| `google_email` | text | which account authorised |
| `refresh_token_secret_id` | uuid | **pointer into Supabase Vault — never the token** |
| `granted_scopes` | text[] | audit what was actually approved |
| `status` | text | `connected` \| `expired` \| `revoked` \| `never` |
| `connected_at`, `last_verified_at` | timestamptz | |

### `automation_definitions` — metadata mirror of the code registry
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `key` | text unique not null | must match a key in `packages/automations` |
| `name` | text not null | "Recall Engine" — operator-facing |
| `client_facing_name` | text not null | "Customer Reminders" — portal-facing |
| `description` | text | plain language |
| `industries` | text[] | |
| `required_scopes` | text[] | |
| `config_schema` | jsonb | JSON Schema derived from the Zod schema; drives the console form |
| `default_schedule` | text | cron expression |
| `is_bespoke` | bool default false | true = built for one client |
| `status` | text default `'active'` | `active` \| `deprecated` |

> Synced from the registry by a build step, not hand-edited. A row whose `key` has no
> matching module is a deployment error and should fail CI.

### `bundles` — industry presets (the playbooks)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `key` | text unique | `tyre_garage` |
| `name` | text | "Tyre Garage Starter" |
| `industry` | text | |
| `playbook_url` | text | the public playbook page — keep them in sync |

### `bundle_items`
| Column | Type | Notes |
|---|---|---|
| `bundle_id` | uuid FK | |
| `definition_id` | uuid FK | |
| `default_config` | jsonb | starting values the operator then tunes |
| `sort_order` | int | |

### `client_automations` — **the core table: one automation, configured for one client**
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `client_id` | uuid FK not null | |
| `definition_id` | uuid FK not null | |
| `definition_key` | text not null | denormalised; the engine resolves code by this |
| `config` | jsonb not null | **this is "customisation"** — validated against `config_schema` |
| `enabled` | bool default false | |
| `schedule` | text | cron; overrides the definition default |
| `next_run_at` | timestamptz | computed after each run |
| `last_run_at` | timestamptz | |
| `last_run_status` | text | `ok` \| `error` \| null |
| `run_status` | text default `'idle'` | `idle` \| `running` — the claim lock |
| `locked_at` | timestamptz | for detecting stuck runs |
| `consecutive_failures` | int default 0 | auto-disable threshold |
| `created_at`, `updated_at`, `deleted_at` | timestamptz | |

Unique on `(client_id, definition_id)` where `deleted_at is null` — one instance of a
given automation per client.
Index on `(enabled, next_run_at)` — the tick's hot query.

### `automation_runs` — execution log
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `client_automation_id` | uuid FK not null | |
| `client_id` | uuid FK not null | denormalised so RLS filters without a join |
| `idempotency_key` | text not null | `clientAutomationId:scheduledFor` |
| `status` | text not null | `running` \| `ok` \| `error` \| `skipped` |
| `summary` | text | **counts only** — "14 customers due" |
| `counts` | jsonb | `{ "due": 14, "sent": 14 }` |
| `error_message` | text | sanitised, truncated to 2000 chars |
| `started_at`, `finished_at` | timestamptz | |
| `duration_ms` | int | |

Unique on `idempotency_key`. Index `(client_automation_id, started_at desc)` and
`(client_id, started_at desc)`.

> **`summary`, `counts` and `error_message` must never contain customer data.**
> This is the single most likely place for a leak, because an error message is the
> natural place for a developer to dump the row that failed. See [Security.md](Security.md) §5.

### `run_actions` — idempotency ledger
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `client_automation_id` | uuid FK not null | |
| `client_id` | uuid FK not null | |
| `action_key` | text not null | e.g. `reminder:vehicle:UP14AB1234:2026-08` |
| `performed_at` | timestamptz | |

Unique on `(client_automation_id, action_key)`. Before any outward action, insert here;
a conflict means it already happened, so skip. This is what stops a retried run
sending a customer the same reminder twice.

> `action_key` is a **stable identifier, not personal data** — a vehicle registration
> and a period, not a name or phone number. Hash it if in doubt.

### `incidents`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `client_id` | uuid FK not null | |
| `client_automation_id` | uuid FK | nullable |
| `title`, `description` | text | |
| `source` | text | `auto_error` \| `auto_auth` \| `operator` \| `client_report` |
| `status` | text default `'open'` | `open` \| `investigating` \| `resolved` |
| `resolved_at` | timestamptz | |

### `audit_log` — append-only
`actor_id`, `client_id`, `action`, `target_type`, `target_id`, `metadata` jsonb, `created_at`.
No UPDATE or DELETE policy exists. Insert-only by design.

---

## 3. Helper functions

```sql
create or replace function auth.user_role() returns text as $$
  select role from public.profiles where id = auth.uid();
$$ language sql stable security definer;

create or replace function auth.user_client_id() returns uuid as $$
  select client_id from public.profiles where id = auth.uid();
$$ language sql stable security definer;

create or replace function auth.is_operator() returns boolean as $$
  select coalesce(auth.user_role() = 'operator', false);
$$ language sql stable security definer;
```

`stable` matters — Postgres caches these within a statement instead of per row.

---

## 4. RLS policies

The pattern, applied to every tenant table:

```sql
alter table public.client_automations enable row level security;

create policy "operators all" on public.client_automations
  for all using (auth.is_operator()) with check (auth.is_operator());

create policy "clients read own" on public.client_automations
  for select using (client_id = auth.user_client_id());
```

| Table | Operator | client_admin / client_staff |
|---|---|---|
| `clients` | all | select own row |
| `profiles` | all | select own + same-client |
| `google_connections` | all | select own; update own `status` only (to disconnect) |
| `automation_definitions` | all | select — not tenant data |
| `bundles`, `bundle_items` | all | select |
| `client_automations` | all | **select own only** — clients never edit their own config |
| `automation_runs` | all | select own |
| `run_actions` | all | **no access** — internal bookkeeping |
| `incidents` | all | select own + insert own |
| `audit_log` | select | **no access** |

Clients are deliberately read-only on `client_automations`. A business owner changing
their own reminder interval to "every day" would be a support incident, not a feature.
Changes go through the operator.

**Service role** bypasses RLS. Used only by the execution engine and cron jobs, never in
a request path serving a logged-in user.

---

## 5. Triggers

- `updated_at` auto-touch.
- `automation_runs.client_id` and `run_actions.client_id` populated from the parent
  `client_automations` row — never trusted from application input.
- After an `automation_runs` update to a terminal status: update the parent's
  `last_run_at`, `last_run_status`, `consecutive_failures`, and release `run_status` to `idle`.
- Auto-disable: when `consecutive_failures >= 5`, set `enabled = false` and open an incident.

---

## 6. Testing tenant isolation

**Not optional, and not satisfied by reading the code.** Before any client account exists:

1. Seed two clients, A and B, each with automations, runs and incidents.
2. Create a `client_admin` for A.
3. As A, attempt to read B's rows — by id, by filter, and with no filter at all.
   Every attempt must return zero rows.
4. As A, attempt to insert an incident with `client_id = B`. Must be rejected by `WITH CHECK`.
5. As A, attempt to update own `client_automations.config`. Must be rejected.

Keep these as automated tests and re-run on every migration. A passing manual check today
is not evidence the policy still holds after the next schema change.
