/**
 * Turning a pasted block into rows.
 *
 * A garage owner copying from Google Sheets or Excel produces tab-separated text.
 * Someone exporting a CSV produces commas. Someone typing by hand produces neither
 * consistently. This accepts all three rather than telling them their input is wrong,
 * because "your format is wrong" is exactly the moment a sceptical owner gives up.
 */

/** Split one line into cells, honouring quoted commas in CSV. */
function splitLine(line, delimiter) {
  if (delimiter === '\t') return line.split('\t');

  const cells = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      // A doubled quote inside a quoted field is a literal quote.
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      cells.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current);
  return cells;
}

/** Does this row look like a header rather than a job? */
function looksLikeHeader(cells) {
  const joined = cells.join(' ').toLowerCase();
  return /date/.test(joined) && /(vehicle|reg|car|number)/.test(joined);
}

/**
 * Parse pasted text into rows of cells.
 * Returns the rows plus whether a header line was dropped, so the UI can say so —
 * silently eating someone's first row of real data would be worse than an error.
 */
export function parsePasted(text) {
  const lines = String(text ?? '')
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0);

  if (lines.length === 0) return { rows: [], headerDropped: false };

  // Tabs win when present: a spreadsheet paste is tab-separated, and addresses or
  // service lists inside it often contain commas of their own.
  const delimiter = lines[0].includes('\t') ? '\t' : ',';

  let rows = lines.map((l) => splitLine(l, delimiter).map((c) => c.trim()));

  let headerDropped = false;
  if (rows.length > 1 && looksLikeHeader(rows[0])) {
    rows = rows.slice(1);
    headerDropped = true;
  }

  return { rows, headerDropped };
}
