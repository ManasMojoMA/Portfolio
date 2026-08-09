# Demo Deployments — runbook

Getting every remaining project live so a recruiter can log in and click around.

**Verified 2026-08-07:** all four remaining projects **build cleanly** on this machine.
No code blockers. What is missing is infrastructure — a database, environment
variables, and a seeded demo account.

| # | Project | Folder | Stack | Effort |
|---|---|---|---|---|
| 1 | QR Attendance | `SIP Bootcamp` | Vite + Firebase | ~30 min |
| 2 | Appraisal Portal | `faculty_appraisal_portal` | Next + Supabase + Prisma | ~1–2 h |
| 3 | PlaceFlow | `Job floating/placeflow` | Vite + Supabase | ~1–2 h |
| 4 | Internship Tracker | `internship-tracker-form` | Vite + Express + Puppeteer | ~2–3 h |

FTT Signal Engine has been **removed from the portfolio** — it needs a paid market-data
feed and an always-on Python backend, and markets are closed exactly when recruiters
look. A recorded walkthrough shows the interesting part better than a login would.

---

## Demo access — the standard

**Every demo app puts "Explore as &lt;Role&gt;" buttons on its own login screen.**
Adopted after the QR Attendance deploy, where it worked well enough to become the
rule. The portfolio then just says *"Explore the app"* and links.

Why this beats publishing credentials on the portfolio:

- One click. No copy-paste, no typos, no wrong-account confusion.
- Rotating a password touches that app's env vars only — never the portfolio.
- A recruiter sees **every role the app has**, not one arbitrary account. On the
  appraisal portal that is the whole point: hidden rubrics and dean moderation only
  make sense across four roles.
- The portfolio stops being a credential registry that drifts out of sync.

**Honest limit:** the passwords still sit in each app's client bundle — Vite compiles
`VITE_*` in, and anyone can read them in DevTools. This hides credentials from casual
view; it does not make them secret. That is only acceptable because of the rules below.

### ⛔ Never point a demo at these backends

Each demo gets its **own** Supabase/Firebase project. These refs belong to the real
deployments and hold real records — pasting one into a demo's env vars would expose
live data through a public login:

| Project ref | Belongs to | Notes |
|---|---|---|
| `mpidcsyrdtgfamriwjsg.supabase.co` | Appraisal Portal (original) | Also referenced from `university-erp-lms/legacy/` — same database, two checkouts |
| `bmlrzkvbfmdnzemhyemw.supabase.co` | Internship Tracker (original) | |

Safe demo backends currently in use:

| Project ref | Demo |
|---|---|
| `jfsaqbqxxruumjibbtyg.supabase.co` | ChalkZone demo (verified: no real users) |
| `qr-attendance-demo-cae28` | QR Attendance demo |
| `simplyform-demo` | SimplyForm demo |

Before deploying any demo, check the connection string against this table. The demo
folders deliberately ship only `.env.example`, so there is nothing to copy by
accident — the risk is pasting the wrong value in by hand.

### Rules for every demo account

1. **A different password per project.** All seven once shared `Demo@2024`, committed
   in a public repo — one leak was seven leaks.
2. **Never a password used anywhere else.**
3. **Assume visitors will edit and delete things.** Seed fake data; see "Keeping
   demos clean".
4. **Least privilege.** A demo role must not delete all users or export anything, and
   must be privileged no further than that one demo project.
5. **Nothing real behind them.** No real names, staff records or phone numbers.

Generate one per project:
```powershell
-join ((48..57)+(65..90)+(97..122) | Get-Random -Count 16 | % {[char]$_})
```

### Implementing the buttons

Reference implementation: `qr-attendance-demo/src/config/app.ts` +
`src/components/LoginPage.tsx`.

1. A `DEMO_MODE` flag and a `DEMO_ROLES` array in config, both env-driven, so the
   buttons never appear in a real deployment.
2. Each role signs in with email + password behind the scenes.
3. **Swallow the auth error.** Surfacing the raw provider message distinguishes "no
   such user" from "wrong password" — free reconnaissance on a public login.
4. Say the data is disposable, so visitors feel free to click things.

`entry` in `demoAccounts.js` tracks which apps are converted: `'roles'` (done),
`'credentials'` (still publishing a login — convert it), `'sso'` (Google only).

### Freeze account management — always

The role buttons hand every visitor an admin session. That is fine for the data,
which is invented and disposable, and not fine for the accounts. Left open, a
visitor can create an admin under an address they control — which survives every
password rotation — or delete the demo logins and break the demo for everyone
after them. **The account is the asset; the fake data behind it is not the point.**

