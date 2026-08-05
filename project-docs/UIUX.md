# UI / UX — Simplymation Platform

Two products with genuinely different users. Do not unify their design language for
the sake of consistency — unify the *components*, not the tone.

---

## The two audiences

| | Console | Portal |
|---|---|---|
| User | Manas, daily, on a laptop | Business owner or staff, occasionally, on a cheap Android phone |
| Skill | Expert | Non-technical, possibly nervous about tech |
| Goal | Density. See everything, act fast. | Reassurance. "It's working." |
| Failure mode | Information hidden behind clicks | One unexplained word and they stop trusting it |

The console may be dense and keyboard-driven. The portal must be readable by someone
standing in a garage in daylight, holding a phone with a cracked screen.

---

## Shared foundation

- **shadcn/ui + Tailwind 4**, components in `packages/ui`, consumed by both apps.
- **Light theme default.** The portal must be sunlight-readable; the console follows for
  consistency. Dark mode is a Phase 5 nicety, not a launch requirement.
- **System font stack.** No webfont downloads on a mobile connection.
- Radii, spacing and easing tokens shared; **colour semantics diverge** (below).

### Status colour language — identical in both apps
| State | Colour | Meaning |
|---|---|---|
| Healthy | green | ran as expected |
| Degraded | amber | ran, but with errors, or is late |
| Down | red | failed repeatedly, or silent past threshold |
| Dormant | grey | intentionally paused, not broken |

**Dormant must never look like Down.** A paused automation showing red trains the
operator to ignore red. That is how real outages get missed.

---

## Console

### Layout
```
┌──────────────────────────────────────────────────────────┐
│ Simplymation   [ Sharma Tyre House  ▾ ]        ⚙  MA     │  ← switcher in header
├────────────┬─────────────────────────────────────────────┤
│ Overview   │                                             │
│ Clients    │   scoped to the selected business           │
│ Automations│                                             │
│ Health     │                                             │
│ Incidents  │                                             │
│ Audit      │                                             │
└────────────┴─────────────────────────────────────────────┘
```

### The client switcher
The most-used control in the product. Requirements:

- Opens with `Cmd/Ctrl + K`, type-to-filter immediately
- Each row: business name · industry · status dot
- Selecting navigates — it changes the URL, it does not mutate hidden state
- A persistent, unmissable indication of which client is active. **Acting on the wrong
  client is the single worst usability failure this console can have**, so the current
  business name stays visible on every screen, not just the header dropdown.
- Remembers last selection across sessions

### Health dashboard — the default landing screen
Not a chart wall. A triage list, worst first:

```
🔴 Sharma Tyre House · Recall Engine · silent 3 days · expected daily
🟠 Gupta Motors · Job Card · 4 errors today · "Cannot read property 'phone'"
🟢 Verma Tyres · everything healthy · last run 9:02am
```

Every row is one click from the client, the deployment, and the raw run log.
Silence is styled as loudly as errors.

### The config editor — *where "customise per business" happens*
A form generated from the automation's Zod schema. This is the most-used screen after
the switcher, and it replaces what used to be a deploy pipeline.

Requirements:

- Group fields sensibly (Intervals · Pricing · Message · Schedule), not in schema order
- Show the **client's own words** beside abstract fields — "Alignment interval" with a
  hint reading "Sharma charges ₹600 for alignment + balancing"
- Live preview of the generated message, in the configured language
- Show the next scheduled run **in the client's timezone**, spelled out:
  "Next run: tomorrow 9:00am IST"
- Save is instant and takes effect on the next run. Say so — "Saved. Takes effect at the
  next run, tomorrow 9:00am" — so nobody hunts for a deploy button that does not exist.

### Run now — the highest-risk button
It takes a real action in a real business: messages get prepared, sheets get written.

- Confirm before running, naming the client: "Run Customer Reminders for Sharma Tyre House?"
- Disable while a run is in flight; show progress
- Report honestly: `Ran in 4.2s — 14 customers due` or the sanitised failure
- Rate limited, and the UI must make that visible rather than silently swallowing clicks

There is no bulk-deploy flow, because there is nothing to deploy. A code fix reaches
every client on their next run.

---

## Portal

### Design rules
1. **No jargon.** Not deployment, execution, trigger, cron, instance, sync.
   Say: "your reminder system", "ran this morning", "sent".
2. **Every screen answers "is it working?" above the fold.**
3. **Tap targets ≥ 44px.** Users may be wearing work gloves.
4. **No empty state that looks like a failure.** "Nothing yet — your first reminders go
   out tomorrow morning" beats a blank panel.
5. **Never show an error the user cannot act on.** Internal failures surface to the
   operator, not to the client. The client sees "we're looking into this" and an
   incident is opened automatically.

### Home
```
┌─────────────────────────────┐
│ Sharma Tyre House           │
│                             │
│  ✅ Everything is running   │
│                             │
│ ┌─────────────────────────┐ │
│ │ Customer Reminders      │ │
│ │ Ran today, 9:02am       │ │
│ │ 14 customers due        │ │
│ │            [ See list ] │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Job Cards               │ │
│ │ 6 jobs recorded today   │ │
│ └─────────────────────────┘ │
│                             │
│ [ Something's wrong? ]      │
└─────────────────────────────┘
```

Each card names the automation in **the client's language**, taken from
`automation_templates.client_facing_description` — never the internal `key`.

### PWA specifics
- Installable, with a real icon and name ("Simplymation")
- Works offline for *viewing* last-known status, with an honest "last updated" timestamp
- No push notifications in v1 — iOS PWA push is fragile and a failed notification is
  worse than none

---

## Accessibility

- WCAG AA contrast minimum, verified — the portal is used outdoors
- Full keyboard navigation in the console (it is a power tool)
- Visible focus rings; never `outline: none` without a replacement
- Semantic HTML and correct labels; status never conveyed by colour alone —
  always colour **plus** text or icon

---

## Copy guidelines

| Do not write | Write |
|---|---|
| Deployment executed successfully | Ran this morning at 9:02 |
| Sync error | We had a problem — we're on it |
| 14 records processed | 14 customers are due for a reminder |
| Trigger scheduled | Runs every morning |
| Auth token expired | Please reconnect your Google account |

The console may use precise technical language. The portal may not. When in doubt,
read the sentence aloud and ask whether a 55-year-old garage owner would understand
it without asking a question.
