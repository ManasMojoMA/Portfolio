// ============================================
// SIMPLYMATION — INDUSTRY PLAYBOOK
// Tyre Shop, Retreading & Auto Repair Garage
//
// Audience: owner of a 3-10 person garage in India.
// Language rule: use the words the owner uses (job card, casing,
// udhaar, alignment) — never the words we use (webhook, API, CRM).
// Every number on this page must be either measured or clearly
// labelled as an assumption the owner can change.
// ============================================

export const meta = {
  industry: 'Tyre Shop, Retreading & Auto Repair',
  headline: 'Your garage already has the money. It just walks out and never comes back.',
  subhead:
    'Every vehicle you align today needs aligning again in six months. Every set of tyres you fit today needs replacing in three years. You know this. Your customer forgot the day they drove out. Nobody calls them.',
  readTime: '6 min read',
  region: 'Built for Indian garages — works anywhere.',
};

// The opening gut-check. These are the leaks, in the owner's language.
export const leaks = [
  {
    id: 'no-recall',
    icon: '📞',
    title: 'Nobody calls the old customer back',
    body:
      'Alignment and balancing are due every 5,000-10,000 km. That is twice a year, per vehicle. You have hundreds of vehicles in your old job card books. None of them get a reminder — so they get it done wherever they happen to be when the steering starts pulling.',
  },
  {
    id: 'paper',
    icon: '📒',
    title: 'The job card book is the only memory',
    body:
      'When a customer says "you charged me less last time" or "this tyre is only 8 months old, it is under warranty" — you are flipping through a carbon-copy book from last year. Usually you just let it go.',
  },
  {
    id: 'casing',
    icon: '🔁',
    title: '"Is my tyre ready?"',
    body:
      'Casings go out for retreading and come back days later. In between, the customer calls. Twice. Somebody has to stop work and go check the pile. Sometimes a casing goes to the wrong customer.',
  },
  {
    id: 'stock',
    icon: '🛞',
    title: 'The size he wanted was sitting in the back',
    body:
      'Customer asks for 205/55 R16. Whoever picked up the phone said "not available." It was available. That is a ₹9,000 sale that walked to the shop down the road.',
  },
  {
    id: 'udhaar',
    icon: '📝',
    title: 'Udhaar lives in a diary and in your head',
    body:
      'The taxi fellow, the two transport operators, the regular who always pays "next week." You know roughly what is outstanding. Roughly is where money is lost.',
  },
];

