import React, { useMemo, useState } from 'react';
import { projectFuture, seasonOf, fmtDose, currentDose, prettyDate } from './model.js';

/**
 * The Map Table — Planning Mode. Draft-space, visibly not daily life.
 * Nothing here changes your days until you commit.
 */

function routeSentence(state, strategy) {
  const future = projectFuture(state, undefined, strategy);
  const dose = currentDose(state);
  const firstCut = dose * (strategy.percent / 100);
  const weeks = Math.round(strategy.intervalDays / 7 * 10) / 10;
  const arrival = future.horizonExceeded
    ? 'beyond the four-year horizon'
    : future.arrivalISO ? `around ${seasonOf(future.arrivalISO)}` : '—';
  return {
    future,
    arrival,
    text: (
      <>
        This pace reaches near-zero <span className="figure">{arrival}</span>.
        Steps of about <span className="figure">{fmtDose(Math.round(firstCut * 100) / 100)}</span> at
        first, then smaller, every <span className="figure">{weeks} {weeks === 1 ? 'week' : 'weeks'}</span>.
        {' '}<span className="figure">{future.horizonExceeded ? 'More than ' : ''}{future.reductionsRemaining}</span> reductions remaining.
      </>
    ),
  };
}

export default function MapTable({ state, actions, onClose }) {
  const [draft, setDraft] = useState({ ...state.strategy });
  const [confirming, setConfirming] = useState(false);

  const current = useMemo(() => routeSentence(state, state.strategy), [state]);
  const drafted = useMemo(() => routeSentence(state, draft), [state, draft]);

  const changed =
    draft.percent !== state.strategy.percent ||
    draft.intervalDays !== state.strategy.intervalDays;

  const firstStep = drafted.future.steps[0];

  return (
    <div className="page maptable">
      <div className="maptable__threshold">
        <div>
          <h1 className="maptable__title">Map table</h1>
          <p className="maptable__notice">Nothing here changes your days until you commit.</p>
        </div>
        <button className="back-link" onClick={onClose}>← back to the path</button>
      </div>

      <div className="current-route-line">
        The route you're on: {state.strategy.percent}% of current dose,
        every {state.strategy.intervalDays} days · arrival {current.arrival}.
      </div>

      <div className="dial">
        <label>
          <span>Gradient — how much each step down takes</span>
          <span>{draft.percent}% of current dose</span>
        </label>
        <input
          type="range" min="4" max="15" step="0.5"
          value={draft.percent}
          onChange={(e) => setDraft({ ...draft, percent: parseFloat(e.target.value) })}
        />
      </div>

      <div className="dial">
        <label>
          <span>Rhythm — how long each step is held</span>
          <span>{draft.intervalDays} days</span>
        </label>
        <input
          type="range" min="7" max="42" step="7"
          value={draft.intervalDays}
          onChange={(e) => setDraft({ ...draft, intervalDays: parseInt(e.target.value, 10) })}
        />
      </div>

      <div className="draft-sentence">{drafted.text}</div>

      <details className="assumptions">
        <summary>What this projection assumes</summary>
        <p>
          A hyperbolic reduction of {draft.percent}% of the <em>current</em> dose per step,
          each step held {draft.intervalDays} days, starting when your current hold ends.
          Each cut is smaller than the last. Projections re-flow whenever reality differs —
          they are sketches, not promises, and none of this is medical advice.
          Holds and adjustments you make along the way always take precedence.
        </p>
      </details>

      {confirming ? (
        <>
          <div className="commit-summary">
            {firstStep ? (
              <>Your next step becomes {fmtDose(firstStep.dose)} on {prettyDate(firstStep.date)}. </>
            ) : null}
            Arrival moves from {current.arrival} to {drafted.arrival}.
            The old route is kept, quietly, in your record.
          </div>
          <div className="maptable__actions">
            <button className="door" onClick={() => setConfirming(false)}>keep drafting</button>
            <button
              className="door door--primary"
              onClick={() => { actions.commitStrategy(draft); onClose(); }}
            >
              commit this route
            </button>
          </div>
        </>
      ) : (
        <div className="maptable__actions">
          <button className="door" onClick={onClose}>discard draft</button>
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
    </div>
  );
}
