/**
 * Date helpers — ported from simplymation-platform/src/lib/dates.ts.
 *
 * A garage's job card book is written by hand, so dates arrive in whatever format
 * the person at the counter used. Parsing is forgiving about format and strict
 * about ambiguity — and in India day-first is the convention, so 03/04/2026 is
 * 3 April, not 4 March. Getting that backwards silently shifts every reminder by
 * months, which is why it is asserted in the platform's tests.
 *
 * Kept as a straight port rather than an import: the platform is a separate,
 * unpublished Node project, and this page must run entirely in the browser.
 */

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** Whole months from `from` to `to`, ignoring time of day. */
export function monthsBetween(from, to) {
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  // Not a full month yet if we have not reached the same day-of-month.
  if (to.getDate() < from.getDate()) months -= 1;
  return months;
}

/** Builds a date only if the components describe a real calendar day. */
function buildDate(year, month, day) {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const d = new Date(year, month - 1, day);
  // Rejects 31 February, which JS would silently roll into March.
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  return d;
}

/**
 * Parse a date written by a human.
 * Accepts 12/08/2025, 12-8-25, 12.08.2025, 2025-08-12, "12 Aug 2025".
 * Returns null rather than an Invalid Date, so callers must handle bad input.
 */
export function parseHumanDate(input) {
  const raw = String(input ?? '').trim();
  if (!raw) return null;

  // ISO first — unambiguous, so it wins.
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(raw);
  if (iso) return buildDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const dmy = /^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2}|\d{4})$/.exec(raw);
  if (dmy) {
    let year = Number(dmy[3]);
    if (year < 100) year += year < 70 ? 2000 : 1900;
    return buildDate(year, Number(dmy[2]), Number(dmy[1]));
  }

  const named = /^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{2}|\d{4})$/.exec(raw);
  if (named) {
    const month = MONTHS.indexOf(named[2].slice(0, 3).toLowerCase()) + 1;
    if (month === 0) return null;
    let year = Number(named[3]);
    if (year < 100) year += year < 70 ? 2000 : 1900;
    return buildDate(year, month, Number(named[1]));
  }

  return null;
}

/** `12 Aug 2025` — for display back to the garage owner. */
export function formatDisplayDate(d) {
  const month = MONTHS[d.getMonth()];
  return `${d.getDate()} ${month.charAt(0).toUpperCase()}${month.slice(1)} ${d.getFullYear()}`;
}