// ---------------------------------------------------------------
// The automations. Ordered by money, not by how clever they are.
// `hero: true` gets the big treatment.
// ---------------------------------------------------------------
export const automations = [
  {
    id: 'service-recall',
    hero: true,
    number: '01',
    name: 'The Recall Engine',
    tagline: 'Turns your old job cards into next month\'s bookings',
    problem:
      'You have a year of customers who are overdue for alignment, balancing, or a new set of tyres. They are not angry with you. They simply forgot, and nobody reminded them.',
    solution: [
      'Every job card that gets filled sets a quiet timer — alignment and balancing at 6 months, tyre replacement at 3 years from the fitment date, retread inspection at your chosen interval.',
      'Every morning at 9am the system builds one list: who is due today.',
      'The list opens on your phone with the message already written, in Hindi or English, with the vehicle number and what is due. You tap. WhatsApp opens with the message ready. You press send.',
      'When they book, the job card closes the loop and the next timer starts.',
    ],
    honest:
      'On the free plan you tap send yourself — roughly 10-15 taps a day, about four minutes. Fully hands-off sending needs paid WhatsApp (see below). Most owners keep tapping, because a message from a real number gets replied to.',
    builtWith: ['Your Google Sheet', 'Simplymation (runs every morning)', 'WhatsApp click-to-send'],
    payoff: 'The single biggest revenue line on this page',
  },
  {
    id: 'job-card',
    number: '02',
    name: 'Digital Job Card',
    tagline: 'Replaces the carbon-copy book, not your way of working',
    problem:
      'Paper job cards get oily, get lost, and cannot be searched. Estimates are verbal, so billing turns into an argument.',
    solution: [
      'Your mechanic opens a form on his own phone. Vehicle number, customer name and mobile, odometer, work to be done, tyres fitted with size and brand, parts, labour estimate.',
      'The customer immediately gets a WhatsApp: job started, this is the estimate, this is your job number.',
      'When the work is marked done, a proper GST-format bill is generated as a PDF and sent on WhatsApp.',
      'Type any vehicle number into the search box and see everything that vehicle has ever had done, with dates and amounts.',
    ],
    honest:
      'This one needs your mechanics to actually fill the form. Keep it to 8 fields or they will stop. We start with 8.',
    builtWith: ['Google Forms', 'Your Google Sheet', 'Google Docs template', 'Simplymation'],
    payoff: 'Ends billing disputes, feeds every other automation',
  },
  {
    id: 'casing-tracker',
    number: '03',
    name: 'Retread Casing Tracker',
    tagline: 'Stops the "is it ready yet" phone calls',
    problem:
      'A casing passes through five hands and several days. The only tracking is memory and a chalk mark.',
    solution: [
      'Casing comes in, gets logged against the customer and vehicle with its serial. It now has a status: Received → Sent to plant → At plant → Returned → Ready → Delivered.',
      'Whoever moves it changes the status on their phone. Two taps.',
      'The moment it hits Ready, the customer gets a WhatsApp on his own — before he calls you.',
      'Anything sitting at one stage too long shows up in red on your evening summary.',
    ],
    honest:
      'Works with an outsourced retreading plant too — the plant does not need to use anything. Your man updates the status when the truck leaves and when it returns.',
    builtWith: ['Your Google Sheet', 'Simplymation', 'WhatsApp click-to-send'],
    payoff: 'Fewer interruptions, no mixed-up casings',
  },
  {
    id: 'stock',
    number: '04',
    name: 'Live Stock by Size',
    tagline: 'So nobody ever says "not available" when it is',
    problem:
      'Stock is in a register or in one person\'s head. The person answering the phone is usually not that person.',
    solution: [
      'One clean sheet: size, brand, tube or tubeless, quantity, cost, selling price. Anyone can search it on their phone in four seconds.',
      'Every tyre sold through a job card reduces the count automatically. No separate stock entry.',
      'When a fast-moving size drops below the level you set, you get a message to reorder.',
      'End of month you can see which sizes are dead stock and which you keep running out of.',
    ],
    honest:
      'Accuracy depends on sales going through the job card. If tyres leave the shop without a job card, the count drifts. This is a discipline fix, not a software fix — but the system makes the discipline easy.',
    builtWith: ['Your Google Sheet', 'Simplymation (low-stock alerts)'],
    payoff: 'Recovers walk-in sales you are currently losing',
  },
  {
    id: 'udhaar',
    number: '05',
    name: 'Udhaar & Fleet Statements',
    tagline: 'Know exactly who owes what, without asking anyone',
    problem:
      'Credit customers — taxis, transporters, the regulars — are tracked in a diary. Recovery happens when you remember.',
    solution: [
      'Every unpaid job card automatically becomes an outstanding entry against that customer.',
      'Fleet customers get a clean monthly statement on WhatsApp or email on the 1st, with every vehicle and job listed.',
      'Anything crossing the days you set gets a polite reminder message drafted for you.',
      'One screen shows total outstanding, and who the top five defaulters are.',
    ],
    honest:
      'This is a record and a reminder, not accounting software. If your CA needs Tally, this feeds Tally — it does not replace it.',
    builtWith: ['Your Google Sheet', 'Simplymation', 'Google Docs (statement PDF)'],
    payoff: 'Faster recovery on money already earned',
  },
  {
    id: 'daily-summary',
    number: '06',
    name: 'The 8 O\'Clock Summary',
    tagline: 'Your whole day in one message, even when you are not there',
    problem:
      'To know how the day went you have to be at the shop, or make three phone calls.',
    solution: [
      'Every evening at 8pm, one WhatsApp or email to you: jobs completed, tyres sold by size, money collected, money still outstanding.',
      'Plus the exceptions — casings stuck too long, sizes running low, customers who did not respond to reminders.',
      'Nobody has to prepare it. It writes itself from the day\'s job cards.',
    ],
    honest:
      'It reports what was entered. A day where nobody filled job cards reports an empty day — which, usefully, tells you something too.',
    builtWith: ['Your Google Sheet', 'Simplymation (runs each evening)', 'Your Gmail'],
    payoff: 'Run the shop from anywhere',
  },
];

