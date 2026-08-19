import { useState, useEffect } from 'react';

/**
 * Typing rows in by hand, as an alternative to pasting.
 *
 * Pasting stays the main path and must: a garage with three hundred job cards
 * cannot hand-type them, so replacing the paste box with a form would break the
 * tool for exactly the person it is for. But paste assumes a spreadsheet already
 * open, and plenty of visitors have a paper book, a phone, or simply want to try
 * three rows before trusting it with the real list.
 *
 * So this is a second door, not a replacement. It emits the same tab-separated
 * text the paste box takes, which means everything downstream — detection,
 * mapping, the engine — is identical and there is only one path to get wrong.
 *
 * Four columns, not five. Date, who, contact and what-they-had is the minimum
 * that produces a useful answer, and every extra field is another reason to give
 * up before finishing.
 */
export default function RecallRowEntry({ preset, onChange }) {
  const blank = () => ({ date: '', who: '', phone: '', what: '' });
  const [rows, setRows] = useState([blank(), blank(), blank()]);

  const labels = {
    date: 'Date',
    who: preset.idIsRegistration ? 'Vehicle' : 'Customer',
    phone: 'Phone',
    what: 'What they had',
  };

  // Emit whenever anything changes, dropping rows the person left empty rather
  // than making them tidy up after themselves.
  useEffect(() => {
    const TAB = String.fromCharCode(9);
    const NL = String.fromCharCode(10);
    const filled = rows.filter((r) => r.date.trim() || r.who.trim() || r.what.trim());

    if (filled.length === 0) {
      onChange('');
      return;
    }

    // A header line, so detection follows a stated intention instead of guessing
    // from values that can look like several things at once.
    // 'Service' rather than the friendlier on-screen label: this string is read
    // by the column detector, and it should be one the detector certainly knows
    // rather than the nicest phrasing.
    const header = ['Date', 'Customer', 'Phone', 'Service'].join(TAB);
    const body = filled.map((r) => [r.date, r.who, r.phone, r.what].join(TAB));
    onChange([header, ...body].join(NL));
  }, [rows, onChange]);

  const update = (i, field, value) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));

  const addRow = () => setRows((rs) => [...rs, blank()]);
  const removeRow = (i) => setRows((rs) => (rs.length > 1 ? rs.filter((_, idx) => idx !== i) : rs));

  return (
    <div className="try-entry">
      <div className="try-entry-head" aria-hidden="true">
        <span>{labels.date}</span>
        <span>{labels.who}</span>
        <span>{labels.phone}</span>
        <span>{labels.what}</span>
        <span />
      </div>

      {rows.map((r, i) => (
        <div className="try-entry-row" key={i}>
          <label className="try-entry-cell">
            <span className="try-entry-label">{labels.date}</span>
            <input
              className="try-input"
              value={r.date}
              onChange={(e) => update(i, 'date', e.target.value)}
              placeholder="12/08/2025"
              inputMode="numeric"
            />
          </label>
          <label className="try-entry-cell">
            <span className="try-entry-label">{labels.who}</span>
            <input
              className="try-input"
              value={r.who}
              onChange={(e) => update(i, 'who', e.target.value)}
              placeholder={preset.idIsRegistration ? 'UP 14 AB 1234' : 'Ramesh Kumar'}
            />
          </label>
          <label className="try-entry-cell">
            <span className="try-entry-label">{labels.phone}</span>
            <input
              className="try-input"
              value={r.phone}
              onChange={(e) => update(i, 'phone', e.target.value)}
              placeholder="98765 43210"
              inputMode="tel"
            />
          </label>
          <label className="try-entry-cell">
            <span className="try-entry-label">{labels.what}</span>
            <input
              className="try-input"
              value={r.what}
              onChange={(e) => update(i, 'what', e.target.value)}
              placeholder={preset.services[0]?.label || 'what you did'}
            />
          </label>
          <button
            type="button"
            className="try-entry-remove"
            onClick={() => removeRow(i)}
            aria-label={`Remove row ${i + 1}`}
            disabled={rows.length === 1}
          >
            ×
          </button>
        </div>
      ))}

      <button type="button" className="try-service-add" onClick={addRow}>
        + Add another row
      </button>

      <p className="try-note">
        One row per customer is enough. What matters is the date: a visit only
        counts as overdue once more time has passed than that service&rsquo;s
        interval — six months for an alignment, for example — so something from
        last week will not appear. Put in a few older dates to see it work.
      </p>
    </div>
  );
}
