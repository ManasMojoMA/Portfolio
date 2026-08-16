/**
 * Keeps the Supabase demo projects awake, and tells you when one is not.
 *
 * WHY THIS EXISTS SEPARATELY FROM THE VERCEL CRONS
 *
 * chalkzone-demo paused despite having a keep-warm cron, for two reasons that
 * both need fixing:
 *
 *   1. The cron pinged /rest/v1/, the PostgREST schema root, which answers 401
 *      without ever reaching Postgres — and the handler reported that 401 as a
 *      success. Every run looked green while the database saw no queries. Fixed
 *      in each app: they now run a real SELECT and fail loudly on a non-2xx.
 *
 *   2. Vercel Hobby crons are best-effort. Nothing guarantees delivery, and
 *      nothing tells you when one silently stops firing. A watchdog that lives
 *      on the same platform as the thing it watches is not a watchdog.
 *
 * This runs on Google's infrastructure, independently, and emails you the moment
 * a project stops answering — so the failure mode is an email, not a recruiter
 * meeting a paused database.
 *
 * SETUP
 *   1. script.google.com → New project → paste this in
 *   2. Fill in ANON_KEY for each project below (anon keys are public by design —
 *      they are already in each app's client bundle)
 *   3. Run checkAll once and authorise it
 *   4. Triggers (clock icon) → Add Trigger → checkAll → Time-driven → Day timer
 *   5. Leave it. It will email NOTIFY_EMAIL only when something is wrong.
 */

/**
 * Where alerts go.
 *
 * Deliberately the account this script runs under, which is NOT the public
 * contact address on the site. These are operational alerts about infrastructure
 * — nobody but the owner should ever see one — so they belong in the inbox that
 * is already open when the Apps Script dashboard is. The public address stays
 * for enquiries; see ContactForm.gs, which points somewhere else on purpose.
 */
var NOTIFY_EMAIL = 'aroramanas07@gmail.com';

/**
 * Each project, with a table that genuinely exists in it. The probe must be a
 * real table: only SQL resets Supabase's inactivity timer.
 */
var PROJECTS = [
  {
    name: 'chalkzone-demo',
    url: 'https://jfsaqbqxxruumjibbtyg.supabase.co',
    probe: 'users',
    anonKey: 'PASTE_CHALKZONE_ANON_KEY',
  },
  {
    name: 'placeflow-demo',
    url: 'https://mykxxvpsojagxymywwbd.supabase.co',
    probe: 'jobs',
    anonKey: 'PASTE_PLACEFLOW_ANON_KEY',
  },
];

/** Also worth pinging: the deployed sites themselves. */
var SITES = [
  'https://chalkzone-ma.vercel.app',
  'https://placeflow-demo.vercel.app',
  'https://appraisal-demo-alpha.vercel.app',
  'https://internship-tracker-demo.vercel.app',
  'https://simplyform.vercel.app',
  'https://qr-attendance-demo-cae28.web.app',
  'https://scaleresume.vercel.app',
];

function checkAll() {
  var problems = [];
  var lines = [];

  PROJECTS.forEach(function (p) {
    if (p.anonKey.indexOf('PASTE_') === 0) {
      problems.push(p.name + ': anon key not filled in');
      return;
    }
    var target = p.url + '/rest/v1/' + p.probe + '?select=id&limit=1';
    try {
      var res = UrlFetchApp.fetch(target, {
        method: 'get',
        headers: { apikey: p.anonKey, Authorization: 'Bearer ' + p.anonKey },
        muteHttpExceptions: true,
      });
      var code = res.getResponseCode();
      lines.push(p.name + ' database: HTTP ' + code);
      // 2xx means the query ran. Anything else means it did not.
      if (code < 200 || code >= 300) {
        problems.push(p.name + ' database returned HTTP ' + code + ' — likely paused');
      }
    } catch (err) {
      // A paused Supabase project stops resolving in DNS, so this throws rather
      // than returning a status code. That is the signal we most care about.
      problems.push(p.name + ' database unreachable: ' + err);
      lines.push(p.name + ' database: UNREACHABLE');
    }
  });

  SITES.forEach(function (url) {
    try {
      var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true });
      var code = res.getResponseCode();
      lines.push(url + ': HTTP ' + code);
      if (code >= 400) problems.push(url + ' returned HTTP ' + code);
    } catch (err) {
      problems.push(url + ' unreachable: ' + err);
      lines.push(url + ': UNREACHABLE');
    }
  });

  Logger.log(lines.join('\n'));

  // Quiet when healthy. An alert that arrives every day is an alert nobody
  // reads, and the whole point is to be believed on the day it matters.
  if (problems.length) {
    MailApp.sendEmail(
      NOTIFY_EMAIL,
      'Portfolio demo check failed (' + problems.length + ')',
      'Something on the portfolio is not answering.\n\n' +
        problems.join('\n') +
        '\n\n— full results —\n' +
        lines.join('\n') +
        '\n\nA paused Supabase project is resumed from its dashboard:\n' +
        'https://supabase.com/dashboard\n',
    );
  }
}

/** Run manually to see the current state without waiting for the trigger. */
function checkNow() {
  checkAll();
  Logger.log('Done. Check the execution log above.');
}
