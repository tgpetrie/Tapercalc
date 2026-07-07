/**
 * Compass model — one object: the route through time.
 *
 * The past is an append-only list of events (ink).
 * The future is derived, every time, from the current dose + strategy (pencil).
 * The journal is the daily record: marks, weather, notes.
 *
 * Nothing in here ever says "failed", "missed", or "off track".
 */

import { generateSchedule } from '../utils/taperEngine.js';

// ── Design dials ────────────────────────────────────────────────────────────
// The few numbers that define how Compass feels in the hand.
// Tune these before anything else.
export const DIALS = {
  DAYMARK_HOLD_MS: 900,          // how long the press-and-hold takes to seal the day
  WEATHER_WORDS: ['clear', 'unsettled', 'foggy', 'stormy'],
  STORMY_RUN_LENGTH: 3,          // consecutive stormy days before the one quiet sentence
  GAP_SENTENCE_AFTER_DAYS: 4,    // unmarked days before "Welcome back."
  ARRIVAL_DOSE: 0.15,            // mg below which we consider the descent arrived
};

const STORAGE_KEY = 'compass.route.v1';
const MS_DAY = 24 * 60 * 60 * 1000;

// ── Dates ───────────────────────────────────────────────────────────────────

export function toISO(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function todayISO() {
  return toISO(new Date());
}

export function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  return toISO(new Date(y, m - 1, d + n));
}

export function daysBetween(isoA, isoB) {
  const [y1, m1, d1] = isoA.split('-').map(Number);
  const [y2, m2, d2] = isoB.split('-').map(Number);
  return Math.round((new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1)) / MS_DAY);
}

export function weekdayName(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long' });
}

export function prettyDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

/** Dates are seasons until they're close. */
export function seasonOf(iso) {
  const [y, m] = iso.split('-').map(Number);
  const season =
    m <= 2 || m === 12 ? 'winter'
    : m <= 5 ? 'spring'
    : m <= 8 ? 'summer'
    : 'autumn';
  const year = m === 12 ? y + 1 : y;
  return `${season} ${year}`;
}

export function fmtDose(mg) {
  if (mg == null) return '';
  const rounded = Math.round(mg * 100) / 100;
  return `${rounded} mg`;
}

// ── Seed: a lived-in demo route (214 days of ink) ──────────────────────────
// Replaced by the user's real record the moment they use the app.

function seedState() {
  const today = todayISO();
  const startDate = addDays(today, -213); // today is Day 214

  const events = [
    { day: 1,   dose: 10,  kind: 'start',  note: 'Set out at 10 mg.' },
    { day: 22,  dose: 9,   kind: 'step' },
    { day: 43,  dose: 8.1, kind: 'step' },
    { day: 62,  dose: 8.1, kind: 'hold', lengthDays: 21, note: 'Held three weeks to let things settle.' },
    { day: 83,  dose: 7.3, kind: 'step' },
    { day: 110, dose: 8,   kind: 'updose', note: 'Stepped back up to steady things.' },
    { day: 138, dose: 7.2, kind: 'step' },
    { day: 159, dose: 6.6, kind: 'step' },
    { day: 180, dose: 6,   kind: 'step' },
    { day: 207, dose: 6,   kind: 'hold', lengthDays: 14, note: 'Rest point before the next step.' },
  ].map(e => ({ ...e, date: addDays(startDate, e.day - 1) }));

  // Journal: most days marked, honest weather, one unremarked gap.
  const journal = {};
  for (let day = 1; day <= 213; day++) {
    if (day >= 96 && day <= 104) continue; // nine unmarked days. a gap, not a verdict.
    const date = addDays(startDate, day - 1);
    let weather = null;
    const r = ((day * 2654435761) % 97) / 97; // deterministic, no deps
    if (day >= 106 && day <= 118) {
      weather = r < 0.6 ? 'stormy' : 'foggy';          // the rough stretch after the updose
    } else if (day >= 84 && day <= 95) {
      weather = r < 0.5 ? 'foggy' : 'unsettled';
    } else if (r < 0.55) {
      weather = 'clear';
    } else if (r < 0.75) {
      weather = 'unsettled';
    }
    journal[date] = { marked: true, ...(weather ? { weather } : {}) };
  }
  journal[addDays(startDate, 104)] = { marked: true, note: 'Back. One day at a time.' };

  return {
    version: 1,
    medication: 'Diazepam',
    unit: 'mg',
    startDate,
    events,
    journal,
    strategy: { id: 'hyperbolic', percent: 9, intervalDays: 21 },
    reminderHour: 20,
    theme: 'paper',
    routeHistory: [], // roads not taken, kept quietly
    // milestones already honored along the way; walked-200 is close —
    // the demo's next mark will bring it
    celebrated: ['walked-30', 'walked-100', 'descent-75'],
  };
}

// ── Persistence ─────────────────────────────────────────────────────────────

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* fall through to a fresh seed */ }
  const state = seedState();
  saveState(state);
  return state;
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* storage unavailable — Compass still works for the session */ }
}

export function eraseAll() {
  localStorage.removeItem(STORAGE_KEY);
}

