import React, { useMemo, useState } from 'react';
import {
  projectFuture, seasonOf, fmtDose, currentDose, prettyDate,
  paceSentence, firstCutOf, doseParts, todayISO, nextChange, activeHold,
} from './model.js';
import { normalizeStrategy, GENTLE_PACES, restSentence, shapeSentence } from './route.js';
import RouteHelper from './RouteHelper.jsx';

/**
 * The Map Table — the Plan tab. Not settings; the map room.
 * Three layers, in reading order:
 *   1. Current route — the road being walked. Visibly the active plan.
 *   2. Draft changes — a workshop. Nothing here is live until committed.
 *   3. Route options — other shapes for the same road, none of them ranked.
 * The spine: current → draft → compare → review → commit.
 */

const SCHEDULES = [
  { id: 'morning', times: ['morning'], label: 'once, in the morning' },
  { id: 'split', times: ['morning', 'evening'], label: 'morning and evening' },
  { id: 'three', times: ['morning', 'midday', 'evening'], label: 'three times a day' },
];

const STRATEGY_FIELDS = [
  'shape', 'percent', 'amount', 'pace', 'minCut', 'intervalDays',
  'distribution', 'restEvery', 'restLengthDays', 'initialHoldDays', 'targetDose',
];

function arrivalWord(future) {
  return future.horizonExceeded
    ? 'beyond the four-year horizon'
    : future.arrivalISO ? `around ${seasonOf(future.arrivalISO)}` : '—';
}

/**
 * The route shapes, each drawn as the same descent: same start, same end,
 * same number of days. Only the shape of the steps changes between cards,
 * so the drawings can be told apart at a glance. The dashed line is a
 * straight run from start to end, for comparison.
 */
const SHAPE_STEPS = { linear: 6, percent: 6, gentle: 9 };

function stairs(shape) {
  const steps = SHAPE_STEPS[shape];
  const W = 96, H = 60, padX = 6, padY = 8;
  const top = 1, bottom = 0.03;
  const val = (i) => (shape === 'linear'
    ? top - (i * (top - bottom)) / steps
    : top * Math.pow(bottom / top, i / steps));
  const x = (i) => padX + (i * (W - 2 * padX)) / steps;
  const y = (v) => padY + (1 - v) * (H - 2 * padY);
  let d = `M ${x(0)} ${y(val(0))}`;
  for (let i = 1; i <= steps; i++) d += ` H ${x(i)} V ${y(val(i))}`;
  return { d, W, H, start: [x(0), y(val(0))], end: [x(steps), y(val(steps))] };
}

function MethodArt({ shape }) {
  const a = stairs(shape);
  return (
    <svg className="method__art" viewBox={`0 0 ${a.W} ${a.H}`} aria-hidden="true">
      <line className="method__base" x1="4" y1={a.H - 6} x2={a.W - 4} y2={a.H - 6} />
      {shape !== 'linear' && (
        <line className="method__ref" x1={a.start[0]} y1={a.start[1]} x2={a.end[0]} y2={a.end[1]} />
      )}
      <path className="method__line" d={a.d} />
      <circle className="method__dot" cx={a.start[0]} cy={a.start[1]} r="2.6" />
    </svg>
  );
}

const METHODS = [
  {
    shape: 'percent',
    name: 'Hyperbolic',
    hint: 'Each cut is a share of what is left, so the steps shrink as you descend.',
  },
  {
    shape: 'linear',
    name: 'Linear',
    hint: 'The same amount comes off every time.',
  },
  {
    shape: 'gentle',
    name: 'Gentle curve',
    hint: 'A soft curve that slows further as the dose gets low.',
  },
];

/** The real first step for this shape, from the dose you are on today. */
function methodFigure(state, draft, shape) {
  if (shape === 'linear') return `${fmtDose(draft.amount)} every time`;
  return `first cut ${fmtDose(firstCutOf(state, { ...draft, shape }))}, then smaller`;
}

/** A labeled row on the table: a fact of the route, quietly editable. */
function Fact({ label, children }) {
  return (
    <div className="fact">
      <span className="fact__label">{label}</span>
      <span className="fact__control">{children}</span>
    </div>
  );
}