// ---------------------------------------------------------------
// The honest ROI model. Every assumption is visible and editable.
// Conservative on purpose — a skeptic who catches one inflated
// number stops believing all of them.
// ---------------------------------------------------------------
export const roiModel = {
  inputs: [
    {
      key: 'vehiclesPerMonth',
      label: 'Vehicles you service in a month',
      min: 30,
      max: 500,
      step: 10,
      default: 120,
      unit: '',
    },
    {
      key: 'alignmentTicket',
      label: 'What a customer pays for alignment + balancing',
      min: 200,
      max: 2000,
      step: 50,
      default: 600,
      unit: '₹',
    },
    {
      key: 'tyreTicket',
      label: 'Average tyre purchase (what they spend on a set)',
      min: 2000,
      max: 40000,
      step: 500,
      default: 9000,
      unit: '₹',
    },
    {
      key: 'responseRate',
      label: 'Out of 100 reminded, how many come back?',
      min: 3,
      max: 30,
      step: 1,
      default: 10,
      unit: '%',
    },
  ],

  // Fixed, stated-out-loud assumptions. Deliberately pessimistic.
  assumptions: [
    { label: 'Unique customers (some vehicles return in the same year)', value: '70% of jobs' },
    { label: 'Still reachable after a year (number changed, moved, sold the vehicle)', value: '60%' },
    { label: 'Alignment / balancing reminders per customer per year', value: '2' },
    { label: 'Customers due for new tyres in a given year (3-4 year cycle)', value: '25%' },
    { label: 'Response to a big-ticket tyre reminder vs a cheap service reminder', value: 'half' },
    { label: 'Revenue counted from stock, udhaar and casing automations', value: '₹0 — not counted' },
  ],

  // Time recovered per month, measured in the tasks the owner recognises.
  timeSaved: [
    { task: 'Writing and re-writing job cards and bills by hand', hours: 10 },
    { task: 'Answering "is my tyre ready" calls', hours: 6 },
    { task: 'Checking stock for phone enquiries', hours: 4 },
    { task: 'Working out who owes money, and chasing it', hours: 5 },
  ],
};

/**
 * Conservative annual-recovery estimate.
 * Kept in this file (not the component) so the numbers stay auditable
 * next to the assumptions they depend on.
 */
export function calculateRecovery({ vehiclesPerMonth, alignmentTicket, tyreTicket, responseRate }) {
  const UNIQUE = 0.7;
  const REACHABLE = 0.6;
  const RECALLS_PER_YEAR = 2;
  const TYRE_DUE_SHARE = 0.25;
  const BIG_TICKET_DAMPING = 0.5;

  const rate = responseRate / 100;
  const reachableBase = vehiclesPerMonth * 12 * UNIQUE * REACHABLE;

  const serviceRecovery = reachableBase * RECALLS_PER_YEAR * rate * alignmentTicket;
  const tyreRecovery = reachableBase * TYRE_DUE_SHARE * rate * BIG_TICKET_DAMPING * tyreTicket;

  return {
    reachableBase: Math.round(reachableBase),
    serviceRecovery: Math.round(serviceRecovery),
    tyreRecovery: Math.round(tyreRecovery),
    total: Math.round(serviceRecovery + tyreRecovery),
  };
}

