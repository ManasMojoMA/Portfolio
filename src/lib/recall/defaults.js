/**
 * Defaults for the try-it page: the service rules a tyre garage would start with,
 * and a sample job book for anyone who wants to see it work before pasting their own.
 *
 * These mirror clients/example.json in the platform. Everything here is CONFIG, not
 * code — a dental clinic runs the same engine with different labels and intervals,
 * which is the argument the playbook makes and this page demonstrates.
 */

export const DEFAULT_SERVICES = [
  { key: 'alignment', label: 'wheel alignment', matches: ['alignment', 'align'], intervalMonths: 6, typicalPrice: 400 },
  { key: 'balancing', label: 'wheel balancing', matches: ['balancing', 'balance'], intervalMonths: 6, typicalPrice: 200 },
  { key: 'rotation', label: 'tyre rotation', matches: ['rotation', 'rotate'], intervalMonths: 6, typicalPrice: 300 },
  { key: 'tyres', label: 'new tyres', matches: ['tyre', 'tire'], intervalMonths: 36, typicalPrice: 9000 },
];

export const DEFAULT_TEMPLATE =
  'Namaste {{name}} ji, your {{vehicle}} is due for {{service}} — last done {{lastDone}}. Shall we book you in this week? — {{business}}';

export const DEFAULT_BUSINESS = 'Sharma Tyre House';

/**
 * A sample book, written the way one actually is.
 *
 * Deliberately messy: dates in three formats, registrations spaced inconsistently,
 * a phone number with a note beside it, a blank customer name, a row with no date at
 * all, and one landline that cannot be messaged. A tidy sample would demo beautifully
 * and teach a garage owner nothing about their own book — the skipped rows are half
 * the value of the output.
 *
 * Dates are generated relative to today so the sample is always meaningfully overdue,
 * rather than going stale a few months after this was written.
 */
export function buildSampleRows(now = new Date()) {
  const ago = (months, days = 0) => {
    const d = new Date(now.getFullYear(), now.getMonth() - months, now.getDate() - days);
    return d;
  };
  const dmy = (d) => `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  const dotted = (d) => `${d.getDate()}.${d.getMonth() + 1}.${String(d.getFullYear()).slice(2)}`;
  const named = (d) => {
    const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear()}`;
  };

  return [
    [dmy(ago(14)),     'UP 14 AB 1234', 'Ramesh Kumar',  '98765 43210',        'alignment, balancing'],
    [dmy(ago(13)),     'DL 3C AY 9012', 'Sunita Devi',   '+91-99887-76655',    'alignment'],
    [dotted(ago(11)),  'up14ab1234',    'Ramesh Kumar',  '9876543210',         'puncture'],
    [named(ago(9)),    'HR 26 DK 8888', '',              '9123456780 (son)',   'new tyres, alignment'],
    [dmy(ago(8)),      'UP-16-BC-4321', 'Imran Sheikh',  '98111 22233',        'balancing'],
    [dmy(ago(7)),      'DL 8C AA 1111', 'Priya Nair',    '0120-2345678',       'alignment, rotation'],
    [dmy(ago(7, 10)),  'MH 12 XY 5555', 'Arjun Patil',   '9765432109',         'rotation'],
    [dotted(ago(5)),   'UP 14 AB 1234', 'Ramesh Kumar',  '98765 43210',        'oil change'],
    [dmy(ago(4)),      'DL 3C AY 9012', 'Sunita Devi',   '9988776655',         'puncture repair'],
    ['',               'RJ 14 CD 7777', 'Vikram Singh',  '9812345678',         'alignment'],
    [dmy(ago(2)),      'HR 26 DK 8888', 'Neha Gupta',    '9123456780',         'balancing'],
    [dmy(ago(1)),      'MH 12 XY 5555', 'Arjun Patil',   '9765432109',         'puncture'],
  ];
}

/** The sample as pasteable text, so the textarea and the parser see the same thing. */
export function sampleAsText(now = new Date()) {
  return buildSampleRows(now).map((r) => r.join('\t')).join('\n');
}
