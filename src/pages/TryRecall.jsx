import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import EmailCta from '../components/EmailCta';
import { parsePasted } from '../lib/recall/paste.js';
import { parseJobs, findDue, renderTemplate } from '../lib/recall/engine.js';
import { whatsAppLink } from '../lib/recall/phone.js';
import { formatDisplayDate } from '../lib/recall/dates.js';
import { sampleFor } from '../lib/recall/defaults.js';
import { PRESETS, PRESET_LIST, DEFAULT_PRESET } from '../lib/recall/presets.js';
import {
  FIELDS,
  guessMapping,
  applyMapping,
  looksLikeHeaderRow,
  missingRequired,
} from '../lib/recall/columns.js';
import '../styles/site.css';
import './TryRecall.css';

/**
 * "See who owes you a visit" — the Recall Engine, runnable by a stranger.
 *
 * The playbook argues that following up on work customers already bought is worth
 * money. Arguing is weak. This lets an owner paste their own book and see their own
 * overdue customers, message already written, in about a minute.
 *
 * Two things this page must not assume, both learned by getting them wrong:
 *
 *   The visitor's trade. A dental clinic, salon, AC firm and physio practice all
 *   have the same problem and none of them have a number plate. Services, wording
 *   and the noun for the thing being tracked are per-industry config.
 *
 *   The visitor's column order. Nobody keeps their book the way a sample does.
 *   Columns are detected and then SHOWN, so a wrong guess gets corrected in a
 *   dropdown rather than silently producing a plausible, wrong answer.
 *
 * Nothing pasted leaves the browser. Not a footnote: this person is protective of
 * their customer list, and "upload it so I can show you something" is exactly
 * where they stop reading.
 */