/** Layer 1 — the road being walked. */
function CurrentRoute({ state, actions }) {
  const dose = currentDose(state);
  const origin = state.events[0];
  const hold = activeHold(state);
  const next = nextChange(state);
  const strat = normalizeStrategy(state.strategy);
  const future = projectFuture(state);
  const parts = doseParts(state);
  const [confirmPause, setConfirmPause] = useState(false);

  let nextLine;
  if (state.pausedSince) {
    nextLine = `Paused since ${prettyDate(state.pausedSince)}. The road ahead waits — your days still count.`;
  } else if (hold) {
    nextLine = `Resting until ${prettyDate(hold.endsOn)} — part of the route.`;
  } else if (next) {
    nextLine = `Next step: ${fmtDose(next.dose)} on ${prettyDate(next.date)}.`;
  } else {
    nextLine = 'No further steps drawn — the route has arrived.';
  }

  return (
    <section className="plan-section">
      <h2 className="plan-section__title">Current route</h2>
      <div className="route-card">
        <div className="route-card__dose">{fmtDose(dose)} today</div>
        <div className="route-card__meta">
          {state.medication} · set out at {fmtDose(origin?.dose)} on {prettyDate(state.startDate)}
          {strat.targetDose > 0 ? ` · headed for ${fmtDose(strat.targetDose)}` : ' · headed for zero'}
          {parts.length > 1 && ` · taken ${parts.map(p => `${fmtDose(p.mg)} ${p.label}`).join(', ')}`}
        </div>
        <p className="route-card__shape">
          {shapeSentence(strat)} {paceSentence(state, strat)} {restSentence(strat)}
        </p>
        <p className="route-card__next">
          {nextLine}
          {!state.pausedSince && future.arrivalISO && ` Arrival ${arrivalWord(future)}, at this pace.`}
          {!state.pausedSince && future.horizonExceeded && ' Arrival beyond the four-year horizon, at this pace.'}
        </p>
        <p className="route-card__keep">Past days are preserved. Changes only redraw the road ahead.</p>
        <div className="route-card__tools">
          {state.pausedSince ? (
            <button className="margin-link" onClick={actions.resumeRoute}>
              resume the route — the pencil redraws from today
            </button>
          ) : confirmPause ? (
            <span className="fact__pair">
              <span className="fact__unit">pause reductions until you resume?</span>
              <button className="margin-link" onClick={() => { actions.pauseRoute(); setConfirmPause(false); }}>pause</button>
              <button className="margin-link" onClick={() => setConfirmPause(false)}>never mind</button>
            </span>
          ) : (
            <button className="margin-link" onClick={() => setConfirmPause(true)}>pause the route</button>
          )}
        </div>
      </div>
    </section>
  );
}

/** Layer 3 — other shapes for the same road. Never ranked. */
function RouteOptions({ state, onLoad, onOpenHelper }) {
  const base = normalizeStrategy(state.strategy);
  const dose = currentDose(state);
  const pct = base.shape === 'percent' ? base.percent
    : base.shape === 'gentle' ? (GENTLE_PACES[base.pace]?.percent ?? 5)
    : (dose > 0 ? Math.round((base.amount / dose) * 1000) / 10 : 9);

  const options = [
    {
      id: 'slower',
      label: 'Slower draft',
      strategy: {
        ...base, shape: 'percent',
        percent: Math.max(1, Math.round(pct * 0.6 * 10) / 10),
        intervalDays: Math.min(56, Math.round((base.intervalDays * 1.5) / 7) * 7),
        distribution: 'step', initialHoldDays: 0, restEvery: 0,
      },
    },
    {
      id: 'steady',
      label: 'Steady percentage draft',
      strategy: { ...base, shape: 'percent', percent: pct, distribution: 'step', initialHoldDays: 0, restEvery: 0 },
    },
    {
      id: 'fixed',
      label: 'Fixed-step draft',
      strategy: {
        ...base, shape: 'linear',
        amount: Math.max(0.1, Math.round(dose * (pct / 100) * 100) / 100),
        distribution: 'step', initialHoldDays: 0, restEvery: 0,
      },
    },
    {
      id: 'micro',
      label: 'Smaller-step draft',
      strategy: { ...base, shape: 'percent', percent: pct, distribution: 'micro', initialHoldDays: 0, restEvery: 0 },
    },
    {
      id: 'holdFirst',
      label: 'Hold-first draft',
      strategy: {
        ...base, shape: 'percent',
        percent: Math.max(1, Math.round((pct / 2) * 10) / 10),
        intervalDays: 14, distribution: 'step', initialHoldDays: 28, restEvery: 0,
      },
    },
  ];

  return (
    <section className="plan-section">
      <h2 className="plan-section__title">Route options</h2>
      <p className="plan-section__note">
        Other shapes for the same road. None of them is ranked or recommended —
        each is one possible structure, a draft to review with your prescriber or care team.
      </p>
      <div className="draft-cards">
        {options.map(opt => {
          const future = projectFuture(state, undefined, opt.strategy);
          const rest = restSentence(opt.strategy);
          return (
            <div className="draft-card" key={opt.id}>
              <div className="draft-card__name">{opt.label}</div>
              <p className="draft-card__pace">{paceSentence(state, opt.strategy)}</p>
              {rest && <p className="draft-card__pace">{rest}</p>}
              <p className="draft-card__why">{shapeSentence(opt.strategy)}</p>
              <p className="draft-card__arrival">
                Reaches {opt.strategy.targetDose > 0 ? fmtDose(opt.strategy.targetDose) : 'near-zero'}{' '}
                {arrivalWord(future)} · {future.horizonExceeded ? 'more than ' : ''}{future.reductionsRemaining} reductions.
              </p>
              <button className="door" onClick={() => onLoad(opt.strategy)}>
                load into draft changes
              </button>
            </div>
          );
        })}
      </div>
      <div className="maptable__tools">
        <button className="door" onClick={onOpenHelper}>
          describe the route in your own words →
        </button>
      </div>
    </section>
  );
}

