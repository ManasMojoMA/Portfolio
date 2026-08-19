/**
 * Working out which pasted column is which.
 *
 * The first version of this page demanded a fixed order — date, subject, customer,
 * phone, services — which quietly assumed every visitor keeps their book the way the
 * sample does. Nobody does. A clinic puts the patient first; a salon may have no
 * separate "customer" column at all because the client's name IS the identifier;
 * plenty of books carry columns this tool has no use for.
 *
 * So: guess from the header row where there is one, guess from the shape of the data
 * where there is not, and always show the guess so a person can correct it. Guessing
 * silently and getting it wrong is worse than not guessing, because the output still
 * looks plausible.
 */
import { parseHumanDate } from './dates.js';
import { normalisePhone } from './phone.js';

/** The fields the engine needs. `services` and `date` are the only required ones. */
export const FIELDS = [
  { key: 'date', label: 'Date of visit', required: true },
  { key: 'subject', label: 'Customer / vehicle identifier', required: true },
  { key: 'customer', label: 'Customer name', required: false },
  { key: 'phone', label: 'Phone number', required: false },
  { key: 'services', label: 'What was done', required: true },
];

/**
 * Headings that are definitely NOT a customer or an identifier. Without this, a
 * salon book with columns Client, Phone, Date, Service, Amount, Staff mapped the
 * STAFF member as the customer: "Client" was claimed as the identifier first, and
 * "Staff" was the next name-shaped column left over. The output looked entirely
 * plausible and was addressed to the wrong person.
 */
const NEGATIVE_HINTS = [
  'staff', 'stylist', 'technician', 'mechanic', 'doctor', 'therapist', 'attended',
  'amount', 'total', 'price', 'cost', 'paid', 'balance', 'bill', 'invoice',
  'qty', 'quantity', 'discount', 'tax', 'gst', 'remarks', 'status',
];

const HEADER_HINTS = {
  date: ['date', 'day', 'visit', 'when', 'dt', 'tarikh'],
  subject: ['vehicle', 'reg', 'registration', 'number plate', 'plate', 'car', 'bike', 'patient', 'file', 'client', 'id', 'unit', 'guest', 'member'],
  customer: ['customer', 'name', 'client name', 'patient name', 'owner', 'party',
    'guest', 'member'],
  phone: ['phone', 'mobile', 'contact', 'number', 'whatsapp', 'cell', 'no.'],
  services: ['service', 'services', 'work', 'job', 'done', 'treatment', 'description',
    'particulars', 'item', 'details', 'session', 'procedure', 'package', 'activity',
    'complaint', 'reason', 'repair', 'part', 'what for', 'occasion', 'purpose',
    'booked for', 'type'],
};

/** Does this row look like headings rather than data? */
export function looksLikeHeaderRow(cells) {
  if (!cells || cells.length === 0) return false;
  // A header row has no parseable date in it — that is the most reliable signal,
  // because almost every book starts each data row with one.
  const anyDate = cells.some((c) => parseHumanDate(c));
  if (anyDate) return false;
  const joined = cells.join(' ').toLowerCase();
  return Object.values(HEADER_HINTS).some((hints) => hints.some((h) => joined.includes(h)));
}

function isNegativeHeader(cell) {
  const c = String(cell ?? '').trim().toLowerCase();
  return Boolean(c) && NEGATIVE_HINTS.some((n) => c.includes(n));
}

function scoreHeader(cell, field) {
  const c = String(cell ?? '').trim().toLowerCase();
  if (!c) return 0;

  // A column named for who DID the work, or for money, is never the customer or
  // the thing being tracked.
  if ((field === 'customer' || field === 'subject') &&
      NEGATIVE_HINTS.some((n) => c.includes(n))) {
    return 0;
  }
  let best = 0;
  for (const hint of HEADER_HINTS[field]) {
    if (c === hint) best = Math.max(best, 100);
    else if (c.startsWith(hint) || c.endsWith(hint)) best = Math.max(best, 80);
    else if (c.includes(hint)) best = Math.max(best, 60);
  }
  return best;
}