export default function TryRecall() {
  const [presetKey, setPresetKey] = useState(DEFAULT_PRESET);
  const preset = PRESETS[presetKey];

  const [raw, setRaw] = useState('');
  const [business, setBusiness] = useState(PRESETS[DEFAULT_PRESET].business);
  const [template, setTemplate] = useState(PRESETS[DEFAULT_PRESET].template);
  const [services, setServices] = useState(PRESETS[DEFAULT_PRESET].services);
  const [mapping, setMapping] = useState(null);
  const [userTouchedMapping, setUserTouchedMapping] = useState(false);
  const [showSkipped, setShowSkipped] = useState(false);

  // Switching trade replaces the trade-specific defaults but never what has been
  // pasted — making someone retype their book because they changed a dropdown
  // would be rude.
  const switchPreset = useCallback((key) => {
    const p = PRESETS[key];
    setPresetKey(key);
    setBusiness(p.business);
    setTemplate(p.template);
    setServices(p.services);
    setUserTouchedMapping(false);
  }, []);

  const loadSample = useCallback(() => {
    setRaw(sampleFor(presetKey, new Date()));
    setUserTouchedMapping(false);
    setShowSkipped(false);
  }, [presetKey]);

  // Split the paste once, so detection and the preview agree.
  const parsed = useMemo(() => {
    if (!raw.trim()) return null;
    const { rows } = parsePasted(raw);
    if (rows.length === 0) return null;
    const hasHeader = looksLikeHeaderRow(rows[0]);
    return {
      rows,
      hasHeader,
      body: hasHeader ? rows.slice(1) : rows,
      header: hasHeader ? rows[0] : null,
    };
  }, [raw]);

  // Re-guess when the paste changes, unless the person has corrected it by hand.
  useEffect(() => {
    if (!parsed) {
      setMapping(null);
      return;
    }
    if (userTouchedMapping) return;
    setMapping(guessMapping(parsed.rows, parsed.hasHeader));
  }, [parsed, userTouchedMapping]);

  const setField = (field, value) => {
    setUserTouchedMapping(true);
    setMapping((m) => ({ ...m, [field]: value === '' ? undefined : Number(value) }));
  };

  const columnCount = parsed ? Math.max(...parsed.rows.map((r) => r.length)) : 0;
  const missing = mapping ? missingRequired(mapping) : [];

  const result = useMemo(() => {
    if (!parsed || !mapping || missing.length > 0 || services.length === 0) return null;

    const now = new Date();
    const shaped = applyMapping(parsed.body, mapping);
    const { jobs, skipped } = parseJobs(shaped);
    const usable = services.filter((s) => s.label.trim() && s.matches.length > 0);
    const due = findDue(jobs, usable, now);

    const items = due.map((d) => {
      const message = renderTemplate(template, {
        name: d.customer.trim() || 'there',
        subject: d.vehicleRaw || d.vehicle,
        vehicle: d.vehicleRaw || d.vehicle,
        service: d.service.label,
        business: business.trim() || 'us',
        lastDone: formatDisplayDate(d.lastDone),
        monthsAgo: String(d.monthsAgo),
      });
      return { ...d, message, link: whatsAppLink(d.phone, message) };
    });

    // Count only what could actually be earned. A row with an unusable number is
    // not revenue, and inflating this is the sort of thing the rest of the site
    // exists not to do.
    const reachable = items.filter((i) => i.link);
    const potential = reachable.reduce((s, i) => s + (i.service.typicalPrice || 0), 0);

    return {
      items,
      reachable,
      potential,
      skipped,
      customers: new Set(jobs.map((j) => j.vehicle)).size,
    };
  }, [parsed, mapping, missing.length, services, template, business]);

  return (
    <div className="site">
      <SiteNav />

      <header className="site-section try-hero">
        <p className="site-eyebrow">Free · nothing to install · nothing uploaded</p>
        <h1>See who owes you a visit</h1>
        <p className="site-lede">
          Paste your customer book. This finds everyone overdue for something they
          have <strong>paid for before</strong>, and writes the WhatsApp message for
          you. You read it and tap send.
        </p>
        <p className="try-privacy">
          Everything runs inside your browser. Nothing you paste is uploaded, stored
          or seen by anyone, including me. Close the tab and it is gone.
        </p>
      </header>

      <section className="site-section try-step">
        <h2 className="try-step-title">
          <span className="try-step-num">1</span> What kind of business is this?
        </h2>
        <p className="try-step-lede">
          This only changes the service names and how often each comes round. The
          method is identical for all of them.
        </p>
        <div className="try-presets">
          {PRESET_LIST.map((p) => (
            <button
              key={p.key}
              type="button"
              className={`try-preset${p.key === presetKey ? ' try-preset-on' : ''}`}
              onClick={() => switchPreset(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      <section className="site-section try-step">
        <h2 className="try-step-title">
          <span className="try-step-num">2</span> Paste your book
        </h2>
        <p className="try-step-lede">
          Straight out of Excel, Google Sheets, or your billing software&rsquo;s
          export. Any column order — it works out which is which, and shows you what
          it decided so you can correct it.
        </p>

        <div className="try-controls">
          <label className="try-field">
            <span className="try-label">Your business name</span>
            <input
              className="try-input"
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              placeholder={preset.business}
            />
          </label>
          <button type="button" className="try-sample-btn" onClick={loadSample}>
            No list handy? Show me with sample data
          </button>
        </div>

        <label className="try-field try-field-wide">
          <span className="try-label">Your customer book</span>
          <textarea
            className="try-textarea"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={9}
            spellCheck={false}
            placeholder="Paste here. A heading row is fine — it will be spotted and skipped. Dates can be 12/08/2025, 12-8-25 or 12 Aug 2025 (day first)."
          />
        </label>
      </section>

      {parsed && mapping && (
        <section className="site-section site-section-tint try-step">
          <h2 className="try-step-title">
            <span className="try-step-num">3</span> Check the columns
          </h2>
          <p className="try-step-lede">
            {parsed.hasHeader
              ? 'Your first row looked like headings, so it has been skipped. '
              : 'No heading row spotted, so every line is treated as data. '}
            Change anything that is wrong — a bad guess here produces an answer that
            looks right and is not.
          </p>

          <div className="try-mapping">
            {FIELDS.map((f) => (
              <label key={f.key} className="try-map-field">
                <span className="try-label">
                  {f.key === 'subject' ? preset.idLabel : f.label}
                  {f.required && <span className="try-req">required</span>}
                </span>
                <select
                  className="try-input"
                  value={mapping[f.key] ?? ''}
                  onChange={(e) => setField(f.key, e.target.value)}
                >
                  <option value="">— not in my data —</option>
                  {Array.from({ length: columnCount }, (_, i) => (
                    <option key={i} value={i}>
                      {parsed.header?.[i]?.trim() || `Column ${i + 1}`}
                      {parsed.body[0]?.[i]
                        ? ` — e.g. ${String(parsed.body[0][i]).slice(0, 20)}`
                        : ''}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          {missing.length > 0 && (
            <p className="try-missing">
              Still needed: {missing.join(', ')}. Without these there is nothing to
              work out.
            </p>
          )}
        </section>
      )}

      {parsed && missing.length === 0 && services.length === 0 && (
        <section className="site-section try-step">
          <h2 className="try-step-title">
            <span className="try-step-num">4</span> What do people come back for?
          </h2>
          <p className="try-step-lede">
            Nothing is pre-filled for your trade, and guessing would be worse than
            asking. Add the two or three things customers return for, and how often.
          </p>
          <ServiceEditor services={services} onChange={setServices} />
        </section>
      )}

      {result && (
        <section className="site-section site-section-tint try-results">
          <h2 className="try-step-title">Who owes you a visit</h2>

          <div className="try-summary">
            <div className="try-stat">
              <span className="try-stat-value">{result.reachable.length}</span>
              <span className="try-stat-label">you can message today</span>
            </div>
            <div className="try-stat">
              <span className="try-stat-value">{result.customers}</span>
              <span className="try-stat-label">customers in your book</span>
            </div>
            {result.potential > 0 && (
              <div className="try-stat">
                <span className="try-stat-value">
                  ₹{result.potential.toLocaleString('en-IN')}
                </span>
                <span className="try-stat-label">typical value if all of them book</span>
              </div>
            )}
          </div>

          {result.potential > 0 && (
            <p className="try-caveat">
              That assumes everyone says yes, which nobody does. Treat it as the
              ceiling, not a forecast — and it counts only the{' '}
              {result.reachable.length} you can actually reach.
            </p>
          )}

          {result.items.length === 0 && (
            <p className="try-empty">
              Nothing is overdue in what you pasted. That is a real answer, not an
              error — either the book is short, or your customers are already coming
              back on time.
            </p>
          )}

          {result.items.length > 0 && (
            <div className="try-table-wrap">
              <table className="try-table">
                <thead>
                  <tr>
                    <th>{preset.idIsRegistration ? 'Vehicle' : 'Customer'}</th>
                    <th>Name</th>
                    <th>Due for</th>
                    <th>Last done</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((item, i) => (
                    <tr key={`${item.vehicle}-${item.service.key}-${i}`}>
                      <td className="try-veh">{item.vehicleRaw || item.vehicle}</td>
                      <td>{item.customer || <em>not in book</em>}</td>
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
                          <span
                            className="try-nolink"
                            title={item.phone || 'no number in book'}
                          >
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
                {result.skipped.length} row{result.skipped.length === 1 ? '' : 's'}{' '}
                could not be read — {showSkipped ? 'hide' : 'show'}
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
                Worth a look. A row with no date or no name is invisible to any
                follow-up, including a person working through the book by hand.
              </p>
            </div>
          )}

          <details className="try-details try-template">
            <summary>Change the services, intervals or wording</summary>
            <ServiceEditor services={services} onChange={setServices} />
            <label className="try-field try-field-wide try-template-field">
              <span className="try-label">Message</span>
              <textarea
                className="try-textarea try-textarea-small"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                rows={3}
              />
            </label>
            <p className="try-note">
              name, subject, service, lastDone, monthsAgo and business are filled in
              per customer. Anything else in double braces is left visible, so a typo
              shows up here rather than in a message to a customer.
            </p>
          </details>
        </section>
      )}

      <section className="site-section try-next">
        <h2>What this is not doing</h2>
        <ul className="try-honest">
          <li>
            <strong>It is not sending anything.</strong> Each link opens WhatsApp with
            the message ready. You read it and press send. Genuinely automatic sending
            needs Meta&rsquo;s paid Business Platform, and most small businesses do
            not need it.
          </li>
          <li>
            <strong>It never suggests something they have not had.</strong> Only work
            that customer already paid for once. Anything else is a sales pitch
            wearing a reminder&rsquo;s clothes.
          </li>
          <li>
            <strong>It has not kept your data.</strong> No account, no upload, no
            database. Refresh the page and you start again.
          </li>
        </ul>

        <h2>If you want this running by itself</h2>
        <p className="site-lede">
          The same thing on your own Google Sheet, updating every morning without you
          pasting anything — that is the part I set up. It stays on free Google tools;
          there is no software subscription to me.
        </p>
        <EmailCta subject="Recall Engine — I tried it on my own list">
          Tell me what you saw
        </EmailCta>
        <p className="try-back">
          <Link to="/playbooks">← Back to the playbooks</Link>
        </p>
      </section>

      <SiteFooter />
    </div>
  );
}

/**
 * Editing what people come back for, and how often.
 *
 * Three fields and no more. The interval is the only number that really changes
 * the answer; price only affects a figure already labelled as a ceiling.
 */
function ServiceEditor({ services, onChange }) {
  const update = (i, patch) =>
    onChange(services.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const add = () =>
    onChange([
      ...services,
      {
        key: `custom_${Date.now()}`,
        label: '',
        matches: [],
        intervalMonths: 6,
        typicalPrice: 0,
      },
    ]);

  const remove = (i) => onChange(services.filter((_, idx) => idx !== i));

  return (
    <div className="try-services">
      {services.map((s, i) => (
        <div className="try-service-row" key={s.key}>
          <label className="try-service-field">
            <span className="try-label">Service</span>
            <input
              className="try-input"
              value={s.label}
              placeholder="e.g. wheel alignment"
              onChange={(e) =>
                update(i, {
                  label: e.target.value,
                  // What to look for in the book defaults to what they typed, which
                  // is right far more often than not.
                  matches: e.target.value.trim()
                    ? [e.target.value.trim().toLowerCase()]
                    : [],
                })
              }
            />
          </label>
          <label className="try-service-field try-service-narrow">
            <span className="try-label">Every (months)</span>
            <input
              className="try-input"
              type="number"
              min="1"
              max="120"
              value={s.intervalMonths}
              onChange={(e) => update(i, { intervalMonths: Number(e.target.value) || 1 })}
            />
          </label>
          <label className="try-service-field try-service-narrow">
            <span className="try-label">Typical ₹</span>
            <input
              className="try-input"
              type="number"
              min="0"
              value={s.typicalPrice || 0}
              onChange={(e) => update(i, { typicalPrice: Number(e.target.value) || 0 })}
            />
          </label>
          <button
            type="button"
            className="try-service-remove"
            onClick={() => remove(i)}
            aria-label={`Remove ${s.label || 'service'}`}
          >
            ×
          </button>
        </div>
      ))}
      <button type="button" className="try-service-add" onClick={add}>
        + Add a service
      </button>
    </div>
  );
}
