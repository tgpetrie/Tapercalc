/**
 * route.js — the taper domain. What Compass understands about tapering.
 *
 * This app is not a dose countdown. A route through a taper is a shape
 * drawn over time, and that shape can include reductions, holds, rest
 * points, pauses, corrections, and redraws. The words below are the
 * app's working vocabulary; every screen should speak this language.
 *
 * ── The glossary ──────────────────────────────────────────────────────────
 *
 * CURRENT DOSE   — what the person is actually taking now. The only dose
 *                  the future is ever drawn from.
 * STARTING DOSE  — where this route began. Context for how far someone has
 *                  come; never a stick to measure them against.
 * TARGET DOSE    — where this route is headed. Often zero, but a partial
 *                  target (28 mg down to 24 mg) is a complete route too.
 *
 * CUT            — one planned decrease. Cuts can be a fixed amount
 *                  (linear), a share of the current dose (percentage),
 *                  or drawn on a gentle curve (see shapes below).
 * HOLD           — the dose stays level for a stretch. A hold is not a
 *                  failure. A hold is part of the route, and the line
 *                  shows it as an intentional flat section.
 * REST POINT     — a hold that was planned in advance: reduce for a few
 *                  cuts, then stop and let things settle. Rest points are
 *                  designed places to stabilize, not setbacks.
 * PAUSE          — an unplanned hold. Something came up; reductions stop
 *                  until the person chooses to resume. The route waits
 *                  without judgment.
 * UPDOSE         — a step back up after a hard stretch. Recorded as part
 *                  of the route's history in plain words, never as a
 *                  relapse or a failure.
 *
 * STORM DAY      — a hard day, recorded in the journal. Storms are
 *                  context, not commands: they never change the route by
 *                  themselves.
 * DAILY MARK     — "this day was recorded." It does not mean perfect
 *                  adherence, and a missed mark is silence, not censure.
 *
 * RECALCULATE FROM TODAY — when the route changes, the past is preserved
 *                  exactly as it was walked; only the road ahead is
 *                  redrawn, always starting from the current dose.
 *
 * ── Route shapes ──────────────────────────────────────────────────────────
 *
 * LINEAR         — the same absolute amount comes off each time.
 *                  28 → 27.5 → 27 → 26.5. Predictable; the steps feel
 *                  relatively bigger as the dose gets lower.
 * PERCENT        — each cut is a share of the *current* dose, so cuts
 *                  shrink as the dose shrinks. 2% of 28 mg is 0.56 mg;
 *                  2% of 27.44 mg is a little less.
 * GENTLE         — a deliberately soft curve chosen by pace rather than
 *                  arithmetic: the lower the dose gets, the smaller the
 *                  steps become, down to a minimum step size. This is a
 *                  route shape option, not a medical claim.
 *
 * DISTRIBUTION   — how a cut lands on the calendar:
 *                  'step'  — the whole cut at once, then level until the
 *                            next one (a step taper).
 *                  'micro' — the same overall pace spread into small
 *                            weekly slices (a microtaper). Nothing about
 *                            the destination changes; the stairs become
 *                            a ramp.
 *
 * Everything this module produces is a DRAFT ROUTE — a shape to look at
 * and to review with a prescriber or care team. It is never advice.
 */

const MS_DAY = 24 * 60 * 60 * 1000;
const HORIZON_DAYS = 1460; // four years — beyond this, honesty says "beyond the horizon"

const round2 = (n) => Math.round(n * 100) / 100;

