import React, { useMemo, useState } from 'react';
import {
  todayISO, addDays, prettyDate, seasonOf, fmtDose,
  currentDose, weatherSentence,
} from './model.js';
import {
  W, X_ZERO, TOP_PAD, PPD_PAST, PPD_FUTURE,
  buildGeometry, doseOnDay, inkPath, pencilPath, journalRuns,
} from './lineGeometry.js';

/**
 * Path — the hilltop. One continuous line: ink above, pencil below,
 * you at the seam. Doses appear only where they change. No chart chrome.
 */

function captionFor(state, g, day) {
  const iso = addDays(state.startDate, day - 1);
  if (day <= g.todayDay) {
    // the past, retold
    let sentence = '';
    for (const e of state.events) {
      if (Math.abs(g.isoToDay(e.date) - day) <= 2) {
        if (e.kind === 'start') sentence = e.note;
        else if (e.kind === 'hold') sentence = e.note || 'A rest point, honored.';
        else if (e.kind === 'updose') sentence = e.note || `Stepped back up to ${fmtDose(e.dose)}.`;
        else sentence = `Stepped down to ${fmtDose(e.dose)}.`;
      }
    }
    if (!sentence) sentence = `${fmtDose(doseOnDay(state, day))}, holding the line.`;
    const weather = weatherSentence(state, iso);
    const note = state.journal[iso]?.note;
    return {
      date: `${prettyDate(iso)} · Day ${day}`,
      text: [sentence, weather, note && `“${note}”`].filter(Boolean).join(' '),
    };
  }
  // the future, honestly provisional
  let dose = currentDose(state);
  for (const s of g.future.steps) {
    if (g.isoToDay(s.date) <= day) dose = s.dose;
  }
  if (state.routePlanned === false) {
    return { date: `${prettyDate(iso)} · ahead`, text: 'No changes planned. You are keeping a record.' };
  }
  return {
    date: `Around ${prettyDate(iso)} · pencil`,
    text: `${fmtDose(dose)}, if the current pace holds. Nothing here is fixed.`,
  };
}