export default function MapTable({ state, actions }) {
  const [draft, setDraft] = useState(() => normalizeStrategy(state.strategy));
  const [confirming, setConfirming] = useState(false);
  const [helperOpen, setHelperOpen] = useState(false);
  const [restOpen, setRestOpen] = useState(false);

  const dose = currentDose(state);
  const origin = state.events[0];
  const cur = normalizeStrategy(state.strategy);

  const drafted = useMemo(
    () => projectFuture(state, undefined, draft),
    [state, draft]
  );
  const current = useMemo(
    () => projectFuture(state, undefined, cur),
    [state] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const changed = STRATEGY_FIELDS.some(f => draft[f] !== cur[f]);
  const firstStep = drafted.steps[0];

  // a calm caution, not a warning siren: a bigger single cut, or more
  // coming off per day on average, than the route being walked.
  // (raw rhythm doesn't decide — smaller cuts on a quicker rhythm can be
  // the gentler route)
  const paceOf = (s) => firstCutOf(state, s) / s.intervalDays;
  const faster =
    firstCutOf(state, draft) > firstCutOf(state, cur) * 1.25 ||
    paceOf(draft) > paceOf(cur) * 1.25;

  const scheduleId =
    SCHEDULES.find(s => s.times.length === (state.doseSchedule || ['morning']).length)?.id || 'morning';

  const loadDraft = (strategy) => {
    setDraft(normalizeStrategy(strategy));
    setConfirming(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (helperOpen) {
    return (
      <RouteHelper
        state={state}
        onClose={() => setHelperOpen(false)}
        onAdopt={(strategy) => { loadDraft(strategy); setHelperOpen(false); }}
      />
    );
  }

  return (
    <div className="page maptable">
      <div className="maptable__threshold">
        <div>
          <h1 className="maptable__title">Map table</h1>
          <p className="maptable__notice">
            This is a route draft, not medical advice. Review changes with your
            prescriber or care team.
          </p>
        </div>
      </div>

      <CurrentRoute state={state} actions={actions} />

      {/* ── Layer 2: the workshop ── */}
      <section className="plan-section plan-section--draft">
        <h2 className="plan-section__title">Draft changes</h2>
        <p className="plan-section__note">
          Nothing changes your route until you review and commit. Past days stay recorded.
        </p>

        <div className="facts">
          <Fact label="Medication">
            <input
              type="text"
              value={state.medication}
              onChange={(e) => actions.setMedication(e.target.value)}
            />
          </Fact>
          <Fact label="Where you set out">
            <span className="fact__pair">
              <input
                key={`origin-${origin?.dose}`}
                type="number" step="0.5" min="0" inputMode="decimal"
                defaultValue={origin?.dose ?? 0}
                onBlur={(e) => {
                  const v = parseFloat(e.target.value);
                  if (v > 0 && v !== origin?.dose) actions.editOrigin({ dose: v });
                }}
              />
              <span className="fact__unit">mg on</span>
              <input
                type="date"
                value={state.startDate}
                max={state.events[1]?.date ?? todayISO()}
                onChange={(e) => e.target.value && actions.editOrigin({ date: e.target.value })}
              />
            </span>
          </Fact>
          <Fact label="Where you are today">
            <span className="fact__pair">
              <input
                key={`dose-${dose}`}
                type="number" step="0.1" min="0" inputMode="decimal"
                defaultValue={dose}
                onBlur={(e) => {
                  const v = parseFloat(e.target.value);
                  if (!Number.isNaN(v) && v >= 0 && v !== dose) actions.adjustDoseToday(v);
                }}
              />
              <span className="fact__unit">mg</span>
            </span>
          </Fact>
          <Fact label="Where the route ends">
            <span className="fact__pair">
              <input
                type="number" step="0.1" min="0" inputMode="decimal"
                value={draft.targetDose || 0}
                onChange={(e) => setDraft({ ...draft, targetDose: parseFloat(e.target.value) || 0 })}
              />
              <span className="fact__unit">mg — 0 means all the way down</span>
            </span>
          </Fact>
          <Fact label="Taken">
            <select
              value={scheduleId}
              onChange={(e) => {
                const s = SCHEDULES.find(x => x.id === e.target.value);
                if (s) actions.setDoseSchedule(s.times);
              }}
            >
              {SCHEDULES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </Fact>
        </div>

        {/* the shape of the descent */}
        <div className="method-row" role="radiogroup" aria-label="Route shape">
          {METHODS.map(m => (
            <button
              key={m.shape}
              type="button"
              role="radio"
              aria-checked={draft.shape === m.shape}
              className={`method ${draft.shape === m.shape ? 'is-chosen' : ''}`}
              onClick={() => setDraft({ ...draft, shape: m.shape })}
            >
              <MethodArt shape={m.shape} />
              <span className="method__body">
                <span className="method__name">{m.name}</span>
                <span className="method__hint">{m.hint}</span>
                <span className="method__figure">{methodFigure(state, draft, m.shape)}</span>
              </span>
            </button>
          ))}
        </div>

        {draft.shape === 'percent' && (
          <div className="dial">
            <label>
              <span>Gradient — how much each step down takes</span>
              <span>{draft.percent}% of current dose</span>
            </label>
            <input
              type="range" min="1" max="15" step="0.5"
              value={draft.percent}
              onChange={(e) => setDraft({ ...draft, percent: parseFloat(e.target.value) })}
            />
          </div>
        )}
        {draft.shape === 'linear' && (
          <div className="dial">
            <label>
              <span>Step — how much comes off each time</span>
              <span>{fmtDose(draft.amount)}</span>
            </label>
            <input
              type="range" min="0.1" max={Math.max(2, dose / 4)} step="0.1"
              value={draft.amount}
              onChange={(e) => setDraft({ ...draft, amount: parseFloat(e.target.value) })}
            />
          </div>
        )}
        {draft.shape === 'gentle' && (
          <>
            <div className="fact">
              <span className="fact__label">Pace of the curve</span>
              <select
                value={draft.pace}
                onChange={(e) => setDraft({ ...draft, pace: e.target.value })}
              >
                {Object.entries(GENTLE_PACES).map(([id, p]) => (
                  <option key={id} value={id}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="dial">
              <label>
                <span>Smallest step the curve will draw</span>
                <span>{fmtDose(draft.minCut)}</span>
              </label>
              <input
                type="range" min="0.05" max="0.5" step="0.05"
                value={draft.minCut}
                onChange={(e) => setDraft({ ...draft, minCut: parseFloat(e.target.value) })}
              />
            </div>
          </>
        )}

        <div className="dial">
          <label>
            <span>Rhythm — how long each step is held</span>
            <span>{draft.intervalDays} days</span>
          </label>
          <input
            type="range" min="7" max="56" step="7"
            value={draft.intervalDays}
            onChange={(e) => setDraft({ ...draft, intervalDays: parseInt(e.target.value, 10) })}
          />
        </div>

        {/* how each cut lands, and where the route rests */}
        <div className="rest-row">
          <span className="fact__label">Each cut lands</span>
          <button
            className={`chip ${draft.distribution === 'step' ? 'is-chosen' : ''}`}
            onClick={() => setDraft({ ...draft, distribution: 'step' })}
          >
            all at once
          </button>
          <button
            className={`chip ${draft.distribution === 'micro' ? 'is-chosen' : ''}`}
            onClick={() => setDraft({ ...draft, distribution: 'micro' })}
          >
            in small weekly slices
          </button>
        </div>

        <div className="rest-row">
          <span className="fact__label">Planned rest points</span>
          <select
            value={draft.restEvery}
            onChange={(e) => setDraft({ ...draft, restEvery: parseInt(e.target.value, 10) })}
          >
            <option value={0}>none — holds added as needed</option>
            <option value={2}>after every 2 cuts</option>
            <option value={3}>after every 3 cuts</option>
            <option value={4}>after every 4 cuts</option>
          </select>
          {draft.restEvery > 0 && (
            <select
              value={draft.restLengthDays}
              onChange={(e) => setDraft({ ...draft, restLengthDays: parseInt(e.target.value, 10) })}
            >
              <option value={14}>2 weeks each</option>
              <option value={28}>4 weeks each</option>
              <option value={42}>6 weeks each</option>
            </select>
          )}
        </div>

        <div className="draft-sentence">
          <span className="figure">{paceSentence(state, draft)}</span>{' '}
          {restSentence(draft) && <>{restSentence(draft)}{' '}</>}
          This shape reaches {draft.targetDose > 0 ? fmtDose(draft.targetDose) : 'near-zero'}{' '}
          <span className="figure">{arrivalWord(drafted)}</span>
          {' '}— <span className="figure">{drafted.horizonExceeded ? 'more than ' : ''}{drafted.reductionsRemaining}</span> reductions
          from here. The pencil always redraws from today's actual dose.
        </div>

        {faster && changed && (
          <p className="caution">
            Larger or faster changes can be harder for some people. Consider
            reviewing this route with your prescriber or care team before committing.
          </p>
        )}

        <div className="maptable__tools">
          {restOpen ? (
            <span className="fact__pair">
              <span className="fact__unit">rest here for</span>
              {[7, 14, 21, 28].map(d => (
                <button
                  key={d} className="door"
                  onClick={() => { actions.addRestPoint(d); setRestOpen(false); }}
                >
                  {d} days
                </button>
              ))}
              <button className="margin-link" onClick={() => setRestOpen(false)}>never mind</button>
            </span>
          ) : (
            <button className="door" onClick={() => setRestOpen(true)}>add a rest point from today</button>
          )}
        </div>

        {confirming ? (
          <>
            <div className="commit-summary">
              {firstStep ? (
                <>Your next step becomes {fmtDose(firstStep.dose)} on {prettyDate(firstStep.date)}. </>
              ) : null}
              Arrival moves from {arrivalWord(current)} to {arrivalWord(drafted)}.
              The old route is kept, quietly, in your record.
              <span className="commit-summary__keep">
                Committing redraws only the future. It does not erase holds,
                notes, storms, or days already marked.
              </span>
            </div>
            <div className="maptable__actions">
              <button className="door" onClick={() => setConfirming(false)}>keep drafting</button>
              <button
                className="door door--primary"
                onClick={() => { actions.commitStrategy(draft); setConfirming(false); }}
              >
                commit this route
              </button>
            </div>
          </>
        ) : (
          <div className="maptable__actions">
            <button
              className="door"
              disabled={!changed}
              style={!changed ? { opacity: 0.4, cursor: 'default' } : undefined}
              onClick={() => setDraft(normalizeStrategy(state.strategy))}
            >
              discard draft
            </button>
            <button
              className="door door--primary"
              disabled={!changed}
              style={!changed ? { opacity: 0.4, cursor: 'default' } : undefined}
              onClick={() => setConfirming(true)}
            >
              review changes →
            </button>
          </div>
        )}
      </section>

      <RouteOptions state={state} onLoad={loadDraft} onOpenHelper={() => setHelperOpen(true)} />
    </div>
  );
}
