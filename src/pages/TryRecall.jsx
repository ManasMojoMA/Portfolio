import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import EmailCta from '../components/EmailCta';
import { parsePasted } from '../lib/recall/paste.js';
import { parseJobs, findDue, renderTemplate } from '../lib/recall/engine.js';
import { whatsAppLink } from '../lib/recall/phone.js';
import { formatDisplayDate } from '../lib/recall/dates.js';
import {
  DEFAULT_SERVICES,
  DEFAULT_TEMPLATE,
  DEFAULT_BUSINESS,
  sampleAsText,
} from '../lib/recall/defaults.js';
import '../styles/site.css';
import './TryRecall.css';

/**
 * "See who's due at your garage" — the Recall Engine, runnable by a stranger.
 *
 * The playbook argues that following up on services customers already bought is
 * worth money. Arguing is weak. This lets a garage owner paste their own job book
 * and see their own overdue customers, message already written, in about a minute.
 *
 * Nothing they paste leaves the browser, and that is not a footnote. The person
 * this is for is sceptical and protective of their customer list; "upload your
 * customers to my server so I can show you something" is exactly where they stop.
 * Everything is computed locally and the page says so where they can see it.
 */
export default function TryRecall() {
  const [raw, setRaw] = useState('');
  const [business, setBusiness] = useState(DEFAULT_BUSINESS);
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [showSkipped, setShowSkipped] = useState(false);

  const loadSample = useCallback(() => {
    setRaw(sampleAsText(new Date()));
    setShowSkipped(false);
  }, []);

  const result = useMemo(() => {
    if (!raw.trim()) return null;
    const now = new Date();
    const { rows, headerDropped } = parsePasted(raw);
    const { jobs, skipped } = parseJobs(rows);
    const due = findDue(jobs, DEFAULT_SERVICES, now);

    const items = due.map((d) => {
      const message = renderTemplate(template, {
        name: d.customer.trim() || 'Sir/Madam',
        vehicle: d.vehicleRaw || d.vehicle,
        service: d.service.label,
        business: business.trim() || 'your garage',
        lastDone: formatDisplayDate(d.lastDone),
        monthsAgo: String(d.monthsAgo),
      });
      return { ...d, message, link: whatsAppLink(d.phone, message) };
    });

    // Only count what could actually be earned. A row with an unusable phone number
    // is not revenue, and inflating this number is the sort of thing the rest of
    // this site exists not to do.
    const reachable = items.filter((i) => i.link);
    const potential = reachable.reduce((sum, i) => sum + (i.service.typicalPrice || 0), 0);
    const vehicles = new Set(jobs.map((j) => j.vehicle)).size;

    return { items, reachable, potential, skipped, headerDropped, vehicles };
  }, [raw, business, template]);

  return (
    <div className="site">
      <SiteNav />

      <header className="pb-hero try-hero">
        <p className="pb-eyebrow">Free · nothing to install · nothing uploaded</p>
        <h1>See who&rsquo;s due at your garage</h1>
        <p className="pb-hero-lede">
          Paste your job book below. This finds every vehicle overdue for a service it
          has <strong>had before</strong>, and writes the WhatsApp message for you. You
          tap send.
        </p>
        <p className="try-privacy">
          Everything runs inside your browser. Nothing you paste is uploaded, stored or
          seen by anyone — including me. Close the tab and it is gone.
        </p>
      </header>

      <section className="pb-section try-input-section">
        <div className="try-controls">
          <label className="try-field">
            <span className="try-label">Your garage&rsquo;s name</span>
            <input
              className="try-input"
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              placeholder="Sharma Tyre House"
            />
          </label>
          <button type="button" className="try-sample-btn" onClick={loadSample}>
            No list handy? Show me with sample data
          </button>
        </div>

        <label className="try-field try-field-wide">
          <span className="try-label">
            Your job book — one job per line: date, vehicle, customer, phone, services
          </span>
          <textarea
            className="try-textarea"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={10}
            spellCheck={false}
            placeholder="Copy straight out of Excel or Google Sheets and paste here."
          />
        </label>
        <p className="try-hint">
          Dates can be 12/08/2025, 12-8-25 or 12 Aug 2025 — day first, as written in
          India. Column order is what matters, not the headings. Rows it cannot read
          are listed rather than silently dropped.
        </p>
      </section>

      {result && (
        <section className="pb-section pb-section-tint try-results">
          <div className="try-summary">
            <div className="try-stat">
              <span className="try-stat-value">{result.reachable.length}</span>
              <span className="try-stat-label">customers you can message today</span>
            </div>
            <div className="try-stat">
              <span className="try-stat-value">{result.vehicles}</span>
              <span className="try-stat-label">vehicles in your book</span>
            </div>
            {result.potential > 0 && (
              <div className="try-stat">
                <span className="try-stat-value">
                  ₹{result.potential.toLocaleString('en-IN')}
                </span>
                <span className="try-stat-label">typical value, if every one books</span>
              </div>
            )}
          </div>

          {result.potential > 0 && (
            <p className="try-caveat">
              That figure assumes everyone says yes, which nobody does. Treat it as the
              ceiling, not a forecast — and it counts only the {result.reachable.length}{' '}
              you can actually reach.
            </p>
          )}

          {result.items.length === 0 && (
            <p className="try-empty">
              Nothing is overdue in what you pasted. That is a real answer, not an error
              — either the book is short, or your customers are already coming back on
              time.
            </p>
          )}

          {result.items.length > 0 && (
            <div className="try-table-wrap">
              <table className="try-table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Customer</th>
                    <th>Due for</th>
                    <th>Last done</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((item, i) => (
                    <tr key={`${item.vehicle}-${item.service.key}-${i}`}>
                      <td className="try-veh">{item.vehicleRaw || item.vehicle}</td>
                      <td>{item.customer || <em>no name in book</em>}</td>
                      <td>
                        {item.service.label}
                        <span className="try-overdue">{item.monthsAgo} months ago</span>
                      </td>
                      <td>{formatDisplayDate(item.lastDone)}</td>
                      <td>
                        {item.link ? (
                          <a
                            className="try-wa"
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open in WhatsApp
                          </a>
                        ) : (
                          <span className="try-nolink" title={item.phone}>
                            no usable mobile
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.skipped.length > 0 && (
            <div className="try-skipped">
              <button
                type="button"
                className="try-skipped-toggle"
                onClick={() => setShowSkipped((s) => !s)}
              >
                {result.skipped.length} row{result.skipped.length === 1 ? '' : 's'} could
                not be read — {showSkipped ? 'hide' : 'show'}
              </button>
              {showSkipped && (
                <ul className="try-skipped-list">
                  {result.skipped.map((s) => (
                    <li key={s.rowNumber}>
                      Row {s.rowNumber}: {s.reason}
                    </li>
                  ))}
                </ul>
              )}
              <p className="try-skipped-note">
                Worth a look. A row with no date or no registration is invisible to any
                follow-up system, including a person going through the book by hand.
              </p>
            </div>
          )}

          <details className="pb-assumptions try-template">
            <summary>Change the message wording</summary>
            <textarea
              className="try-textarea try-textarea-small"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              rows={3}
            />
            <p className="pb-assumptions-note">
              name, vehicle, service, lastDone, monthsAgo and business are filled in per
              customer. Anything else in double braces is left visible, so a typo shows
              up here rather than in a message to a customer.
            </p>
          </details>
        </section>
      )}

      <section className="pb-section try-next">
        <h2>What this is not doing</h2>
        <ul className="try-honest">
          <li>
            <strong>It is not sending anything.</strong> Each link opens WhatsApp with
            the message ready. You read it and press send. Genuinely automatic sending
            needs Meta&rsquo;s paid Business Platform, and most garages do not need it.
          </li>
          <li>
            <strong>It never suggests a service the vehicle has not had.</strong> Only
            things that customer already paid for once. Anything else is a sales pitch
            wearing a reminder&rsquo;s clothes.
          </li>
          <li>
            <strong>It has not kept your data.</strong> No account, no upload, no
            database. Refresh the page and you start again.
          </li>
        </ul>

        <h2>If you want this running by itself</h2>
        <p className="pb-section-lede">
          The same thing on your own Google Sheet, updating every morning without you
          pasting anything — that is the part I set up. It stays on free Google tools;
          there is no software subscription to me.
        </p>
        <EmailCta subject="Recall Engine — I tried it on my own list">
          Tell me what you saw
        </EmailCta>
        <p className="try-back">
          <Link to="/playbooks/tyre-garage">← Back to the tyre garage playbook</Link>
        </p>
      </section>

      <SiteFooter />
    </div>
  );
}