So in every demo, freeze anything that creates, deletes or re-roles a user, and
leave everything else fully editable. The features are what a recruiter came to
see; only the accounts are locked.

Three things to get right:

1. **Enforce on the server, not in the UI.** Hiding a button protects nothing —
   session tokens are readable in DevTools and the endpoint is callable directly.
   Hide the form as a courtesy and put the real check in Firestore rules, the
   server action, or the Edge Function.
2. **Put the guard *after* authentication.** A guard at the top of a handler
   answers an anonymous caller with "demo restricted" instead of `401`, which
   confirms the endpoint exists and skips the rate limiting behind it.
3. **Find the account-*minting* path, not just the obvious screen.** PlaceFlow's
   was `auth-bootstrap` — a public function that turns a student row plus a date
   of birth into a permanent login. Blocking the Admins page would have missed it:
   an admin could add a row with invented details and mint an account anyway.
   Blocking that one function meant Add Student and CSV import could stay live.

Where it landed, per app:

| App | Frozen | Enforced by |
|---|---|---|
| QR Attendance | add/remove admins, write students | Firestore rules |
| ChalkZone | create/delete/re-role users | 7 guards in the server actions |
| PlaceFlow | `admin-create`, `admin-delete`, `auth-bootstrap` | Edge Functions, after authz |
| SimplyForm | self-registration | UI only — see below |

SimplyForm is the exception and worth knowing about. Firebase Auth is a public
API, so `accounts:signUp` is always reachable with the key from the bundle, and
the project-level "disable create" switch cannot be used — anonymous sign-in goes
through that same endpoint, so turning it on breaks the Explore button and takes
the demo down. Acceptable there only because there is nothing to escalate to:
rules scope every form to the owner's uid and the `role` field is never consulted,
so a self-made account reaches no further than the anonymous guest already does.
**Do not copy that reasoning to an app that has real roles.**

Verify by attacking, never by reading. Sign in with the demo role, call the
endpoint directly, and confirm a `403`; then confirm the ordinary features still
work and an anonymous caller still gets `401`.

---

## 1. QR Attendance — `SIP Bootcamp`

Easiest by a distance. Static Vite build, Firebase only, no server. **Start here** —
one live demo tonight is worth more than four planned ones.

### Step 1 — Firebase project
1. <https://console.firebase.google.com> → **Add project** → `sip-attendance-demo`
   (disable Google Analytics, you do not need it)
2. **Build → Authentication → Get started → Email/Password → Enable**
3. **Build → Firestore Database → Create database → Production mode**, region
   `asia-south1`
4. **Project settings (gear) → Your apps → Web (`</>`)** → register app → copy the
   `firebaseConfig` values

### Step 2 — Firestore rules
**Rules** tab, replace with — the default locks everything, and test mode leaves it
open to the world:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 3 — Push to GitHub
This folder has no git remote yet.
```powershell
cd "c:\Users\arora\OneDrive\Desktop\SIP Bootcamp"
git init
git add .
git commit -m "QR attendance system"
# create an EMPTY repo named qr-attendance on github.com first
git remote add origin https://github.com/<you>/qr-attendance.git
git branch -M main
git push -u origin main
```
Check `.env.local` is gitignored before pushing.

