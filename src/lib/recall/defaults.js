/**
 * Sample books, one per trade.
 *
 * Deliberately messy, and that is the point: three date formats, inconsistent
 * spacing, a phone with a note beside it, a blank name, a row with no date and one
 * landline that cannot be messaged. A tidy sample demos beautifully and teaches an
 * owner nothing about their own book — the skipped rows are half the value.
 *
 * Each trade gets its own so a clinic owner is never shown number plates. Dates are
 * generated relative to today, so a sample written months ago is still meaningfully
 * overdue rather than quietly stale.
 */
import { PRESETS, DEFAULT_PRESET } from './presets.js';

const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function makeHelpers(now) {
  const ago = (months, days = 0) =>
    new Date(now.getFullYear(), now.getMonth() - months, now.getDate() - days);
  return {
    dmy: (m, d = 0) => { const x = ago(m, d); return `${x.getDate()}/${x.getMonth() + 1}/${x.getFullYear()}`; },
    dot: (m, d = 0) => { const x = ago(m, d); return `${x.getDate()}.${x.getMonth() + 1}.${String(x.getFullYear()).slice(2)}`; },
    nam: (m, d = 0) => { const x = ago(m, d); return `${x.getDate()} ${M[x.getMonth()]} ${x.getFullYear()}`; },
  };
}

const BUILDERS = {
  tyre_garage: (h) => [
    ['Date', 'Vehicle', 'Customer', 'Phone', 'Work done'],
    [h.dmy(14), 'UP 14 AB 1234', 'Ramesh Kumar', '98765 43210', 'alignment, balancing'],
    [h.dmy(13), 'DL 3C AY 9012', 'Sunita Devi', '+91-99887-76655', 'alignment'],
    [h.dot(11), 'up14ab1234', 'Ramesh Kumar', '9876543210', 'puncture'],
    [h.nam(9), 'HR 26 DK 8888', '', '9123456780 (son)', 'new tyres, alignment'],
    [h.dmy(8), 'UP-16-BC-4321', 'Imran Sheikh', '98111 22233', 'balancing'],
    [h.dmy(7), 'DL 8C AA 1111', 'Priya Nair', '0120-2345678', 'alignment, rotation'],
    [h.dmy(7, 10), 'MH 12 XY 5555', 'Arjun Patil', '9765432109', 'rotation'],
    [h.dot(5), 'UP 14 AB 1234', 'Ramesh Kumar', '98765 43210', 'oil change'],
    ['', 'RJ 14 CD 7777', 'Vikram Singh', '9812345678', 'alignment'],
    [h.dmy(2), 'HR 26 DK 8888', 'Neha Gupta', '9123456780', 'balancing'],
  ],

  dental_clinic: (h) => [
    ['Patient', 'File No', 'Visit date', 'Treatment', 'Mobile'],
    ['Asha Rao', 'F-102', h.dmy(14), 'scaling and cleaning', '9876543210'],
    ['Imran Qureshi', 'F-118', h.dmy(13), 'routine check-up', '98111 22233'],
    ['Asha Rao', 'F-102', h.dot(11), 'filling', '9876543210'],
    ['Meera Joshi', 'F-131', h.nam(9), 'scaling and cleaning', '9911223344 (husband)'],
    ['', 'F-144', h.dmy(8), 'dental X-ray', '9765432109'],
    ['Kabir Shah', 'F-150', h.dmy(7), 'routine check-up', '011-40506070'],
    ['Meera Joshi', 'F-131', h.dmy(2), 'consultation', '9911223344'],
    ['Rhea Das', 'F-162', '', 'scaling', '9876501234'],
  ],

  salon: (h) => [
    ['Bill No', 'Client', 'Phone', 'Date', 'Service', 'Amount', 'Staff'],
    ['881', 'Priya Menon', '9812345678', h.dmy(7), 'hair colour', '2500', 'Ritu'],
    ['902', 'Sneha Kulkarni', '98765 43210', h.dmy(6), 'facial', '1500', 'Anjali'],
    ['915', 'Priya Menon', '9812345678', h.dot(4), 'hair spa', '1200', 'Ritu'],
    ['931', 'Farah Khan', '+91-99887-76655', h.nam(4), 'keratin', '5000', 'Ritu'],
    ['944', '', '9123456780', h.dmy(3), 'facial', '1500', 'Anjali'],
    ['958', 'Divya Iyer', '022-24445555', h.dmy(3), 'hair colour', '2500', 'Ritu'],
    ['970', 'Sneha Kulkarni', '9876543210', '', 'clean up', '900', 'Anjali'],
  ],

  ac_servicing: (h) => [
    ['Date', 'Customer', 'Address', 'Contact', 'Work done'],
    [h.dmy(14), 'Meera Joshi', 'B-42 Sector 15', '9911223344', 'AC service'],
    [h.dmy(13), 'Rakesh Yadav', 'C-8 Green Park', '98765 43210', 'gas refill, service'],
    [h.dot(11), 'Meera Joshi', 'B-42 Sector 15', '9911223344', 'filter cleaning'],
    [h.nam(9), 'Sana Sheikh', 'D-19 Model Town', '9123456780 (office)', 'AMC renewal'],
    [h.dmy(8), '', 'A-3 Rohini', '9765432109', 'AC service'],
    [h.dmy(7), 'Vikram Singh', 'E-77 Dwarka', '011-27778888', 'AC service'],
    ['', 'Nisha Bhatt', 'F-12 Saket', '9812345678', 'gas refill'],
  ],

  physiotherapy: (h) => [
    ['Date', 'Patient', 'Session', 'Contact'],
    [h.dmy(9), 'Kabir Shah', 'therapy session', '9876543210'],
    [h.dmy(8), 'Anita Menon', 'follow-up review', '98111 22233'],
    [h.dot(6), 'Kabir Shah', 'therapy session', '9876543210'],
    [h.nam(5), 'Rohit Sharma', 'follow-up review', '9123456780 (wife)'],
    [h.dmy(4), '', 'therapy session', '9765432109'],
    [h.dmy(4), 'Leela Nair', 'follow-up review', '044-28889999'],
    ['', 'Anita Menon', 'therapy session', '9811122233'],
  ],
};

/** A pasteable sample for the given trade, tab-separated as a spreadsheet copy is. */
// Built from char codes rather than escape sequences: this file is generated, and
// a mangled 	 once produced a real tab inside a string literal and a syntax error.
const TAB = String.fromCharCode(9);
const NEWLINE = String.fromCharCode(10);
const joinCells = (r) => r.join(TAB);

export function sampleFor(presetKey, now = new Date()) {
  const build = BUILDERS[presetKey] || BUILDERS[DEFAULT_PRESET];
  return build(makeHelpers(now)).map(joinCells).join(NEWLINE);
}

/** Re-exported so callers need only this module. */
export const DEFAULT_SERVICES = PRESETS[DEFAULT_PRESET].services;
export const DEFAULT_TEMPLATE = PRESETS[DEFAULT_PRESET].template;
export const DEFAULT_BUSINESS = PRESETS[DEFAULT_PRESET].business;
