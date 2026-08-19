/**
 * Phone normalisation and WhatsApp links — ported from
 * simplymation-platform/src/lib/phone.ts.
 *
 * Numbers in a garage's book are written every possible way: "98765 43210",
 * "+91-98765-43210", "098765 43210", "9876543210 (son)". A wrong normalisation
 * sends a reminder to a stranger, so this returns null rather than guessing.
 */

/** Normalise to bare national digits, or null if it cannot be trusted. */
export function normalisePhone(raw, countryCode = '91') {
  if (!raw) return null;

  // Strip everything except digits and a leading +. Notes like "(son)" fall away.
  let digits = String(raw).replace(/[^\d+]/g, '');
  if (!digits) return null;

  if (digits.startsWith('+')) digits = digits.slice(1);
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.length > 10 && digits.startsWith(countryCode)) {
    digits = digits.slice(countryCode.length);
  }
  // Domestic trunk prefix: 09876543210
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);

  // India: mobiles are 10 digits starting 6-9. A landline or a mistyped number is
  // not something we will message.
  if (countryCode === '91') {
    return /^[6-9]\d{9}$/.test(digits) ? digits : null;
  }
  return /^\d{7,15}$/.test(digits) ? digits : null;
}

/** Full international number without the +, as wa.me expects: 919876543210 */
export function toWhatsAppNumber(raw, countryCode = '91') {
  const national = normalisePhone(raw, countryCode);
  return national ? `${countryCode}${national}` : null;
}

/**
 * A click-to-send WhatsApp link. Opening it puts the message in the compose box —
 * the owner still presses send.
 *
 * This is the whole mechanism behind the free tier, and the playbook says so
 * openly. Truly automated sending needs Meta's paid Business Platform.
 */
export function whatsAppLink(phone, message, countryCode = '91') {
  const number = toWhatsAppNumber(phone, countryCode);
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
