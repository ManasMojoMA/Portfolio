// ============================================
// DEMO ACCOUNTS — one place to define and rotate them
//
// THESE ARE PUBLIC BY DESIGN. They are printed on a public portfolio page so a
// recruiter can log in without emailing you first. Trying to keep them secret is
// pointless — the protection is not secrecy, it is BLAST RADIUS:
//
//   1. A different password per project, so one leak is not seven leaks.
//     (Previously every project shared `Demo@2024`, committed in a public repo.)
//   2. Never a password used anywhere else, ever.
//   3. The data behind them is fake and disposable, and resets on a schedule —
//      assume every visitor will edit and delete things, because some will.
//   4. Least privilege: a demo role should not be able to delete all users,
//      change billing, or export anything real.
//   5. Nothing real behind them. No real student names, employee records or
//      phone numbers in any seeded demo database.
//
// Rotating: change the password here AND in that project's auth provider. Nothing
// else in the portfolio needs touching.
// ============================================

/**
 * `status` drives what the portfolio shows, so it can never claim a demo that is
 * not there:
 *   'live'    — deployed, credentials work, link shown
 *   'pending' — being deployed; shown as "demo coming soon", no dead link
 *   'private' — will not be public; shown as "walkthrough on request"
 */
export const demoAccounts = {
  'chalkzone-erp': {
    status: 'live',
    url: 'https://chalkzone-ma.vercel.app',
    accounts: [{ role: 'Demo user', email: 'demo@chalkzone.demo', password: 'ROTATE-ME-chalkzone' }],
    note: 'Multi-role — pick a role at login to see different dashboards.'
  },

  simplyform: {
    status: 'live',
    url: 'https://simplyform.vercel.app',
    accounts: [{ role: 'Demo user', email: 'demo@simplyform.demo', password: 'ROTATE-ME-simplyform' }]
  },

  scaleresume: {
    status: 'live',
    url: 'https://scaleresume.vercel.app',
    accounts: [{ role: 'Google sign-in', email: 'Sign in with Google', password: 'No password needed' }],
    note: 'Uses Google SSO — no demo password required.'
  },

  // ---- Awaiting deployment. See DEMOS.md for the runbook. ----

  'sip-bootcamp-attendance': {
    status: 'pending',
    url: '',
    accounts: [
      { role: 'Admin', email: 'demo.admin@qrattend.demo', password: 'SET-ON-DEPLOY' },
      { role: 'Student', email: 'demo.student@qrattend.demo', password: 'SET-ON-DEPLOY' }
    ]
  },

  'employee-appraisal-portal': {
    status: 'pending',
    url: '',
    accounts: [
      { role: 'Employee', email: 'demo.employee@appraisal.demo', password: 'SET-ON-DEPLOY' },
      { role: 'Evaluator', email: 'demo.evaluator@appraisal.demo', password: 'SET-ON-DEPLOY' },
      { role: 'Dean', email: 'demo.dean@appraisal.demo', password: 'SET-ON-DEPLOY' },
      { role: 'Admin', email: 'demo.admin@appraisal.demo', password: 'SET-ON-DEPLOY' }
    ],
    note: 'Four roles — the hidden-rubric and dean-moderation behaviour only makes sense across them.'
  },

  placeflow: {
    status: 'pending',
    url: '',
    accounts: [
      { role: 'Student', email: 'demo.student@placeflow.demo', password: 'SET-ON-DEPLOY' },
      { role: 'Admin', email: 'demo.admin@placeflow.demo', password: 'SET-ON-DEPLOY' }
    ]
  },

  'internship-tracker': {
    status: 'pending',
    url: '',
    accounts: [
      { role: 'Student', email: 'demo.student@internship.demo', password: 'SET-ON-DEPLOY' },
      { role: 'Faculty', email: 'demo.faculty@internship.demo', password: 'SET-ON-DEPLOY' },
      { role: 'Admin', email: 'demo.admin@internship.demo', password: 'SET-ON-DEPLOY' }
    ]
  }
};

/** Demo info for a project, or a safe default if it has no entry. */
export function demoFor(projectId) {
  return demoAccounts[projectId] ?? { status: 'private', url: '', accounts: [] };
}

export const isLive = (projectId) => demoFor(projectId).status === 'live';
