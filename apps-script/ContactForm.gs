/**
 * Receives portfolio contact-form submissions.
 *
 * WHY
 * The form used to call setTimeout and show a success tick without sending
 * anything — every enquiry a visitor typed was discarded while they were told it
 * had arrived. This gives it somewhere real to land: a row in a Google Sheet you
 * own, plus an email to you so you do not have to remember to check.
 *
 * WHY APPS SCRIPT rather than a form service: it runs as you, writes into your
 * own Drive, costs nothing, needs no account anywhere else, and the data stays
 * in your Google account rather than a third party's dashboard.
 *
 * SECURITY
 * Deployed "Anyone", so it is a public URL. It only ever appends to one sheet
 * and mails one fixed address — there is no parameter a caller can set to
 * redirect either. The rate limit is what stops someone using it to fill your
 * inbox; there is no secret, because a public form cannot carry one that a
 * visitor could not also read out of the page source.
 *
 * SETUP — see apps-script/README.md in this repo.
 */

// ── Configure these two ──────────────────────────────────────────────────────

/** The Sheet that stores enquiries. Create it, then paste its ID here. */
var SHEET_ID = 'PASTE_YOUR_SHEET_ID_HERE';

/** Where the notification goes. */
var NOTIFY_EMAIL = 'aroramanasm07@gmail.com';

/** Submissions accepted per rolling hour, across everyone. */
var MAX_PER_HOUR = 20;

// ─────────────────────────────────────────────────────────────────────────────

var TAB = 'Enquiries';
var HEADERS = ['Received', 'Name', 'Email', 'Message', 'Source', 'IP hint'];

function doPost(e) {
  try {
    if (!underRateLimit()) {
      return json({ ok: false, error: 'rate limited' });
    }

    var body = JSON.parse(e.postData.contents);

    var name = clean(body.name, 120);
    var email = clean(body.email, 160);
    var message = clean(body.message, 4000);

    if (!name || !email || !message) {
      return json({ ok: false, error: 'name, email and message are required' });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json({ ok: false, error: 'that email address does not look right' });
    }

    var sheet = getSheet();
    sheet.appendRow([
      new Date(),
      name,
      email,
      message,
      clean(body.source, 60) || 'unknown',
      clean(body.sentAt, 40),
    ]);

    // Best effort — a failed notification must not lose the row that is already
    // safely written above.
    try {
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: 'Portfolio enquiry from ' + name,
        replyTo: email,
        body:
          name + ' <' + email + '> wrote:\n\n' + message +
          '\n\n— via the portfolio contact form',
      });
    } catch (mailErr) {
      // Swallowed on purpose; the enquiry is in the sheet either way.
    }

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

/** Lets you confirm the deployment is alive without sending anything. */
function doGet() {
  return json({ ok: true, service: 'portfolio-contact-form' });
}

function getSheet() {
  var doc = SpreadsheetApp.openById(SHEET_ID);
  var sheet = doc.getSheetByName(TAB);
  if (!sheet) {
    sheet = doc.insertSheet(TAB);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function clean(value, max) {
  if (!value) return '';
  return String(value).replace(/<[^>]*>?/g, '').trim().slice(0, max);
}

function underRateLimit() {
  var props = PropertiesService.getScriptProperties();
  var hour = Math.floor(Date.now() / 3600000);
  var key = 'contact_' + hour;
  var used = Number(props.getProperty(key) || '0');
  if (used >= MAX_PER_HOUR) return false;
  props.setProperty(key, String(used + 1));
  return true;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