// ---------------------------------------------------------------
// What it costs, and where free genuinely stops. No small print.
// ---------------------------------------------------------------
export const costs = {
  free: {
    title: 'What you pay: nothing',
    points: [
      'Your records live in the Google account you already have. Sheets, Forms, Drive — nothing new to buy, nothing new to learn.',
      'No new app for your staff to download. No new login to remember.',
      'I never keep a copy of your customer list. It stays in your Google account, and you can cut off my access in one click from your own Google settings.',
      'Everything the system produces — job cards, customer history, reminder records — is written straight into your own Google account as it happens. It is yours the moment it exists.',
    ],
  },
  limits: {
    title: 'Where free actually stops',
    points: [
      'Your records are yours and stay in your Google account. The part that reads them each morning and works out who is due sits on Simplymation\'s side — so if we ever part ways, your records and your history stay with you, but the reminders stop going out on their own.',
      'WhatsApp messages are prepared for you but you tap send. Truly automatic WhatsApp requires Meta\'s paid business platform, which charges per conversation. I will not pretend otherwise.',
      'Free covers one automation running once a day. More automations, or running more often than that, is where the paid plan begins.',
      'This suits a garage up to roughly 15-20 staff. Past that you need something heavier, and I would rather tell you than sell you the wrong thing.',
    ],
  },
};

// ---------------------------------------------------------------
export const rollout = [
  {
    when: 'Day 1',
    duration: '90 minutes, at your shop',
    what:
      'I sit with you and watch how a job actually moves through the garage. No slides. I write down your services, your prices, your tyre sizes and your staff names.',
  },
  {
    when: 'Day 2-3',
    duration: 'I work, you do not',
    what:
      'The job card form, the stock sheet and the recall engine get built with your real data in them — not a demo. Your last three months of job cards get typed in so the recall engine has something to work with from day one.',
  },
  {
    when: 'Day 4',
    duration: '45 minutes',
    what:
      'I show your mechanics the form on their own phones. If they cannot use it without help, it is too complicated and I simplify it that day.',
  },
  {
    when: 'Week 2',
    duration: 'One phone call',
    what:
      'We look at what actually got used and what got ignored. Whatever got ignored, I remove. A system nobody uses is worse than paper.',
  },
  {
    when: 'Month 2',
    duration: 'You decide',
    what:
      'By now the recall engine has sent real reminders and you can count the vehicles that came back because of them. If that number is zero, you have lost nothing and you owe nothing.',
  },
];

// ---------------------------------------------------------------
// Trust block. New brand, no client logos. Say so plainly —
// this buyer trusts an admitted gap more than a stock photo.
// ---------------------------------------------------------------
export const trust = {
  title: 'Why you should believe any of this',
  points: [
    {
      heading: 'I will not ask you for money to find out',
      body:
        'The first automation is free and stays free. Not a trial that expires — genuinely free, because one garage costs me almost nothing to run.',
    },
    {
      heading: 'Simplymation is new, and I am not going to fake a client list',
      body:
        'You will not find invented testimonials on this page. What you will find is working software I have built and shipped, which you can log into and click around before you talk to me.',
    },
    {
      heading: 'Nothing leaves your control',
      body:
        'Your customer list is your most valuable asset. It stays in your Google account. I never hold your data, and there is nothing to migrate if you walk away.',
    },
    {
      heading: 'If it does not work in your garage, I will say so',
      body:
        'Some of this may not suit how you run things. I would rather tell you in the first 90 minutes than build something that gathers dust.',
    },
  ],
};

// The actual mechanic behind WhatsApp on the free plan. Shown openly —
// proving there is no magic is more convincing than claiming there is.
export const theTrick = {
  title: 'There is no magic here. This is the whole trick.',
  body:
    'One formula in a spreadsheet turns a phone number and a message into a WhatsApp link. Tap it, WhatsApp opens with everything typed. That is it. Everything else on this page is that idea, arranged carefully.',
  formula:
    '=HYPERLINK("https://wa.me/91" & B2 & "?text=" & ENCODEURL("Namaste " & A2 & ", your " & C2 & " is due for wheel alignment. Shall we book you in this week?"), "Send")',
  footnote:
    'I am showing you this so you know exactly what you are getting, and so you know you could learn it yourself. Most owners would rather run their garage.',
};
