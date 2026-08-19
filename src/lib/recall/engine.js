/**
 * The Recall Engine's matching logic, ported for the browser from
 * simplymation-platform/src/automations/recall-engine/.
 *
 * Given a garage's job history it works out which vehicle is overdue for a service
 * it has HAD BEFORE, and writes the message the owner will send.
 *
 * The one rule worth restating, because it is what separates this from spam:
 * a service the vehicle has never had is never "due". Suggesting one is a sales
 * pitch, not a reminder, and the whole pitch to a sceptical owner is that this
 * only chases business they already earned.
 *
 * Runs entirely in the visitor's browser. Nothing here is uploaded anywhere.
 */
import { monthsBetween, parseHumanDate } from './dates.js';

/**
 * Registrations are the join key, so they must normalise consistently:
 * "UP 14 AB 1234", "up14ab1234" and "UP-14-AB-1234" are one vehicle. Without this
 * the same car looks like three customers.
 */
export function normaliseVehicle(raw) {
  return String(raw ?? '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

/** Split a free-text service cell into lowercased parts. */
function splitServices(raw) {
  return String(raw ?? '')
    .split(/[,;/+|]| and /i)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Does this job's free-text service list match the rule? */
function jobMatchesRule(job, rule) {
  return job.services.some((s) => rule.matches.some((m) => s.includes(m.toLowerCase())));
}

/**
 * Turn rows of raw cells into jobs, reporting what was skipped and why.
 *
 * Skipped rows are returned rather than silently dropped: a garage owner looking at
 * "14 due, 3 rows skipped — no date" learns something true about their own book,
 * and that is often the more valuable half of the output.
 */
export function parseJobs(rows) {
  const jobs = [];
  const skipped = [];

  rows.forEach((cells, i) => {
    const rowNumber = i + 1;
    const [dateRaw, vehicleRaw, customerRaw, phoneRaw, servicesRaw] = cells;

    if (!String(dateRaw ?? '').trim()) {
      skipped.push({ rowNumber, reason: 'no date' });
      return;
    }
    const date = parseHumanDate(dateRaw);
    if (!date) {
      skipped.push({ rowNumber, reason: `date not understood: "${String(dateRaw).trim()}"` });
      return;
    }
    const vehicle = normaliseVehicle(vehicleRaw);
    if (!vehicle) {
      skipped.push({ rowNumber, reason: 'no vehicle registration' });
      return;
    }
    const services = splitServices(servicesRaw);
    if (services.length === 0) {
      skipped.push({ rowNumber, reason: 'no services listed' });
      return;
    }

    jobs.push({
      rowNumber,
      date,
      vehicle,
      // As written in the book, for display. 'your UP14AB1234 is due' is not how
      // anyone writes a plate, and this text goes to a real customer.
      vehicleRaw: String(vehicleRaw ?? '').trim(),
      customer: String(customerRaw ?? '').trim(),
      phone: String(phoneRaw ?? '').trim(),
      services,
    });
  });

  return { jobs, skipped };
}

/**
 * Find every vehicle+service that is overdue.
 * The most recent contact details win — people change phones, and the latest job
 * card is the best record there is.
 */
export function findDue(jobs, services, now) {
  const latestByVehicle = new Map();
  for (const job of jobs) {
    const existing = latestByVehicle.get(job.vehicle);
    if (!existing || job.date > existing.date) latestByVehicle.set(job.vehicle, job);
  }

  // Latest occurrence of each service, per vehicle.
  const lastService = new Map();
  for (const job of jobs) {
    for (const rule of services) {
      if (!jobMatchesRule(job, rule)) continue;
      let perVehicle = lastService.get(job.vehicle);
      if (!perVehicle) {
        perVehicle = new Map();
        lastService.set(job.vehicle, perVehicle);
      }
      const prev = perVehicle.get(rule.key);
      if (!prev || job.date > prev) perVehicle.set(rule.key, job.date);
    }
  }

  const due = [];
  for (const [vehicle, perVehicle] of lastService) {
    const latest = latestByVehicle.get(vehicle);
    if (!latest) continue;

    for (const rule of services) {
      const lastDone = perVehicle.get(rule.key);
      // Never done is not "due" — see the note at the top of this file.
      if (!lastDone) continue;

      const monthsAgo = monthsBetween(lastDone, now);
      if (monthsAgo < rule.intervalMonths) continue;

      due.push({
        vehicle,
        // The most recent spelling wins, same rule as the phone number.
        vehicleRaw: latest.vehicleRaw || vehicle,
        customer: latest.customer,
        phone: latest.phone,
        service: rule,
        lastDone,
        monthsAgo,
      });
    }
  }

  // Most overdue first — if the owner only taps ten, they should be the best ten.
  due.sort((a, b) =>
    b.monthsAgo !== a.monthsAgo ? b.monthsAgo - a.monthsAgo : a.vehicle.localeCompare(b.vehicle),
  );
  return due;
}

/**
 * Fill {{placeholders}}. Unknown ones are left visible rather than replaced with
 * "undefined" — a visible {{typo}} in a draft beats a message that reads
 * "your undefined is due".
 */
export function renderTemplate(template, vars) {
  return String(template).replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : match,
  );
}