### Step 4 — Vercel
1. **Add New → Project** → import `qr-attendance`
2. Framework **Vite**, build `npm run build`, output `dist`
3. **Environment Variables** — all six, from step 1:
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```
4. **Deploy**

### Step 5 — Demo accounts and data
1. Firebase → Authentication → **Add user**:
   `demo.admin@qrattend.demo` and `demo.student@qrattend.demo`
2. Log in as admin on the live URL, create **2–3 sessions** with realistic topics,
   facilitators and time slots
3. Mark a few attendances so the export and analytics have something to show

> An empty demo reads as broken. Seeded data is the difference between "this works"
> and "is this finished?"

### Step 6 — Send me
The URL and both passwords. I wire them in — the live count updates itself.

---

## 2. Appraisal Portal — `faculty_appraisal_portal`

Next.js + Supabase + Prisma. **Has a seed script already** (`prisma/seed.ts`), which
saves most of the data work.

### Step 1 — Supabase
1. <https://supabase.com> → **New project** `appraisal-demo`, region **Mumbai**,
   save the database password
2. **Settings → API** → copy Project URL, `anon` key, `service_role` key
3. **Settings → Database → Connection string** → copy both:
   - **Transaction** pooler (port 6543) → `DATABASE_URL`
   - **Session/direct** (port 5432) → `DIRECT_URL`

### Step 2 — Migrate and seed locally
```powershell
cd "c:\Users\arora\OneDrive\Desktop\faculty_appraisal_portal"
# put the values into .env.local first
npx prisma migrate deploy
npx prisma db seed
```
If the seed fails, note the error and send it to me — that is a code problem I can fix.

### Step 3 — Vercel
Import the repo (`posob/Faculty-Performance-Appraisal-Portal`), framework **Next.js**:
```
NEXT_PUBLIC_APP_NAME=Appraisal Portal
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server-only. NEVER prefix NEXT_PUBLIC_.
DATABASE_URL=
DIRECT_URL=
APP_URL=                        # the deployed URL, set after first deploy
```

### Step 4 — Four demo accounts
The interesting behaviour — hidden rubrics, dean moderation — only makes sense across
roles, so create all four:
`demo.employee@` · `demo.evaluator@` · `demo.dean@` · `demo.admin@appraisal.demo`

Seed one complete appraisal cycle with fake staff names.

---

## 3. PlaceFlow — `Job floating/placeflow`

**This project already has its own `DEPLOY.md`** — follow that; it is more specific
than anything I would write, and covers the Supabase Edge Functions and Apps Script
pieces.

Two deviations for a demo deployment:
- It targets **Cloudflare Pages**. Vercel is fine and matches your other projects —
  framework Vite, output `dist`.
- **Skip Firebase FCM.** Push notifications need a mobile device to demonstrate and add
  nothing to a recruiter clicking around in a browser. One less thing to break.

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_FIREBASE_CONFIG=           # can be an empty JSON object if FCM is skipped
```

21 Supabase migrations exist — `npm run db:push` applies them.

**Demo content:** 8–10 fake job postings, ~20 fake candidates with varied CGPA and
branches. The eligibility engine is the impressive part and it needs data to be
impressive. Accounts: `demo.student@` and `demo.admin@placeflow.demo`.

---

## 4. Internship Tracker — `internship-tracker-form`

Hardest, and worth knowing why before you start.

### Two things that make it different
1. **It is not a static site.** There is an Express server (`dist/server.cjs`).
2. **The build installs Chrome** — `npx puppeteer browsers install chrome`, for PDF
   certificate generation. **This will not fit Vercel's serverless size limit.**

**Use Render or Railway, not Vercel.** Both run a normal Node process with a real
filesystem, which is what Puppeteer needs.

### Steps
1. **Google Cloud** → service account with Sheets API access → download the JSON key
2. **Google AI Studio** → Gemini API key
3. Create the Google Sheet it writes to, share it with the service account email
   (editor)
4. Supabase project → `npx prisma migrate deploy`
5. **Render → New Web Service** → connect `manasarora-GU/internship-tracker`
   - Build: `npm install && npm run build`
   - Start: `npm start`
   - Instance: free tier is fine, but note it **sleeps after 15 minutes idle** and
     cold-starts in ~50 s. For a recruiter demo that is a bad first impression —
     consider the cheapest paid instance, or accept it and say so on the card.

```
GEMINI_API_KEY=
APP_URL=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=             # keep the \n escapes intact — the usual failure point
GOOGLE_SHEET_ID=
DATABASE_URL=
```

Five roles: Student, Faculty, Manager, Admin, Master Admin. Three demo accounts is
enough to show the workflow.

**Do this last.** Three live demos already make the portfolio feel complete, and this
one costs the most hours per unit of recruiter impact.

---

## Keeping demos clean

A public login on a public portfolio will eventually be used badly. Two defences,
cheapest first:

**A visible "Reset demo data" button.** In each app, shown only to the demo account.
Truncates the demo tables and re-runs the seed. A recruiter who finds a mess fixes it
themselves in one click. Cheap to build, no infrastructure.

**A nightly reseed.** A Vercel Cron (or Supabase `pg_cron`) that reseeds at 3am so
vandalism self-heals within a day. Better, slightly more work.

I would do the button first, and add the cron only if a demo actually gets abused.

---

## After each deployment

1. **Test in a private window** with the published credentials. If it fails there it
   fails for every recruiter — and a broken demo is worse than no demo.
2. Send me the URL and passwords.
3. I update `src/data/demoAccounts.js` — status flips to `live`, credentials appear,
   the "N live demos" stat recalculates itself.

Until then the portfolio says *"Live demo being set up — ask me for a walkthrough"*
rather than showing credentials for something that is not there.
