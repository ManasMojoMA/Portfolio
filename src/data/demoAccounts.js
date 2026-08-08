// ============================================
// DEMO ACCESS — how a recruiter gets into each project
//
// THE STANDARD (adopted 2026-08-08, after the QR Attendance deploy):
// every demo app puts "Explore as <Role>" buttons on its own login screen. One
// click, no typing, and every role the app has is visible right where it is needed.
// The portfolio then only has to say "explore the app" and link — it stops being a
// credential registry that has to be kept in sync.
//
// Why this beats publishing credentials:
//   - No copy-paste, no typos, no wrong-account confusion.
//   - Rotating a password touches only that app's env vars, never this file.
//   - A recruiter sees every applicable role rather than one arbitrary account.
//
// Honest limit: the demo passwords still live in each app's client bundle (Vite
// compiles VITE_* in, readable in DevTools). This hides them from casual view, it
// does not make them secret. That is acceptable only because every demo account is
// fake, disposable, and privileged no further than that one demo project.
//
// `entry` describes how a visitor actually gets in. NOTE: 'credentials' is gone —
// the portfolio no longer publishes a login for anything, ever. Recruiters use the
// one-click role buttons on each app's own login screen, nothing else.
//   'roles'     — buttons are live. The goal state for every project.
//   'preparing' — buttons are built but not yet deployed. Say so; never send a
//                 recruiter off to register an account themselves.
//   'sso'       — Google sign-in only, nothing to publish.
//
// `status`:
//   'live' | 'pending' (being deployed) | 'private' (walkthrough on request)
// ============================================

export const demoAccounts = {
  'sip-bootcamp-attendance': {
    status: 'live',
    entry: 'roles',
    url: 'https://qr-attendance-demo-cae28.web.app',
    roles: ['Admin', 'Student'],
    note: 'Pick a role on the login screen — one click, nothing to type.'
  },

  'chalkzone-erp': {
    status: 'live',
    entry: 'roles',
    url: 'https://chalkzone-ma.vercel.app',
    // All eight, because the dashboard is almost entirely different per role —
    // showing one would misrepresent the app.
    roles: [
      'Student',
      'Parent',
      'Faculty',
      'HR',
      'Manager',
      'Admin',
      'Executive',
      'Super Admin'
    ],
    note: 'Eight roles, grouped on the login screen. Worth comparing Student against Super Admin — they are effectively different products.'
  },

  simplyform: {
    status: 'live',
    // Anonymous sign-in rather than a shared demo account: no credential exists at
    // all, and each visitor gets a private workspace. Verified against the live
    // rules that one guest cannot read or edit another's forms.
    entry: 'roles',
    url: 'https://simplyform.vercel.app',
    roles: ['Guest workspace'],
    note: 'One button, no signup. You get a private workspace with a sample form already in it — edit it, publish it, and submit a response to see it land on the dashboard.'
  },

  scaleresume: {
    status: 'live',
    entry: 'sso',
    url: 'https://scaleresume.vercel.app',
    note: 'Sign in with any Google account — nothing to set up, and your drafts stay yours.'
  },

  // ---- Awaiting deployment. Each ships with role buttons from the start. ----

  'employee-appraisal-portal': {
    status: 'pending',
    entry: 'roles',
    url: '',
    roles: ['Employee', 'Evaluator', 'Dean', 'Admin'],
    note: 'Four roles — hidden rubrics and dean moderation only make sense across them.'
  },

  placeflow: {
    status: 'pending',
    entry: 'roles',
    url: '',
    roles: ['Student', 'Admin']
  },

  'internship-tracker': {
    status: 'pending',
    entry: 'roles',
    url: '',
    roles: ['Student', 'Faculty', 'Admin']
  }
};

/** Demo info for a project, or a safe default if it has no entry. */
export function demoFor(projectId) {
  return demoAccounts[projectId] ?? { status: 'private', entry: 'roles', url: '', roles: [] };
}

export const isLive = (projectId) => demoFor(projectId).status === 'live';