// ── Derived: where am I? ────────────────────────────────────────────────────

export function currentDose(state, onISO = todayISO()) {
  let dose = state.events[0]?.dose ?? 0;
  for (const e of state.events) {
    if (daysBetween(e.date, onISO) >= 0) dose = e.dose;
  }
  return dose;
}

export function dayNumber(state, onISO = todayISO()) {
  return daysBetween(state.startDate, onISO) + 1;
}

/** The hold we are currently inside, if any. */
export function activeHold(state, onISO = todayISO()) {
  for (const e of state.events) {
    if (e.kind !== 'hold') continue;
    const since = daysBetween(e.date, onISO);
    if (since >= 0 && since < e.lengthDays) {
      return { ...e, endsOn: addDays(e.date, e.lengthDays) };
    }
  }
  return null;
}

/**
 * The pencil: future dose-change points derived from the current dose
 * and strategy via the taper engine. Recomputed every time — the future
 * is always a sketch, never a record.
 */
export function projectFuture(state, fromISO = todayISO(), strategyOverride = null) {
  const strat = strategyOverride || state.strategy;
  const hold = activeHold(state, fromISO);
  const projectionStart = hold ? hold.endsOn : fromISO;
  const dose = currentDose(state, fromISO);
  if (dose <= DIALS.ARRIVAL_DOSE) {
    return { steps: [], arrivalISO: fromISO, projectionStart, reductionsRemaining: 0 };
  }

  const schedule = generateSchedule({
    doses: [{ tabletMg: dose, liquidMl: 0, mgPerMl: 0 }],
    targetDose: 0,
    strategy: strat.id,
    frequency: 'custom',
    customInterval: strat.intervalDays,
    reductionAmount: strat.amount || 0,
    reductionPercent: strat.percent || 0,
    cutStrategy: 'firstFirst',
    startDate: projectionStart,
    maxDays: 1460,
  });

  const steps = [];
  let arrivalISO = null;
  for (const row of schedule) {
    if (row.dailyReduction > 0) {
      steps.push({ date: row.date, dose: row.totalDailyDose });
    }
    if (arrivalISO === null && row.totalDailyDose <= DIALS.ARRIVAL_DOSE) {
      arrivalISO = row.date;
    }
  }
  // Hyperbolic descents approach zero asymptotically; if the engine's horizon
  // ran out before ARRIVAL_DOSE, the honest answer is "beyond the horizon".
  const meaningfulSteps = arrivalISO
    ? steps.filter(s => daysBetween(s.date, arrivalISO) >= 0)
    : steps;
  return {
    steps: meaningfulSteps,
    arrivalISO,
    projectionStart,
    reductionsRemaining: meaningfulSteps.length,
    horizonExceeded: arrivalISO === null,
  };
}

/** The next thing that changes, as a plain fact. */
export function nextChange(state, onISO = todayISO()) {
  const hold = activeHold(state, onISO);
  const future = projectFuture(state, onISO);
  if (hold) {
    const first = future.steps[0];
    return {
      kind: 'stepAfterHold',
      date: hold.endsOn,
      dose: first ? first.dose : currentDose(state, onISO),
    };
  }
  const first = future.steps[0];
  if (!first) return null;
  return { kind: 'step', date: first.date, dose: first.dose };
}

// ── Derived: continuity & weather ───────────────────────────────────────────

export function daysWalked(state) {
  return Object.values(state.journal).filter(j => j.marked).length;
}

export function lastMarkedISO(state) {
  const dates = Object.keys(state.journal).filter(d => state.journal[d].marked).sort();
  return dates[dates.length - 1] || null;
}

/** Unmarked days between the last mark and today (today excluded). */
export function gapLength(state, onISO = todayISO()) {
  const last = lastMarkedISO(state);
  if (!last) return 0;
  return Math.max(0, daysBetween(last, onISO) - 1);
}

export function stormyRun(state, onISO = todayISO()) {
  let run = 0;
  for (let i = 1; i <= 14; i++) {
    const j = state.journal[addDays(onISO, -i)];
    if (j?.weather === 'stormy') run++;
    else if (j?.marked) break;
  }
  const today = state.journal[onISO];
  if (today?.weather === 'stormy') run++;
  return run;
}

/**
 * Retell a stretch of days as one plain sentence, for the Path caption.
 * The past retold as language, not data points.
 */
export function weatherSentence(state, aroundISO) {
  const words = [];
  for (let i = -3; i <= 3; i++) {
    const j = state.journal[addDays(aroundISO, i)];
    if (j?.weather) words.push(j.weather);
  }
  if (words.length === 0) return '';
  const count = w => words.filter(x => x === w).length;
  const stormy = count('stormy'), foggy = count('foggy'), clear = count('clear');
  if (stormy >= 3) return 'A stormy stretch.';
  if (stormy > 0) return 'Some storms in the mix.';
  if (foggy >= 3) return words[words.length - 1] === 'clear' ? 'A foggy week, then it cleared.' : 'A foggy week.';
  if (foggy > 0) return 'A little fog, mostly steady.';
  if (clear >= 4) return 'A clear stretch.';
  return 'Mostly steady.';
}

