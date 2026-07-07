/**
 * The Line's geometry — shared by the Path (the hilltop view) and by
 * Celebration (which draws the user's own ink back to them).
 * One route, several altitudes: the numbers must agree everywhere.
 */

import {
  todayISO, addDays, daysBetween, dayNumber, currentDose, projectFuture,
} from './model.js';

export const W = 360;                // viewBox width
export const X_ZERO = 46;            // where 0 mg lives
export const X_MAX = W - 92;         // where the starting dose lives
export const PPD_PAST = 1.55;        // px per day, past (ink is dense with life)
export const PPD_FUTURE = 0.62;      // px per day, future (a sketch, compressed)
export const TOP_PAD = 34;

export function buildGeometry(state) {
  const today = todayISO();
  const todayDay = dayNumber(state);
  const future = projectFuture(state);
  const startDose = state.events[0]?.dose ?? 1;

  const lastFutureISO = future.arrivalISO
    || (future.steps.length ? future.steps[future.steps.length - 1].date : addDays(today, 120));
  const futureDays = Math.max(60, daysBetween(today, lastFutureISO));

  const doseToX = (dose) => X_ZERO + (dose / startDose) * (X_MAX - X_ZERO);
  const dayToY = (day) =>
    day <= todayDay
      ? TOP_PAD + (day - 1) * PPD_PAST
      : TOP_PAD + (todayDay - 1) * PPD_PAST + (day - todayDay) * PPD_FUTURE;
  const isoToDay = (iso) => daysBetween(state.startDate, iso) + 1;
  const height = dayToY(todayDay + futureDays) + 120;
  const pastHeight = dayToY(todayDay) + 40;

  return { today, todayDay, future, doseToX, dayToY, isoToDay, height, pastHeight, startDose };
}

/** Dose on a given day, from the event record. */
export function doseOnDay(state, day) {
  let dose = state.events[0]?.dose ?? 0;
  for (const e of state.events) {
    const eDay = daysBetween(state.startDate, e.date) + 1;
    if (eDay <= day) dose = e.dose;
  }
  return dose;
}

export function inkPath(state, g) {
  const changes = state.events.filter((e, i) =>
    i === 0 || e.dose !== state.events[i - 1].dose);
  let d = '';
  let prevX = null;
  for (const e of changes) {
    const day = g.isoToDay(e.date);
    const x = g.doseToX(e.dose);
    const y = g.dayToY(day);
    if (prevX === null) d = `M ${x} ${y}`;
    else d += ` L ${prevX} ${y} L ${x} ${y}`;
    prevX = x;
  }
  d += ` L ${prevX} ${g.dayToY(g.todayDay)}`;
  return d;
}

export function pencilPath(state, g) {
  const nowX = g.doseToX(currentDose(state));
  let d = `M ${nowX} ${g.dayToY(g.todayDay)}`;
  let prevX = nowX;
  for (const s of g.future.steps) {
    const y = g.dayToY(g.isoToDay(s.date));
    const x = g.doseToX(s.dose);
    d += ` L ${prevX} ${y} L ${x} ${y}`;
    prevX = x;
  }
  const endISO = g.future.arrivalISO
    || (g.future.steps.length ? g.future.steps[g.future.steps.length - 1].date : g.today);
  d += ` L ${prevX} ${g.dayToY(g.isoToDay(endISO))}`;
  return d;
}

/** Runs of unmarked days (gaps) and stormy days (washes) in the ink. */
export function journalRuns(state, g) {
  const gaps = [];
  const storms = [];
  let run = null;
  for (let day = 1; day < g.todayDay; day++) {
    const iso = addDays(state.startDate, day - 1);
    const j = state.journal[iso];
    const kind = !j?.marked ? 'gap' : j.weather === 'stormy' || j.weather === 'foggy' ? 'storm' : null;
    if (kind && run && run.kind === kind) run.end = day;
    else {
      if (run && run.end - run.start >= 2) (run.kind === 'gap' ? gaps : storms).push(run);
      run = kind ? { kind, start: day, end: day } : null;
    }
  }
  if (run && run.end - run.start >= 2) (run.kind === 'gap' ? gaps : storms).push(run);
  return { gaps, storms };
}
