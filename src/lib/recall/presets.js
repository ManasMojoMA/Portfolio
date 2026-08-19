/**
 * Industry presets for the try-it page.
 *
 * The engine never knew anything about tyres — services, intervals and wording are
 * all config, which is the argument the playbook makes. The first version of this
 * page still hardcoded one industry's worth of that config, so a dental clinic or a
 * salon owner arriving from anywhere other than the garage playbook had nothing to
 * try. These presets are the same data the platform's client JSON carries, one set
 * per industry it already claims to serve.
 *
 * Two things vary beyond the service list and are easy to miss:
 *
 *   subject  — a garage tracks a VEHICLE, a clinic tracks a PATIENT, a salon
 *              tracks a CLIENT. Using the wrong noun in a message to someone's
 *              customer is the sort of detail that makes software feel foreign.
 *   idLabel  — what identifies a returning customer. A registration number for a
 *              garage; for a clinic or salon there is no plate, so the person's
 *              own name or file number does the job.
 */

export const PRESETS = {
  tyre_garage: {
    key: 'tyre_garage',
    label: 'Tyre shop / garage',
    subject: 'vehicle',
    idLabel: 'Vehicle number',
    idIsRegistration: true,
    business: 'Sharma Tyre House',
    template:
      'Namaste {{name}} ji, your {{subject}} is due for {{service}} — last done {{lastDone}}. Shall we book you in this week? — {{business}}',
    services: [
      { key: 'alignment', label: 'wheel alignment', matches: ['alignment', 'align'], intervalMonths: 6, typicalPrice: 400 },
      { key: 'balancing', label: 'wheel balancing', matches: ['balancing', 'balance'], intervalMonths: 6, typicalPrice: 200 },
      { key: 'rotation', label: 'tyre rotation', matches: ['rotation', 'rotate'], intervalMonths: 6, typicalPrice: 300 },
      { key: 'tyres', label: 'new tyres', matches: ['tyre', 'tire'], intervalMonths: 36, typicalPrice: 9000 },
    ],
  },

  dental_clinic: {
    key: 'dental_clinic',
    label: 'Dental clinic',
    subject: 'check-up',
    idLabel: 'Patient name or file no.',
    idIsRegistration: false,
    business: 'Smile Dental Care',
    template:
      'Hello {{name}}, it has been {{monthsAgo}} months since your {{service}} on {{lastDone}}. Shall we book your next appointment? — {{business}}',
    services: [
      { key: 'cleaning', label: 'scaling and cleaning', matches: ['cleaning', 'scaling', 'polish'], intervalMonths: 6, typicalPrice: 1200 },
      { key: 'checkup', label: 'routine check-up', matches: ['checkup', 'check-up', 'consultation', 'review'], intervalMonths: 6, typicalPrice: 500 },
      { key: 'xray', label: 'dental X-ray', matches: ['x-ray', 'xray', 'opg'], intervalMonths: 12, typicalPrice: 800 },
      { key: 'whitening', label: 'teeth whitening', matches: ['whitening', 'bleaching'], intervalMonths: 12, typicalPrice: 6000 },
    ],
  },

  salon: {
    key: 'salon',
    label: 'Salon / spa',
    subject: 'appointment',
    idLabel: 'Client name or phone',
    idIsRegistration: false,
    business: 'Glow Studio',
    template:
      'Hi {{name}}, your last {{service}} was {{monthsAgo}} months ago on {{lastDone}}. Want me to hold a slot this week? — {{business}}',
    services: [
      { key: 'colour', label: 'hair colour / touch-up', matches: ['colour', 'color', 'highlights', 'touch up', 'touch-up'], intervalMonths: 2, typicalPrice: 2500 },
      { key: 'facial', label: 'facial', matches: ['facial', 'clean up', 'cleanup'], intervalMonths: 2, typicalPrice: 1500 },
      { key: 'keratin', label: 'keratin / smoothening', matches: ['keratin', 'smoothening', 'straightening'], intervalMonths: 6, typicalPrice: 5000 },
      { key: 'spa', label: 'hair spa', matches: ['spa', 'treatment'], intervalMonths: 2, typicalPrice: 1200 },
    ],
  },

  ac_servicing: {
    key: 'ac_servicing',
    label: 'AC / appliance servicing',
    subject: 'unit',
    idLabel: 'Customer name or address',
    idIsRegistration: false,
    business: 'CoolCare Services',
    template:
      'Hello {{name}}, your {{service}} was done {{monthsAgo}} months ago on {{lastDone}}. Shall we schedule the next one before the season? — {{business}}',
    services: [
      { key: 'service', label: 'AC service', matches: ['service', 'servicing', 'cleaning'], intervalMonths: 6, typicalPrice: 600 },
      { key: 'gas', label: 'gas refill', matches: ['gas', 'refill', 'charging'], intervalMonths: 24, typicalPrice: 2500 },
      { key: 'amc', label: 'AMC renewal', matches: ['amc', 'contract'], intervalMonths: 12, typicalPrice: 3500 },
    ],
  },

  physiotherapy: {
    key: 'physiotherapy',
    label: 'Physiotherapy / clinic',
    subject: 'session',
    idLabel: 'Patient name or file no.',
    idIsRegistration: false,
    business: 'Align Physiotherapy',
    template:
      'Hello {{name}}, it has been {{monthsAgo}} months since your {{service}} on {{lastDone}}. Shall we book a review? — {{business}}',
    services: [
      { key: 'review', label: 'follow-up review', matches: ['review', 'follow up', 'follow-up', 'consultation'], intervalMonths: 3, typicalPrice: 700 },
      { key: 'therapy', label: 'therapy session', matches: ['therapy', 'session', 'treatment'], intervalMonths: 6, typicalPrice: 900 },
    ],
  },

  other: {
    key: 'other',
    label: 'Something else',
    subject: 'service',
    idLabel: 'Customer name or reference',
    idIsRegistration: false,
    business: 'Your business',
    template:
      'Hello {{name}}, your last {{service}} was on {{lastDone}}, {{monthsAgo}} months ago. Shall we book the next one? — {{business}}',
    // Nothing pre-filled: an unfamiliar trade is exactly the case where guessed
    // service names would be wrong, and a wrong guess reads as sloppy software.
    // The page prompts for these instead.
    services: [],
  },
};

export const PRESET_LIST = Object.values(PRESETS);

export const DEFAULT_PRESET = 'tyre_garage';
