import React, { useState } from 'react';
import { draftRoutes, projectFuture, seasonOf, paceSentence, fmtDose, currentDose } from './model.js';
import { restSentence, shapeSentence } from './route.js';

/**
 * The Route Helper — say what you're trying to do, in your own words,
 * and get back draft route shapes to consider. It never advises; it
 * sketches. It never says "you should"; it says "here is one possible
 * structure". Every draft is something to bring to a prescriber.
 *
 * Drafts load into Draft Changes on the map table — they never touch
 * the active route directly. Review always comes before commit.
 */

function DraftCard({ state, draft, onAdopt }) {
  const future = projectFuture(state, undefined, draft.strategy);
  const arrival = future.horizonExceeded
    ? 'beyond the four-year horizon'
    : future.arrivalISO ? `around ${seasonOf(future.arrivalISO)}` : '—';
  const rest = restSentence(draft.strategy);
  return (
    <div className="draft-card">
      <div className="draft-card__name">{draft.label}</div>
      <p className="draft-card__pace">{paceSentence(state, draft.strategy)}</p>
      {rest && <p className="draft-card__pace">{rest}</p>}
      <p className="draft-card__why">{draft.why}</p>
      <p className="draft-card__arrival">
        Reaches near-zero {arrival} · {future.horizonExceeded ? 'more than ' : ''}{future.reductionsRemaining} reductions.
      </p>
      <button className="door" onClick={() => onAdopt(draft.strategy)}>
        load into draft changes →
      </button>
    </div>
  );
}

export default function RouteHelper({ state, onClose, onAdopt }) {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);

  return (
    <div className="page maptable helper">
      <button className="back-link" onClick={onClose}>← the map table</button>
      <h1 className="maptable__title">In your own words</h1>
      <p className="maptable__notice">
        Describe the route you're trying to build. Compass will sketch a few
        route shapes — drafts to look at, not advice to follow.
      </p>

      <textarea
        className="helper__field"
        rows={4}
        value={text}
        placeholder={`for example — "I'm at ${fmtDose(currentDose(state))} and want to come down about 2% a month, with rest points when things get hard."`}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="maptable__actions" style={{ justifyContent: 'flex-start', borderTop: 'none', paddingTop: 0 }}>
        <button
          className="door door--primary"
          disabled={text.trim().length < 8}
          style={text.trim().length < 8 ? { opacity: 0.4, cursor: 'default' } : undefined}
          onClick={() => setResult(draftRoutes(state, text))}
        >
          sketch some routes
        </button>
      </div>

      {result && (
        <>
          {result.wish.wantsHolds && (
            <p className="helper__note">
              You mentioned holds — the Steady shape below draws a planned rest
              point every few cuts, and you can always add a hold from the map
              table when a hard stretch arrives. A hold is part of the route,
              not a detour.
            </p>
          )}
          <div className="draft-cards">
            {result.drafts.map(d => (
              <DraftCard key={d.id} state={state} draft={d} onAdopt={onAdopt} />
            ))}
          </div>
          <p className="helper__disclaimer">
            These are draft routes, not medical advice. Loading one changes
            nothing until you review and commit it. Bring the shape that reads
            right to your prescriber or care team.
          </p>
        </>
      )}
    </div>
  );
}