/**
 * Score a column by what its VALUES look like, for books with no header row.
 * Content beats naming: a column of parseable dates is a date column whatever it
 * is called, or even if it is called nothing.
 */
function scoreContent(values, field) {
  const sample = values.filter((v) => String(v ?? '').trim()).slice(0, 12);
  if (sample.length === 0) return 0;
  const ratio = (fn) => sample.filter(fn).length / sample.length;

  switch (field) {
    case 'date':
      return ratio((v) => parseHumanDate(v)) * 100;
    case 'phone':
      // Deliberately loose: a landline is still obviously a phone column even
      // though the engine will not message it.
      return ratio((v) => /\d/.test(v) && String(v).replace(/\D/g, '').length >= 7) * 95;
    case 'subject':
      // Registration-ish: letters and digits mixed, short, few spaces.
      return ratio((v) => /[A-Za-z]/.test(v) && /\d/.test(v) && String(v).trim().length <= 15) * 70;
    case 'customer':
      // Words, no digits.
      return ratio((v) => /^[A-Za-z][A-Za-z .'-]{2,}$/.test(String(v).trim())) * 55;
    case 'services':
      // Longest free text, often with separators.
      return ratio((v) => String(v).trim().length > 3 && !/^\d+$/.test(String(v).trim())) * 45;
    default:
      return 0;
  }
}

/**
 * Best-guess mapping of field -> column index, or null where nothing fits.
 * Each column is used at most once: the highest-scoring claim wins, so a single
 * "name" column cannot be both the customer and the identifier.
 */
export function guessMapping(rows, hasHeader) {
  if (!rows || rows.length === 0) return {};

  const header = hasHeader ? rows[0] : null;
  const body = hasHeader ? rows.slice(1) : rows;
  const width = Math.max(...rows.map((r) => r.length));

  const claims = [];
  for (const field of FIELDS.map((f) => f.key)) {
    for (let col = 0; col < width; col++) {
      // A column headed "Staff" or "Amount" is out of the running for these two
      // whatever its values look like. Scoring it low was not enough: the names in
      // a Staff column are still names.
      if ((field === 'customer' || field === 'subject') && header && isNegativeHeader(header[col])) {
        continue;
      }

      const byHeader = header ? scoreHeader(header[col], field) : 0;
      const byContent = scoreContent(body.map((r) => r[col]), field);
      // A header is a stated intention and outranks inference, but only when the
      // content does not flatly contradict it.
      // A heading is a stated intention; inference is a guess. When someone has
      // labelled their columns, believe them.
      const score = header ? Math.max(byHeader, byContent * 0.5) : byContent;
      if (score > 25) claims.push({ field, col, score });
    }
  }

  claims.sort((a, b) => b.score - a.score);

  const mapping = {};
  const takenCols = new Set();
  for (const { field, col } of claims) {
    if (mapping[field] !== undefined || takenCols.has(col)) continue;
    mapping[field] = col;
    takenCols.add(col);
  }
  // For a business with no registration number the person's name is both the
  // identifier and the customer. Sharing one column is correct there, and far
  // better than reaching for the next name-shaped column, which is how "Staff"
  // once became the customer.
  if (mapping.customer === undefined && mapping.subject !== undefined) {
    mapping.customer = mapping.subject;
  }
  if (mapping.subject === undefined && mapping.customer !== undefined) {
    mapping.subject = mapping.customer;
  }

  return mapping;
}

/** Reorder arbitrary columns into the fixed shape the engine parses. */
export function applyMapping(rows, mapping) {
  const at = (row, key) => {
    const idx = mapping[key];
    return idx === undefined || idx === null ? '' : (row[idx] ?? '');
  };
  return rows.map((row) => [
    at(row, 'date'),
    at(row, 'subject'),
    at(row, 'customer'),
    at(row, 'phone'),
    at(row, 'services'),
  ]);
}

/** Which required fields are still unmapped, for the UI to ask about. */
export function missingRequired(mapping) {
  return FIELDS.filter((f) => f.required && (mapping[f.key] === undefined || mapping[f.key] === null))
    .map((f) => f.label);
}