function shiftISO(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date(y, m - 1, d + n);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

/** The gentle curve's paces, in plain words. A pace is a starting share
 *  of the current dose; the curve does the shrinking from there. */
export const GENTLE_PACES = {
  verySlow: { label: 'very slow', percent: 3 },
  slow: { label: 'slow', percent: 5 },
  moderate: { label: 'moderate', percent: 8 },
};

/** A complete strategy, with every dial at a sane default. */
export const STRATEGY_DEFAULTS = {
  shape: 'percent',        // 'linear' | 'percent' | 'gentle'
  percent: 9,              // percent shape: share of current dose per cut
  amount: 0.5,             // linear shape: mg per cut
  pace: 'slow',            // gentle shape: which curve
  minCut: 0.1,             // gentle shape: the smallest step it will draw (mg)
  intervalDays: 21,        // the rhythm: days between cuts
  distribution: 'step',    // 'step' | 'micro'
  restEvery: 0,            // planned rest point after every N cuts (0 = none)
  restLengthDays: 28,      // how long each planned rest runs
  initialHoldDays: 0,      // hold-first: stay level this long before the first cut
  targetDose: 0,           // where this route ends (0 = all the way down)
};

/** Older strategies ({id, percent, intervalDays}) become full ones.
 *  History is data; we read it, we never rewrite it. */
export function normalizeStrategy(s = {}) {
  const shape = s.shape || (s.id === 'linear' ? 'linear' : 'percent');
  return { ...STRATEGY_DEFAULTS, ...s, shape };
}

/** How much the next cut takes, given where the dose stands now. */
function nextCut(dose, strat, floor) {
  let cut;
  if (strat.shape === 'linear') {
    cut = strat.amount;
  } else if (strat.shape === 'gentle') {
    const pace = GENTLE_PACES[strat.pace] || GENTLE_PACES.slow;
    // the curve: a share of the current dose, but never below the minimum
    // step — that's what keeps a gentle route from stretching forever
    cut = Math.max(dose * (pace.percent / 100), strat.minCut || 0.05);
  } else {
    cut = dose * ((strat.percent || 0) / 100);
  }
  // the last step lands exactly on the target, never below it
  return round2(Math.min(cut, dose - floor));
}

/**
 * Draw the road ahead: from a dose, along a strategy, starting on a date.
 * The past is never an input here — that is the point. Recalculation from
 * today falls out of the design: call this again, from wherever you are.
 *
 * Returns { steps: [{date, dose}], arrivalISO, reductions, horizonExceeded }
 * where `reductions` counts cuts (a micro-sliced cut is still one cut).
 */
export function projectRoute(fromDose, strategy, startISO, floorOverride = null) {
  const strat = normalizeStrategy(strategy);
  const floor = floorOverride ?? Math.max(strat.targetDose || 0, 0);

  const steps = [];
  let dose = fromDose;
  let day = strat.initialHoldDays || 0; // hold-first: the line runs flat before it bends
  let cuts = 0;
  let arrivalISO = null;

  while (dose > floor + 1e-9 && day <= HORIZON_DAYS) {
    const cut = nextCut(dose, strat, floor);
    if (cut <= 0) break;

    if (strat.distribution === 'micro') {
      // a microtaper: the same cut, spread into weekly slices — the pace
      // is unchanged, the stairs become a ramp
      const slices = Math.max(1, Math.round(strat.intervalDays / 7));
      const per = cut / slices;
      for (let i = 0; i < slices; i++) {
        day += strat.intervalDays / slices;
        dose = round2(Math.max(dose - per, floor));
        steps.push({ date: shiftISO(startISO, Math.round(day)), dose });
        if (dose <= floor + 1e-9) break;
      }
    } else {
      day += strat.intervalDays;
      dose = round2(Math.max(dose - cut, floor));
      steps.push({ date: shiftISO(startISO, day), dose });
    }

    cuts += 1;
    if (dose <= floor + 1e-9) {
      arrivalISO = steps[steps.length - 1].date;
      break;
    }
    // a planned rest point: after every Nth cut, the route deliberately
    // stays level for a while — designed stabilization, drawn flat
    if (strat.restEvery > 0 && cuts % strat.restEvery === 0) {
      day += strat.restLengthDays || 28;
    }
  }

  return {
    steps,
    arrivalISO,
    reductions: cuts,
    horizonExceeded: arrivalISO === null && steps.length > 0,
  };
}

/** The rest-point rhythm as one plain sentence, or nothing. */
export function restSentence(strategy) {
  const s = normalizeStrategy(strategy);
  const parts = [];
  if (s.initialHoldDays > 0) {
    parts.push(`Holds level for ${Math.round(s.initialHoldDays / 7)} weeks before the first step.`);
  }
  if (s.restEvery > 0) {
    parts.push(`A planned rest point every ${s.restEvery} cuts, ${Math.round(s.restLengthDays / 7)} weeks each.`);
  }
  return parts.join(' ');
}

/** One route shape, described the way Compass talks. */
export function shapeSentence(strategy) {
  const s = normalizeStrategy(strategy);
  if (s.shape === 'linear') return 'The same amount comes off each time.';
  if (s.shape === 'gentle') return 'A gentle curve — the lower the dose gets, the smaller the steps become.';
  return 'Each cut is a share of the current dose, so the cuts shrink as you descend.';
}
