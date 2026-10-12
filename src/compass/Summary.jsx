import React, { useState } from 'react';
import { daysWalked, fmtDose, currentDose, prettyDate } from './model.js';
import WeatherIcon from './WeatherIcon.jsx';

/**
 * Summary — one printable page: the record, set out plainly for a prescriber,
 * a care team, or a trusted person. Notes are private unless included.
 */

const fullDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const kindLabel = (e) =>
  e.kind === 'start' ? 'Started'
  : e.kind === 'hold' ? `Held${e.lengthDays ? ` for ${e.lengthDays} days` : ''}`
  : e.kind === 'updose' ? 'Stepped back up'
  : 'Stepped down';

export default function Summary({ state, onBack, readOnly = false, sharedNotes = null }) {
  // Owner chooses whether notes are included; a shared view is told by the sender.
  const [withNotes, setWithNotes] = useState(false);
  const includeNotes = readOnly ? !!sharedNotes : withNotes;

  const days = Object.entries(state.journal).filter(([, v]) => v.marked);
  const weather = { clear: 0, unsettled: 0, foggy: 0, stormy: 0 };
  Object.values(state.journal).forEach((v) => { if (v.weather in weather) weather[v.weather] += 1; });
  const notes = Object.entries(state.journal).filter(([, v]) => v.note).sort(([a], [b]) => (a < b ? 1 : -1));
  const changes = state.events;
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="reading summary">
      <div className="summary__controls">
        {onBack && <button className="back-link" onClick={onBack}>← the shelf</button>}
        {!readOnly && (
          <>
            <label className="summary__check">
              <input type="checkbox" checked={withNotes} onChange={(e) => setWithNotes(e.target.checked)} />
              <span>include my daily notes</span>
            </label>
            <button className="door door--primary" onClick={() => window.print()}>print or save as PDF</button>
          </>
        )}
      </div>

      <h2>Taper summary</h2>
      <p className="summary__meta">
        {state.medication} · started {fullDate(state.startDate)} · prepared {today}
      </p>

      <dl className="summary__facts">
        <div><dt>Dose today</dt><dd>{fmtDose(currentDose(state))}</dd></div>
        <div><dt>Days since starting</dt><dd>{daysWalked(state).toLocaleString()}</dd></div>
        <div><dt>Days marked</dt><dd>{days.length.toLocaleString()}</dd></div>
      </dl>

      <h3>Dose changes</h3>
      <table className="summary__table">
        <thead><tr><th>Date</th><th>Dose</th><th>What happened</th></tr></thead>
        <tbody>
          {changes.map((e, i) => (
            <tr key={i}>
              <td>{fullDate(e.date)}</td>
              <td>{fmtDose(e.dose)}</td>
              <td>{kindLabel(e)}{includeNotes && e.note ? ` — ${e.note}` : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>How the days felt</h3>
      <ul className="summary__weather">
        {Object.entries(weather).map(([w, n]) => (
          <li key={w}><WeatherIcon kind={w} size={26} /><span>{n} {n === 1 ? 'day' : 'days'} {w}</span></li>
        ))}
      </ul>

      {includeNotes && notes.length > 0 && (
        <>
          <h3>Notes</h3>
          <ul className="summary__notes">
            {notes.map(([iso, v]) => (
              <li key={iso}><strong>{prettyDate(iso)}</strong> — {v.note}</li>
            ))}
          </ul>
        </>
      )}

      <p className="summary__foot">
        Kept in Compass, a personal record and planning aid. It is not medical advice, and any
        change to a taper is best decided with a prescriber or care team.
      </p>
    </div>
  );
}
