// ============================================
// HOME PAGE CONTENT — the buyer-facing landing at /
//
// Language rule, same as the playbooks: use the words a business owner uses, never
// the words we use. No "workflow orchestration", no "AI integration", no "digital
// transformation". If a sentence would make a 55-year-old garage owner ask what it
// means, it is wrong.
//
// Claim rule: nothing here may be a number we cannot show. See
// project-docs/PRD.md §9 for what we may and may not promise.
// ============================================

export const hero = {
  eyebrow: 'Simplymation',
  headline: "You're doing work a computer should be doing.",
  subhead:
    'Writing the same job card by hand. Chasing customers who never came back. Checking stock by walking to the back room. None of it needs you — and fixing it does not need you to understand a single thing about technology.',
  primaryCta: { label: 'See who owes you a visit', href: '/try/recall' },
  secondaryCta: { label: 'Find your business', href: '/playbooks' },
  note: 'Built for Indian small businesses. Works anywhere.',
};

// The recognition test. If none of these land, they should leave — that is a
// feature. Wasting a skeptic's time is how you lose them permanently.
export const symptoms = [
  {
    icon: '📒',
    title: 'The same thing, written twice',
    body: 'Once in a book, once in a bill, once in a message. Every version is a chance to get it wrong, and none of them can be searched later.',
  },
  {
    icon: '📞',
    title: 'Customers who never came back',
    body: 'Not because they were unhappy. Because nobody reminded them, and the shop down the road was closer on the day they remembered.',
  },
  {
    icon: '🧾',
    title: 'Money you are owed but cannot name',
    body: 'You know roughly who owes what. Roughly is where money quietly disappears.',
  },
  {
    icon: '🌙',
    title: 'Not knowing how the day went',
    body: 'Unless you were standing there, or you make three phone calls to find out.',
  },
];

// Services in the buyer's language. Deliberately not the four abstract agency
// categories that used to be on this site.
export const whatIDo = [
  {
    title: 'I watch how you actually work',
    body: 'Ninety minutes at your shop, no slides. I write down what your staff really do, in your words — not what a system thinks they should do.',
  },
  {
    title: 'I automate the boring half',
    body: 'The reminders, the records, the reports, the reconciling. The parts where a person is being used as a filing cabinet.',
  },
  {
    title: 'I build it in your own account',
    body: 'Your records live in your Google account, not mine. I never keep a copy of your customer list, and you can cut off my access in one click.',
  },
  {
    title: 'I tell you when it is not worth it',
    body: 'Some things should stay manual. I would rather say so in the first hour than build something that gathers dust.',
  },
];

export const howItWorks = [
  {
    step: '01',
    title: 'A free ninety minutes',
    body: 'I come to your shop and watch a normal day. You do not prepare anything. At the end I tell you the two or three things worth automating — and the ones that are not.',
  },
  {
    step: '02',
    title: 'I build the first one free',
    body: 'Not a trial that expires. Genuinely free, because one business costs me almost nothing to run. It uses your real data, not a demo.',
  },
  {
    step: '03',
    title: 'You watch it run for a month',
    body: 'You count what came back. If the answer is nothing, you have lost nothing and you owe nothing. That is the entire risk you are taking.',
  },
  {
    step: '04',
    title: 'Then we talk about the rest',
    body: 'Only if the first one worked. More automations, running more often, is where a paid plan starts — and by then you will know whether it is worth it.',
  },
];

// The honest limits, stated before anyone asks. With a skeptical buyer an admitted
// constraint buys more trust than a claimed strength.
export const straightAnswers = [
  {
    q: 'What does it cost?',
    a: 'The first automation is free and stays free. Beyond that, a small setup fee and a monthly amount that depends on how much you are running. I will quote it before I build anything, and it will not be a surprise.',
  },
  {
    q: 'Do I need to buy anything?',
    a: 'No. It runs on the Google account you already have. No new app for your staff, no new login to remember.',
  },
  {
    q: 'What happens to my customer list?',
    a: 'It stays in your Google account. I never hold a copy. You can revoke my access from your own Google settings in one click, and you keep every record.',
  },
  {
    q: 'What if I stop working with you?',
    a: 'Your records are yours and they stay with you. The part that runs each morning sits on my side, so the automatic reminders would stop — same as any software you pay for. I would rather say that plainly than let you find out later.',
  },
  {
    q: 'I am not technical. Is that a problem?',
    a: 'No. If your staff cannot use it on their own phone without me explaining it, it is too complicated and I will simplify it.',
  },
];