export default function Path({ state, onOpenPlanning }) {
  const g = useMemo(() => buildGeometry(state), [state]);
  const [caption, setCaption] = useState(null);
  const [pick, setPick] = useState(g.todayDay);

  const runs = useMemo(() => journalRuns(state, g), [state, g]);
  const nowX = g.doseToX(currentDose(state));
  const nowY = g.dayToY(g.todayDay);

  const doseChanges = state.events.filter((e, i) =>
    i === 0 || e.dose !== state.events[i - 1].dose || e.kind === 'hold');

  const arrival = g.future.horizonExceeded
    ? 'beyond the current horizon'
    : g.future.arrivalISO ? `around ${seasonOf(g.future.arrivalISO)}` : null;
  const arrivalY = g.future.arrivalISO
    ? g.dayToY(g.isoToDay(g.future.arrivalISO))
    : g.height - 110;

  const scrub = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const y = ((e.clientY - rect.top) / rect.height) * g.height;
    const pastLimit = TOP_PAD + (g.todayDay - 1) * PPD_PAST;
    const day = y <= pastLimit
      ? Math.round((y - TOP_PAD) / PPD_PAST) + 1
      : g.todayDay + Math.round((y - pastLimit) / PPD_FUTURE);
    if (day >= 1) setCaption(captionFor(state, g, day));
  };

  return (
    <div className="page path">
      <div className="path__header">
        Day {g.todayDay}. {fmtDose(currentDose(state))}.{' '}
        {g.future.paused
          ? 'Paused — the road ahead waits.'
          : arrival && `Arrival ${arrival}, at your current pace.`}
      </div>
      <div className="path__subheader">touch the line — it remembers</div>

      <label className="path__pick">
        <span>Look at a day</span>
        <input
          type="range"
          min="1"
          max={g.todayDay + 120}
          value={pick}
          aria-valuetext={`Day ${pick}`}
          onChange={(e) => {
            const d = parseInt(e.target.value, 10);
            setPick(d);
            setCaption(captionFor(state, g, d));
          }}
        />
        <small>Day {pick}{pick === g.todayDay ? ' · today' : pick > g.todayDay ? ' · ahead, in pencil' : ''}</small>
      </label>

      <div className="path__svg-wrap">
        <svg
          className="path__svg"
          role="img"
          aria-label={`Your route: day ${g.todayDay}, ${fmtDose(currentDose(state))} today. Use the Look at a day slider to hear about any day.`}
          viewBox={`0 0 ${W} ${g.height}`}
          onPointerDown={scrub}
          onPointerMove={(e) => { if (e.buttons || e.pointerType === 'mouse') scrub(e); }}
        >
          {/* storm washes — visible when you look, invisible when you don't */}
          {runs.storms.map((r, i) => {
            const x = g.doseToX(doseOnDay(state, r.start));
            return (
              <rect key={`s${i}`} x={x - 9} y={g.dayToY(r.start)} width={18}
                height={g.dayToY(r.end) - g.dayToY(r.start)}
                rx={9} fill="var(--storm-wash)" opacity="0.14" />
            );
          })}

          {/* the ink */}
          <path d={inkPath(state, g)} fill="none" stroke="var(--ink)"
            strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />

          {/* gaps: absence rendered as silence, not censure */}
          {runs.gaps.map((r, i) => {
            const x = g.doseToX(doseOnDay(state, r.start));
            return (
              <line key={`g${i}`} x1={x} y1={g.dayToY(r.start)} x2={x} y2={g.dayToY(r.end)}
                stroke="var(--paper)" strokeWidth="3.2" opacity="0.82" />
            );
          })}

          {/* the pencil */}
          <path d={pencilPath(state, g)} fill="none" stroke="var(--pencil)"
            strokeWidth="1.8" strokeDasharray="3 5" strokeLinejoin="round" strokeLinecap="round" />

          {/* uncertainty fan at the arrival */}
          {g.future.arrivalISO && (
            <path
              d={`M ${X_ZERO + 6} ${arrivalY - 46} L ${X_ZERO - 8} ${arrivalY + 22} L ${X_ZERO + 22} ${arrivalY + 22} Z`}
              fill="var(--pencil)" opacity="0.08"
            />
          )}

          {/* annotations, only where something changed */}
          {doseChanges.map((e, i) => {
            const y = g.dayToY(g.isoToDay(e.date));
            const x = g.doseToX(e.dose);
            const label =
              e.kind === 'hold' ? `held ${Math.round(e.lengthDays / 7)} wks`
              : e.kind === 'updose' ? `↑ ${fmtDose(e.dose)}`
              : `${prettyDate(e.date).split(' ')[0]} · ${fmtDose(e.dose)}`;
            const flip = e.kind === 'start'; // keep the first label inside the frame
            return (
              <text key={i} x={flip ? x - 12 : x + 14} y={y + 4} fontSize="10.5"
                textAnchor={flip ? 'end' : 'start'}>{label}</text>
            );
          })}

          {/* upcoming waypoints */}
          {g.future.steps.slice(0, 2).map((s, i) => {
            const y = g.dayToY(g.isoToDay(s.date));
            const x = g.doseToX(s.dose);
            return (
              <g key={`w${i}`}>
                <rect x={x - 4} y={y - 4} width={8} height={8}
                  transform={`rotate(45 ${x} ${y})`}
                  fill="var(--paper)" stroke="var(--pencil)" strokeWidth="1.2" />
                {i === 0 && (
                  <text x={x - 12} y={y + 4} fontSize="10.5" textAnchor="end">
                    {prettyDate(s.date).split(' ')[0]} · {fmtDose(s.dose)}
                  </text>
                )}
              </g>
            );
          })}

          {/* the seam: you are here */}
          <circle cx={nowX} cy={nowY} r="6.5" fill="var(--accent)" />
          <circle cx={nowX} cy={nowY} r="11" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.4" />
          <text x={nowX + 22} y={nowY + 24} fontSize="11" fill="var(--accent)"
            style={{ letterSpacing: '0.1em', fontWeight: 600 }}>
            YOU ARE HERE
          </text>

          {/* arrival, as a season */}
          {arrival && (
            <text x={X_ZERO - 4} y={arrivalY + 44} fontSize="11" textAnchor="start">
              arrival: {arrival}
            </text>
          )}
        </svg>

        {caption && (
          <div className="path-caption" role="status" aria-live="polite" onClick={() => setCaption(null)}>
            <div className="path-caption__date">{caption.date}</div>
            {caption.text}
          </div>
        )}
      </div>

      <div className="path__actions">
        <button className="door" onClick={() => window.print()}>share a snapshot</button>
        <button className="door door--primary" onClick={onOpenPlanning}>open the map table →</button>
      </div>
    </div>
  );
}
