// ============================================
// PLAYBOOK REGISTRY
//
// Kept separate from data/projects.js on purpose. The buyer-facing pages (/ and
// /playbooks) need only these two small arrays, and importing them from projects.js
// dragged the entire 8-project engineering catalogue (~23 kB) into the first page a
// business owner loads — for data they never see.
// ============================================

// Only list a playbook here when its page actually exists. A grid of "coming soon"
// tiles reads as vapour to exactly the buyer we want, and one dead link costs more
// trust than six tiles buy.
export const playbooks = [
  {
    id: 'tyre-garage',
    href: '/playbooks/tyre-garage',
    industry: 'Tyre Shop, Retreading & Auto Repair',
    headline: 'Your garage already has the money. It just walks out and never comes back.',
    summary:
      'Six automations for a tyre and repair garage — recall reminders, digital job cards, retread casing tracking, live stock by size, udhaar ledger and a daily closing summary.',
    icon: '🛞',
    status: 'published',
  },
];

// Industries the same automation patterns transfer to. Named honestly as
// "being written next", never as clients or case studies.
export const playbookRoadmap = [
  'Dental & medical clinics',
  'Salons & spas',
  'Physiotherapy & wellness',
  'AC & appliance servicing',
  'Coaching centres',
  'Small manufacturing units',
];
