import React, { useEffect, useMemo, useRef } from 'react';
import { milestonePhrase, personalFacts, currentDose } from './model.js';
import { W, buildGeometry, inkPath } from './lineGeometry.js';

/**
 * Celebration — a milestone moment. No confetti, no badges, no sound.
 * The reward is watching your own line drawn: every hold, every storm,
 * every return, retraced in ink. Then one sentence, and it lets you go.
 *
 * No two people ever see the same animation, because no two routes
 * are the same.
 */

const DRAW_MS = 2600;

export default function Celebration({ state, milestone, onDone }) {
  const g = useMemo(() => buildGeometry(state), [state]);
  const d = useMemo(() => inkPath(state, g), [state, g]);
  const pathRef = useRef(null);

  // draw the ink from the first day to today
  useEffect(() => {
    const p = pathRef.current;
    if (!p) return;
    const len = p.getTotalLength();
    p.style.strokeDasharray = `${len}`;
    p.style.strokeDashoffset = `${len}`;
    // let the initial state paint before transitioning
    requestAnimationFrame(() => requestAnimationFrame(() => {
      p.style.transition = `stroke-dashoffset ${DRAW_MS}ms cubic-bezier(0.45, 0, 0.2, 1)`;
      p.style.strokeDashoffset = '0';
    }));
  }, [d]);

  const nowX = g.doseToX(currentDose(state));
  const nowY = g.dayToY(g.todayDay);
  const facts = personalFacts(state);

  return (
    <div
      className="celebration"
      onClick={onDone}
      role="dialog"
      aria-label={milestonePhrase(milestone, state)}
    >
      <svg viewBox={`0 0 ${W} ${g.pastHeight}`} aria-hidden="true">
        <path ref={pathRef} d={d} fill="none" stroke="var(--ink)"
          strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
        <circle className="celebration__dot" cx={nowX} cy={nowY} r="6.5" fill="var(--accent)" />
        <circle className="celebration__dot" cx={nowX} cy={nowY} r="11"
          fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.4" />
      </svg>

      <div className="celebration__phrase">{milestonePhrase(milestone, state)}</div>

      {facts.length > 0 && (
        <div className="celebration__facts">
          {facts.map(f => <div key={f}>{f}</div>)}
        </div>
      )}

      <div className="celebration__hint">touch anywhere to continue</div>
    </div>
  );
}