// ── Milestones — continuity honored, never adherence graded ────────────────
// A milestone can only ever be reached, never lost. Three kinds:
//   walked-N     : N days marked in your own hand
//   descent-F    : dose crossed below F% of where you began
//   anniversary-Y: Y full years on the path
// Ordered by significance; when several arrive at once, the greatest speaks.

const WALKED_MARKS = [30, 100, 200, 300, 500, 730, 1000, 1500];
const DESCENT_MARKS = [75, 50, 25, 10];   // % of starting dose crossed below
const ANNIVERSARY_MARKS = [1, 2, 3, 4, 5];

export const MILESTONE_ORDER = [
  ...WALKED_MARKS.map(n => `walked-${n}`),
  ...DESCENT_MARKS.map(f => `descent-${f}`),
  ...ANNIVERSARY_MARKS.map(y => `anniversary-${y}`),
];

export function earnedMilestones(state, onISO = todayISO()) {
  const earned = [];
  const walked = daysWalked(state);
  for (const n of WALKED_MARKS) if (walked >= n) earned.push(`walked-${n}`);
  const startDose = state.events[0]?.dose ?? 0;
  const dose = currentDose(state, onISO);
  if (startDose > 0) {
    for (const f of DESCENT_MARKS) {
      if (dose / startDose <= f / 100) earned.push(`descent-${f}`);
    }
  }
  const years = Math.floor((daysBetween(state.startDate, onISO) + 1) / 365);
  for (const y of ANNIVERSARY_MARKS) if (years >= y) earned.push(`anniversary-${y}`);
  return earned;
}

/**
 * After a mark: which milestones arrived today?
 * Returns the updated state and the single most significant new arrival.
 */
export function claimMilestones(state, onISO = todayISO()) {
  const celebrated = state.celebrated || [];
  const earned = earnedMilestones(state, onISO);
  const newly = earned.filter(id => !celebrated.includes(id));
  if (newly.length === 0) return { state, milestone: null };
  newly.sort((a, b) => MILESTONE_ORDER.indexOf(a) - MILESTONE_ORDER.indexOf(b));
  return {
    state: { ...state, celebrated: [...celebrated, ...newly] },
    milestone: newly[newly.length - 1],
  };
}

/** The sentence a milestone speaks — one line, in the app's own voice. */
export function milestonePhrase(id, state) {
  const phrases = {
    'walked-30': 'Thirty days, marked in your own hand.',
    'walked-100': 'One hundred days of ink.',
    'walked-200': 'Two hundred days, marked in your own hand.',
    'walked-300': 'Three hundred days of ink.',
    'walked-500': 'Five hundred days, in your own hand.',
    'walked-730': 'Two years of days, witnessed.',
    'walked-1000': 'One thousand days of ink.',
    'walked-1500': 'Fifteen hundred days, in your own hand.',
    'descent-75': 'A quarter of the descent, behind you.',
    'descent-50': 'Below half of where you began.',
    'descent-25': 'Three quarters of the way down.',
    'descent-10': 'Within sight of the valley floor.',
    'anniversary-1': 'One full year on the path.',
    'anniversary-2': 'Two years on the path.',
    'anniversary-3': 'Three years on the path.',
    'anniversary-4': 'Four years on the path.',
    'anniversary-5': 'Five years on the path.',
  };
  return phrases[id] || `Day ${dayNumber(state)}.`;
}

/**
 * The quiet facts beneath the phrase — composed from this user's own
 * record, so no two people ever see the same celebration.
 */
export function personalFacts(state) {
  const facts = [];
  const startDose = state.events[0]?.dose ?? 0;
  const delta = Math.round((startDose - currentDose(state)) * 100) / 100;
  if (delta > 0) facts.push(`${delta} mg lighter than the day you set out`);
  const storms = Object.values(state.journal).filter(j => j.weather === 'stormy').length;
  if (storms > 0) facts.push(`${storms} stormy days, outlasted`);
  const holds = state.events.filter(e => e.kind === 'hold').length;
  if (holds > 0) facts.push(`${holds} rest ${holds === 1 ? 'point' : 'points'}, honored`);
  return facts.slice(0, 3);
}

// ── Actions ─────────────────────────────────────────────────────────────────

export function markDay(state, iso = todayISO()) {
  const journal = { ...state.journal, [iso]: { ...(state.journal[iso] || {}), marked: true } };
  return { ...state, journal };
}

export function setWeather(state, weather, iso = todayISO()) {
  const prev = state.journal[iso] || {};
  const journal = { ...state.journal, [iso]: { ...prev, weather } };
  return { ...state, journal };
}

export function setNote(state, note, iso = todayISO()) {
  const prev = state.journal[iso] || {};
  const journal = { ...state.journal, [iso]: { ...prev, note } };
  return { ...state, journal };
}

/** Commit a redrawn route. The old pencil is kept, quietly. */
export function commitStrategy(state, strategy) {
  return {
    ...state,
    routeHistory: [
      ...state.routeHistory,
      { retiredOn: todayISO(), strategy: state.strategy },
    ],
    strategy,
  };
}

export function exportEverything(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `compass-record-${todayISO()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
